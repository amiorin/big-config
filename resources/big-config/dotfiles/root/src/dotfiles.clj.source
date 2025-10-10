(ns dotfiles
  (:require
   [babashka.fs :as fs]
   [babashka.process :as process]
   [big-config :as bc]
   [big-config.render :as render :refer [discover]]
   [big-config.run :as run]
   [big-config.selmer-filters]
   [big-config.step :as step]
   [clojure.string :as str]))

(defn ->envrc-template []
  (let [private ".envrc.private"]
    (when-not (fs/exists? private)
      {:template "envrc"
       :target-dir (str (fs/cwd))
       :overwrite true
       :transform [["root"
                    {(subs private 1) private}]]})))

(defn run-steps [s opts & step-fns]
  (let [{:keys [profile]} (step/parse-module-and-profile s)
        dir (format "dist/%s" profile)
        envrc-template (->envrc-template)
        stage-1 {:template "stage-1"
                 :target-dir (format "resources/stage-2/%s" profile)
                 :overwrite :delete
                 :transform [["common"
                              :raw]
                             ["{{ profile }}"
                              :raw]]}
        stage-2 {:template "stage-2"
                 :target-dir dir
                 :overwrite :delete
                 :transform [["{{ profile }}"]]}
        templates (cond-> [stage-1 stage-2]
                    envrc-template (conj envrc-template))
        opts (merge opts
                    {::run/shell-opts {:dir dir}
                     ::render/templates templates})]
    (if step-fns
      (apply step/run-steps s opts step-fns)
      (step/run-steps s opts))))

(comment
  (run-steps "render -- dotfiles ubuntu" {::bc/env :repl}))

(def home (System/getProperty "user.home"))

(defn diff [& {:keys [dir]}]
  (let [dir (str/replace dir #"/$" "")
        prefix (str dir "/")
        dist-path (str (fs/relativize (fs/parent (fs/parent (fs/cwd))) (fs/cwd)))
        files (atom [])
        _ (fs/walk-file-tree dir {:visit-file (fn [path _attr]
                                                (swap! files conj (str path))
                                                :continue)})
        copies (->> @files
                    (map (fn [x]
                           (let [src (str/replace x prefix "")]
                             [(format "%s/%s" home src) (str x)]))))]
    (doseq [[src dst] copies]
      (let [cmd (format "diff --color=always '%s' '%s'" src dst)
            printed-cmd (format "diff '%s' '%s/%s'" src dist-path dst)]
        (println printed-cmd)
        (process/shell {:continue true
                        :out *out*
                        :err *err*} cmd)))))

(defn install [& {:keys [dir]}]
  (let [dir (str/replace dir #"/$" "")]
    (fs/copy-tree dir home {:replace-existing true})))

(comment
  (diff :dir "dist/macos/dotfiles")
  (install :dir "dist/macos/dotfiles"))

(defn core
  {:org.babashka/cli {:exec-args {:profile (or (System/getenv "DOTFILES_PROFILE") "default")}
                      :coerce {:profile :string
                               :only [:string]
                               :all :boolean}
                      :alias {:p :profile
                              :a :all
                              :o :only}}}
  [{:keys [cmd profile all]} & [opts]]
  (let [opts (or opts {::bc/env :shell})]
    (case cmd
      :render (if all
                (let [profiles (discover "resources/stage-2")]
                  (doseq [profile profiles]
                    (process/shell (format "bb render %s" profile))))
                (run-steps (format "render -- dotfiles %s" profile) opts))
      :diff (run-steps (format "render exec -- dotfiles %s bb diff" profile) opts)
      :install (run-steps (format "render exec -- dotfiles %s bb install" profile) opts))))

(comment
  (core {:cmd :render
         :profile "ubuntu"} {::bc/env :repl}))

(defn help
  [& _]
  (println "Usage: bb <cmd> -p|--profile <profile> -a|--all

The available commands are listed below.

Usage:
  bb render -p macos
  bb diff -p macos
  bb install -p macos

profile:
  When the profile option is missing, the DOTFILES_PROFILE env var is used
  `default` is the profile used when a profile is not provided.

options:
  -a is used by command render to render all profiles in `resources/stage-2`
     folder

Commands
  render          render the dotfiles without installing them
  diff            render the dotfiles and diff them with the target
  install         render the dotfiles and install them
"))
