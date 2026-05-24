# BigConfig Clojure

BigConfig is a JVM Clojure workflow and template automation library for infrastructure-as-code tooling. It renders Selmer templates, runs CLI pipelines, manages Git-tag locks, and provides helpers for OpenTofu/Terraform-style data generation.

## Selmer dependency

This project depends on the Selmer template library via Maven:

```edn
selmer/selmer {:mvn/version "1.13.1"}
```

## Development

```sh
clojure -M:test       # clojure.test suite
clojure -M:run -- echo ok
```

## CLI syntax

```sh
clojure -M:run render lock tofu:init tofu:plan -- tofu apply -auto-approve
```

- Known workflow steps are parsed as steps.
- `tool:subcommand` becomes `tool subcommand`.
- `--` starts one raw command and automatically adds the `exec` step.

## Public namespaces

- `big-config.core` — workflow primitives: `ok`, `choice`, `create-workflow`, `->workflow`, `create-step-fn`.
- `big-config.workflow` — dynamic workflow composition, CLI parsing, `prepare`, `run-steps`.
- `big-config.pluggable` — step override registry.
- `big-config.render` — Selmer-based template rendering (via Maven artifact `selmer 1.13.1`).
- `big-config.run` — command runner with a test seam.
- `big-config.git`, `big-config.lock`, `big-config.unlock` — Git helpers and locking workflows.
- `big-config.big-tofu.core`, `big-config.big-tofu.create` — OpenTofu/Terraform construct helpers.

Options use Clojure namespaced keywords such as `:big-config/exit` and `:big-config.workflow/steps`.

## License

MIT
