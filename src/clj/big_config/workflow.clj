(ns big-config.workflow
  "
  The goal of the BigConfig Workflow is to enable independent development of
  automation units while providing a structured way to compose them into complex
  pipelines.

  ### Workflow Types
  * **`tool-workflow`**: The fundamental unit. It renders templates and
  executes CLI tools (e.g., Terraform/OpenTofu, Ansible). It is driven by
  `::params`.
  * **`comp-workflow`**: A high-level orchestrator that sequences multiple
  `tool-workflows` to create a unified lifecycle (e.g., `create`, `delete`).

  ### Usage Syntax
  ```shell
  # Execute a tool workflow directly
  bb <tool-workflow> <step|cmd>+ [-- <raw-command>]

  # Execute a composite workflow
  bb <comp-workflow> <step>+
  ```

  ### Examples
  ```shell
  # Individual development/testing
  bb tool-wf-a render tofu:init -- tofu apply -auto-approve
  bb tool-wf-b render ansible-playbook:main.yml

  # Orchestrated execution
  bb comp-wf-c create
  ```

  In this example, `comp-wf-c` composes `tool-wf-a` and `tool-wf-b`.
  Development and debugging happen within the individual tool workflows, while
  the composite workflow manages the sequence.

  ### Available Steps
  #### `tool-workflow`
  | Step       | Description                                                     |
  | :----      | :----                                                           |
  | **render**     | Generate the configuration files.                               |
  | **git-check**  | Verifies the working directory is clean and synced with origin. |
  | **git-push**   | Pushes local commits to the remote repository.                  |
  | **lock**       | Acquires an execution lock.                                     |
  | **unlock-any** | Force-releases the lock, regardless of the current owner.       |
  | **exec**       | Executes commands provided in the global-args.                  |
  #### `comp-workflow`
  | Step       | Description                                                     |
  | :----      | :----                                                           |
  | **create**     | Invokes one or more `tool-workflows` to create a resource.        |
  | **delete**     | Invokes one or more `tool-workflows` to delete a resource.        |

  ### Core Logic & Functions
  * **`run-steps`**: The engine for dynamic workflow execution.
  * **`prepare`**: Shared logic for rendering templates and initializing
  execution environments.
  * **`parse-args`**: Utility functions to normalize string or vector-based
  arguments.

  ### Options for `opts`
  * `::name` (required): The unique identifier for the workflow instance.
  * `::dirs` (generated): Directory context for execution and output discovery.
  It is generated automatically by `prepare`.
  * `::path-fn` (optional): Logic for resolving file paths.
  * `::params` (optional): The input data for the workflow.

  ### Options for `prepare-opts`
  * `::name` (required): The unique identifier for the workflow instance.

  ### Options for `prepare-overrides`
  * `::path-fn` (optional): Logic for resolving file paths.
  * `::params` (optional): The input data for the workflow.

  ### Naming Conventions
  To distinguish between the library core and the Babashka CLI implementation:

  * **`[workflow name]`**: The library-level function. Requires `step-fns` and `opts`.
  * **`[workflow name]*`**: The Babashka-ready task. Accepts `args` and optional `opts`.

  ```clojure
  ; wf.clj
  (defn tofu
    [step-fns opts]
    (let [opts (prepare {::name ::tofu
                         ::render/templates [{:template \"tofu\"
                                              :overwrite true
                                              :transform [[\"tofu\"
                                                           :raw]]}]}
                        opts)]
      (run-steps step-fns opts)))

  (defn tofu*
    [args & [opts]]
    (let [opts (merge (parse-args args)
                      opts)]
      (tofu [] opts)))
  ```
  ```clojure
  ; bb.edn
  {:deps {group/artifact {:local/root \".\"}}
   :tasks
   {:requires ([group.artifact.wf :as wf])
    tofu {:doc \"bb tofu render tofu:init tofu:apply:-auto-approve\"
          :task (wf/tofu* *command-line-args* {:big-config/env :shell})}
    ansible {:doc \"bb ansible render -- ansible-playbook main.yml\"
             :task (wf/ansible* *command-line-args* {:big-config/env :shell})}
    resource {:doc \"bb resource create and delete a resource\"
              :task (wf/resource* *command-line-args* {:big-config/env :shell})}}}
  ```

  ### Decoupled Data Sharing
  Standard Terraform/HCL patterns often lead to tight coupling, where downstream
  resources must know the exact structure of upstream providers (e.g., the
  specific IP output format of AWS vs. Hetzner).

  **BigConfig Workflow solves this through Parameter Adaptation:**

  1. **Isolation**: `tool-wf-b` (Ansible) never talks directly to `tool-wf-a`
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
   [big-config.unlock :as unlock]
   [big-config.utils :refer [assert-args-present debug keyword->path]]
   [bling.core :refer [bling]]
   [clojure.string :as str]
   [com.rpl.specter :as s]
   [selmer.parser :as parser]
   [selmer.util :as util]))

(def ^{:doc "Print all steps of the workflow. See the namespace
  `big-config.workflow`."
       :arglists '([step opts])}
  print-step-fn
  (core/->step-fn {:before-f (fn [step {:keys [::bc/exit] :as opts}]
                               (binding [util/*escape-variables* false]
                                 (let [[lock-start-step] (lock/lock)
                                       [unlock-start-step] (unlock/unlock-any)
                                       [check-start-step] (git/check)
                                       [render-start-step] (render/templates)
                                       [prefix color] (if (and exit
                                                               (not= exit 0))
                                                        ["\uf05c" :red.bold]
                                                        ["\ueabc" :green.bold])
                                       msg (cond
                                             (= step lock-start-step) (parser/render "Lock (owner {{ big-config..lock/owner }})" opts)
                                             (= step unlock-start-step) "Unlock any"
                                             (= step check-start-step) "Checking if the working directory is clean"
                                             (= step render-start-step) (parser/render "Rendering workflow: {{ big-config..workflow/name }}" opts)
                                             (= step ::run/run-cmd) (parser/render "Running:\n> {{ big-config..run/cmds | first}}" opts)
                                             :else nil)]
                                   (when msg
                                     (binding [*out* *err*]
                                       (println (bling [color (parser/render (str "{{ prefix }} " msg) {:prefix prefix})])))))))
                   :after-f (fn [step {:keys [::bc/exit] :as opts}]
                              (let [[_ check-end-step] (git/check)
                                    prefix "\uf05c"
                                    msg (cond
                                          (= step check-end-step) "Working directory is NOT clean"
                                          (= step ::run/run-cmd) (parser/render "Failed running:\n> {{ big-config..run/cmds | first }}" opts)
                                          :else nil)]
                                (when (and msg
                                           (> exit 0))
                                  (binding [*out* *err*]
                                    (println (bling [:red.bold (parser/render (str "{{ prefix }} " msg) {:prefix prefix})]))))))}))

(comment (print-step-fn))

(defn- resolve-fn [kw opts]
  (let [f (get opts kw)]
    (cond
      (nil? f) (throw (ex-info (format "`%s` not defined" kw) opts))
      (fn? f) f
      (symbol? f) (requiring-resolve f)
      :else (throw (ex-info (format "Value for `%s` is neither a function nor a symbol" kw) opts)))))

(defn run-steps
  [step-fns {:keys [::globals ::steps ::create-opts ::delete-opts] :as opts}]
  (let [globals-opts (->> (or globals [::bc/env ::run/shell-opts ::globals])
                          (select-keys opts))
        create-opts (merge (or create-opts {}) globals-opts)
        delete-opts (merge (or delete-opts {}) globals-opts)
        opts* (atom (-> opts
                        (assoc ::create [])
                        (assoc ::delete [])))
        steps* (atom (map (fn [step] (keyword "big-config.workflow" (name step))) steps))
        wf (core/->workflow {:first-step ::start
                             :wire-fn (fn [step step-fns]
                                        (case step
                                          ::start [core/ok ::unknown]
                                          ::lock [(partial lock/lock step-fns) ::unknown]
                                          ::git-check [(partial git/check step-fns) ::unknown]
                                          ::render [(partial render/templates step-fns) ::unknown]
                                          ::create [(fn [create-opts] ((resolve-fn ::create-fn opts) step-fns create-opts)) ::unknown]
                                          ::delete [(fn [delete-opts] ((resolve-fn ::delete-fn opts) step-fns delete-opts)) ::unknown]
                                          ::exec [(partial run/run-cmds step-fns) ::unknown]
                                          ::git-push [(partial git/git-push) ::unknown]
                                          ::unlock-any [(partial unlock/unlock-any step-fns) ::unknown]
                                          ::end [identity]))
                             :next-fn (fn [step next-step {:keys [::bc/exit] :as opts}]
                                        (if (#{::create ::delete} step)
                                          (do
                                            (swap! opts* merge (select-keys opts [::bc/exit ::bc/err]))
                                            (swap! opts* update step conj opts))
                                          (reset! opts* opts))
                                        (cond
                                          (= step ::end)
                                          [nil @opts*]

                                          (> exit 0)
                                          [::end @opts*]

                                          :else
                                          (let [next-step (first @steps*)
                                                _ (swap! steps* rest)]
                                            (if next-step
                                              [next-step (case next-step
                                                           ::create create-opts
                                                           ::delete delete-opts
                                                           @opts*)]
                                              [::end @opts*]))))})]
    (wf step-fns @opts*)))

(comment
  (debug tap-values
    (run-steps [(fn [f step opts]
                  (tap> [step opts])
                  (f step opts))]
               {::steps [:create :delete :create :delete]
                ::create-fn (fn [step-fns opts] (core/ok opts))
                ::delete-fn (fn [step-fns opts] (core/ok opts))
                ::create-opts {:a 1}
                ::delete-opts {:a 2}
                ::bc/env :repl
                ::lock/owner "alberto"}))
  (-> tap-values))

(defn parse-args
  "Utility functions to normalize string or vector-based arguments. See the
  namespace `big-config.workflow`."
  [str-or-args]
  (loop [xs str-or-args
         token nil
         steps []
         cmds []]
    (cond
      (string? xs)
      (let [xs (-> (str/trim xs)
                   (str/split #"\s+"))]
        (recur (rest xs) (first xs) steps cmds))

      (and (sequential? xs)
           (seq xs)
           (nil? token))
      (recur (rest xs) (first xs) steps cmds)

      (#{"lock" "git-check" "render" "create" "delete" "exec" "git-push" "unlock-any"} token)
      (let [steps (into steps [token])]
        (recur (rest xs) (first xs) steps cmds))

      (= "--" token)
      (if (seq xs)
        (let [steps (if (some #{"exec"} steps)
                      steps
                      (into steps ["exec"]))
              cmds (conj cmds (str/join " " xs))]
          (recur '() nil steps cmds))
        (throw (ex-info "-- cannot be without a command" {})))

      token
      (let [steps (if (some #{"exec"} steps)
                    steps
                    (into steps ["exec"]))
            cmds (into cmds [(str/replace token ":" " ")])]
        (recur (rest xs) (first xs) steps cmds))

      :else
      {::steps steps
       ::run/cmds cmds})))

(defn prepare
  "Prepare `opts`. See the namespace `big-config.workflow`."
  {:arglists '([opts overrides])}
  [{:keys [::name] :as opts} {:keys [::path-fn ::params] :as overrides}]
  (assert-args-present opts overrides name)
  (let [path-fn (or path-fn #(format ".dist/%s" (-> % ::name keyword->path)))
        opts (merge opts overrides)
        dir (path-fn opts)
        opts (->> opts
                  (s/transform [::render/templates s/ALL] #(merge % params
                                                                  {:target-dir dir}))
                  (s/setval [::run/shell-opts :dir] dir)
                  (s/transform [::dirs] #(assoc % name dir)))]
    opts))

(comment
  (prepare {::name ::tofu
            ::render/templates [{}]} {}))
