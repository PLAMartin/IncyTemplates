import "@testing-library/jest-dom/vitest";

// jsdom 27+ delegates `localStorage`/`sessionStorage` to Node's own experimental
// `node:internal/webstorage`, which requires a `--localstorage-file <path>` CLI flag to actually
// function (confirmed: Node 26 + jsdom 30 here — `window.localStorage` is `undefined` without
// it, the "ExperimentalWarning: localStorage is not available" every test run already prints).
// Rather than pass Node flags through vitest's worker pool, install a minimal in-memory
// `Storage`-compatible polyfill whenever the real one isn't usable — same "stub the environment
// gap centrally" approach as `tests/stubs/server-only.ts`. Real browsers always have a working
// localStorage, so this only ever activates in this test environment, never in the app itself.
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => {
      data.clear();
    },
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  } as Storage;
}

for (const prop of ["localStorage", "sessionStorage"] as const) {
  try {
    // Accessing a broken native implementation can throw (opaque-origin SecurityError) rather
    // than just being undefined, depending on jsdom version/config — guard both cases.
    if (typeof window[prop] !== "undefined" && window[prop] !== null) continue;
  } catch {
    // fall through to polyfill installation below
  }
  Object.defineProperty(window, prop, { value: createMemoryStorage(), configurable: true });
}
