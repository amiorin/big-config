(ns app.actions
  (:require
   [big-config.store :refer [get-offset handle!]]
   [hyperlith.core :refer [defaction]]))

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
