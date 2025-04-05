(ns tofu.alpha.main
  (:require
   [big-config.utils :refer [deep-merge nested-sort-map]]
   [big-tofu.core :refer [body add-suffix]]
   [clojure.pprint :as pp]
   [clojure.string :as str]
   [tofu.alpha.create-kms :as create-kms]
   [tofu.alpha.create-sqs :as create-sqs]
   [tofu.common.create-provider :as create-provider]))

(defn invoke [{:keys [aws-account-id region] :as opts}]
  (let [bucket (str/join "-" (vector "tf-state" aws-account-id region))
        queues (->> (for [n (range 2)]
                      (create-sqs/invoke (add-suffix :alpha/big-sqs (str "-" n))))
                    flatten
                    (map body))
        kms (->> (create-kms/invoke :alpha/big-kms)
                 (map body))
        provider (-> opts
                     (assoc :bucket bucket)
                     create-provider/invoke)]
    (->> [provider]
         (concat kms)
         (concat queues)
         (apply deep-merge)
         nested-sort-map)))

(comment
  (-> {:aws-account-id "251213589273"
       :region "eu-west-1"
       :module "alpha"}
      invoke
      pp/pprint))
