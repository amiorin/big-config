(ns big-config.render
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [big-config.selmer-filters :as filters]
            [big-config.utils :as u]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [selmer.parser :as selmer]
            [selmer.util :as selmer-util])
  (:import [java.io File]
           [java.nio.file Files StandardCopyOption LinkOption]))

(def non-replaced-exts #{"jpg" "jpeg" "png" "gif" "bmp" "bin"})

(def template-keys
  #{:template "template"
    :target-dir "target-dir" :targetDir "targetDir"
    :overwrite "overwrite"
    :data-fn "data-fn" :dataFn "dataFn"
    :template-fn "template-fn" :templateFn "templateFn"
    :post-process-fn "post-process-fn" :postProcessFn "postProcessFn"
    :transform "transform"})

(def delimiter-keys
  #{:tag-open :tagOpen :tag-close :tagClose
    :filter-open :filterOpen :filter-close :filterClose
    :tag-second :tagSecond :short-comment-second :shortCommentSecond})

(defn- get-any [m & ks]
  (some (fn [key]
          (when (contains? m key)
            (get m key)))
        ks))

(defn- char-opt [x]
  (first (str x)))

(defn- selmer-opts [delimiters]
  (into {} (map (fn [[dk dv]] [dk (char-opt dv)]) (filters/normalize-delimiters delimiters))))

(defn render-string
  ([input data] (render-string input data nil))
  ([input data delimiters]
   (selmer-util/without-escaping
     (selmer/render (filters/whitespace-control input delimiters) data (selmer-opts delimiters)))))

(defn- file-ext [file]
  (let [n (.getName (io/file file))
        i (.lastIndexOf n ".")]
    (if (neg? i) "" (str/lower-case (subs n (inc i))))))

(defn- ensure-parent [file]
  (when-let [parent (.getParentFile (io/file file))]
    (.mkdirs parent)))

(defn- walk-files [dir]
  (let [root (io/file dir)]
    (when-not (.exists root)
      (throw (ex-info (str "Template directory not found: " dir) {:dir dir})))
    (letfn [(walk [^File f]
              (cond
                (.isDirectory f) (mapcat walk (sort-by #(.getName ^File %) (.listFiles f)))
                (.isFile f) [f]
                :else []))]
      (vec (walk root)))))

(defn- relativize [root file]
  (str (.relativize (.toPath (io/file root)) (.toPath (io/file file)))))

(defn- copy-file [src target]
  (ensure-parent target)
  (Files/copy (.toPath (io/file src))
              (.toPath (io/file target))
              (into-array StandardCopyOption [StandardCopyOption/REPLACE_EXISTING StandardCopyOption/COPY_ATTRIBUTES]))
  (let [src-file (io/file src)
        target-file (io/file target)]
    (.setExecutable target-file (.canExecute src-file) false)
    (.setReadable target-file (.canRead src-file) false)
    (.setWritable target-file (.canWrite src-file) true)))

(defn copy-dir [{:keys [src-dir target-dir data delimiters]}]
  (doseq [src-file (walk-files src-dir)]
    (let [rel (relativize src-dir src-file)
          target-file (io/file target-dir rel)
          replaceable (not (contains? non-replaced-exts (file-ext src-file)))]
      (ensure-parent target-file)
      (if (and data replaceable)
        (spit target-file (render-string (slurp src-file) data delimiters))
        (copy-file src-file target-file)))))

(defn- entries-of-files [files]
  (cond
    (nil? files) []
    (map? files) (seq files)
    :else files))

(defn- delimiter-map? [x]
  (and (map? x) (some #(contains? x %) delimiter-keys)))

(defn- transform-option? [x]
  (contains? #{:raw "raw" ":raw" :only "only" ":only"} x))

(defn- normalize-transform-option [x]
  (keyword (str/replace (name (if (keyword? x) x (keyword (str x)))) #"^:" "")))

(defn parse-transform [spec]
  (when (or (not (sequential? spec)) (empty? spec))
    (throw (ex-info "Invalid transform entry" {:spec spec})))
  (let [[src & rest0] spec
        opts (->> rest0 (filter transform-option?) (map normalize-transform-option) set)
        rest (vec (remove transform-option? rest0))
        [target rest] (if (string? (first rest)) [(first rest) (subvec rest 1)] [nil rest])
        [files rest] (cond
                       (delimiter-map? (first rest)) [nil rest]
                       (map? (first rest)) [(first rest) (subvec rest 1)]
                       :else [nil rest])
        [delimiters _rest] (if (delimiter-map? (first rest)) [(first rest) (subvec rest 1)] [nil rest])]
    {:src src :target target :files files :delimiters delimiters :opts opts}))

(defn copy-template-dir [{:keys [template-dir target-dir data src target files delimiters opts]}]
  (let [data (or data {})
        opts (set (map normalize-transform-option (or opts [])))
        raw? (contains? opts :raw)
        only? (contains? opts :only)
        target-suffix (if target (render-string target data delimiters) "")
        target-base (if (seq target-suffix) (io/file target-dir target-suffix) (io/file target-dir))
        file-entries (vec (entries-of-files files))]
    (if (fn? src)
      (do
        (when (empty? file-entries)
          (throw (ex-info "Files is required when src is a function" {})))
        (doseq [[from to] file-entries]
          (let [raw-content (str (src from data))
                content (if raw? raw-content (render-string raw-content data delimiters))
                target-file (io/file target-base (render-string (str to) data delimiters))]
            (ensure-parent target-file)
            (spit target-file content))))
      (let [src-rendered (render-string (str src) data delimiters)
            src-dir (io/file template-dir src-rendered)]
        (if (empty? file-entries)
          (copy-dir {:src-dir src-dir :target-dir target-base :data (when-not raw? data) :delimiters delimiters})
          (do
            (when-not only?
              (copy-dir {:src-dir src-dir :target-dir target-base :data (when-not raw? data) :delimiters delimiters}))
            (doseq [[from to] file-entries]
              (let [rendered-to (render-string (str to) data delimiters)
                    src-file (io/file src-dir (str from))
                    target-file (io/file target-base rendered-to)]
                (when-not only?
                  (.delete (io/file target-base (str from))))
                (ensure-parent target-file)
                (if (and (not raw?) (not (contains? non-replaced-exts (file-ext src-file))))
                  (spit target-file (render-string (slurp src-file) data delimiters))
                  (copy-file src-file target-file))))))))))

(defn- directory? [x]
  (let [f (io/file x)]
    (and (.exists f) (.isDirectory f))))

(defn- url->file [url]
  (when (= "file" (.getProtocol url))
    (io/file (.toURI url))))

(defn resolve-template-dir [template]
  (let [template (str template)
        template-file (io/file template)
        absolute? (.isAbsolute template-file)
        cwd (System/getProperty "user.dir")
        candidates (remove nil?
                           [(when absolute? template-file)
                            (when-not absolute? (io/file cwd template))
                            (when-not absolute? (io/file cwd "resources" template))
                            (when-not absolute? (some-> (io/resource template) url->file))
                            (when-not absolute? (some-> (io/resource (str "big-config/" template)) url->file))])]
    (if-let [found (some #(when (directory? %) (.getCanonicalPath (io/file %))) candidates)]
      found
      (throw (ex-info "Template resource not found" {:template template
                                                       :candidates (mapv str candidates)})))))

(defn- template-target-dir [edn]
  (get-any edn :target-dir :targetDir "target-dir" "targetDir"))

(defn- get-multi-option [value]
  (cond
    (nil? value) []
    (and (sequential? value) (not (fn? value))) value
    :else [value]))

(defn- delete-recursive [file]
  (let [f (io/file file)]
    (when (.exists f)
      (when (.isDirectory f)
        (doseq [child (.listFiles f)]
          (delete-recursive child)))
      (.delete f))))

(defn render [opts]
  (let [templates (get opts k/render-templates)]
    (when (nil? templates)
      (throw (IllegalArgumentException. ":big-config.render/templates should never be nil")))
    (doseq [input-edn templates]
      (let [data-fn (u/->fn (get-any input-edn :data-fn :dataFn "data-fn" "dataFn")
                            (fn [data _opts] data))
            template-fn (u/->fn (get-any input-edn :template-fn :templateFn "template-fn" "templateFn")
                                (fn [_data edn] edn))
            data-base (into {} (remove (fn [[tk _]] (contains? template-keys tk)) input-edn))
            data (data-fn (merge data-base
                                 {:module (get opts k/render-module)
                                  :profile (get opts k/render-profile)})
                          opts)
            edn (template-fn data input-edn)
            template (get-any edn :template "template")
            target-dir (template-target-dir edn)
            transform (get-any edn :transform "transform")]
        (when (or (not (seq (str template))) (not (seq (str target-dir))))
          (throw (ex-info "Invalid template" {:edn edn})))
        (when (nil? transform)
          (throw (IllegalArgumentException. ":transform not defined")))
        (when (empty? transform)
          (throw (IllegalArgumentException. ":transform is an empty list")))
        (let [template-dir (resolve-template-dir template)
              target-file (io/file target-dir)
              overwrite (get-any edn :overwrite "overwrite")]
          (when (.exists target-file)
            (cond
              (#{:delete "delete" ":delete"} overwrite) (delete-recursive target-file)
              (not overwrite) (throw (ex-info (str target-dir " already exists (and :overwrite was not true).") {}))))
          (doseq [spec transform]
            (let [{:keys [src target files delimiters opts]} (parse-transform spec)]
              (copy-template-dir {:template-dir template-dir
                                  :target-dir target-dir
                                  :data data
                                  :src src
                                  :target target
                                  :files files
                                  :delimiters delimiters
                                  :opts opts})))
          (doseq [f0 (get-multi-option (get-any edn :post-process-fn :postProcessFn "post-process-fn" "postProcessFn"))]
            (let [f (u/->fn f0 (fn [_edn _data] nil))]
              (f edn data))))))
    (assoc opts k/exit 0 k/err nil)))

(def templates
  (core/create-workflow
   {:first-step :big-config.render/start
    :wire-fn (fn [step]
               (case step
                 :big-config.render/start [render :big-config.render/end]
                 :big-config.render/end [identity nil]
                 [identity nil]))}))

(defn discover [parent-dir]
  (let [parent (io/file parent-dir)
        out (atom [])]
    (letfn [(walk [dir depth]
              (when (<= depth 2)
                (doseq [entry (sort-by #(.getName ^File %) (.listFiles (io/file dir)))]
                  (when (.isDirectory entry)
                    (swap! out conj (relativize parent entry))
                    (walk entry (inc depth))))))]
      (walk parent 1)
      (vec (remove str/blank? @out)))))

(def whitespace-control filters/whitespace-control)
