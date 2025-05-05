(ns amiorin.big-config-test
  (:require
   [babashka.fs :as fs]
   [babashka.process :refer [shell]]
   [big-config :as bc]
   [clojure.edn :as edn]
   [clojure.java.io :as io]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [amiorin.big-config :refer [run-steps]]
   [org.corfield.new]))

(deftest valid-template-test
  (testing "template.edn is valid."
    (let [template (edn/read-string (slurp (io/resource "amiorin/big_config/template.edn")))]
      (is (s/valid? :org.corfield.new/template template)
          (s/explain-str :org.corfield.new/template template)))))

(deftest stability
  (testing "working directory is clean after running all modules"
    (let [modules (->> (fs/list-dir "dist/prod")
                       (map str)
                       (map #(str/replace-first % "dist/prod/" "")))]
      (doseq [module modules]
        (run-steps (format "build -- %s prod" module) [] {::bc/env :repl}))
      (as-> (shell {:continue true} "git diff --quiet") $
        (:exit $)
        (is (= $ 0) "The working directory is not clean")))))
