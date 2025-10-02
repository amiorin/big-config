(ns dotfiles-test
  (:require
   [babashka.process :refer [shell]]
   [big-config :as bc]
   [big-config.render :refer [discover]]
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [dotfiles :as sut]))

(defn check-dir
  [dir]
  (and
   (-> (shell {:out :string} (format "git ls-files -o --exclude-standard %s" dir))
       :out
       str/blank?)
   (-> (shell {:continue true} (format "git diff --quiet %s" dir))
       :exit
       zero?)))

(defn git-output
  [dir]
  (let [git-diff (:out (shell {:continue true
                               :out :string} (format "git --no-pager diff %s" dir)))
        git-new-files (:out (shell {:out :string} (format "git ls-files -o --exclude-standard %s" dir)))]
    (format "> git diff
%s
> git new files
%s" git-diff git-new-files)))

(deftest stability
  (testing "working directory is clean after running all modules"
    (let [prefix "resources/stage-2"]
      (doseq [profile (discover prefix)]
        (sut/run-steps (format "render -- dotfiles %s" profile) {::bc/env :repl} []))
      (is (check-dir prefix) (git-output prefix)))))
