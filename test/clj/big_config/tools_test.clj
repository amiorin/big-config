(ns big-config.tools-test
  (:require
   [big-config :as bc]
   [big-config.render-test :refer [check-dir git-output]]
   [big-config.tools :as sut]
   [clojure.test :refer [deftest is testing]]
   [clojure.tools.build.api :as b]))

(deftest tools-test
  (testing "All tools templates"
    (let [prefix "test/fixtures"]
      (loop [counter 0
             xs [[sut/terraform [:opts {::bc/env :repl}
                                 :post-process-fn nil
                                 :aws-profile "251213589273"
                                 :region "eu-west-1"
                                 :dev "251213589273"
                                 :prod "251213589273"]]
                 [sut/devenv [:opts {::bc/env :repl}]]]]
        (when-not (empty? xs)
          (let [[f args] (first xs)
                target-dir (format "%s/target/tools-%s" prefix counter)]
            (b/delete {:path target-dir})
            (apply f :target-dir target-dir :step-fns [] args)
            (recur (inc counter) (rest xs)))))
      (is (check-dir prefix) (git-output prefix)))))
