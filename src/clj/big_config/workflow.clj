(ns big-config.workflow
  "
  The goal of the BigConfig Workflow is to enable independent development of
  automation units while providing a structured way to compose them into complex
  pipelines.

  ### Workflow Types
  * **`shell-workflow`**: The fundamental unit. It renders templates and
  executes CLI tools (e.g., Terraform/OpenTofu, Ansible). It is driven by
  `::params`.
  * **`comp-workflow`**: A high-level orchestrator that sequences multiple
  `shell-workflows` to create a unified lifecycle (e.g., `create`, `delete`).

  ### Usage Syntax
  ```shell
  # Execute a shell workflow directly
  bb <shell-workflow> <step|cmd>+ [-- <raw-command>]

  # Execute a composite workflow
  bb <comp-workflow> <step>+
  ```

  ### Examples
  ```shell
  # Individual development/testing
  bb shell-wf-a render tofu:init -- tofu apply -auto-approve
  bb shell-wf-b render ansible-playbook:main.yml

  # Orchestrated execution
  bb comp-wf-c create
  ```

  In this example, `comp-wf-c` composes `shell-wf-a` and `shell-wf-b`.
  Development and debugging happen within the individual shell workflows, while
  the composite workflow manages the sequence.

  ### Core Logic & Functions
  * **`run-steps`**: The engine for dynamic workflow execution.
  * **`prepare`**: Shared logic for rendering templates and initializing
  execution environments.
  * **`parse-shell-args` / `parse-comp-args`**: Utility functions to normalize
  string or vector-based arguments.

  #### Configuration Options (`opts`)
  * `::path-fn`: Logic for resolving file paths.
  * `::params`: The input data for the workflow.
  * `::name`: The unique identifier for the workflow instance.
  * `::dirs`: Directory context for execution and output discovery.

  ### Naming Conventions
  To distinguish between the library core and the Babashka CLI implementation:

  * **`tofu*`**: The library-level function. Requires `step-fns` and `opts`.
  * **`tofu`**: The Babashka-ready task. Accepts `args` and optional `opts`.

  ### Decoupled Data Sharing
  Standard Terraform/HCL patterns often lead to tight coupling, where downstream
  resources must know the exact structure of upstream providers (e.g., the
  specific IP output format of AWS vs. Hetzner).

  **BigConfig Workflow solves this through Parameter Adaptation:**

  1. **Isolation**: `shell-wf-b` (Ansible) never talks directly to `shell-wf-a`
  (Tofu).
  2. **Orchestration**: The `comp-workflow` acts as a glue layer. It uses
  `::dirs` to discover outputs from the first workflow (via `tofu output
  --json`) and maps them to the `::params` required by the next.
  3. **Interchangeability**: You can swap a Hetzner workflow for an AWS workflow
  without modifying the downstream Ansible code. Only the mapping logic in the
  `comp-workflow` needs to be updated.

  > **Note:** Resource naming and state booking are outside the scope of BigConfig Workflow.
"
  (:require
   [big-config :as bc]
   [big-config.core :as core]
   [big-config.git :as git]
   [big-config.lock :as lock]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.unlock :as unlock]))

(defn run-steps*
  ([step-fns {:keys [::steps] :as opts}]
   (loop [steps (map keyword steps)
          opts opts]
     (let [{:keys [::bc/exit] :as opts} (case (first steps)
                                          :lock (lock/lock step-fns opts)
                                          :git-check (git/check step-fns opts)
                                          :render (render/templates step-fns opts)
                                          :exec (run/run-cmds step-fns opts)
                                          :git-push (git/git-push opts)
                                          :unlock-any (unlock/unlock-any step-fns opts))]
       (cond
         (and (seq (rest steps))
              (or (= exit 0)
                  (nil? exit))) (recur (rest steps) opts)
         :else opts)))))

(def run-steps
  (core/->workflow {:first-step ::start
                    :wire-fn (fn [step step-fns]
                               (case step
                                 ::start [(partial run-steps* step-fns) ::end]
                                 ::end [identity]))}))
