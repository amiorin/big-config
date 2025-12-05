(ns app.fragments
  (:require
   [app.actions :refer [handler-run-job handler-stop-job handler-toggle-debug
                        handler-toggle-theme]]
   [clojure.java.io :as io]
   [hyperlith.core :as h]))

(def main
  (h/static-asset
   {:body         (h/load-resource "main.js")
    :content-type "text/javascript"
    :compress?    true}))

(def shim-headers
  (h/html
   [:script {:defer true :type "module" :src main}]
   [:link {:rel "icon", :href "favicon.svg", :type "image/svg+xml"}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))
