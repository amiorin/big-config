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

  ### Core Logic & Functions
  * **`run-steps`**: The engine for dynamic workflow execution.
  * **`prepare`**: Shared logic for rendering templates and initializing
  execution environments.
  * **`parse-tool-args` / `parse-comp-args`**: Utility functions to normalize
  string or vector-based arguments.

  ### Options for `opts`
  * `::name` (required): The unique identifier for the workflow instance.
  * `::dirs` (generated): Directory context for execution and output discovery.
  It is generated automatically by `prepare`.
  * `::path-fn` (optional): Logic for resolving file paths.
  * `::params` (optional): The input data for the workflow.

  ### Naming Conventions
  To distinguish between the library core and the Babashka CLI implementation:

  * **`[workflow name]*`**: The library-level function. Requires `step-fns` and `opts`.
  * **`[workflow name]`**: The Babashka-ready task. Accepts `args` and optional `opts`.

  ```clojure
  ; wf.clj
  (defn tofu*
    [step-fns opts]
    (let [opts (prepare {::name ::tofu
                         ::render/templates [{:template \"tofu\"
                                              :overwrite true
                                              :transform [[\"tofu\"
                                                           :raw]]}]}
                        opts)]
      (run-steps step-fns opts)))

  (defn tofu
    [args & [opts]]
    (let [opts (merge (parse-tool-args args)
                      opts)]
      (tofu* [] opts)))
  ```
  ```clojure
  ; bb.edn
  {:deps {group/artifact {:local/root \".\"}}
   :tasks
   {:requires ([group.artifact.wf :as wf])
    tofu {:doc \"bb tofu render tofu:init tofu:apply:-auto-approve\"
          :task (wf/tofu *command-line-args* {:big-config/env :shell})}
    ansible {:doc \"bb ansible render -- ansible-playbook main.yml\"
             :task (wf/ansible *command-line-args* {:big-config/env :shell})}
    resource {:doc \"bb resource create and delete a resource\"
              :task (wf/resource *command-line-args* {:big-config/env :shell})}}}
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
   [big-config.utils :refer [assert-args-present]]
   [bling.core :refer [bling]]
   [clojure.string :as str]
   [com.rpl.specter :as s]
   [selmer.parser :as parser]
   [selmer.util :as util]))

(def ^{:doc "Print all steps of the workflow."
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
                                             (= step render-start-step) "Rendering template:"
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

(defn ^:no-doc run-steps*
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

(def ^{:doc "Run the steps of a tool workflow."
       :arglists '([]
                   [opts]
                   [step-fns opts])}
  run-steps
  (core/->workflow {:first-step ::start
                    :wire-fn (fn [step step-fns]
                               (case step
                                 ::start [(partial run-steps* step-fns) ::end]
                                 ::end [identity]))}))

(defn parse-tool-args
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

      (#{"lock" "git-check" "build" "render" "exec" "git-push" "unlock-any"} token)
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

(defn parse-comp-args
  [str-or-args]
  (loop [xs str-or-args
         token nil
         cmds []]
    (cond
      (string? xs)
      (let [xs (-> (str/trim xs)
                   (str/split #"\s+"))]
        (recur (rest xs) (first xs) cmds))

      (and (sequential? xs)
           (seq xs)
           (nil? token))
      (recur (rest xs) (first xs) cmds)

      (#{"create" "delete"} token)
      (let [cmds (into cmds [(keyword token)])]
        (recur (rest xs) (first xs) cmds))

      :else
      (if (nil? token)
        {::cmds cmds}
        (throw (ex-info (format "Unknown cmd %s" token) {}))))))

(defn keyword->path [kw]
  (let [full-str (if-let [ns (namespace kw)]
                   (str ns "/" (name kw))
                   (name kw))]
    (-> full-str
        (str/replace "." "/"))))

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
