(ns app.main
  (:gen-class)
  (:require
   [app.fragments :as f]
   [big-config.store :refer [get-offset handle! store!]]
   [big-config.utils :refer [deep-merge]]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defaction defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(defn update-offset [tx-batch! db p]
  (swap! db
         (fn [current-val]
           (if (= current-val (get-offset p))
             current-val
             (get-offset p))))
  (tx-batch! (fn [& _])))

(defaction handler-toggle-theme [{:keys [tx-batch! db p]}]
  (handle! p [:merge {:theme (case (:theme @p)
                               "dark" "light"
                               "light" "dark"
                               "light")}])
  (update-offset tx-batch! db p))

(defaction handler-toggle-debug [{:keys [tx-batch! db p]}]
  (handle! p [:merge {:debug (not (:debug @p))}])
  (update-offset tx-batch! db p))

(defn render-lines [lines]
  (for [[id content] (reverse @lines)]
    [:p {:id id} content]))

(defview handler-home {:path "/" :shim-headers f/shim-headers}
  [{:keys [counter db p lines] :as _req}]
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href f/css}]
   [:link#theme {:rel "stylesheet" :type "text/css" :href f/theme}]
   [:script#myjs {:defer true :type "module" :src f/myjs}]
   (f/header)
   [:main#main
    [:div {:data-signals:theme (format "'%s'" (:theme @p))
           :data-signals:debug (format "%s" (:debug @p))
           :data-init "el.parentElement.parentElement.parentElement.setAttribute('data-theme', $theme); el.remove()"}]
    [:section#tables.container
     [:h2#counter @counter]]
    [:section#debug.container
     {:data-show "$debug"}
     [:pre
      {:data-json-signals true}]]
    [:section#lines.container
     (render-lines lines)]]))

(def initial-state
  {:theme "light"
   :debug false})

(defn my-business [state [op op-val] _timestamp]
  (case op
    :merge (deep-merge state op-val)
    :reset initial-state))

(defn start-counter! [tx-batch!]
  (let [running_ (atom true)]
    (h/thread
      (while @running_
        (Thread/sleep 10000) ;; 5 fps
        (tx-batch!
         (fn [{:keys [counter lines]}]
           (swap! counter inc)
           (let [new-uid h/new-uid]
             (swap! lines conj [new-uid new-uid]))))))
    (fn stop-game! [] (reset! running_ false))))

(defn ctx-start []
  (let [p_ (store! {:business-fn my-business
                    :store-key "example"})
        db_  (atom (get-offset p_))
        lines_ (atom [])
        counter_ (atom 0)
        tx-batch!   (h/batch!
                     (fn [thunks]
                       (run! (fn [thunk] (thunk {:counter counter_
                                                 :lines lines_})) thunks)
                       (h/refresh-all!))
                     {:run-every-ms 100})]
    {:db db_
     :p p_
     :counter counter_
     :lines lines_
     :tx-batch! tx-batch!
     :stop-counter (start-counter! tx-batch!)}))

(defn -main [& _]
  (h/start-app
   {:max-refresh-ms 100
    :port           (h/env :port)
    :ctx-start      ctx-start
    :ctx-stop       (fn [{:keys [stop-counter]}] (stop-counter))
    :csrf-secret    (h/env :csrf-secret)}))

;; Refresh app when you re-eval file
(h/refresh-all!)

(comment
  (def app (-main))

  (clojure.java.browse/browse-url "http://localhost:8080/")

  ;; stop server
  ((app :stop)))
