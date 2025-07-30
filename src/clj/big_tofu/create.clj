(ns big-tofu.create
  (:require
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [->Construct add-suffix caller-identity construct
                          fqn->name reference root-arn]]
   [clojure.pprint :as pp]
   [clojure.string :as str]))

(defn bucket
  ([fqn]
   [(->Construct :resource :aws_s3_bucket fqn [{:bucket (fqn->name fqn "-")}])])
  ([fqn & xs]
   (if (seq (rest xs))
     (apply bucket (add-suffix fqn (str "-" (first xs))) (rest xs))
     (bucket (add-suffix fqn (str "-" (first xs)))))))

(defn sqs [fqn]
  [(->Construct :resource :aws_sqs_queue fqn {:name (fqn->name fqn)})])

(defn kms [fqn]
  (let [kms (->Construct :resource :aws_kms_key fqn {})
        policy (->Construct :data
                            :aws_iam_policy_document
                            (add-suffix fqn "-data-policy")
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
                  (add-suffix fqn "-resource-policy")
                  {:key_id (reference kms :id)
                   :policy (reference policy :json)})]))

(defn provider [{:keys [region bucket module assume-role]}]
  (let [key (str (name module) ".tfstate")
        assume-role (when (and assume-role
                               (not (str/blank? assume-role)))
                      {:assume_role {:role_arn assume-role}})]
    {:provider {:aws (merge {:region region}
                            assume-role)}
     :terraform {:backend {:s3 (merge {:bucket bucket
                                       :encrypt true
                                       :key key
                                       :region region}
                                      assume-role)}
                 :required_providers {:aws {:source "hashicorp/aws"
                                            :version "~> 5.0"}}
                 :required_version ">= 1.8.0"}}))

(comment
  (provider nil)
  (->> (kms :alpha/big-kms)
       (map construct)
       (apply deep-merge)
       sort-nested-map
       pp/pprint)
  (->> (sqs :alpha/big-sqs)
       (map construct)
       (apply deep-merge)
       sort-nested-map
       pp/pprint)
  (->> (bucket :alpha/big-bucket "foo" "bar")
       (map construct)
       (apply deep-merge)
       sort-nested-map
       pp/pprint))
