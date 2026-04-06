(ns big-config.workflow-test
  (:require
   [big-config :as bc]
   [big-config.core :as core]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.workflow :as sut]
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]))

(defn s1
  [_step-fns opts]
  (core/ok opts))

(defn s2
  [_step-fns opts]
  (core/ok opts))

(deftest parse-args-test
  (testing "parse-args"
    (is (= {::sut/steps ["render"] ::run/cmds []}
           (sut/parse-args "render")))
    (is (= {::sut/steps ["render" "lock"] ::run/cmds []}
           (sut/parse-args "render lock")))
    (is (= {::sut/steps ["render" "exec"] ::run/cmds ["tofu init"]}
           (sut/parse-args "render tofu:init")))
    (is (= {::sut/steps ["render" "exec"] ::run/cmds ["tofu init"]}
           (sut/parse-args "render -- tofu init")))
    (is (= {::sut/steps ["render" "exec"] ::run/cmds ["tofu init -auto-approve"]}
           (sut/parse-args ["render" "--" "tofu" "init" "-auto-approve"])))
    (is (thrown-with-msg? clojure.lang.ExceptionInfo #"-- cannot be without a command"
                          (sut/parse-args "render --")))))

(deftest select-globals-test
  (testing "select-globals with defaults"
    (let [opts {::bc/env :prod
                ::run/shell-opts {:dir "/tmp"}
                :other "junk"}]
      (is (= {::bc/env :prod
              ::run/shell-opts {:dir "/tmp"}}
             (sut/select-globals opts)))))
  (testing "select-globals with explicit globals"
    (let [opts {:globals [:foo]
                :foo 1
                :bar 2}]
      (is (= {:foo 1} (sut/select-globals opts))))))

(deftest path-test
  (is (= ".dist/tofu" (sut/path {} :tofu)))
  (is (= "custom/tofu" (sut/path {::sut/prefix "custom"} :tofu)))
  (is (= ".dist/foo/bar" (sut/path {} :foo/bar))))

(deftest new-prefix-test
  (testing "new-prefix with defaults"
    (let [opts (sut/new-prefix {} ::start)]
      (is (str/starts-with? (::sut/prefix opts) ".dist/default-"))))
  (testing "new-prefix with custom prefix and profile"
    (let [opts (sut/new-prefix {::sut/prefix "target" ::render/profile "prod"} ::start)]
      (is (str/starts-with? (::sut/prefix opts) "target/prod-"))))
  (testing "new-prefix chains hashes (not idempotent)"
    (let [opts1 (sut/new-prefix {} ::start)
          prefix1 (::sut/prefix opts1)
          opts2 (sut/new-prefix opts1 ::start)
          prefix2 (::sut/prefix opts2)]
      (is (not= prefix1 prefix2))
      (is (str/starts-with? prefix2 ".dist/default-")))))

(deftest prepare-test
  (let [opts {::sut/name :tofu
              ::render/templates [{:template "t1"}]}
        prepared (sut/prepare opts {::sut/prefix "dist" ::sut/params {:p 1}})]
    (is (= "dist/tofu" (get-in prepared [::run/shell-opts :dir])))
    (is (= [{:template "t1" :p 1 :target-dir "dist/tofu"}]
           (::render/templates prepared)))))

(deftest merge-params-test
  (let [opts {::sut/create-opts {:tools/tofu-opts {::sut/params {:a 1}}}
              ::sut/delete-opts {:tools/tofu-opts {::sut/params {:a 1}}}}
        merged (sut/merge-params [:tools/tofu-opts] {:b 2} opts)]
    (is (= {:a 1 :b 2} (get-in merged [::sut/create-opts :tools/tofu-opts ::sut/params])))
    (is (= {:a 1 :b 2} (get-in merged [::sut/delete-opts :tools/tofu-opts ::sut/params])))))

(deftest read-bc-pars-test
  (let [env {"BC_PAR_ZONE_ID" "123" "OTHER" "junk"}]
    (is (= {::sut/params {:zone-id "123"}}
           (sut/read-bc-pars {} env)))))

(deftest ->workflow*-test
  (testing ":pipeline with map"
    (is (thrown? java.lang.IllegalArgumentException
                 (sut/->workflow* {:first-step ::start
                                   :pipeline {}}))))
  (testing ":pipeline execution"
    (let [wf (sut/->workflow* {:first-step ::start
                               :pipeline [::s1 ["pwd"]
                                          ::s2 ["render"]]})
          res (wf [] {::bc/env :repl})]
      (is (= 0 (::bc/exit res)))
      (is (some? (::s1 res)))
      (is (some? (::s2 res)))
      (is (= ["exec"] (::sut/steps (::s1 res))))
      (is (= ["render"] (::sut/steps (::s2 res)))))))

(deftest run-steps-test
  (testing "run-steps success"
    (let [res (sut/run-steps [] {::sut/steps [:render :exec]
                                 ::run/cmds ["true"]
                                 ::render/templates []
                                 ::bc/env :repl})]
      (is (= 0 (::bc/exit res)))))
  (testing "run-steps failure"
    (let [res (sut/run-steps [] {::sut/steps [:exec]
                                 ::run/cmds ["false"]
                                 ::bc/env :repl})]
      (is (pos? (::bc/exit res))))))
