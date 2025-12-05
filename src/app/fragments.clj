(ns app.fragments
  (:require
   [app.actions :refer [handler-run-job handler-stop-job handler-toggle-debug
                        handler-toggle-theme]]
   [clojure.java.io :as io]
   [hyperlith.core :as h]))

(def daisy-css
  (h/static-css (h/load-resource "daisyui.css")))

(def tailwind
  (h/static-asset
   {:body         (h/load-resource "tailwindcss.js")
    :content-type "text/javascript"
    :compress?    true}))

(def shim-headers
  (h/html
   [:link {:rel "stylesheet" :type "text/css" :href daisy-css}]
   [:script {:defer true :type "module" :src tailwind}]
   [:link {:rel "icon", :href "favicon.svg", :type "image/svg+xml"}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))
