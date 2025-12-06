(ns app.fragments
  (:require
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
   [:script#app-js {:data-init (format "typeof refresh_app_js !== 'undefined' && refresh_app_js(el, '%s')" app-js)
                    :defer true
                    :type "module"
                    :src app-js}]
   [:link {:rel "icon", :href "favicon.svg", :type "image/svg+xml"}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))
