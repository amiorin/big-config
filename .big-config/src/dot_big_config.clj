(ns dot-big-config
  (:require
   [big-config :as bc]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.step :as step]
   [big-config.utils :refer [port-assigner]]))

(defn run-steps [s opts & step-fns]
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
                    {::run/shell-opts {:dir dir}
                     ::render/templates [template]})]
    (if step-fns
      (apply step/run-steps s opts step-fns)
      (step/run-steps s opts))))

(comment
  (run-steps "render -- generic prod" {::bc/env :repl}))
