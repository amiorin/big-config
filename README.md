# BigConfig TypeScript SDK

The TypeScript SDK is a Node.js workflow and template automation library for infrastructure-as-code tooling. It renders Selmer templates, runs CLI pipelines, manages Git-tag locks, and provides helpers for OpenTofu/Terraform-style data generation.

## Install

```sh
npm install
```

The Selmer engine is pulled from the [`bigconfig-ai/Selmer`](https://github.com/bigconfig-ai/Selmer) GitHub repo, pinned to a commit in `package.json`. To develop against a local checkout, override the dependency with `"selmer": "file:../../selmer/typescript"` and re-run `npm install`.

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

The old store, system lifecycle, build helper, and project scaffolding modules are intentionally not part of this TypeScript SDK.

## License

MIT
