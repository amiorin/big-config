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
                                 :aws-profile "default"
                                 :region "us-west-1"
                                 :dev "111111111111"
                                 :prod "222222222222"]]
                 [sut/devenv [:opts {::bc/env :repl}]]
                 [sut/dotfiles [:opts {::bc/env :repl}
                                :post-process-fn nil]]
                 [sut/ansible [:opts {::bc/env :repl}
                               :post-process-fn nil]]
                 [sut/multi [:opts {::bc/env :repl}
                             :post-process-fn nil]]
                 [sut/action [:opts {::bc/env :repl}]]]]
        (when-not (empty? xs)
          (let [[f args] (first xs)
                target-dir (format "%s/target/tools-%s" prefix counter)]
            (b/delete {:path target-dir})
            (apply f :target-dir target-dir :step-fns [] args)
            (recur (inc counter) (rest xs)))))
      (is (check-dir prefix) (git-output prefix)))))
