(ns big-config.workflow-test
  (:require
   [big-config :as bc]
   [clojure.test :refer [deftest is testing]]
   [big-config.core :as core]
   [big-config.workflow :as sut]))

(defn s1
  [_step-fns opts]
  (core/ok opts))

(defn s2
  [_step-fns opts]
  (core/ok opts))

(defn s3
  [_step-fns opts]
  (core/ok opts))

(deftest ->workflow*-test
  (testing ":pipeline with map"
    (is (thrown? java.lang.IllegalArgumentException
                 (sut/->workflow* {:first-step ::start
                                   :pipeline {}}))))
  (testing ":pipeline"
    (let [expect {:big-config/env :repl, :big-config/exit 0, :big-config/err nil, :big-config.workflow-test/s1 {:big-config.workflow/steps ["exec"], :big-config.run/cmds ["pwd"], :big-config/env :repl, :big-config/exit 0, :big-config/err nil}, :big-config.workflow-test/s2 {:big-config.workflow/steps ["render"], :big-config.run/cmds [], :big-config/env :repl, :big-config/exit 0, :big-config/err nil}, :big-config.workflow-test/s3 {:big-config.workflow/steps [], :big-config.run/cmds [], :big-config/env :repl, :big-config/exit 0, :big-config/err nil}}
          wf (sut/->workflow* {:first-step ::start
                               :pipeline [::s1 ["pwd"]
                                          ::s2 ["render"]
                                          ::s3 []]})]
      (is (= expect (wf [] {::bc/env :repl}))))))
