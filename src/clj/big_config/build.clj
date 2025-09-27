(ns big-config.build
  (:require
   [babashka.fs :as fs]
   [big-config.core :as core]
   [clojure.java.io :as io]
   [clojure.spec.alpha :as s]
   [clojure.tools.build.api :as b]
   [selmer.parser :as p])
  (:import
   (java.nio.file Files)
   (java.nio.file.attribute FileAttribute)))

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

(def ^:dynamic *non-replaced-exts* #{"jpg" "jpeg" "png" "gif" "bmp"})

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
                                                    (and data replacable) (p/render data delimiters))]
                                      (spit target-file content)
                                      (->> (fs/posix-file-permissions path)
                                           (fs/set-posix-file-permissions target-file)))
                                    :continue)}))

(defn copy-template-dir
  [& {:keys [template-dir target-dir data src target files delimiters opts]}]
  (let [target (if target (str "/" (p/render target data)) "")
        opts (set opts)
        raw (:raw opts)
        only (:only opts)]
    (case (first src)
      :sym (let [f (requiring-resolve (second src))]
             (if (seq files)
               (run! (fn [[kw to]]
                       (let [content (cond-> (f kw data)
                                       (not raw) (p/render data delimiters))
                             target-file (str target-dir (p/render target data) "/" (p/render to data))]
                         (fs/create-dirs (fs/parent target-file))
                         (spit target-file content)))
                     files)
               (throw (ex-info "Files is required when src is a symbol" {}))))
      :str (let [src (p/render (second src) data)]
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
                                       :target (str inter-target "/" (p/render to data))}))
                       files)
                 (copy-dir (cond-> {:target-dir target-dir
                                    :src-dir intermediate} (not raw) (merge {:data data
                                                                             :delimiters delimiters}))))
               (copy-dir (cond-> {:target-dir (str target-dir target)
                                  :src-dir (str template-dir "/" src)}
                           (not raw) (merge {:data data
                                             :delimiters delimiters}))))))))

(defn create [{:keys [::templates] :as opts}]
  (when (nil? templates)
    (throw (IllegalArgumentException. ":big-config.build/templates should never be nil")))
  (loop [counter 0
         xs templates]
    (when-not (empty? xs)
      (let [{:keys [data-fn template-fn] :as edn} (first xs)
            data-fn (cond
                      (nil? data-fn) (constantly {})
                      (fn? data-fn) data-fn
                      (symbol? data-fn) (requiring-resolve data-fn))
            template-fn (cond
                          (nil? template-fn) (constantly edn)
                          (fn? template-fn) template-fn
                          (symbol? template-fn) (requiring-resolve template-fn))
            data (data-fn opts counter)
            {:keys [template
                    target-dir
                    overwrite
                    post-process-fn
                    root
                    transform] :as edn} (template-fn data edn)
            ^java.net.URL url (io/resource template)
            template-dir (-> url .getPath io/file .getCanonicalPath)
            post-process-fn (cond
                              (nil? post-process-fn) (constantly nil)
                              (fn? post-process-fn) post-process-fn
                              (symbol? post-process-fn) (requiring-resolve post-process-fn))
            transform (s/conform ::transform (into [[(or root "root")]] transform))]
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
        (post-process-fn edn data)
        (recur (inc counter) (rest xs)))))
  (core/ok opts))

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

(defn ->build
  [build-fn]
  (core/->workflow {:first-step ::start
                    :wire-fn (fn [step _]
                               (case step
                                 ::start [build-fn ::end]
                                 ::end [identity]))}))
