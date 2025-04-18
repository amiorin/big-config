(ns big-config.lock-test
  (:require
   [big-config :as bc]
   [big-config.lock :as lock :refer [lock]]
   [big-config.unlock :as unlock :refer [unlock-any]]
   [big-config.utils-test :refer [default-opts test-step-fn]]
   [clojure.test :refer [deftest is testing]]))

(deftest lock-test
  (testing "acquire and release lock"
    (let [opts default-opts
          xs (atom [])
          step-fns [(partial test-step-fn #{::lock/end ::unlock/end} xs)]]
      (lock step-fns opts)
      (unlock-any step-fns opts)
      (unlock-any step-fns opts)
      (is (= 3 (count @xs)))
      (is (every? #(= (::bc/exit %) 0) @xs)))))

(deftest try-lock-test
  (testing "acquire an already locked module"
    (let [opts default-opts
          xs (atom [])
          step-fns [(partial test-step-fn #{::lock/end ::unlock/end} xs)]]
      (lock step-fns opts)
      (lock step-fns (assoc opts ::lock/owner "CI2"))
      (unlock-any step-fns opts)
      (as-> @xs $
        (map ::bc/exit $)
        (is (= [0 1 0] $))))))
