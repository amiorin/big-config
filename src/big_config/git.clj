(ns big-config.git
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [big-config.run :as run]
            [big-config.utils :as u]))

(defn get-revision [revision key opts]
  (let [resolved (if (contains? opts revision) (get opts revision) revision)]
    (when-not (string? resolved)
      (throw (ex-info "Revision is neither a string nor a keyword"
                      {:revision revision :key key :opts opts})))
    (run/generic-cmd {:opts opts :cmd ["git" "rev-parse" resolved] :key key})))

(defn fetch-origin [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "fetch" "origin"]}))

(defn upstream-name [key opts]
  (run/generic-cmd {:opts opts :cmd ["git" "rev-parse" "--abbrev-ref" "@{upstream}"] :key key}))

(defn git-diff [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "diff" "--quiet"]}))

(defn git-push [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "push"]}))

(defn compare-revisions [opts]
  (if (or (= (get opts k/git-prev-revision) (get opts k/git-origin-revision))
          (= (get opts k/git-current-revision) (get opts k/git-origin-revision)))
    (assoc opts k/exit 0 k/err nil)
    (assoc opts k/exit 1 k/err "The local revisions don't match the remote revision")))

(def check
  (core/create-workflow
   {:first-step :big-config.git/git-diff
    :wire-fn (fn [step]
               (case step
                 :big-config.git/git-diff [git-diff :big-config.git/fetch-origin]
                 :big-config.git/fetch-origin [fetch-origin :big-config.git/upstream-name]
                 :big-config.git/upstream-name [(fn [opts] (upstream-name k/git-upstream-name opts)) :big-config.git/pre-revision]
                 :big-config.git/pre-revision [(fn [opts] (get-revision "HEAD~1" k/git-prev-revision opts)) :big-config.git/current-revision]
                 :big-config.git/current-revision [(fn [opts] (get-revision "HEAD" k/git-current-revision opts)) :big-config.git/origin-revision]
                 :big-config.git/origin-revision [(fn [opts] (get-revision k/git-upstream-name k/git-origin-revision opts)) :big-config.git/compare-revisions]
                 :big-config.git/compare-revisions [compare-revisions :big-config.git/end]
                 :big-config.git/end [identity nil]
                 [identity nil]))}))

(u/register-function 'big-config.git/check check)
(u/register-function 'big-config.git/git-push git-push)
