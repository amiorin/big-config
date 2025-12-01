(ns app.fragments
  (:require
   [app.actions :refer [handler-run-job handler-stop-job handler-toggle-debug
                        handler-toggle-theme]]
   [clojure.java.io :as io]
   [hyperlith.core :as h]))

(def css
  (h/static-css (slurp (io/resource "pico.min.css"))))

(def theme
  (h/static-css (slurp (io/resource "theme.css"))))

(def myjs
  (h/static-asset
   {:body         (h/load-resource "myjs.js")
    :content-type "text/javascript"
    :compress?    true}))

(def css-lines
  (h/static-css
   [[:#lines
     {:margin-inline   :auto
      :overflow-y      :scroll
      :scrollbar-width :none
      :display         :flex
      :flex-direction  :column}]]))

(def shim-headers
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href css}]
   [:link#theme {:rel "stylesheet" :type "text/css" :href theme}]
   [:link#css-lines {:rel "stylesheet" :type "text/css" :href css-lines}]
   [:script#myjs {:defer true :type "module" :src myjs}]
   [:link {:rel "icon", :href "favicon.svg", :type "image/svg+xml"}]
   [:title nil "Playground"]
   [:meta {:content "Playground" :name "description"}]))

(defn header [& {:keys [running]}]
  [:header#header
   [:div
    {:class "container"}
    [:nav
     [:ul
      [:li
       {:class "hide-before-sm"}
       [:a
        {:aria-current "page"
         :class "contrast"
         :data-discover "true"
         :href "/"}
        "Demo"]]
      [:li
       {:class "hide-before-sm"}
       [:a
        {:class "contrast"
         :data-discover "true"
         :href "https://bigconfig.it"
         :target "_blank"}
        "BigConfig"]]
      [:li
       {:class "hide-before-sm"}
       [:a
        {:class "contrast"
         :href "#"
         :data-on:click (format "@post('%s')" handler-toggle-debug)
         :data-text "`${$debug ? 'Debug on' : 'Debug off'}`"
         :data-discover "true"}
        "Debug"]]
      [:li
       {:class "hide-before-sm"}
       [:a
        {:class "contrast"
         :href "#"
         :data-on:click (format "@post('%s')" (if running handler-stop-job handler-run-job))
         :data-discover "true"}
        (if running "Stop" "Run")]]]
     [:ul
      {:class "icons"}
      [:li
       [:a
        {:rel "noopener noreferrer",
         :class "contrast",
         :aria-label "GitHub repository",
         :href "https://github.com/amiorin/big-config/blob/hyperlith/src/app/main.clj",
         :target "_blank"}
        [:svg
         {:xmlns "http://www.w3.org/2000/svg",
          :height "24",
          :width "24.25",
          :viewBox "0 0 496 512",
          :class "icon-github"}
         [:path
          {:d
           "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"}]]]]
      [:li
       [:a
        {:class "contrast",
         :aria-label "Turn off dark mode",
         :href "#"
         :data-discover "true",
         :data-on:click (format "@post('%s')" handler-toggle-theme)}
        [:svg
         {:xmlns "http://www.w3.org/2000/svg",
          :width "24",
          :height "24",
          :viewBox "0 0 32 32",
          :fill "currentColor",
          :class "icon-theme-toggle"
          :data-class:moon "$theme == 'dark'"}
         [:clippath
          {:id "theme-toggle-cutout"}
          [:path {:d "M0-11h25a1 1 0 0017 13v30H0Z"}]]
         [:g
          {:clip-path "url(#theme-toggle-cutout)"}
          [:circle {:cx "16", :cy "16", :r "8.4"}]
          [:path
           {:d
            "M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z"}]]]]]]]]])
