import type { z } from "zod";

/**
 * Tool registry contract (spec v3 §12.3, §35.3). Deliberately minimal for this milestone:
 * `run` is synchronous and deterministic — no AI interpretation layer, no persistence, no
 * async service calls. `it_products.tool_key` is only ever a lookup key into
 * `src/lib/tools/registry.ts`; the database never supplies executable logic.
 */
export type ToolContext = {
  /** Present when the visitor has an anonymous session identity. Unused this milestone
   * (no Tool-run persistence exists yet) — kept in the contract so a future Tool with
   * persistence needs doesn't require changing this shared type. */
  anonymousSessionId?: string;
};

export type ToolDefinition<I, R> = {
  /** Stable key, matches `it_products.tool_key`. */
  key: string;
  /** Bumped whenever `resultSchema`'s shape changes in a way old saved results couldn't satisfy. */
  schemaVersion: number;
  inputSchema: z.ZodType<I>;
  resultSchema: z.ZodType<R>;
  run: (input: I, context?: ToolContext) => R;
};

/** Registry lookup failure — mirrors the `TOOL_NOT_AVAILABLE` error code from spec §35.4. */
export class ToolNotAvailableError extends Error {
  constructor(public readonly toolKey: string) {
    super(`TOOL_NOT_AVAILABLE: no tool is registered for key "${toolKey}"`);
    this.name = "ToolNotAvailableError";
  }
}
