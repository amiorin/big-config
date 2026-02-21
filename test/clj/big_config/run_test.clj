(ns big-config.run-test
  (:require
   [big-config :as bc]
   [big-config.core :as core]
   [big-config.run :as run :refer [run-cmds]]
   [clojure.test :refer [deftest is testing]]))

(deftest run-cmds-test
  (testing "with 3 commands"
    (let [expect {:big-config/env :repl, :big-config.run/shell-opts {:continue true :err :string :out :string}, :big-config.run/cmds '("echo three"), :big-config/procs [{:exit 0, :out "one\n", :err "", :cmd ["echo" "one"]} {:exit 0, :out "two\n", :err "", :cmd ["echo" "two"]} {:exit 0, :out "three\n", :err "", :cmd ["echo" "three"]}], :big-config/exit 0, :big-config/err ""}
          actual (run-cmds {::bc/env :repl
                            ::run/shell-opts {:continue true
                                              :err :string
                                              :out :string}
                            ::run/cmds ["echo one"
                                        "echo two"
                                        "echo three"]})]
      (is (= expect actual)))))

(deftest mktemp-test
  (testing "create temp dir, run pwd, and delete temp dir"
    (let [pwd (fn [{:keys [::run/dir] :as opts}]
                (run/generic-cmd :opts opts
                                 :cmd "pwd"
                                 :shell-opts {:dir dir}
                                 :key ::pwd))
          wf (core/->workflow {:first-step ::start
                               :wire-fn (fn [step _]
                                          (case step
                                            ::start [run/mktemp-create-dir ::pwd]
                                            ::pwd [pwd ::clean]
                                            ::clean [run/mktemp-remove-dir ::end]
                                            ::end [identity]))})
          opts (wf {})
          _ (is (= (::run/dir opts) (::pwd opts)))
          _ (is (= [0 0 0] (->> opts
                                ::bc/procs
                                (mapv :exit))))])))
