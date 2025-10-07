(ns big-config.render-test
  (:require
   [babashka.process :refer [shell]]
   [big-config.render :as sut]
   [big-config.step :as step]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]
   [clojure.tools.build.api :as b]))

(defn ->content [kw _data]
  (case kw
    :inventory "{{ module }}"
    :config "<< module >>"))

(comment
  (->content :intentory {}))

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

(deftest copy-template-dir-test
  (testing "copy-template-dir fn"
    (let [prefix "test/fixtures"]
      (loop [counter 0
             xs [['big-config.render-test/->content
                  {:inventory "inventory.json"}]
                 ['big-config.render-test/->content
                  {:inventory "inventory-raw.json"}
                  :raw]
                 ['big-config.render-test/->content
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
                  :only]
                 ["nested"]
                 ["nested" "{{ module }}"]
                 ["{{ module }}" "{{ module }}"]
                 ["binary"]]]
        (when-not (empty? xs)
          (let [template-dir (str prefix "/source")
                target-dir (format "%s/target/copy-%s" prefix counter)
                transform [(first xs)]]
            (b/delete {:path target-dir})
            (run! #(apply sut/copy-template-dir
                          :template-dir template-dir
                          :target-dir target-dir
                          :data {:module "infra"}
                          (reduce concat (vec %))) (s/conform ::sut/transform transform))
            (recur (inc counter) (rest xs))))))))

(deftest render-test
  (testing "render fn"
    (let [prefix "test/fixtures"]
      (loop [counter 0
             xs [{:template "template"
                  :transform [["root"]
                              ["role" "role"
                               {"tasks.yml" "tasks.yml"}
                               :only
                               :raw]]}
                 {:template "template"
                  :transform [["root"]
                              ["role" "role"
                               {"tasks.yml" "tasks.yml"}
                               :only]]}]]
        (when-not (empty? xs)
          (let [target-dir (format "%s/target/render-%s" prefix counter)]
            (b/delete {:path target-dir})
            (sut/render {::step/module "infra"
                         ::sut/templates [(-> xs
                                              first
                                              (assoc :target-dir target-dir))]})
            (recur (inc counter) (rest xs)))))
      (is (check-dir prefix) (git-output prefix)))))

(deftest binary-files-test
  (testing "empty *non-replaced-ext*"
    (is (thrown? clojure.lang.ExceptionInfo
                 (binding [sut/*non-replaced-exts* #{}]
                   (sut/copy-dir :src-dir "test/fixtures/source/binary" :target-dir "test/fixtures/target/copy-9" :data {}))))))
