(ns big-config.big-tofu.create
  (:require [big-config.big-tofu.core :as tofu]
            [big-config.keys :as k]
            [big-config.utils :as u]
            [clojure.string :as str]))

(defn bucket [fqn & xs]
  (if (seq xs)
    (apply bucket (tofu/add-suffix fqn (str "-" (first xs))) (rest xs))
    [(tofu/->Construct :resource :aws_s3_bucket fqn [{:bucket (tofu/fqn->name fqn "-")}])]))

(defn sqs [fqn]
  [(tofu/->Construct :resource :aws_sqs_queue fqn {:name (tofu/fqn->name fqn)})])

(defn kms [fqn]
  (let [kms-key (tofu/->Construct :resource :aws_kms_key fqn {})
        policy (tofu/->Construct :data :aws_iam_policy_document (tofu/add-suffix fqn "-data-policy")
                                  [{:statement [{:actions ["kms:*"]
                                                 :effect "Allow"
                                                 :resources ["*"]
                                                 :principals [{:identifiers [(tofu/root-arn tofu/caller-identity)]
                                                               :type "AWS"}]}]}])]
    [tofu/caller-identity
     policy
     kms-key
     (tofu/->Construct :resource :aws_kms_key_policy (tofu/add-suffix fqn "-resource-policy")
                        {:key_id (tofu/reference kms-key :id)
                         :policy (tofu/reference policy :json)})]))

(defn provider [{:keys [region bucket module assume-role assumeRole]}]
  (let [role (or assume-role assumeRole)
        key (str (k/name-of module) ".tfstate")
        assume-role-block (when (and role (seq (str/trim (str role))))
                            {:assume_role {:role_arn role}})]
    {:provider {:aws (merge {:region region} assume-role-block)}
     :terraform {:backend {:s3 (merge {:bucket bucket
                                       :encrypt true
                                       :key key
                                       :region region}
                                      assume-role-block)}
                 :required_providers {:aws {:source "hashicorp/aws" :version "~> 5.0"}}
                 :required_version ">= 1.8.0"}}))

(defn constructs->object [constructs]
  (apply u/deep-merge (map tofu/construct constructs)))
