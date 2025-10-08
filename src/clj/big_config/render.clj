(ns big-config.render
  (:require
   [babashka.fs :as fs]
   [big-config.core :as core]
   [clojure.java.io :as io]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [clojure.tools.build.api :as b]
   [selmer.parser :as p]
   [selmer.util :refer [without-escaping]])
  (:import
   (java.nio.file Files)
   (java.nio.file.attribute FileAttribute)))

(set! *warn-on-reflection* true)

(s/def ::files (s/map-of (s/or :kw keyword? :str string?) string?))
(s/def ::tag-open char?)
(s/def ::tag-close char?)
(s/def ::filter-open char?)
(s/def ::filter-close char?)
(s/def ::tag-second char?)
(s/def ::short-comment-second char?)
(s/def ::delimiters (s/keys :opt-un [::tag-open ::tag-close ::filter-open ::filter-close ::tag-second ::short-comment-second]))
(s/def ::opts #{:only :raw})
(s/def ::dir-spec (s/cat :src (s/or :sym symbol? :str string?)
                         :target (s/? string?)
                         :files (s/? ::files)
                         :delimiters (s/? ::delimiters)
                         :opts (s/* ::opts)))
(s/def ::transform (s/coll-of ::dir-spec :min-count 1))

(comment
  (s/conform ::transform [['foo "target"
                           {:foo "bar"}
                           {:tag-open \{
                            :tag-close \}}
                           :only
                           :raw]]))

(defn selmer [s data & delimiters]
  (let [delimiters (if (seq delimiters)
                     (first delimiters)
                     {})]
    (without-escaping
     (p/render s data delimiters))))

(def ^:dynamic *non-replaced-exts* #{"jpg" "jpeg" "png" "gif" "bmp" "bin"})

(defn copy-dir
  [& {:keys [src-dir target-dir data delimiters]}]
  (fs/walk-file-tree src-dir
                     {:visit-file (fn [path _]
                                    (let [path (str path)
                                          replacable ((complement *non-replaced-exts*) (fs/extension path))
                                          target-file (->> (fs/relativize src-dir path)
                                                           (fs/path target-dir)
                                                           str)
                                          _ (fs/create-dirs (fs/parent target-file))
                                          content (cond-> (slurp path)
                                                    (and data replacable) (selmer data delimiters))]
                                      (spit target-file content)
                                      (->> (fs/posix-file-permissions path)
                                           (fs/set-posix-file-permissions target-file)))
                                    :continue)}))

(defn copy-template-dir
  [& {:keys [template-dir target-dir data src target files delimiters opts]}]
  (let [target (if target (str "/" (selmer target data)) "")
        opts (set opts)
        raw (:raw opts)
        only (:only opts)]
    (case (first src)
      :sym (let [f (requiring-resolve (second src))]
             (if (seq files)
               (run! (fn [[kw to]]
                       (let [content (cond-> (f kw data)
                                       (not raw) (selmer data delimiters))
                             target-file (str target-dir (selmer target data) "/" (selmer to data))]
                         (fs/create-dirs (fs/parent target-file))
                         (spit target-file content)))
                     files)
               (throw (ex-info "Files is required when src is a symbol" {}))))
      :str (let [src (selmer (second src) data)]
             (if (seq files)
               (let [intermediate (-> (Files/createTempDirectory
                                       "big-config" (into-array FileAttribute []))
                                      (.toFile)
                                      (doto .deleteOnExit)
                                      (.getCanonicalPath))
                     inter-target (str intermediate target)]
                 (when (not only)
                   (copy-dir {:target-dir inter-target
                              :src-dir (str template-dir "/" src)}))
                 (run! (fn [[from to]]
                         (b/delete {:path (str inter-target "/" from)})
                         (b/copy-file {:src (str template-dir "/" src "/" from)
                                       :target (str inter-target "/" (selmer to data))}))
                       files)
                 (copy-dir (cond-> {:target-dir target-dir
                                    :src-dir intermediate} (not raw) (merge {:data data
                                                                             :delimiters delimiters}))))
               (copy-dir (cond-> {:target-dir (str target-dir target)
                                  :src-dir (str template-dir "/" src)}
                           (not raw) (merge {:data data
                                             :delimiters delimiters}))))))))

(comment
  (let [prefix "test/fixtures"
        template-dir (str prefix "/source")
        target-dir (format "%s/target/copy-%s" prefix 7)
        transform [["nested" "{{ module }}"]]]
    (b/delete {:path target-dir})
    (run! #(apply copy-template-dir
                  :template-dir template-dir
                  :target-dir target-dir
                  :data {:module "infra"}
                  (reduce concat (vec %))) (s/conform ::transform transform))))

(defn get-multi-option
  "Given a hash map of options, return the value for the
  given key, or an empty sequence if the key is not present."
  [opts k]
  (let [v (get opts k [])]
    (if (sequential? v)
      v
      [v])))

(comment
  (get-multi-option {} :foo)
  (get-multi-option {:foo 'bar/baz} :foo)
  (get-multi-option {:foo ['bar/baz]} :foo)
  (get-multi-option {:foo ['bar/baz 'quux/wibble]} :foo))

(def template-keys [:template
                    :target-dir
                    :overwrite
                    :data-fn
                    :template-fn
                    :post-process-fn
                    :transform])

(def non-blank-string? (s/and string? (complement str/blank?)))
(s/def ::template non-blank-string?)
(s/def ::target-dir non-blank-string?)
(s/def ::tpl (s/keys :req-un [::template ::target-dir]))

(defn render [{:keys [::templates :big-config.step/module :big-config.step/profile] :as opts}]
  (when (nil? templates)
    (throw (IllegalArgumentException. ":big-config.render/templates should never be nil")))
  (loop [xs templates]
    (when-not (empty? xs)
      (let [{:keys [data-fn template-fn] :as edn} (first xs)
            data-fn (cond
                      (nil? data-fn) (fn [data _] data)
                      (fn? data-fn) data-fn
                      (symbol? data-fn) (requiring-resolve data-fn))
            template-fn (cond
                          (nil? template-fn) (constantly edn)
                          (fn? template-fn) template-fn
                          (symbol? template-fn) (requiring-resolve template-fn))
            data (-> (apply dissoc edn template-keys)
                     (merge {:module module
                             :profile profile})
                     (data-fn opts))
            {:keys [template
                    target-dir
                    overwrite
                    transform] :as edn} (template-fn data edn)
            edn (s/conform ::tpl edn)
            _ (when (s/invalid? edn)
                (throw (ex-info "Invalid template" (s/explain-data ::tpl edn))))
            ^java.net.URL url (io/resource template)
            _ (when (nil? url)
                (throw (ex-info "Template resource not found" {:template template})))
            template-dir (-> url .getPath io/file .getCanonicalPath)
            transform (s/conform ::transform (cond
                                               (nil? transform) (throw (IllegalArgumentException. ":transform not defined"))
                                               (empty? transform) (throw (IllegalArgumentException. ":transform is an empty list"))
                                               :else transform))
            _ (when (s/invalid? transform)
                (throw (ex-info "Invalid transform" (s/explain-data ::transform transform))))]
        (when (.exists (io/file target-dir))
          (if overwrite
            (when (= :delete overwrite)
              (b/delete {:path target-dir}))
            (throw (ex-info (str target-dir " already exists (and :overwrite was not true).") {}))))
        (run! #(apply copy-template-dir
                      :template-dir template-dir
                      :target-dir target-dir
                      :data data
                      (reduce concat (vec %))) transform)
        (doseq [post-process-fn (get-multi-option edn :post-process-fn)]
          (let [post-process-fn (cond
                                  (nil? post-process-fn) (constantly nil)
                                  (fn? post-process-fn) post-process-fn
                                  (symbol? post-process-fn) (requiring-resolve post-process-fn))]
            (post-process-fn edn data)))
        (recur (rest xs)))))
  (core/ok opts))

(def templates
  (core/->workflow {:first-step ::start
                    :wire-fn (fn [step _]
                               (case step
                                 ::start [render ::end]
                                 ::end [identity]))}))

(defn discover
  "discover all dirs inside a parent dir and return them as list of strings"
  [parent-dir]
  (let [profiles (atom [])]
    (fs/walk-file-tree parent-dir {:max-depth 2
                                   :pre-visit-dir (fn [dir _]
                                                    (let [dir (str (fs/relativize parent-dir dir))]
                                                      (when-not (str/blank? dir)
                                                        (swap! profiles conj dir)))
                                                    :continue)})
    @profiles))

(comment
  (discover "resources"))
