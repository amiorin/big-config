(ns tofu.alpha.create-kms
  (:require
   [big-config.utils :refer [deep-merge nested-sort-map]]
   [big-tofu.core :refer [->Construct add-suffix body caller-identity
                          reference root-arn]]
   [clojure.pprint :as pp]))

(defn invoke [kms-fqn]
  (let [kms (->Construct :resource :aws_kms_key kms-fqn {})
        policy (->Construct :data
                            :aws_iam_policy_document
                            (add-suffix kms-fqn "-data-policy")
                            [{:statement [{:actions ["kms:*"]
                                           :effect "Allow"
                                           :resources ["*"]
                                           :principals [{:identifiers [(-> caller-identity
                                                                           root-arn)]
                                                         :type "AWS"}]}]}])]
    [caller-identity
     policy
     kms
     (->Construct :resource
                  :aws_kms_key_policy
                  (add-suffix kms-fqn "-resource-policy")
                  {:key_id (reference kms :id)
                   :policy (reference policy :json)})]))

(comment
  (->> (invoke :alpha/big-kms)
       (map body)
       (apply deep-merge)
       nested-sort-map
       pp/pprint))
