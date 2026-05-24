(ns big-config.lock
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [big-config.run :as run]
            [big-config.utils :as u]
            [clojure.edn :as edn]
            [clojure.string :as str]))

(defn parse-tag-content [tag-content]
  (let [line (some #(when (str/starts-with? % ">>>") %) (str/split-lines (str tag-content)))
        body (some-> line (str/replace-first #"^>>>" "") str/trim)]
    (if (seq body)
      (try
        (edn/read-string body)
        (catch Throwable _ {}))
      {})))

(defn generate-lock-id [opts]
  (let [lock-keys (get opts k/lock-keys [])
        lock-details (select-keys opts lock-keys)
        lock-name (str "LOCK-" (str/upper-case (u/hash-string (u/stable-stringify (u/sort-nested-map lock-details)) 8)))]
    (assoc opts
           k/lock-details (assoc lock-details k/lock-owner (get opts k/lock-owner))
           k/lock-name lock-name
           k/exit 0
           k/err nil)))

(defn delete-tag [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "tag" "-d" (get opts k/lock-name)]}))

(defn create-tag [opts]
  (run/generic-cmd {:opts opts
                    :shell-opts {:in (str ">>>" (pr-str (get opts k/lock-details {})))}
                    :cmd ["git" "tag" "-a" (get opts k/lock-name) "-F" "-"]}))

(defn push-tag [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "push" "origin" (get opts k/lock-name)]}))

(defn delete-remote-tag [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "push" "--delete" "origin" (get opts k/lock-name)]}))

(defn get-remote-tag [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "fetch" "origin" "tag" (get opts k/lock-name) "--no-tags"]}))

(defn read-tag [opts]
  (run/generic-cmd {:opts opts :cmd ["git" "cat-file" "-p" (get opts k/lock-name)] :key k/tag-content}))

(defn check-tag [opts]
  (let [details (parse-tag-content (get opts k/tag-content ""))
        ownership? (every? (fn [[detail-key detail-value]] (= (get opts detail-key) detail-value)) details)]
    (if ownership?
      (assoc opts k/exit 0 k/err nil)
      (assoc opts k/exit 1 k/err "Different owner"))))

(defn check-remote-tag [opts]
  (let [next (run/generic-cmd {:opts opts
                               :cmd ["git" "ls-remote" "--exit-code" "origin" (str "refs/tags/" (get opts k/lock-name))]})]
    (if (= 2 (get next k/exit))
      (assoc next k/exit 0 k/err nil)
      (assoc next k/exit 1 k/err (get next k/err)))))

(def lock
  (core/create-workflow
   {:first-step :big-config.lock/generate-lock-id
    :wire-fn (fn [step]
               (case step
                 :big-config.lock/generate-lock-id [generate-lock-id :big-config.lock/delete-tag]
                 :big-config.lock/delete-tag [delete-tag :big-config.lock/create-tag]
                 :big-config.lock/create-tag [create-tag :big-config.lock/push-tag]
                 :big-config.lock/push-tag [push-tag :big-config.lock/get-remote-tag]
                 :big-config.lock/get-remote-tag [(fn [opts] (get-remote-tag (delete-tag opts))) :big-config.lock/read-tag]
                 :big-config.lock/read-tag [read-tag :big-config.lock/check-tag]
                 :big-config.lock/check-tag [check-tag :big-config.lock/end]
                 :big-config.lock/end [identity nil]
                 [identity nil]))
    :next-fn (fn [step next-step opts]
               (case step
                 :big-config.lock/end [nil opts]
                 :big-config.lock/push-tag (core/choice {:on-success :big-config.lock/end :on-failure next-step :opts opts})
                 :big-config.lock/delete-tag [next-step opts]
                 (core/choice {:on-success next-step :on-failure :big-config.lock/end :opts opts})))}))

(u/register-function 'big-config.lock/lock lock)
(u/register-function 'big-config.lock/generate-lock-id generate-lock-id)
(u/register-function 'big-config.lock/delete-tag delete-tag)
(u/register-function 'big-config.lock/delete-remote-tag delete-remote-tag)
(u/register-function 'big-config.lock/check-remote-tag check-remote-tag)
