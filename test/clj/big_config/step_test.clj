(ns big-config.step-test
  (:require
   [big-config.render :as render]
   [big-config.step :as sut]
   [clojure.test :refer [deftest is testing]]))

(deftest step-test
  (testing "parser"
    (let [xs ["build exec -- module profile ansible-playbook main.yml --tags focus"
              [["build" "exec"] ["ansible-playbook main.yml --tags focus"] "module" "profile"]
              "build tofu:init tofu:plan unlock-any -- module profile -auto-approve"
              [["build" "exec" "unlock-any"] ["tofu init -auto-approve" "tofu plan -auto-approve"] "module" "profile"]
              "build -- foo prod"
              [["build"] [] "foo" "prod"]]]

      (doseq [[example expect] (partition 2 xs)]
        (is (= expect (sut/parse example)))))))

(deftest render-test
  (testing "render step works"
    (as-> (sut/run-steps "render -- foo bar" [] {::render/templates []}) $
      (:big-config/exit $)
      (is (= 0 $)))))
