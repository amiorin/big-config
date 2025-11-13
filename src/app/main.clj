(ns app.main
  (:gen-class)
  (:require
   [com.rpl.specter :refer [transform must nthpath ATOM]]
   [clojure.java.io :as io]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defaction defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(def css
  (h/static-css (slurp (io/resource "pico.min.css"))))

(defaction handler-update [{:keys [db _sid _tabid] {:keys [theme operation selected name email]} :body}]
  (case operation
    "save" (do (transform [ATOM (must :trs) (nthpath selected)] #(merge % {:name name
                                                                           :email email}) db)
               (swap! db merge {:theme theme
                                :operation "list"
                                :selected -1}))
    "edit" (swap! db merge {:theme theme
                            :selected selected
                            :operation operation})
    (swap! db merge {:theme theme
                     :operation "list"
                     :selected -1})))

(def shim-headers
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href css}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))

(defn trs [db]
  (println @db)
  (let [{:keys [trs operation selected]} @db
        cnt (atom -1)]
    (for [{:keys [name email]} trs]
      (do
        (swap! cnt inc)
        (if (= selected @cnt)
          [:tr
           [:td [:input {:type "text", :data-bind:name true :data-init (format "$name = '%s'" name) :value name}]]
           [:td [:input {:type "text", :data-bind:email true :data-init (format "$email = '%s'" email) :value email}]]
           [:td
            [:button {:data-on:click (str "$selected = " @cnt "; "
                                          "$operation = 'cancel'; "
                                          ""
                                          "@post('" handler-update "')")} "Cancel"]
            [:button {:data-on:click (str "$selected = " @cnt "; "
                                          "$operation = 'save'; "
                                          ""
                                          "@post('" handler-update "')")} "Save"]]]
          [:tr
           [:td name]
           [:td email]
           [:td [:button {:data-on:click (str "$selected = " @cnt "; "
                                              "$operation = 'edit'; "
                                              "@post('" handler-update "')")} "Edit"]]])))))

(defview handler-home {:path "/" :shim-headers shim-headers}
  [{:keys [db] :as _req}]
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href css}]
   [:main#morph.main
    [:div {:data-signals:theme (format "'%s'" (:theme @db))
           :data-init "el.parentElement.parentElement.parentElement.setAttribute('data-theme', $theme); el.remove()"}]
    [:header.container
     [:hgroup
      [:h1 "Pico"]
      [:p "A pure HTML example, without dependencies."]]
     [:nav
      [:ul
       [:li
        [:details.dropdown
         [:summary.secondary {:role "button"} "Theme"]
         [:ul
          {:data-on:click
           (str
            "el.parentElement.removeAttribute('open');
            $theme = evt.target.dataset.themeSwitcher;
            @post('" handler-update "')")}
          [:li [:a {:href "#", :data-theme-switcher "auto"} "Auto"]]
          [:li [:a {:href "#", :data-theme-switcher "light"} "Light"]]
          [:li [:a {:href "#", :data-theme-switcher "dark"} "Dark"]]]]]]]]
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
                   :trs [{:name "Joe Smith"
                          :email "joe@smith.org"}
                         {:name "Angie MacDowell"
                          :email "angie@macdowell.org"}]})]
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
