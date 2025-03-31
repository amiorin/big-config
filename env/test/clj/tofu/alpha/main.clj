(ns tofu.alpha.main
  (:require
   [big-config.utils :refer [deep-merge nested-sort-map]]
   [clojure.string :as str]
   [tofu.alpha.create-sqs :as create-sqs]
   [tofu.common.create-provider :as create-provider]))

(defn invoke [{:keys [aws-account-id region] :as opts}]
  (let [bucket (str/join "-" (vector "tf-state" aws-account-id region))
        queues (for [n (range 2)]
                 (create-sqs/invoke {:name (str "sqs-" n)}))

        provider (-> opts
                     (assoc :bucket bucket)
                     create-provider/invoke)]
    (->> [provider]
         (concat queues)
         (apply deep-merge)
         nested-sort-map)))

(comment
  (-> {:aws-account-id "251213589273"
       :region "eu-west-1"}
      invoke))
