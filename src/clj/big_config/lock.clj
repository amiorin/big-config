(ns big-config.lock
  (:require
   [babashka.process :as process]
   [big-config :as bc]
   [big-config.core :as utils :refer [->workflow choice]]
   [big-config.run :refer [generic-cmd handle-cmd]]
   [big-config.utils :refer [sort-nested-map]]
   [clojure.edn :as edn]
   [clojure.string :as str]))

(defn generate-lock-id [opts]
  (let [{:keys [::lock-keys ::owner]} opts
        lock-details (select-keys opts lock-keys)
        lock-name (-> lock-details
                      sort-nested-map
                      hash
                      (->> (format "%X"))
                      (as-> $ (str "LOCK-" $)))]
    (-> opts
        (assoc ::lock-details lock-details)
        (update ::lock-details assoc ::owner owner)
        (merge {::lock-name lock-name
                ::bc/exit 0
                ::bc/err nil}))))

(defn delete-tag [opts]
  (let [{:keys [::lock-name]} opts]
    (generic-cmd opts (format "git tag -d %s" lock-name))))

(defn create-tag [opts]
  (let [{:keys [::lock-name ::lock-details]} opts
        proc (-> (process/shell {:continue true
                                 :in (str ">>>" (pr-str lock-details))
                                 :out :string
                                 :err :string} (format "git tag -a %s -F -" lock-name)))]
    (handle-cmd opts proc)))

(defn push-tag [opts]
  (let [{:keys [::lock-name]} opts]
    (generic-cmd opts (format "git push origin %s" lock-name))))

(defn delete-remote-tag [opts]
  (let [{:keys [::lock-name]} opts]
    (generic-cmd opts (format "git push --delete origin %s" lock-name))))

(defn get-remote-tag [opts]
  (let [{:keys [::lock-name]} opts]
    (generic-cmd opts (format "git fetch origin tag %s --no-tags" lock-name))))

(defn read-tag [opts]
  (let [{:keys [::lock-name]} opts
        cmd (format "git cat-file -p %s" lock-name)]
    (generic-cmd opts cmd ::tag-content)))

(defn parse-tag-content [tag-content]
  (-> tag-content
      str/split-lines
      (->> (filter #(str/starts-with? % ">>>")))
      first
      (str/replace-first ">>>" "")
      edn/read-string))

(defn check-tag [opts]
  (let [{:keys [::tag-content]} opts
        ownership (every? (fn [[k v]]
                            (= (get opts k) v))
                          (parse-tag-content tag-content))]
    (merge opts (if ownership
                  {::bc/exit 0
                   ::bc/err nil}
                  {::bc/exit 1
                   ::bc/err "Different owner"}))))

(defn check-remote-tag [opts]
  (let [{:keys [::lock-name]} opts
        cmd (format "git ls-remote --exit-code origin  refs/tags/%s" lock-name)
        {:keys [::bc/exit ::bc/err] :as opts} (generic-cmd opts cmd)]
    (merge opts (if (= exit 2)
                  {::bc/exit 0
                   ::bc/err nil}
                  {::bc/exit 1
                   ::bc/err err}))))

(def lock (->workflow {:first-step ::generate-lock-id
                       :wire-fn (fn [step _]
                                  (case step
                                    ::generate-lock-id [generate-lock-id ::delete-tag]
                                    ::delete-tag [delete-tag ::create-tag]
                                    ::create-tag [create-tag ::push-tag]
                                    ::push-tag [push-tag ::get-remote-tag]
                                    ::get-remote-tag [(comp get-remote-tag delete-tag) ::read-tag]
                                    ::read-tag [read-tag ::check-tag]
                                    ::check-tag [check-tag ::end]
                                    ::end [identity]))
                       :next-fn (fn [step next-step opts]
                                  (case step
                                    ::end [nil opts]
                                    ::push-tag (choice {:on-success ::end
                                                        :on-failure next-step
                                                        :opts opts})
                                    ::delete-tag [next-step opts]
                                    (choice {:on-success next-step
                                             :on-failure ::end
                                             :opts opts})))}))

(comment
  (->> (lock {::owner "alberto"})
       (into (sorted-map))))
