(ns tofu.alpha.main
  (:require
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [add-suffix construct]]
   [clojure.pprint :as pp]
   [clojure.string :as str]
   [big-tofu.create :as create]))

(defn invoke [{:keys [aws-account-id region] :as opts}]
  (let [bucket (str/join "-" (vector "tf-state" aws-account-id region))
        queues (->> (for [n (range 2)]
                      (create/sqs (add-suffix :alpha/big-sqs (str "-" n))))
                    flatten
                    (map construct))
        kms (->> (create/kms :alpha/big-kms)
                 (map construct))
        provider (create/provider (assoc opts :bucket bucket))]
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
