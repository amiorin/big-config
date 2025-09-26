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

(defn copy-dir
  [& {:keys [src-dir target-dir data delimiters]}]
  (fs/walk-file-tree src-dir
                     {:visit-file (fn [path _]
                                    (let [path (str path)
                                          target-file (->> (fs/relativize src-dir path)
                                                           (fs/path target-dir)
                                                           str)
                                          _ (fs/create-dirs (fs/parent target-file))
                                          content (cond-> (slurp path)
                                                    data (p/render data delimiters))]
                                      (spit target-file content))
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
      :str (let [src (second src)]
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
                                    :src-dir intermediate}
                             (not raw) (merge {:data data
                                               :delimiters delimiters}))))
               (copy-dir (cond-> {:target-dir target-dir
                                  :src-dir (str template-dir "/" src)}
                           (not raw) (merge {:data data
                                             :delimiters delimiters}))))))))

(defn create [{:keys [::recipes] :as opts}]
  (loop [counter 0
         xs recipes]
    (when-not (empty? xs)
      (let [{:keys [template
                    target-dir
                    overwrite
                    data-fn
                    post-process-fn
                    root
                    transform]} (first xs)
            ^java.net.URL url (io/resource template)
            template-dir (-> url .getPath io/file .getCanonicalPath)
            data-fn (if (symbol? data-fn)
                      (requiring-resolve data-fn)
                      (constantly {}))
            data (data-fn opts counter)
            post-process-fn (if (symbol? post-process-fn)
                              (requiring-resolve post-process-fn)
                              (constantly nil))
            transform (s/conform ::transform (if transform
                                               transform
                                               [[(or root "root")]]))]
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
        (post-process-fn)
        (recur (inc counter) (rest xs)))))
  (core/ok opts))

(defn ->build
  [build-fn]
  (core/->workflow {:first-step ::start
                    :wire-fn (fn [step _]
                               (case step
                                 ::start [build-fn ::end]
                                 ::end [identity]))}))
