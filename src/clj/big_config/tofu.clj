(ns big-config.tofu
  (:require
   [babashka.process :as process]
   [big-config :as bc]
   [big-config.aero :as aero]
   [big-config.core :refer [->workflow handle-cmd]]
   [big-config.run :as run]
   [clojure.pprint :as pp]))

(defn ok [opts]
  (merge opts {::bc/exit 0
               ::bc/err nil}))

(defn action->opts [{:keys [::action] :as opts}]
  (-> (case action
        :opts opts
        :init (merge opts {::run/cmds ["echo tofu init"]})
        :ci (merge opts {::run/cmds ["echo tofu init" "echo tofu apply" "echo tofu destroy"]}))
      ok))

(defn trace-step-fn [f step opts]
  (f step (update opts ::bc/steps (fnil conj []) step)))

(defn run-cmds [{:keys [::bc/env ::run/cmds ::run/dir] :as opts}]
  (let [shell-opts {:continue true
                    :dir dir}
        shell-opts (case env
                     :shell shell-opts
                     :repl (merge shell-opts {:out :string
                                              :err :string}))]
    (loop [cmds cmds
           opts opts]
      (let [proc (process/shell shell-opts (first cmds))
            {:keys [::bc/exit] :as opts} (handle-cmd opts proc)]
        (cond
          (not= exit 0) opts
          (seq (rest cmds)) (recur (rest cmds) opts)
          :else opts)))))

(defn run-action [{:keys [::action] :as opts}]
  (case action
    :opts (do (pp/pprint (into (sorted-map) opts))
              (ok opts))
    (:init :ci) (run-cmds opts)))

(comment
  (let [action :ci
        module :alpha
        profile :dev
        env :repl
        wf (->workflow {:first-step ::start
                        :wire-fn (fn [step _]
                                   (case step
                                     ::start [action->opts ::read-module]
                                     ::read-module [aero/read-module ::run-action]
                                     ::run-action [run-action ::end]
                                     ::end [identity]))})]
    (->> (wf [trace-step-fn] {::action action
                              ::bc/env (or env :shell)
                              ::aero/config "big-config.edn"
                              ::aero/module module
                              ::aero/profile profile})
         (into (sorted-map)))))
