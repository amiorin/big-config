(ns big-config.git-test
  (:require
   [big-config :as bc]
   [big-config.git :as git :refer [check]]
   [big-config.utils-test :refer [test-step-fn]]
   [clojure.test :refer [deftest is testing]]))

(deftest check-test
  (testing "git check test"
    (let [opts {}
          xs (atom [])
          step-fns [(partial test-step-fn #{::git/end} xs)]]
      (check step-fns opts)
      (as-> @xs $
        (map ::bc/exit $)
        (is (= [0] $))))))
