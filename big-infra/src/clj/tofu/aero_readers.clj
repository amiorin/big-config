(ns tofu.aero-readers
  (:require
   [aero.core :refer [reader]]))

(def modules (atom #{}))

(defmethod reader 'module
  [_ _ value]
  (swap! modules conj value)
  value)
