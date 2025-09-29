(ns big-config.build
  (:require
   [big-config.core :as core]))

(defn ->build
  [build-fn]
  (core/->workflow {:first-step ::start
                    :wire-fn (fn [step _]
                               (case step
                                 ::start [build-fn ::end]
                                 ::end [identity]))}))
