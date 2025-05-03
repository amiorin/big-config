(ns big-config.step-test
  (:require
   [big-config.step :as sut]
   [clojure.test :refer [deftest is testing]]))

(deftest step-test
  (testing "parser"
    (let [example-1 "build exec -- module profile ansible-playbook main.yml --tags focus"
          expect-1 [["build" "exec"] ["ansible-playbook main.yml --tags focus"] "module" "profile"]
          example-2 "build tofu:init tofu:plan unlock-any -- module profile -auto-approve"
          expect-2 [["build" "exec" "unlock-any"] ["tofu init -auto-approve" "tofu plan -auto-approve"] "module" "profile"]]
      (is (= expect-1 (sut/parse example-1)))
      (is (= expect-2 (sut/parse example-2))))))
