# 0001 — `docs/` folder placement and repo bootstrap

## Status
Accepted

## Context
Spec §13's recommended repository tree has no top-level `docs/` folder, but
§43.1 rule 7 requires recording assumptions in `docs/decisions/`. The repo
also already existed on GitHub (`PLAMartin/IncyTemplates`) with a single
placeholder `README.md` before this build started.

## Decision
- Add a top-level `docs/` folder (deviation from §13's literal tree),
  containing the technical spec itself (`Incytemplates-website-spec-v2.md`)
  and this `decisions/` folder of ADRs.
- Bootstrap by `git init`-ing the working directory, adding the existing
  GitHub repo as `origin`, and checking out its `main` branch so the
  existing README is preserved rather than overwritten, per spec §43.1
  ("inspect and preserve any existing files... before scaffolding").
- All scaffolding work happens on feature branches (`feature/project-foundation`,
  `feature/public-catalogue`), merged via PR, per spec §43.2.
