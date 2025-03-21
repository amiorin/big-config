(ns tofu.common.create-provider
  (:require
   [big-config.aero :as aero]
   [big-config.tofu :as tofu]))

(defn invoke [opts]
  (let [{:keys [::tofu/region
                ::tofu/bucket
                ::aero/module
                ::tofu/aws-account-id]} opts
        key (str (name module) ".tfstate")]
    {:provider {:aws [{:profile aws-account-id
                       :region region
                       :allowed_account_ids (vector aws-account-id)}]}
     :terraform [{:backend {:s3 [{:bucket bucket
                                  :encrypt true
                                  :key key
                                  :region region}]}
                  :required_providers [{:aws {:source "hashicorp/aws"
                                              :version "~> 5.0"}}]
                  :required_version ">= 1.8.0"}]}))
