(ns big-config.pluggable
  (:refer-clojure :exclude [defmethod remove-method])
  (:require [big-config.core :as core]
            [big-config.keys :as k]))

(defonce handlers (atom {}))

(defn handle-step [f step step-fns opts]
  (let [step (k/normalize-keyword step)]
    (if-let [handler (get @handlers step)]
      (handler f step step-fns opts)
      (f opts))))

(defn register-handle-step [step handler]
  (swap! handlers assoc (k/normalize-keyword step) handler))

(defn remove-handle-step [step]
  (swap! handlers dissoc (k/normalize-keyword step)))

(defn clear-handle-steps []
  (reset! handlers {}))

(def defmethod register-handle-step)
(def remove-method remove-handle-step)

(defn create-workflow-star [options]
  (let [wire-fn (or (:wire-fn options) (:wireFn options))
        wrapped-options (assoc options :wire-fn
                               (fn [step step-fns]
                                 (let [[f next-step] (try
                                                       (wire-fn step step-fns)
                                                       (catch clojure.lang.ArityException _
                                                         (wire-fn step)))]
                                   [(fn [opts] (handle-step f step step-fns opts)) next-step])))]
    (core/create-workflow wrapped-options)))

(def ->workflow* create-workflow-star)
