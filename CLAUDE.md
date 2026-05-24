# BigConfig TypeScript — AI Assistant Guide

## Project Overview

This directory is the TypeScript/Node.js rewrite of BigConfig. It provides workflow orchestration, Selmer template rendering, shell command execution, Git locking helpers, and BigTofu/OpenTofu construct helpers.

The project is ESM-only and uses Vitest for tests. The Selmer engine is consumed as a local dependency from `../../Selmer/typescript`.

## Repository Layout

```text
big-config/typescript/
├── src/                 # TypeScript source
│   ├── big-tofu/        # OpenTofu/Terraform helpers
│   ├── core.ts          # Workflow primitives
│   ├── workflow.ts      # Composition layer and CLI parsing
│   ├── render.ts        # Selmer template renderer
│   ├── run.ts           # Shell command execution
│   ├── lock.ts          # Git-tag locking
│   └── ...
├── test/                # Vitest tests
├── package.json
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
- Use `Opts` maps with string keys such as `big-config/exit` and `big-config.workflow/steps` to preserve BigConfig API concepts.
- Keep command execution behind the `run.runner` seam so tests can avoid spawning real processes.
- Keep subworkflow isolation in `workflow.runSteps` and `workflow.createWorkflowStar`.
- Do not add project scaffolding, store, system lifecycle, or build-helper modules unless explicitly requested.

## Git

Stay on `main`. Commit only when explicitly asked.
