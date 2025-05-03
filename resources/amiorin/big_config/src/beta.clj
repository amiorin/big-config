(ns {{top/ns}}.beta
  (:require
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [add-suffix construct]]
   [big-tofu.create :as create]
   [clojure.pprint :as pp]))

(defn ->opts [profile module]
  (let [opts {:region "{{aws-region}}"
              :module module}]
    (merge opts {:aws-account-id (case profile
                                   "dev" "{{aws-account-id-dev}}"
                                   "prod" "{{aws-account-id-prod}}")})))

(defn render [profile]
  (let [opts (->opts profile :beta)
        queues (->> (for [n (range 2)]
                      (create/sqs (add-suffix :alpha/big-sqs (str "-" n))))
                    flatten
                    (map construct))
        kms (->> (create/kms :alpha/big-kms)
                 (map construct))
        provider (create/provider (assoc opts :bucket "tf-state-{{aws-account-id-dev}}-{{aws-region}}"))]
    (->> [provider]
         (into kms)
         (into queues)
         (apply deep-merge)
         sort-nested-map)))

(comment
  (-> (render "dev")
      pp/pprint))
