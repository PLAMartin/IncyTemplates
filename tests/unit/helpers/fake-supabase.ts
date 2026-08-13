/**
 * Minimal fake for the Supabase query-builder chain, purpose-built for the checkout/webhook unit
 * tests (create-checkout-session, fulfill-checkout-session, resolve-paid-order-file, the Stripe
 * webhook route) — this repo has no prior precedent for mocking a chained Postgrest-style
 * builder, so this is a fresh, small implementation rather than a generic mock library.
 *
 * Responses are queued per table/RPC name, FIFO — the Nth call to `.from(table)` in the code
 * under test resolves to the Nth response programmed for that table via `queueResponse`. This
 * matches how the code under test actually calls each table (a fixed, known sequence), without
 * needing to replicate every possible Postgrest chain shape.
 */

export type FakeResult<T = unknown> = { data: T | null; error: { message: string; code?: string } | null };

type CallLogEntry = { table: string; method: string; args: unknown[] };

export class FakeSupabase {
  readonly calls: CallLogEntry[] = [];
  readonly rpcCalls: { name: string; args: unknown }[] = [];
  private tableQueues = new Map<string, FakeResult[]>();
  private rpcQueues = new Map<string, FakeResult[]>();
  readonly storage = {
    from: (bucket: string) => ({
      createSignedUrl: (path: string, expiresIn: number, options?: unknown) => {
        this.calls.push({ table: `storage:${bucket}`, method: "createSignedUrl", args: [path, expiresIn, options] });
        const queued = this.storageQueue.shift();
        return Promise.resolve(queued ?? { data: null, error: { message: "no queued storage response" } });
      },
    }),
  };
  private storageQueue: FakeResult[] = [];

  /** Programs the next response for the Nth call to `.from(table)`, in call order. */
  queueResponse<T>(table: string, result: FakeResult<T>): this {
    const queue = this.tableQueues.get(table) ?? [];
    queue.push(result as FakeResult);
    this.tableQueues.set(table, queue);
    return this;
  }

  queueRpcResponse<T>(name: string, result: FakeResult<T>): this {
    const queue = this.rpcQueues.get(name) ?? [];
    queue.push(result as FakeResult);
    this.rpcQueues.set(name, queue);
    return this;
  }

  queueStorageResponse<T>(result: FakeResult<T>): this {
    this.storageQueue.push(result as FakeResult);
    return this;
  }

  from(table: string): FakeQueryBuilder {
    return new FakeQueryBuilder(table, this);
  }

  rpc(name: string, args: unknown): Promise<FakeResult> {
    this.rpcCalls.push({ name, args });
    const queue = this.rpcQueues.get(name);
    const next = queue?.shift();
    return Promise.resolve(next ?? { data: null, error: { message: `no queued rpc response for ${name}` } });
  }

  /** @internal used by FakeQueryBuilder to resolve + log */
  _nextTableResult(table: string): FakeResult {
    const queue = this.tableQueues.get(table);
    const next = queue?.shift();
    return next ?? { data: null, error: { message: `no queued response for table ${table}` } };
  }

  _log(entry: CallLogEntry): void {
    this.calls.push(entry);
  }
}

class FakeQueryBuilder implements PromiseLike<FakeResult> {
  constructor(
    private table: string,
    private root: FakeSupabase,
  ) {}

  select(...args: unknown[]): this {
    this.root._log({ table: this.table, method: "select", args });
    return this;
  }
  eq(...args: unknown[]): this {
    this.root._log({ table: this.table, method: "eq", args });
    return this;
  }
  in(...args: unknown[]): this {
    this.root._log({ table: this.table, method: "in", args });
    return this;
  }
  insert(payload: unknown): this {
    this.root._log({ table: this.table, method: "insert", args: [payload] });
    return this;
  }
  update(payload: unknown): this {
    this.root._log({ table: this.table, method: "update", args: [payload] });
    return this;
  }
  maybeSingle(): Promise<FakeResult> {
    this.root._log({ table: this.table, method: "maybeSingle", args: [] });
    return Promise.resolve(this.root._nextTableResult(this.table));
  }
  single(): Promise<FakeResult> {
    this.root._log({ table: this.table, method: "single", args: [] });
    return Promise.resolve(this.root._nextTableResult(this.table));
  }
  then<TResult1 = FakeResult, TResult2 = never>(
    onfulfilled?: ((value: FakeResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.root._nextTableResult(this.table)).then(onfulfilled, onrejected);
  }
}
