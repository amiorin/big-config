(ns user
  (:require
   [big-config.integrant :refer [system-config]]
   [clojure.spec.alpha :as s]
   [clojure.tools.namespace.repl :as repl]
   [expound.alpha :as expound]
   [integrant.core :as ig]
   [integrant.repl :refer [go halt reset]]
   [integrant.repl.state :as state]
   [lambdaisland.classpath.watch-deps :as watch-deps]))

(watch-deps/start! {:aliases [:dev :test]})

(alter-var-root #'s/*explain-out* (constantly expound/printer))

(repl/set-refresh-dirs "src/clj" "test/clj")

(defonce debug-atom (atom []))
(defn add-to-debug [x]
  (swap! debug-atom conj x))
(add-tap add-to-debug)

(comment
  (reset! debug-atom [])
  (-> @debug-atom))

(defn prep-with-profile! [profile]
  (integrant.repl/set-prep! #(-> {:profile profile}
                                 (system-config)
                                 (ig/expand))))

(prep-with-profile! :dev)

(defn start! []
  (go))

(defn stop! []
  (halt))

(comment
  (go)
  (halt)
  (reset)
  [state/config state/preparer state/system])
