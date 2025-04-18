(ns big-config.tofu-test
  (:require
   [babashka.process :as process]
   [clojure.test :refer [deftest is testing]]))

(deftest block-destroy-prod-step-fn-test
  (testing "block-destroy-prod-step-fn is stopping from destroying a prod module"
    (let [expect 1
          proc (process/shell {:continue true
                               :out :string
                               :err :string} "just tofu destroy alpha prod")
          {:keys [exit]} proc]
      (is (= expect exit)))))
