(ns tofu.common.create-provider)

(defn invoke [{:keys [region bucket module assume-role]}]
  (let [key (str (name module) ".tfstate")
        assume-role (when assume-role
                      {:assume_role {:role_arn assume-role}})]
    {:provider {:aws [(merge {:region region}
                             assume-role)]}
     :terraform [{:backend {:s3 [(merge {:bucket bucket
                                         :encrypt true
                                         :key key
                                         :region region}
                                        assume-role)]}
                  :required_providers [{:aws {:source "hashicorp/aws"
                                              :version "~> 5.0"}}]
                  :required_version ">= 1.8.0"}]}))
