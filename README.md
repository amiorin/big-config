# BigConfig TypeScript

BigConfig is a Node.js/TypeScript workflow and template automation library for infrastructure-as-code tooling. It renders Selmer templates, runs CLI pipelines, manages Git-tag locks, and provides helpers for OpenTofu/Terraform-style data generation.

## Install

```sh
npm install
```

The project uses the local Selmer TypeScript package at `../../Selmer/typescript`.

## Development

```sh
npm run check   # TypeScript typecheck
npm test        # Vitest test suite
npm run build   # Compile to dist/
```

## CLI syntax

```sh
big-config render lock tofu:init tofu:plan -- tofu apply -auto-approve
```

- Known workflow steps are parsed as steps.
- `tool:subcommand` becomes `tool subcommand`.
- `--` starts one raw command and automatically adds the `exec` step.

## Public modules

- `big-config/core` — workflow primitives: `ok`, `choice`, `createWorkflow`, `createStepFn`.
- `big-config/workflow` — dynamic workflow composition, CLI parsing, `prepare`, `runSteps`.
- `big-config/pluggable` — step override registry.
- `big-config/render` — Selmer-based template rendering.
- `big-config/run` — command runner with test seam.
- `big-config/git`, `big-config/lock`, `big-config/unlock` — Git helpers and locking workflows.
- `big-config/big-tofu/core`, `big-config/big-tofu/create` — OpenTofu/Terraform construct helpers.

The old store, system lifecycle, build helper, and project scaffolding modules are intentionally not part of this TypeScript rewrite.

## License

MIT
