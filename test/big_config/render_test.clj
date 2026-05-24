(ns big-config.render-test
  (:require [big-config.keys :as k]
            [big-config.render :as render]
            [clojure.java.io :as io]
            [clojure.test :refer [deftest is use-fixtures]])
  (:import [java.nio.file Files]))

(defonce dirs (atom []))

(defn temp-dir []
  (let [dir (.toFile (Files/createTempDirectory "big-config-render-test-" (make-array java.nio.file.attribute.FileAttribute 0)))]
    (swap! dirs conj dir)
    (.getCanonicalPath dir)))

(defn delete-recursive [file]
  (let [f (io/file file)]
    (when (.exists f)
      (when (.isDirectory f)
        (doseq [child (.listFiles f)]
          (delete-recursive child)))
      (.delete f))))

(use-fixtures :each
  (fn [f]
    (try
      (f)
      (finally
        (doseq [d @dirs] (delete-recursive d))
        (reset! dirs [])))))

(deftest renders-templates-from-absolute-local-path
  (let [root (temp-dir)
        template (io/file root "template")
        target (io/file root "target")]
    (.mkdirs (io/file template "root"))
    (spit (io/file template "root" "hello.txt") "Hello {{ module }} {{ name }}")
    (let [res (render/render {k/render-module "infra"
                              k/render-templates [{:template (.getPath template)
                                                   :target-dir (.getPath target)
                                                   :overwrite true
                                                   :transform [["root"]]
                                                   :name "world"}]})]
      (is (= 0 (get res k/exit)))
      (is (= "Hello infra world" (slurp (io/file target "hello.txt")))))))

(deftest supports-function-sources-and-raw-transforms
  (let [root (temp-dir)]
    (render/copy-template-dir {:template-dir root
                               :target-dir (str (io/file root "target"))
                               :data {:module "infra"}
                               :src (fn [_key _data] "{{ module }}")
                               :files {:inventory "inventory.txt"}})
    (render/copy-template-dir {:template-dir root
                               :target-dir (str (io/file root "target"))
                               :data {:module "infra"}
                               :src (fn [_key _data] "{{ module }}")
                               :files {:raw "raw.txt"}
                               :opts [:raw]})
    (is (= "infra" (slurp (io/file root "target" "inventory.txt"))))
    (is (= "{{ module }}" (slurp (io/file root "target" "raw.txt"))))))

(deftest implements-selmer-whitespace-control-workaround
  (is (= "a{{ name }}b" (render/whitespace-control "a {{- name -}} b"))))
