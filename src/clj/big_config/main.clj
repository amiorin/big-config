(ns big-config.main
  (:require
   [aero.core :as aero]
   [big-config :as bc]
   [big-config.lock :as lock]
   [big-config.msg :refer [step->message]]
   [big-config.run :as run]
   [big-config.run-with-lock :as rwl]
   [big-config.unlock :as unlock]
   [big-config.utils :refer [default-step-fn exit-end-fn]]
   [clojure.string :as str]))

(defn resolve-array [config key xs]
  (assoc config key
         (->> xs
              (map (fn [e] (if (keyword? e) (name (e config)) e)))
              (str/join ""))))

(defn read-module [cmd module profile]
  (let [config (-> (aero/read-config "big-config.edn" {:profile profile})
                   module
                   (merge {:cmd cmd
                           :module module
                           :profile profile}))
        {:keys [run-cmd working-dir]} config
        config (resolve-array config :working-dir working-dir)
        config (resolve-array config :run-cmd run-cmd)]
    config))

(defn run-step-fn [end {:keys [f step opts]}]
  (let [msg (step->message step)]
    (when msg
      (println msg))
    (let [new-opts (default-step-fn {:f f
                                     :step step
                                     :opts opts})]
      (when (= step end)
        (exit-end-fn new-opts))
      new-opts)))

(defn ^:export tofu [{[cmd module profile] :args
                      env :env
                      step-fn :step-fn}]
  (let [step-fn (or step-fn run-step-fn)]
    (as-> (read-module cmd module profile) $
      (assoc $ ::bc/env (or env :shell))
      (case cmd
        (:init :plan)     (run/run (partial step-fn ::run/end) $)
        :lock             (lock/lock (partial step-fn ::lock/end) $)
        :unlock-any       (unlock/unlock-any (partial step-fn ::unlock/end) $)
        (:apply :destroy) (rwl/run-with-lock (partial step-fn ::rwl/end) $)))))

(comment
  (-> (tofu {:args [:init :module-a :dev]
             :env :repl})))
