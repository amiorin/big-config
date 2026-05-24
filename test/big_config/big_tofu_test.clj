(ns big-config.big-tofu-test
  (:require [big-config.big-tofu.core :as tofu]
            [big-config.big-tofu.create :as tofu-create]
            [clojure.test :refer [deftest is]]))

(deftest creates-references-and-constructs
  (let [c (tofu/->Construct :resource :aws_sqs_queue :alpha/big-sqs {:name "q"})]
    (is (= "${resource.aws_sqs_queue.alpha_big_sqs.id}" (tofu/reference c :id)))
    (is (= {:resource {:aws_sqs_queue {:alpha_big_sqs {:name "q"}}}}
           (tofu/construct c)))
    (is (= "alpha-big-sqs" (tofu/fqn->name :alpha/big-sqs "-")))))

(deftest creates-stdlib-resources
  (is (= :alpha/big-bucket-foo-bar (:fqn (first (tofu-create/bucket :alpha/big-bucket "foo" "bar")))))
  (is (= {:name "alpha_big_sqs"} (:block (first (tofu-create/sqs :alpha/big-sqs)))))
  (is (= "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
         (tofu/root-arn tofu/caller-identity)))
  (is (= 4 (count (tofu-create/kms :alpha/big-kms))))
  (is (= "tofu.tfstate"
         (get-in (tofu-create/provider {:region "eu-west-1" :bucket "state" :module :tofu})
                 [:terraform :backend :s3 :key]))))
