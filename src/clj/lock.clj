(ns lock
  (:require
   [babashka.process :as process]
   [big-spec :as bs]
   [buddy.core.codecs :as codecs]
   [buddy.core.hash :as hash]
   [clojure.edn :as edn]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [utils :refer [exit-with-code? generic-cmd handle-last-cmd recur-with-error
                  recur-with-no-error]]))

(defn get-config [opts]
  (let [lock-name (-> opts
                      (select-keys [:aws-account-id :region :module])
                      pr-str
                      hash/sha256
                      codecs/bytes->hex
                      str/upper-case
                      (subs 0 4)
                      (as-> $ (str "LOCK-" $)))]
    (assoc opts :lock-name lock-name)))

(defn delete-tag [opts]
  (let [{:keys [lock-name]} opts]
    (generic-cmd opts (format "git tag -d %s" lock-name))))

(defn create-tag [opts]
  (let [{:keys [aws-account-id
                module
                owner
                lock-name]} opts
        res (-> (process/shell {:continue true
                                :in (pr-str {:aws-account-id aws-account-id
                                             :module module
                                             :owner owner})
                                :out :string
                                :err :string} (format "git tag -a %s -F -" lock-name)))]
    (update opts :cmd-results (fnil conj []) res)))

(defn push-tag [opts]
  (let [{:keys [lock-name]} opts]
    (generic-cmd opts (format "git push origin %s" lock-name))))

(defn delete-remote-tag [opts]
  (let [{:keys [lock-name]} opts]
    (generic-cmd opts (format "git push --delete origin %s" lock-name))))

(defn get-remote-tag [opts]
  (let [{:keys [lock-name]} opts]
    (generic-cmd opts (format "git fetch origin tag %s --no-tags" lock-name))))

(defn read-tag [opts]
  (let [{:keys [lock-name]} opts
        cmd (format "git cat-file -p %s" lock-name)]
    (generic-cmd opts cmd :tag-content)))

(defn parse-tag-content [tag-content]
  (->> tag-content
       str/split-lines
       (filter #(str/starts-with? % "{"))
       first
       edn/read-string))

(defn check-tag [opts]
  (let [{:keys [tag-content]} opts
        ownership (every? (fn [[k v]]
                            (= (get opts k) v))
                          (parse-tag-content tag-content))]
    (if ownership
      (do
        (println "Success")
        (exit-with-code? 0 opts)
        opts)
      (do
        (println "Different owner")
        (exit-with-code? 1 opts)
        opts))))

(defn ^:export acquire [opts]
  {:pre [(s/valid? ::bs/config-with-owner opts)]}
  (loop [step :get-config
         opts opts]
    (let [opts (update opts :steps (fnil conj []) step)]
      (case step
        :get-config (recur :delete-tag (get-config opts))
        :delete-tag (recur :create-tag (delete-tag opts))
        :create-tag (as-> (create-tag opts) $
                      (recur-with-no-error :push-tag $))
        :push-tag (as-> (push-tag opts) $
                    (recur-with-error :get-remote-tag $))
        :get-remote-tag (as-> (-> opts
                                  delete-tag
                                  get-remote-tag) $
                          (let [{:keys [exit]} (handle-last-cmd $)]
                            (if (= exit 0)
                              (recur :read-tag $)
                              (recur :delete-tag $))))
        :read-tag (as-> (read-tag opts) $
                    (recur-with-no-error :check-tag $))
        :check-tag (check-tag opts)))))

(defn ^:export release [opts]
  {:pre [(s/valid? ::bs/config opts)]}
  (loop [step :get-config
         opts opts]
    (let [opts (update opts :steps (fnil conj []) step)]
      (case step
        :get-config (recur :delete-tag (get-config opts))
        :delete-tag (recur :delete-remote-tag (delete-tag opts))
        :delete-remote-tag (do (delete-remote-tag opts)
                               (println "Success"))))))
