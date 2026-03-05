(ns big-config.proj-test
  (:require
   [babashka.fs :as fs]
   [big-config :as bc]
   [big-config.core :as core]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.tools :as tools]
   [big-config.utils-test :refer [test-step-fn]]
   [clojure.test :refer [deftest is testing]]))

(defn prepare-create-repos [opts]
  (let [bare "bare"
        repo "repo"
        dir (str (fs/create-temp-dir {:prefix "lock-"}))
        new-opts (merge-with merge opts {::run/shell-opts {:dir dir}})]
    (-> new-opts
        (assoc ::run/cmds [(format "git init --bare %s" bare)
                           (format "git clone bare %s" repo)]
               ::bare (str dir "/bare")
               ::repo (str dir "/repo"))

        core/ok)))

(defn prepare-render-tests [{:keys [::repo] :as opts}]
  (let [templates {::render/templates [{:post-process-fn [tools/rename]
                                        :template "test-proj"
                                        :project-dir (System/getProperty "user.dir")
                                        :target-dir repo
                                        :overwrite true
                                        :transform [["."
                                                     {:tag-open \<
                                                      :tag-close \>
                                                      :filter-open \{
                                                      :filter-close \}}]]}]}]
    (merge opts (core/ok) templates)))

(defn prepare-tests [{:keys [::run/shell-opts ::repo] :as opts}]
  (let [new-opts {::run/shell-opts shell-opts
                  ::prepare-opts opts
                  ::run/cmds ["git add ."
                              "git commit -m First"
                              "touch README.md"
                              "git add ."
                              "git commit -m Second"
                              "git push"
                              "clojure -M:test"]}]
    (merge-with merge new-opts (core/ok) {::run/shell-opts {:dir repo}})))

(deftest proj-test
  (testing "Lock and Git workflow tests are tested in an isolated local environment"
    (let [xs (atom [])
          step-fns [(partial test-step-fn #{::end} xs)]
          wf (core/->workflow {:first-step ::start
                               :wire-fn (fn [step step-fns]
                                          (case step
                                            ::start [prepare-create-repos ::create-repos]
                                            ::create-repos [(partial run/run-cmds step-fns) ::prepare-render-tests]
                                            ::prepare-render-tests [prepare-render-tests ::render-tests]
                                            ::render-tests [render/render ::prepare-tests]
                                            ::prepare-tests [prepare-tests ::run-tests]
                                            ::run-tests [(partial run/run-cmds step-fns) ::end]
                                            ::end [identity]))})]
      (wf step-fns {::bc/env :repl
                    ::run/shell-opts {:err :string
                                      :out :string}})
      (as-> @xs $
        (map ::bc/exit $)
        (is (= [0] $))))))
