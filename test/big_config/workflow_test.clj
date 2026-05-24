(ns big-config.workflow-test
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [big-config.run :as run]
            [big-config.workflow :as workflow]
            [clojure.test :refer [deftest is use-fixtures]]))

(use-fixtures :each
  (fn [f]
    (try
      (f)
      (finally
        (run/reset-runner)
        (workflow/unregister-workflow :test/s1)
        (workflow/unregister-workflow :test/s2)))))

(deftest parses-cli-args
  (is (= {k/wf-steps [:render] k/run-cmds []}
         (workflow/parse-args "render")))
  (is (= {k/wf-steps [:render :lock] k/run-cmds []}
         (workflow/parse-args "render lock")))
  (is (= {k/wf-steps [:render :exec] k/run-cmds ["tofu init"]}
         (workflow/parse-args "render tofu:init")))
  (is (= {k/wf-steps [:render :exec] k/run-cmds ["tofu init -auto-approve"]}
         (workflow/parse-args ["render" "--" "tofu" "init" "-auto-approve"])))
  (is (thrown-with-msg? clojure.lang.ExceptionInfo #"-- cannot" (workflow/parse-args "render --"))))

(deftest selects-globals
  (is (= {k/env :prod k/run-shell-opts {:dir "/tmp"}}
         (workflow/select-globals {k/env :prod k/run-shell-opts {:dir "/tmp"} :other "junk"})))
  (is (= {:foo 1}
         (workflow/select-globals {:globals [:foo] :foo 1 :bar 2}))))

(deftest builds-paths-and-prepares-templates
  (is (= ".dist/tofu" (workflow/path {} :tofu)))
  (is (= "custom/foo/bar" (workflow/path {k/wf-prefix "custom"} :foo/bar)))
  (let [prefixed (workflow/new-prefix {k/wf-prefix "target" k/render-profile "prod"} :test/start)]
    (is (re-find #"^target/prod-" (get prefixed k/wf-prefix))))
  (let [prepared (workflow/prepare {k/wf-name :tofu k/render-templates [{:template "t1"}]}
                                   {k/wf-prefix "dist" k/wf-params {:p 1}})]
    (is (= "dist/tofu" (get-in prepared [k/run-shell-opts :dir])))
    (is (= [{:template "t1" :p 1 :target-dir "dist/tofu" :target-object "tofu/tofu"}]
           (get prepared k/render-templates)))))

(deftest merges-params-and-reads-bc-par-overrides
  (let [opts {k/wf-create-opts {:tools/tofu-opts {k/wf-params {:a 1}}}
              k/wf-delete-opts {:tools/tofu-opts {k/wf-params {:a 1}}}}
        merged (workflow/merge-params [:tools/tofu-opts] {:b 2} opts)]
    (is (= {:a 1 :b 2} (get-in merged [k/wf-create-opts :tools/tofu-opts k/wf-params])))
    (is (= {k/wf-params {:zone-id "123"}}
           (workflow/read-bc-pars {} {"BC_PAR_ZONE_ID" "123" "OTHER" "junk"})))))

(deftest runs-built-in-steps
  (run/set-runner (fn [_shell-opts cmd]
                    {:exit (if (= cmd "false") 1 0)
                     :out ""
                     :err (if (= cmd "false") "bad" "")
                     :cmd cmd}))
  (let [success (workflow/run-steps [] {k/wf-steps [:render :exec]
                                        k/run-cmds ["true"]
                                        k/render-templates []
                                        k/env :lib})
        failure (workflow/run-steps [] {k/wf-steps [:exec]
                                        k/run-cmds ["false"]
                                        k/env :lib})]
    (is (= 0 (get success k/exit)))
    (is (= 1 (get failure k/exit)))))

(deftest runs-validate-and-describe-hooks
  (let [called (atom [])
        res (workflow/run-steps [] {k/wf-steps [:validate :describe]
                                    k/wf-validate-fn (fn [_step-fns opts] (swap! called conj :validate) (core/ok opts))
                                    k/wf-describe-fn (fn [_step-fns opts] (swap! called conj :describe) (core/ok opts))
                                    k/env :lib})]
    (is (= 0 (get res k/exit)))
    (is (= [:validate :describe] @called))))

(deftest composes-registered-workflow-pipeline-steps
  (workflow/register-workflow :test/s1 (fn [_step-fns opts] (core/ok opts)))
  (workflow/register-workflow :test/s2 (fn [_step-fns opts] (core/ok opts)))
  (let [wf (workflow/create-workflow-star {:first-step :test/start
                                           :pipeline [:test/s1 ["pwd"] :test/s2 ["pwd"]]})
        res (wf [] {k/env :lib})]
    (is (= 0 (get res k/exit)))
    (is (= [:exec] (get-in res [:test/s1 k/wf-steps])))
    (is (= [:exec] (get-in res [:test/s2 k/wf-steps])))))
