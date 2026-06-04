# BigConfig TypeScript SDK — AI Assistant Guide

## Project Overview

This directory is the TypeScript SDK: the Node.js implementation of BigConfig SDK. It provides workflow orchestration, Selmer template rendering, shell command execution, Git locking helpers, and BigTofu/OpenTofu construct helpers.

The project is ESM-only and uses Vitest for tests. The Selmer engine is pulled from the `bigconfig-ai/Selmer` GitHub repo, pinned to a commit in `package.json`. To develop against a local checkout, override the `selmer` dependency with `"selmer": "file:../../selmer/typescript"` and re-run `npm install`.

## Repository Layout

```text
big-config/typescript/
├── src/                  # TypeScript source
│   ├── index.ts          # Public re-exports
│   ├── cli.ts            # CLI entry point (`bin/big-config`)
│   ├── core.ts           # Workflow primitives (ok, choice, workflow, stepFn)
│   ├── workflow.ts       # Composition layer, CLI parsing, runSteps, createWorkflowStar
│   ├── pluggable.ts      # Pluggable step dispatch
│   ├── render.ts         # Selmer template renderer
│   ├── run.ts            # Shell command execution (runner seam)
│   ├── git.ts            # Git helper workflows
│   ├── lock.ts           # Git-tag pessimistic locking
│   ├── unlock.ts         # Force-release locking workflow
│   ├── step.ts           # Step type
│   ├── step-fns.ts       # Workflow middleware helpers
│   ├── selmer-filters.ts # SDK Selmer filters
│   ├── keys.ts           # Reserved-key registry
│   ├── utils.ts          # Shared helpers
│   └── big-tofu/         # OpenTofu/Terraform construct helpers (core.ts, create.ts)
├── test/                 # Vitest tests
├── package.json          # ESM, subpath exports for every module above
├── tsconfig.json
└── vitest.config.ts
```

## Development Commands

```sh
npm install
npm run check
npm test
npm run build
```

## Code Conventions

- Keep the package ESM-only.
- Prefer named exports plus compatibility aliases where useful.
- Use `Opts` maps with string keys such as `big-config/exit` and `big-config.workflow/steps` to preserve SDK API concepts.
- Keep command execution behind the `run.runner` seam so tests can avoid spawning real processes.
- Keep subworkflow isolation in `workflow.runSteps` and `workflow.createWorkflowStar`.
- Do not add project scaffolding, store, system lifecycle, or build-helper modules unless explicitly requested.

## Git

Stay on `typescript` (each language has its own branch in this repo). Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `deps:`). Commit only when explicitly asked.
