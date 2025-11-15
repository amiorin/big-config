(ns app.main
  (:gen-class)
  (:require
   [clojure.java.io :as io]
   [com.rpl.specter :refer [ALL ATOM must pred select-any transform]]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defaction defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(def css
  (h/static-css (slurp (io/resource "pico.min.css"))))

(def theme
  (h/static-css (slurp (io/resource "theme.css"))))

(def shim-headers
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href css}]
   [:link#theme {:rel "stylesheet" :type "text/css" :href theme}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))

(defaction handler-update [{:keys [db _sid _tabid] {:keys [theme operation target trs]} :body}]
  (transform [ATOM] #(assoc % :theme theme) db)
  (case (keyword operation)
    :cancel (transform [ATOM (must :trs) ALL (pred #(= (:uid %) target)) (must :form)]
                       #(assoc % :show false) db)
    :edit (let [fields (select-keys (select-any [ATOM (must :trs) ALL (pred #(= (:uid %) target))] db)
                                    [:name :email])]
            (transform [ATOM (must :trs) ALL (pred #(= (:uid %) target)) (must :form)] #(merge % {:show true} fields) db))

    :save (let [new-fields ((keyword target) trs)]
            (transform [ATOM (must :trs) ALL (pred #(= (:uid %) target))]
                       #(merge % new-fields {:form {:show false}}) db))
    :live (let [new-fields ((keyword target) trs)]
            (transform [ATOM (must :trs) ALL (pred #(= (:uid %) target)) (must :form)] #(merge % new-fields) db))
    nil))

(defn header []
  [:header#header
   [:div
    {:class "container"}
    [:nav
     [:ul
      [:li
       {:class "hide-before-sm"}
       [:a
        {:aria-current "page"
         :class "contrast"
         :data-discover "true"
         :href "/"}
        "Example"]]
      [:li
       {:class "hide-before-sm"}
       [:a
        {:class "contrast"
         :data-discover "true"
         :href "https://bigconfig.it"
         :target "_blank"}
        "Docs"]]]
     [:ul
      {:class "icons"}
      [:li
       [:a
        {:rel "noopener noreferrer",
         :class "contrast",
         :aria-label "GitHub repository",
         :href "https://github.com/amiorin/big-config",
         :target "_blank"}
        [:svg
         {:xmlns "http://www.w3.org/2000/svg",
          :height "24",
          :width "24.25",
          :viewBox "0 0 496 512",
          :class "icon-github"}
         [:path
          {:d
           "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"}]]]]
      [:li
       [:a
        {:class "contrast",
         :aria-label "Turn off dark mode",
         :data-discover "true",
         :data-on:click (format (str "$theme = ($theme == 'light') ? 'dark' : 'light'; "
                                     "@post('%s')") handler-update)}
        [:svg
         {:xmlns "http://www.w3.org/2000/svg",
          :width "24",
          :height "24",
          :viewBox "0 0 32 32",
          :fill "currentColor",
          :class "icon-theme-toggle"
          :data-class:moon "$theme == 'dark'"}
         [:clippath
          {:id "theme-toggle-cutout"}
          [:path {:d "M0-11h25a1 1 0 0017 13v30H0Z"}]]
         [:g
          {:clip-path "url(#theme-toggle-cutout)"}
          [:circle {:cx "16", :cy "16", :r "8.4"}]
          [:path
           {:d
            "M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z"}]]]]]]]]])

(defn trs [db]
  (let [{:keys [trs]} @db]
    (for [{:keys [uid name email] {:keys [show] :as form} :form} trs]
      (if show
        (let [{:keys [name email]} form]
          [:tr
           {:data-signals (format "{trs: {%s: {name: '%s', email: '%s'}}}" uid name email)}
           [:td [:input {:style "min-width: max-content;"
                         :type "text"
                         :data-on:input__debounce.500ms (format (str "$target = '%s'; "
                                                                     "$operation = 'live'; "
                                                                     "@post('%s')") uid handler-update)
                         (format "data-bind:trs.%s.name" uid) true}]]
           [:td [:input {:style "min-width: max-content;"
                         :type "text"
                         :data-on:input__debounce.500ms (format (str "$target = '%s'; "
                                                                     "$operation = 'live'; "
                                                                     "@post('%s')") uid handler-update)
                         (format "data-bind:trs.%s.email" uid) true}]]
           [:td
            [:fieldset.grid {:style "display: flex;"}
             [:button.secondary {:data-on:click (format (str "$target = '%s'; "
                                                             "$operation = 'cancel'; "
                                                             "@post('%s')") uid handler-update)} "Cancel"]
             [:button {:data-on:click (format (str "$target = '%s'; "
                                                   "$operation = 'save'; "
                                                   "@post('%s')") uid handler-update)} "Save"]]]])
        [:tr
         {:data-signals (format "{trs: {%s: null}}" uid)}
         [:td name]
         [:td email]
         [:td [:button {:data-on:click (format (str "$target = '%s'; "
                                                    "$operation = 'edit'; "
                                                    "@post('%s')") uid handler-update)} "Edit"]]]))))

(defview handler-home {:path "/" :shim-headers shim-headers}
  [{:keys [db] :as _req}]
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href css}]
   [:link#theme {:rel "stylesheet" :type "text/css" :href theme}]
   (header)
   [:main#main
    [:div {:data-signals:theme (format "'%s'" (:theme @db))
           :data-init "el.parentElement.parentElement.parentElement.setAttribute('data-theme', $theme); el.remove()"}]
    [:section.container
     [:button {:data-on:click (format (str "$theme = ($theme == 'light') ? 'dark' : 'light'; "
                                           "@post('%s')") handler-update)} "Save"]]
    [:section#tables.container
     [:h2 "Tables"]
     [:div.overflow-auto
      [:table.striped
       [:thead
        [:tr
         [:th {:scope "col"} "Name"]
         [:th {:scope "col"} "Email"]
         [:th {:scope "col"} "Actions"]]]
       [:tbody#trs
        (trs db)]]]]]))

(defn ctx-start []
  (let [db_ (atom {:theme "light"
                   :operation "list"
                   :selected -1
                   :users 2
                   :trs [{:uid "aaa"
                          :name "Joe Smith"
                          :email "joe@smith.org"
                          :form {:show false}}
                         {:uid "bbb"
                          :name "Fuqua Tarkenton"
                          :email "fuqua@tarkenton.org	"
                          :form {:show false}}
                         {:uid "ccc"
                          :name "Angie MacDowell"
                          :email "angie@macdowell.org"
                          :form {:show false}}]})]
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

  (h/html (-> app :ctx :db trs))

  ;; stop server
  ((app :stop)))
