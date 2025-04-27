(ns big-config.ansible-test
  (:require
   [babashka.fs :as fs]
   [big-config.utils :refer [sort-nested-map]]
   [clojure.edn :as edn]
   [clojure.java.io :as io]
   [clojure.pprint :as pp]
   [clojure.walk :as walk]
   [selmer.parser :as p]
   [selmer.util :as u]))

(defn missing-value-fn [tag context-map]
  (throw (ex-info "Missing value" {:tag tag
                                   :context-map context-map})))

(u/set-missing-value-formatter! missing-value-fn)

(defprotocol To
  (task [this]))

(defrecord Task [name remote-user action args notify]
  To
  (task [{:keys [name remote-user action args notify]}]
    (let [t {:name name
             :action action
             :args args
             :remote_user remote-user
             :notify notify}]
      (cond
        :else t))))

(defn path->str [& xs]
  (str (apply fs/path xs)))

(defn res->file [{:keys [target-dir resource-dir] :as ctx} res]
  (-> (fs/path target-dir res)
      fs/parent
      fs/create-dirs)
  (-> (path->str resource-dir res)
      io/resource
      slurp
      (p/render ctx)
      (->> (spit (fs/file target-dir res)))))

(defn process-dir [{:keys [remote-user target-dir resource-dir] :as ctx} entry]
  (let [entry (walk/postwalk #(if (string? %)
                                (p/render % ctx)
                                %) entry)
        [dir-src dir-dest files dir-map file-map] entry
        create-dir (map->Task (merge {:name (format "Create dir %s" dir-dest)
                                      :remote-user remote-user
                                      :action "ansible.builtin.file"} dir-map))
        create-files (for [[file-src file-dest] files]
                       (let [src (path->str dir-src file-src)
                             dest (path->str dir-dest file-dest)]
                         (res->file ctx src)
                         (map->Task (merge {:name (format "Create file %s" dest)
                                            :remote-user remote-user
                                            :action "ansible.builtin.copy"} file-map))))]
    (into create-files [create-dir])))

(let [ctx {:target-dir "foo"
           :resource-dir "ansible"
           :remote-user "vscode"
           :app-user "airflow"}
      xs (-> "ansible/template.edn"
             io/resource
             slurp
             edn/read-string
             :transform)]
  (->> (mapcat (partial process-dir ctx) xs)
       (mapv task)
       pp/pprint))
