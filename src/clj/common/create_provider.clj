(ns common.create-provider)

(defn ^:export invoke [opts]
  (let [{:keys [region
                bucket
                module
                aws-account-id]} opts
        key (str module "/tofu.tfstate")]
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
