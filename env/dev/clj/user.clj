(ns user
  (:require
   [clojure.spec.alpha :as s]
   [expound.alpha :as expound]
   [clojure.tools.namespace.repl :as repl]
   [lambdaisland.classpath.watch-deps :as watch-deps]))

(watch-deps/start! {:aliases [:dev :test]})

(alter-var-root #'s/*explain-out* (constantly expound/printer))

(repl/set-refresh-dirs "src/clj")

(def debug-atom (atom []))
(defn add-to-debug [x]
  (swap! debug-atom conj x))
(add-tap add-to-debug)
