(ns app
  (:require [core]))

(println "app-h")

(defn refresh-app-js [el uid]
  (when (and el
             (not= js/window.last-app-js-uid uid))
    ;; 2. Get the code content from the existing script.
    (let [script-content (.-textContent el)
          ;; 3. Create a new <script> element.
          new-script (js/document.createElement "script")]

      ;; 4. Set the new script's properties.
      ;; Copy attributes to maintain context (like data-squint-entry or type).
      (doseq [attr (.-attributes el)]
        (.setAttribute new-script (.-name attr) (.-value attr)))

      ;; Set the content.
      (set! (.-textContent new-script) script-content)

      ;; 5. Replace the old script with the new one.
      ;; Removing the old one and appending the new one triggers the browser
      ;; to evaluate the new script's content again.
      (let [parent-node (.-parentNode el)]
        (when parent-node
          (.removeChild parent-node el)
          (.appendChild parent-node new-script)))
      (set! js/window.last-app-js-uid uid))))

(set! js/window.refresh-app-js refresh-app-js)
