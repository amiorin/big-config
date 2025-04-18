(ns big-infra.alpha.main
  (:require
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [add-suffix construct]]
   [big-tofu.create :as create]
   [clojure.pprint :as pp]))

(defn invoke [opts]
  (let [queues (->> (for [n (range 2)]
                      (create/sqs (add-suffix :alpha/big-sqs (str "-" n))))
                    flatten
                    (map construct))
        kms (->> (create/kms :alpha/big-kms)
                 (map construct))
        provider (create/provider (assoc opts :bucket "tf-state-251213589273-eu-west-1"))]
    (->> [provider]
         (into kms)
         (into queues)
         (apply deep-merge)
         sort-nested-map)))

(comment
  (-> {:aws-account-id "251213589273"
       :region "eu-west-1"
       :module "alpha"}
      invoke
      pp/pprint))
