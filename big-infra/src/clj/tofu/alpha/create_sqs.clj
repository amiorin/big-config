(ns tofu.alpha.create-sqs
  (:require
   [big-config.utils :refer [deep-merge nested-sort-map]]
   [clojure.pprint :as pp]
   [big-tofu.core :refer [->Construct fqn->name body]]))

(defn invoke [fqn]
  [(->Construct :resource :aws_sqs_queue fqn {:name (fqn->name fqn)})])

(comment
  (->> (invoke :alpha/big-sqs)
       (map body)
       (apply deep-merge)
       nested-sort-map
       pp/pprint))
