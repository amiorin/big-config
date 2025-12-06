(ns app.fragments
  (:require
   [app.actions :refer [handler-run-job handler-stop-job handler-toggle-debug
                        handler-toggle-theme]]
   [clojure.java.io :as io]
   [hyperlith.core :as h]))

(def app-css
  (h/static-css (h/load-resource "app.css")))

(def app-js
  (h/static-asset
   {:body         (h/load-resource "app.js")
    :content-type "text/javascript"
    :compress?    true}))

(def shim-headers
  (h/html
   [:link#app-css {:rel "stylesheet" :type "text/css" :href app-css}]
   [:link {:rel "icon", :href "favicon.svg", :type "image/svg+xml"}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))
