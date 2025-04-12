(ns amiorin.big-config
  (:require
   [babashka.classpath :as cp]
   [babashka.cli :as cli]
   [big-config :as bc]
   [big-config.aero :as aero]
   [big-config.step-fns :refer [->exit-step-fn]]
   [big-config.tofu :as tofu :refer [block-destroy-prod-step-fn print-step-fn
                                     run-tofu stack-trace-step-fn]]))

(defn main [{[action module profile] :args
             step-fns :step-fns
             config :config
             env :env}]
  (let [action action
        module module
        profile profile
        step-fns (or step-fns [stack-trace-step-fn
                               print-step-fn
                               (block-destroy-prod-step-fn ::start)
                               (->exit-step-fn ::end)])
        env (or env :shell)]
    (->> (run-tofu step-fns {::tofu/action action
                             ::bc/env (or env :shell)
                             ::aero/config config
                             ::aero/module module
                             ::aero/profile profile
                             :big-config.run/dir [:big-config.aero/join
                                                  "tofu/"
                                                  :big-config.tofu/aws-account-id "/"
                                                  :big-config.aero/module]})
         (into (sorted-map)))))

(defn tofu [{:keys [opts]}]
  (let [{:keys [action module profile config]} opts]
    (cp/add-classpath "src")
    (cp/add-classpath "resources")
    (require '[tofu.aero-readers])
    (let [config (or config "big-config.edn")
          args (->> [action module profile]
                    (map keyword))]
      (main {:args args
             :config config}))))

(defn help [_]
  (println "Usage: big-config tofu <action> <module> <profil> [args]

Main actions:
  opts        Print the [big-config.edn] after interpolation
  init        prepare
  plan        plan
  apply       apply
  destroy
  lock
  unlock-any  a
  ci
  reset
  auto-apply

Options
  --config big-config.edn"))

(defn create-tofu-app [_]
  (println "TBD"))

(def table
  [{:cmds ["tofu"] :fn tofu :args->opts [:action :module :profile]}
   {:cmds ["create-tofu-app"] :fn create-tofu-app}
   {:cmds [] :fn help}])

(defn -main [& args]
  (cli/dispatch table args))

(comment
  (cli/dispatch table ["tofu" "init" "alpha" "prod" "--config" "foo.edn"])
  (cli/dispatch table []))
