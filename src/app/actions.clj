(ns app.actions
  (:require
   [big-config.store :refer [handle!]]
   [hyperlith.core :refer [defaction]]))

(defaction handler-toggle-theme [{:keys [state]}]
  (handle! state [:merge {:theme (case (:theme @state)
                                   "dark" "light"
                                   "light" "dark"
                                   "light")}]))

(defaction handler-toggle-debug [{:keys [state]}]
  (handle! state [:merge {:debug (not (:debug @state))}]))

(def job-name "tofu")

(defaction handler-run-job [{:keys [state]}]
  (handle! state [:run-job {:job-name job-name}]))

(defaction handler-stop-job [{:keys [state]}]
  (handle! state [:stop-job {:job-name job-name}]))
