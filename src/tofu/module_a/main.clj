(ns tofu.module-a.main)

(defn ^:export invoke [{:keys [region
                               aws-account-id]}]
  {:provider {:aws [{:region region
                     :allowed_account_ids (vector aws-account-id)
                     :default_tags {:tags  {:org_repo    "motain/iac"
                                            :tribe       "data-platform"
                                            :squad       "dacore"
                                            :path        "production-infra-dacore-data-platform"
                                            :Managed_by  "Terraform"}}}]}
   :terraform [{:backend {:s3 [{:bucket "airflow-dacore"
                                :encrypt true
                                :key "bar.tfstate"
                                :region region}]}
                :required_providers [{:aws {:source "hashicorp/aws"
                                            :version "~> 5.0"}}]
                :required_version ">= 1.8.0"}]})
