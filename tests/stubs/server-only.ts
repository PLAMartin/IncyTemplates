// Vitest stub for the `server-only` package (spec v6 test-suite fix).
//
// `server-only` is not an npm dependency of this repo -- it only exists compiled inside
// Next.js's own bundler (node_modules/next/dist/compiled/server-only) and only resolves under
// Next's webpack/turbopack build. Vitest/Vite has no equivalent build-time guard, so importing
// the bare specifier fails module resolution outright ("Failed to resolve import 'server-only'")
// rather than silently doing nothing.
//
// Every file under src/server/ and a few files under src/lib/ start with `import "server-only"`
// as a real safety guard (it throws at Next.js build time if server-only code is ever pulled
// into a client bundle). Until now nothing under those directories was reachable from a unit
// test, only from e2e/build, so this was never hit. This stub -- aliased in vitest.config.ts --
// makes the bare import a no-op in tests, matching the documented pattern for testing
// server-only Next.js code with Vitest/Jest.
export {};
