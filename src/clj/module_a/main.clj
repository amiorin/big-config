(ns module-a.main
  (:require
   [big-config :as bc]
   [clojure.string :as str]
   [common.create-provider :as create-provider]
   [module-a.create-sqs :as create-sqs]))

(defn ^:export invoke [opts]
  (let [{:keys [aws-account-id
                region]} opts
        bucket (str/join "-" (vector "tf-state" aws-account-id region))
        queues (for [n (range 2)]
                 (create-sqs/invoke {:name (str "sqs-" n)}))

        provider (case aws-account-id
                   "251213589273"  (-> opts
                                       (assoc :bucket bucket)
                                       create-provider/invoke))]
    (->> [provider]
         (concat queues)
         (apply bc/deep-merge)
         bc/nested-sort-map)))

(comment)
(-> {:aws-account-id "251213589273"
     :region "eu-west-1"
     :module "module-a"}
    invoke)
