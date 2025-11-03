(ns big-config.integrant-keys
  (:require
   [babashka.fs :as fs]
   [babashka.process :refer [destroy process]]
   [babashka.wait :refer [wait-for-path]]
   [clojure.string :as str]
   [clojure.tools.logging :as log]
   [integrant.core :as ig]))

(defn log
  [out-or-err]
  (proxy [java.io.OutputStream] []
    (write
      [b off len]
      (let [s (String. b off len)]
        (doseq [line (str/split-lines s)]
          ((case out-or-err
             :err #(binding [*out* *err*] (log/info %))
             :out #(log/info %)) line))))))

(defmethod ig/init-key :system/env
  [_ env]
  env)

(defn ->ready-file
  [port]
  (format "/tmp/port-%s" port))

(defmethod ig/init-key :redis/server
  [_ {:keys [port pc-port env]}]
  (let [ready-file (->ready-file port)
        _ (fs/delete-if-exists ready-file)
        cmd (format "direnv exec . process-compose -f pc-%s.yaml -p %s up" (name env) pc-port)
        pc (process {:err (log :err)
                     :out (log :out)} cmd)]
    (wait-for-path ready-file {:timeout 5000})
    {:pc pc
     :port port}))

(defmethod ig/halt-key! :redis/server
  [_ {:keys [pc]}]
  (destroy pc))
