(ns app.actions
  (:require
   [big-config.store :refer [handle!]]
   [hyperlith.core :refer [defaction]]))

(defaction handler-toggle-theme [{:keys [p]}]
  (handle! p [:merge {:theme (case (:theme @p)
                               "dark" "light"
                               "light" "dark"
                               "light")}]))

(defaction handler-toggle-debug [{:keys [p]}]
  (handle! p [:merge {:debug (not (:debug @p))}]))

(def job-name "tofu")

(defaction handler-run-job [{:keys [p]}]
  (handle! p [:run-job {:job-name job-name}]))

(defaction handler-stop-job [{:keys [p]}]
  (handle! p [:stop-job {:job-name job-name}]))
