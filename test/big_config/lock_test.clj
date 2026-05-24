(ns big-config.lock-test
  (:require [big-config.keys :as k]
            [big-config.lock :as lock]
            [big-config.run :as run]
            [clojure.test :refer [deftest is use-fixtures]]))

(use-fixtures :each (fn [f] (try (f) (finally (run/reset-runner)))))

(defn last-cmd [opts]
  (:cmd (last (get opts k/procs))))

(deftest constructs-git-commands-as-argv-vectors
  (run/set-runner (fn [_shell-opts cmd] {:exit 0 :out "" :err "" :cmd cmd}))
  (let [opts {k/lock-name "LOCK-DEAD"}]
    (is (= ["git" "tag" "-d" "LOCK-DEAD"] (last-cmd (lock/delete-tag opts))))
    (is (= ["git" "push" "--delete" "origin" "LOCK-DEAD"] (last-cmd (lock/delete-remote-tag opts))))
    (is (= ["git" "fetch" "origin" "tag" "LOCK-DEAD" "--no-tags"] (last-cmd (lock/get-remote-tag opts))))
    (is (= ["git" "cat-file" "-p" "LOCK-DEAD"] (last-cmd (lock/read-tag opts))))
    (is (= ["git" "ls-remote" "--exit-code" "origin" "refs/tags/LOCK-DEAD"] (last-cmd (lock/check-remote-tag opts))))))

(deftest passes-lock-details-through-stdin
  (let [calls (atom [])]
    (run/set-runner (fn [shell-opts cmd]
                      (swap! calls conj {:shell-opts shell-opts :cmd cmd})
                      {:exit 0 :out "" :err "" :cmd cmd}))
    (lock/create-tag {k/lock-name "LOCK-DEAD" k/lock-details {k/lock-owner "alberto"}})
    (is (= ["git" "tag" "-a" "LOCK-DEAD" "-F" "-"] (:cmd (first @calls))))
    (is (re-find #"^>>>" (get-in (first @calls) [:shell-opts :in])))))

(deftest parses-tag-content
  (is (= {k/lock-owner "me"}
         (lock/parse-tag-content "object\n>>>{:big-config.lock/owner \"me\"}\n"))))
