(ns app.main
  (:gen-class)
  (:require
   [clojure.java.io :as io]
   [hyperlith.core :as h :refer [defaction defview]]))

(def css
  (h/static-css (slurp (io/resource "pico.min.css"))))

(def shim-headers
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href css}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))

(defview handler-home {:path "/" :shim-headers shim-headers}
  [{:keys [] :as _req}]
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href css}]
   [:main#morph.main
    [:header
     {:class "container"}
     [:hgroup
      [:h1 "Pico"]
      [:p "A pure HTML example, without dependencies."]]
     [:nav
      [:ul
       [:li
        [:details
         {:class "dropdown"}
         [:summary {:role "button", :class "secondary"} "Theme"]
         [:ul
          {:data-on:click
           "el.parentElement.removeAttribute('open'); $theme = evt.target.dataset.themeSwitcher"}
          [:li [:a {:href "#", :data-theme-switcher "auto"} "Auto"]]
          [:li [:a {:href "#", :data-theme-switcher "light"} "Light"]]
          [:li [:a {:href "#", :data-theme-switcher "dark"} "Dark"]]]]]]]]]))

(defn ctx-start []
  (let [db_ (atom {})]
    (add-watch db_ :refresh-on-change (fn [& _] (h/refresh-all!)))
    {:db db_}))

(defn -main [& _]
  (h/start-app
   {:max-refresh-ms 100
    :ctx-start      ctx-start
    :ctx-stop       (fn [_state] nil)
    :csrf-secret    (h/env :csrf-secret)}))

;; Refresh app when you re-eval file
(h/refresh-all!)

(comment
  (def app (-main))

  (clojure.java.browse/browse-url "http://localhost:8080/")

  ;; stop server
  ((app :stop))
  )
