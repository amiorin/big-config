(ns big-config.build-test
  (:require
   [babashka.process :refer [shell]]
   [big-config.build :as sut]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [clojure.tools.build.api :as b]))

(defn ->content [kw _data]
  (case kw
    :inventory "{{ module }}"
    :config "<< module >>"))

(defn data-fn [_opts _counter]
  {:module "infra"})

(defn check-dir
  [dir]
  (and
   (-> (shell {:out :string} (format "git ls-files -o --exclude-standard %s" dir))
       :out
       str/blank?)
   (-> (shell {:continue true} (format "git diff --quiet %s" dir))
       :exit
       zero?)))

(defn git-output
  [dir]
  (let [git-diff (:out (shell {:continue true
                               :out :string} (format "git --no-pager diff %s" dir)))
        git-new-files (:out (shell {:out :string} (format "git ls-files -o --exclude-standard %s" dir)))]
    (format "> git diff
%s
> git new files
%s" git-diff git-new-files)))

(deftest all-test
  (testing "Test both copy-template-dir and create"
    (let [template-dir "test/dist/source"
          target-dir "test/dist/target"
          transform [['big-config.build-test/->content
                      {:inventory "inventory.json"}]
                     ['big-config.build-test/->content
                      {:inventory "inventory-raw.json"}
                      :raw]
                     ['big-config.build-test/->content
                      {:config "config.json"}
                      {:tag-open \<
                       :tag-close \>
                       :filter-open \<
                       :filter-close \>}]
                     ["root"]
                     ["root" "role"
                      {"root-config.json" "config.json"}
                      {:tag-open \<
                       :tag-close \>
                       :filter-open \<
                       :filter-close \>}]
                     ["root" "{{ module }}"
                      {"root-config.json" "{{ module }}.json"}
                      :only]]]
      (b/delete {:path target-dir})
      (run! #(sut/copy-template-dir template-dir target-dir % {:module "infra"}) (s/conform ::sut/transform transform))
      (sut/create {::sut/recipes [{:template "template"
                               :target-dir target-dir
                               :data-fn 'big-config.build-test/data-fn}]}))
    (is (check-dir "test/dist") (git-output "test/dist"))))
