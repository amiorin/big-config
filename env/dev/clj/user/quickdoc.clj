(ns user.quickdoc
  (:require
   [big-config.core :refer [->workflow ok]]
   [big-config.render :as render]
   [clojure.string :as str]
   [quickdoc.api :as q]
   [selmer.filters :as f]
   [selmer.parser :as p]))

(defn quickdoc [source-path]
  (-> (q/quickdoc {:source-paths [(format "src/clj/%s" source-path)]
                   :github/repo "https://github.com/amiorin/big-config"
                   :outfile false
                   :toc false})
      :markdown
      (str/replace-first #".*\R" "")
      (str/replace-first #".*\R" "")))

(f/add-filter! :quickdoc quickdoc)

(comment
  (p/render "{{\"big_config/core.clj\"|quickdoc}}" {})
  (q/quickdoc {:source-paths ["src/clj/big_config/core.clj"]
               :github/repo "https://github.com/amiorin/big-config"
               :outfile false
               :toc false})
  (quickdoc "big_config/core.clj"))

(defn prepare [opts]
  (merge opts (ok) {::render/templates [{:template "quickdoc"
                                         :target-dir "../../albertomiorin.com/big-config/src/content/docs/api"
                                         :overwrite true
                                         :transform [["."]]}]}))
(defn gen-doc
  []
  (let [wf (->workflow {:first-step ::start
                        :wire-fn (fn [step _]
                                   (case step
                                     ::start [prepare ::render]
                                     ::render [render/render ::end]
                                     ::end [identity]))})]
    (wf {})))
