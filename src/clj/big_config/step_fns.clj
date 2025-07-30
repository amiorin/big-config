(ns big-config.step-fns
  (:require
   [big-config :as bc]
   [big-config.core :refer [->step-fn]]
   [bling.core :refer [bling]]
   [clojure.java.io :as io]
   [clojure.string :as str]
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

(defn ->print-error-step-fn [end]
  (->step-fn {:before-f (fn [step {:keys [::bc/err
                                          ::bc/exit
                                          ::bc/stack-trace]}]
                          (let [color :red.bold
                                prefix "\uf05c"
                                msg (when (and (= step end)
                                               (> exit 0)
                                               (string? err)
                                               (not (str/blank? err))) err)
                                stack-trace (when (and (= step end)
                                                       (> exit 0)
                                                       (not (str/blank? stack-trace))) stack-trace)]
                            (when msg
                              (binding [*out* *err*]
                                (println (bling [color (p/render (str "{{ prefix }} " msg) {:prefix prefix})]))))
                            (when stack-trace
                              (let [temp-file (java.io.File/createTempFile "big-config-" ".txt" (java.io.File. "/tmp"))]
                                (with-open [writer (io/writer temp-file)]
                                  (.write writer (str stack-trace)))
                                (binding [*out* *err*]
                                  (println (bling [color (p/render "\nThe stack-trace has been written to {{temp-file}}" {:temp-file (.getAbsolutePath temp-file)})])))))))}))

(def tap-step-fn
  (let [f (fn [label step opts]
            (tap> [step label opts]))]
    (->step-fn {:before-f (partial f :before)
                :after-f (partial f :after)})))

(defn log-step-fn [f step opts]
  (->> (update opts ::bc/steps (fnil conj []) step)
       (f step)))

(def bling-step-fn
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

(comment
  [tap-step-fn bling-step-fn]
  (log-step-fn nil nil nil))
