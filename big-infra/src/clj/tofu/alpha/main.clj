(ns tofu.alpha.main
  (:require
   [big-config.utils :refer [deep-merge nested-sort-map]]
   [big-tofu.core :refer [body add-suffix]]
   [clojure.pprint :as pp]
   [clojure.string :as str]
   [tofu.common.create :as create]))

(defn invoke [{:keys [aws-account-id region] :as opts}]
  (let [bucket (str/join "-" (vector "tf-state" aws-account-id region))
        queues (->> (for [n (range 2)]
                      (create/sqs (add-suffix :alpha/big-sqs (str "-" n))))
                    flatten
                    (map body))
        kms (->> (create/kms :alpha/big-kms)
                 (map body))
        provider (create/provider (assoc opts :bucket bucket))]
    (->> [provider]
         (into kms)
         (into queues)
         (apply deep-merge)
         nested-sort-map)))

(comment
  (-> {:aws-account-id "251213589273"
       :region "eu-west-1"
       :module "alpha"}
      invoke
      pp/pprint))
