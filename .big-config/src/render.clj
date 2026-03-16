(ns render
  (:require
   [big-config :as bc]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.step-fns :as step-fns]
   [big-config.utils :refer [debug port-assigner]]
   [big-config.workflow :as workflow]))

(def step-fns [workflow/print-step-fn
               (step-fns/->exit-step-fn ::workflow/end)
               (step-fns/->print-error-step-fn ::workflow/end)])

(defn build
  [step-fns opts]
  (let [dir ".."
        template {:template "big-config"
                  :target-dir dir
                  :overwrite true
                  :redis-port-dev (port-assigner "redis")
                  :redis-port-test (port-assigner "redis-test")
                  :pc-port-dev (port-assigner "pc")
                  :pc-port-test (port-assigner "pc-test")
                  :transform [["root" ""
                               {"envrc" ".envrc"
                                "projectile" ".projectile"}
                               {:tag-open \<
                                :tag-close \>}]]}
        opts (merge opts
                    {::workflow/name ::build
                     ::run/shell-opts {:dir dir}
                     ::render/templates [template]})]
    (workflow/run-steps step-fns opts)))

(defn build*
  [args & [opts]]
  (let [opts (merge (workflow/parse-args args)
                    {::bc/env :shell}
                    opts)]
    (build step-fns opts)))

(comment
  (debug tap-values
    (build* "render" {::bc/env :repl})))
