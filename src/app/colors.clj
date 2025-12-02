(ns app.colors
  (:require
   [lambdaisland.ansi :as ansi]
   [babashka.process :refer [sh]]))

(defn ->chunk->hiccup []
  (let [counter (atom 0)]
    (fn chunk->hiccup [[{:keys [foreground background bold] :as props} text]]
      (let [id (str "chunk_" (swap! counter inc))
            data-init "el.previousElementSibling && isFullyInViewport(el.previousElementSibling) && el.scrollIntoView()"]
        (case text
          "\n" [:br {:id id}]
          [:span (if (seq props)
                   {:id id
                    :data-init data-init
                    :style (cond-> {}
                             foreground (assoc :color (ansi/rgb->css foreground))
                             background (assoc :background-color (ansi/rgb->css background))
                             bold       (assoc :font-weight "bold"))}
                   {:id id
                    :data-init data-init})
           text])))))

(defn text->hiccup
  "Convenience function for the basic case where you have a string of terminal
  output and want to turn it into hiccup. Returns a seq of [:span] elements."
  [text]
  (sequence (comp ansi/apply-props
                  (map (->chunk->hiccup)))
            (ansi/token-stream text)))

(comment
  (-> (sh ["bat --style plain -f build.clj"])
      :out
      text->hiccup))
