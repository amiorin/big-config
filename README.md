# BigConfig Clojure

BigConfig is a JVM Clojure workflow and template automation library for infrastructure-as-code tooling. It renders Selmer templates, runs CLI pipelines, manages Git-tag locks, and provides helpers for OpenTofu/Terraform-style data generation.

## Local Selmer dependency

This project depends on the local Clojure Selmer checkout:

```edn
selmer/selmer {:local/root "../../Selmer/master"}
```

Prepare that local dependency once before running tests in a fresh checkout:

```sh
clojure -X:deps prep
```

## Development

```sh
clojure -X:deps prep # needed when Selmer target/classes is missing
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
- `big-config.render` — Selmer-based template rendering using the local Selmer dependency.
- `big-config.run` — command runner with a test seam.
- `big-config.git`, `big-config.lock`, `big-config.unlock` — Git helpers and locking workflows.
- `big-config.big-tofu.core`, `big-config.big-tofu.create` — OpenTofu/Terraform construct helpers.

Options use Clojure namespaced keywords such as `:big-config/exit` and `:big-config.workflow/steps`.

## License

MIT
