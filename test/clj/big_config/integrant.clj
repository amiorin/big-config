(ns big-config.integrant
  (:require
   [aero.core :as aero]
   [clojure.java.io :as io]
   [clojure.tools.logging :as log]
   [integrant.core :as ig]
   [integrant.repl.state :as state]
   [big-config.integrant-keys]))

(defmethod aero/reader 'ig/ref
  [_ _ value]
  (ig/ref value))

(defmethod aero/reader 'ig/refset
  [_ _ value]
  (ig/refset value))

(defn read-config
  [filename options]
  (log/info "Reading config" filename)
  (aero/read-config (io/resource filename) options))

(comment
  (read-config "system.edn" {:profile :dev})
  (slurp (io/resource "system.edn")))

(def ^:const system-filename "system.edn")

(defn system-config
  [options]
  (read-config system-filename options))

(defonce system (atom nil))

(defn system-state []
  (or @system state/system))

(defn system-fixture []
  (fn [f]
    (when (nil? (system-state))
      (reset! system (-> {:profile :test}
                         (system-config)
                         (ig/init))))
    (f)
    (some-> (deref system) (ig/halt!))
    (reset! system nil)))
