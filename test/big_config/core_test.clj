(ns big-config.core-test
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [clojure.test :refer [deftest is testing]]))

(defn a-step-fn [f step opts]
  (let [started (assoc opts k/steps-trace (conj (vec (get opts k/steps-trace [])) [step :start-a]))
        next (f step started)]
    (assoc next k/steps-trace (conj (vec (get next k/steps-trace [])) [step :end-a]))))

(defn b-step-fn [f step opts]
  (let [started (assoc opts k/steps-trace (conj (vec (get opts k/steps-trace [])) [step :start-b]))
        next (f step started)]
    (assoc next k/steps-trace (conj (vec (get next k/steps-trace [])) [step :end-b]))))

(deftest validates-step-fn-options
  (is (thrown-with-msg? IllegalArgumentException #"At least one" (core/create-step-fn {})))
  (is (thrown-with-msg? IllegalArgumentException #"before-f" (core/create-step-fn {:after-f :same}))))

(deftest threads-opts-and-wraps-step-fns-in-order
  (let [wf (core/create-workflow
            {:first-step :test/start
             :wire-fn (fn [step]
                        (case step
                          :test/start [(fn [opts] (assoc (core/ok opts) :test/bar "baz")) :test/end]
                          :test/end [identity nil]
                          [identity nil]))})
        res (wf [a-step-fn b-step-fn] {})]
    (is (= 0 (get res k/exit)))
    (is (nil? (get res k/err)))
    (is (= "baz" (:test/bar res)))
    (is (= [[:test/start :start-a]
            [:test/start :start-b]
            [:test/start :end-b]
            [:test/start :end-a]
            [:test/end :start-a]
            [:test/end :start-b]
            [:test/end :end-b]
            [:test/end :end-a]]
           (get res k/steps-trace)))))

(deftest captures-exceptions-into-opts
  (let [wf (core/create-workflow
            {:first-step :test/start
             :wire-fn (fn [step]
                        (if (= step :test/start)
                          [(fn [_opts] (throw (ex-info "boom" {:extra 1}))) :test/end]
                          [identity nil]))})
        res (wf [] {})]
    (is (= 1 (get res k/exit)))
    (is (= "boom" (get res k/err)))
    (is (= 1 (:extra res)))))
