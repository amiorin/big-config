(ns big-config.store-test
  (:require
   [big-config.integrant :refer [system-fixture system-state]]
   [big-config.store :as sut]
   [clojure.test :refer [deftest is testing use-fixtures]]
   [taoensso.carmine :as car :refer [wcar]]))

(when (nil? (system-state))
  (use-fixtures :each (system-fixture)))

(deftest smoke-test-integrant
  (testing "loading of the system"
    (is (#{:test :dev} (:system/env (system-state))))))

(deftest smoke-test-redis
  (testing "reding PING"
    (let [port (-> (system-state)
                   :redis/server
                   :port)
          pong (wcar {:spec {:port port}
                      :pool :none}
                     (car/ping))]
      (is "PONG" pong))))

(deftest inc-test
  (testing "inc from 2 instances works"
    (let [port (-> (system-state)
                   :redis/server
                   :port)
          default-opts {:store-key (-> (random-uuid) str)
                        :initial-state {:cnt 0}
                        :wcar-opts {:spec {:port port}
                                    :pool :none}
                        :snapshot-every 2
                        :business-fn (fn [state _event _timestamp]
                                       (update state :cnt inc))}
          store1 (sut/store! default-opts)
          store2 (sut/store! default-opts)
          times 10]
      (dotimes [_ times]
        (sut/handle! store1 {:op :inc})
        (sut/handle! store2 {:op :inc}))
      (is (= [{:cnt (- (* times 2) 1)} {:cnt (* times 2)}] [@store1 @store2])))))

(system-state)
