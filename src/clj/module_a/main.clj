(ns module-a.main
  (:require
   [big-config :as bc]
   [clojure.string :as str]
   [common.create-provider :as create-provider]))

(defn ^:export invoke [opts]
  (let [{:keys [aws-account-id
                region
                module]} opts
        bucket (str/join "-" (vector "tf-state" aws-account-id region))
        provider (case aws-account-id
                   "251213589273" (create-provider/invoke {:region region
                                                           :bucket bucket
                                                           :module module
                                                           :aws-account-id aws-account-id}))]
    (bc/deep-merge provider)))
