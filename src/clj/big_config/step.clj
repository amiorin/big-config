(ns big-config.step
  "
  BigConfig Step provides a Babashka-powered DSL for defining and executing
  infrastructure workflows directly from the CLI.

  ### Usage
  ```text
  bb <step|cmd>+ -- <module> <profile> [global-args]
  ```

  ### Core Concepts
  * **Steps:** Predefined functions built into the DSL (e.g., render, lock).
  * **Commands:** Any argument not recognized as a **Step** is treated as a shell command.
    * The `:` character is automatically replaced with a space.
    * Example: `tofu:plan` becomes `tofu plan`.

  ### Available Steps
  | Step       | Description                                                     |
  | :----      | :----                                                           |
  | **render**     | Generate the configuration files.                               |
  | **git-check**  | Verifies the working directory is clean and synced with origin. |
  | **git-push**   | Pushes local commits to the remote repository.                  |
  | **lock**       | Acquires an execution lock.                                     |
  | **unlock-any** | Force-releases the lock, regardless of the current owner.       |
  | **exec**       | Executes commands provided in the global-args.                  |

  ### Command Mapping Examples

  The DSL allows you to chain commands or pass arguments globally.

  **1. Using exec vs. Direct Mapping**

  These commands are functionally identical:
  ```sh
  # Using the exec step with global-args
  bb exec -- alpha prod ansible-playbook main.yml

  # Using direct command mapping
  bb ansible-playbook:main.yml -- alpha prod
  ```
  **2. Handling Arguments**

  You can pass arguments globally after the `--` separator, or inline using the
  colon syntax:

  ```sh
  # Global arguments (applied to all steps)
  bb tofu:apply tofu:destroy -- alpha prod -auto-approve

  # Inline arguments (specific to each command)
  bb tofu:apply:-auto-approve tofu:destroy:-auto-approve -- alpha prod
  ```

  **3. Quick Reference: Command Syntax**
  * `tofu:init` -> `tofu init`
  * `tofu:plan` -> `tofu plan`
  * `ansible-playbook:main.yml` -> `ansible-playbook main.yml`

  ### Zero-cost workflow
  By using an alias, you can make BigConfig invisible to your daily workflow,
  wrapping your standard tools in a safety-first pipeline (rendering, locking,
  and syncing) automatically.

  ```sh
  # Example: Wrapping Tofu with a full safety lifecycle
  alias tofu=\"bb render git-check lock exec git-push unlock-any -- alpha prod tofu\"
  ```
  "
  (:require
   [big-config :as bc]
   [big-config.build :as build]
   [big-config.core :as core]
   [big-config.git :as git]
   [big-config.lock :as lock]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.step-fns :as step-fns]
   [big-config.unlock :as unlock]
   [bling.core :refer [bling]]
   [clojure.string :as str]
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
                                       [build-start-step] ((build/->build (fn [])))
                                       [render-start-step] (render/templates)
                                       [prefix color] (if (and exit
                                                               (not= exit 0))
                                                        ["\uf05c" :red.bold]
                                                        ["\ueabc" :green.bold])
                                       msg (cond
                                             (= step lock-start-step) (parser/render "Lock (owner {{ big-config..lock/owner }})" opts)
                                             (= step unlock-start-step) "Unlock any"
                                             (= step check-start-step) "Checking if the working directory is clean"
                                             (= step build-start-step) "Building:"
                                             (= step render-start-step) (parser/render "Rendering template for module {{ big-config..step/module }} and profile {{ big-config..step/profile }}:" opts)
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

(defn ^:no-doc parse [s]
  (loop [xs s
         token nil
         steps []
         cmds []
         module nil
         profile nil
         global-args nil]
    (cond
      (string? xs)
      (let [xs (-> (str/trim xs)
                   (str/split #"\s+"))]
        (recur (rest xs) (first xs) steps cmds module profile global-args))

      (#{"lock" "git-check" "build" "render" "exec" "git-push" "unlock-any"} token)
      (let [steps (into steps [token])]
        (recur (rest xs) (first xs) steps cmds module profile global-args))

      (= "--" token)
      (recur (drop 2 xs) (second xs) steps cmds (first xs) profile global-args)

      (and module (nil? profile))
      (let [global-args (if (seq xs)
                          (str/join ":" xs)
                          nil)
            cmds (if (seq cmds)
                   (mapv #(apply str % (if global-args
                                         [":" global-args]
                                         nil)) cmds)
                   (if global-args
                     [global-args]
                     []))
            cmds (mapv #(str/replace % ":" " ") cmds)]
        [steps cmds module token])

      (nil? module)
      (let [steps (if (some #{"exec"} steps)
                    steps
                    (into steps ["exec"]))
            cmds (into cmds [token])]
        (recur (rest xs) (first xs) steps cmds module profile global-args)))))

(defn parse-module-and-profile
  "Given a BigConfig DSL, it returns `module` and `profile`"
  [s]
  (let [[_ _ module profile] (parse s)]
    {:module module
     :profile profile}))

(comment
  (parse-module-and-profile "render -- dotfiles ubuntu"))

(defn ^:no-doc run-step
  ([step-fns opts]
   (run-step (fn [opts] (core/ok opts)) step-fns opts))
  ([build-fn step-fns {:keys [::steps] :as opts}]
   (loop [steps (map keyword steps)
          opts opts]
     (let [{:keys [::bc/exit] :as opts} (case (first steps)
                                          :lock (lock/lock step-fns opts)
                                          :git-check (git/check step-fns opts)
                                          :build ((build/->build build-fn) step-fns opts)
                                          :render (render/templates step-fns opts)
                                          :exec (run/run-cmds step-fns opts)
                                          :git-push (git/git-push opts)
                                          :unlock-any (unlock/unlock-any step-fns opts))]
       (cond
         (and (seq (rest steps))
              (or (= exit 0)
                  (nil? exit))) (recur (rest steps) opts)
         :else opts)))))

(defn ^:no-doc ->run-steps
  ([]
   (->run-steps (fn [opts] (core/ok opts))))
  ([build-fn]
   (core/->workflow {:first-step ::start
                     :wire-fn (fn [step step-fns]
                                (case step
                                  ::start [(partial run-step build-fn step-fns) ::end]
                                  ::end [identity]))})))

(defn run-steps
  "A function that takes a BigConfig DSL and an `opts` map. It run a dynamic
  workflow based on the steps defined in the DSL."
  ([s]
   (run-steps s nil))
  ([s opts]
   (let [step-fns [print-step-fn
                   (step-fns/->exit-step-fn ::end)
                   (step-fns/->print-error-step-fn ::end)]]
     (run-steps s opts step-fns)))
  ([s opts step-fns]
   (apply run-steps opts step-fns (parse s)))
  ([opts step-fns steps cmds module profile]
   (let [opts (merge (or opts {::bc/env :repl})
                     {::steps steps
                      ::run/cmds cmds
                      ::module module
                      ::profile profile})
         step-fns (or step-fns [])
         do-run-steps (->run-steps)]
     (do-run-steps step-fns opts))))

(comment
  (run-steps "render -- foo bar" {::render/templates []}))
