(ns user
  (:require
   [babashka.fs :as fs]
   [big-config.integrant :refer [system-config]]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [clojure.tools.namespace.repl :as repl]
   [expound.alpha :as expound]
   [integrant.core :as ig]
   [integrant.repl :refer [go halt reset]]
   [integrant.repl.state :as state]
   [lambdaisland.classpath.watch-deps :as watch-deps]
   [user.quickdoc :as q]))

(watch-deps/start! {:aliases [:dev :test]})

(alter-var-root #'s/*explain-out* (constantly expound/printer))

(repl/set-refresh-dirs "src/clj" "test/clj")

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

(comment
  (def markdown (atom {}))
  (fs/walk-file-tree "../../albertomiorin.com/big-config"
                     {:visit-file
                      (fn
                        [path _]
                        (let [path (str path)]
                          (when (str/ends-with? path ".mdx")
                            (swap! markdown assoc (keyword path) (slurp path))))
                        :continue)})
  (let [content (apply str (vals @markdown))]
    (spit ".all-content.md" content))
  (-> @markdown))

(comment
  (q/gen-doc))
