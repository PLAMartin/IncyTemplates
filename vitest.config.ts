import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    css: false,
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // `server-only` isn't an installed dependency (it only resolves under Next's own
      // bundler) -- stub it so files that start with `import "server-only"` are importable
      // from a unit test. See tests/stubs/server-only.ts for the full explanation.
      { find: "server-only", replacement: path.resolve(__dirname, "./tests/stubs/server-only.ts") },
    ],
  },
});
