# 0008 — npm instead of pnpm

## Status
Accepted, easy to revisit

## Context
Spec §12.4 doesn't mandate a package manager. `pnpm` was not installed in
the build environment; `npm` was.

## Decision
Use npm (`package-lock.json`) for this build. Switching to pnpm later is a
mechanical change (delete `node_modules`/`package-lock.json`, `pnpm import`
or fresh install) with no code impact — not a load-bearing decision.
