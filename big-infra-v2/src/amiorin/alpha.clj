(ns amiorin.alpha
  (:require
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [add-suffix construct]]
   [big-tofu.create :as create]
   [clojure.pprint :as pp]))

(defn ->opts [profile module]
  (let [opts {:region "eu-west-1"
              :module module}]
    (merge opts {:aws-account-id (case profile
                                   "dev" "251213589273"
                                   "prod" "251213589273")})))

(defn render [profile]
  (let [opts (->opts profile :beta)
        queues (->> (for [n (range 2)]
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
  (-> (render "dev")
      pp/pprint))
