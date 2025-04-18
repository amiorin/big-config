(ns big-config.step-fns
  (:require
   [big-config :as bc]
   [big-config.core :refer [->step-fn]]
   [bling.core :refer [bling]]
   [selmer.parser :as p]
   [selmer.util :as util]))

(defn exit-with-code [n]
  (shutdown-agents)
  (flush)
  (System/exit n))

(defn ->exit-step-fn [end]
  (->step-fn {:after-f (fn [step {:keys [::bc/env ::bc/exit]}]
                         (when (and (= step end)
                                    ((complement #{:repl}) env))
                           (exit-with-code exit)))}))

(def tap-step-fn
  (let [f (fn [label step opts]
            (tap> [step label opts]))]
    (->step-fn {:before-f (partial f :before)
                :after-f (partial f :after)})))

(defn log-step-fn [f step opts]
  (->> (update opts ::bc/steps (fnil conj []) step)
       (f step)))

(def ^:export bling-step-fn
  (->step-fn {:before-f (fn [step _]
                          (let [prefix "\ueabc"
                                color :green.bold]
                            (binding [*out* *err*
                                      util/*escape-variables* false]
                              (println (bling [color (p/render "{{ prefix }} {{ msg }}" {:prefix prefix
                                                                                         :msg (name step)})])))))
              :after-f (fn [step {:keys [::bc/exit
                                         ::bc/err]}]
                         (let [prefix "\uf05c"
                               color :red.bold]
                           (when (> exit 0)
                             (binding [*out* *err*
                                       util/*escape-variables* false]
                               (println (bling [color (p/render "{{ prefix }} {{ msg }}: {{ err }}" {:prefix prefix
                                                                                                     :msg (name step)
                                                                                                     :err err})]))))))}))
