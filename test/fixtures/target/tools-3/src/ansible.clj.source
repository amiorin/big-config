(ns ansible
  (:require
   [big-config :as bc]
   [big-config.lock :as lock]
   [big-config.render :as render]
   [cheshire.core :refer [generate-string]]
   [big-config.run :as run]
   [big-config.step :as step]))

(defn run-steps [s opts & step-fns]
  (let [{:keys [module profile]} (step/parse-module-and-profile s)
        dir (format "dist/%s/%s" module profile)
        opts (merge opts
                    {::lock/owner (or (System/getenv "ZELLIJ_SESSION_NAME") "CI")
                     ::lock/lock-keys [::step/module ::step/profile]
                     ::run/shell-opts {:dir dir}
                     ::render/templates [{:template "ansible"
                                          :target-dir dir
                                          :overwrite :delete
                                          :data-fn 'ansible/data-fn
                                          :root "foo"
                                          :transform [["root"
                                                       {"projectile" ".projectile"}
                                                       :raw]
                                                      ['ansible/kw->content "roles/users/tasks"
                                                       {:packages "packages.yml"
                                                        :repos "repos.yml"
                                                        :ssh-config "ssh-config.yml"}
                                                       :raw]
                                                      ['ansible/kw->content
                                                       {:inventory "inventory.json"
                                                        :config "default.config.yml"}
                                                       :raw]]}]})]
    (if step-fns
      (apply step/run-steps s opts step-fns)
      (step/run-steps s opts))))

(comment
  (run-steps "render -- machines ansible" {::bc/env :repl}))

(defn data-fn [_ _]
  (let [sudoer "ubuntu"
        hosts ["firebat" "soyo"]
        users [{:name "ubuntu"
                :uid "1000"
                :doomemacs "68010af0906171e3c989fc19bcb3ba81f7305022"
                :remove false}
               {:name "vscode"
                :uid "1001"
                :doomemacs "6ea4332b854d311d7ec8ae6384fae8d9871f5730"
                :remove false}
               {:name "alberto"
                :uid "1002"
                :doomemacs "68010af0906171e3c989fc19bcb3ba81f7305022"
                :remove false}
               {:name "amiorin"
                :uid "1003"
                :doomemacs "d6cdbb4d22a2db68e3d74b7f5abf5b1fd14f4de0"
                :remove false}]
        config {:users (filter (complement :remove) users)
                :remove_users (filter :remove users)
                :atuin_login "{{ lookup('ansible.builtin.env', 'ATUIN_LOGIN') }}"
                :ssh_key "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHDKdUkY+SfRm6ttOz2EEZ2+i/zm+o1mpMOdMeGUr0t4 32617+amiorin@users.noreply.github.com"}
        repos (-> (into [] (for [[repo worktrees] [["dotfiles-v3" ["ansible" "babashka"]]
                                                   ["albertomiorin.com" ["albertomiorin" "big-config"]]
                                                   ["big-config" ["deps-new"]]
                                                   ["big-container" []]
                                                   ["rama-jdbc" []]]]
                             {:user "vscode"
                              :org "amiorin"
                              :repo repo
                              :branch "main"
                              :worktrees worktrees}))
                  (into [{:user "ubuntu"
                          :org "amiorin"
                          :repo "dotfiles-v3"
                          :branch "main"
                          :worktrees ["ansible"
                                      "babashka"]}
                         {:user "alberto"
                          :org "amiorin"
                          :repo "dotfiles-v3"
                          :branch "main"
                          :worktrees ["ansible"
                                      "babashka"]}
                         {:user "amiorin"
                          :org "amiorin"
                          :repo "dotfiles-v3"
                          :branch "main"
                          :worktrees ["ansible"
                                      "babashka"]}]))
        packages (->> ["fish"
                       "emacs"
                       "zellij"
                       "starship"
                       "direnv"
                       "gh"
                       "fd"
                       "fzf"
                       "atuin"
                       "just"
                       "git"
                       "cmake"
                       "libtool"
                       "socat"
                       "zoxide"
                       "pixi"
                       "eza"
                       "zip"
                       "unzip"
                       "d2"
                       "clojure-lsp"]
                      (mapv (fn [x] [x x]))
                      (into [["ripgrep" "rg"]]))]
    {:repos repos
     :sudoer sudoer
     :hosts hosts
     :users users
     :config config
     :packages packages}))

(defn packages
  [{:keys [packages]}]
  (-> (for [[package cli] packages]
        [{:name (format "Add devbox package %s" package)
          :args {:creates (format ".local/share/devbox/global/default/.devbox/nix/profile/default/bin/%s" cli)}
          "ansible.builtin.shell" (format ". /etc/profile.d/nix.sh && devbox global add --disable-plugin %s" package)}])
      flatten
      (generate-string {:pretty true})))

(defn config
  [{:keys [config]}]
  (generate-string config {:pretty true}))

(defn ssh-config
  [{:keys [hosts]}]
  (-> (for [host hosts]
        [{:name (format "Add a new host entry using blockinfile for %s" host)
          "ansible.builtin.blockinfile" {:path "~/.ssh/config"
                                         :create true
                                         :block (format "Host %s
  Hostname %s.afrino-bushi.ts.net
  User ubuntu
  ForwardAgent yes " host host)
                                         :marker (format "# {mark} ANSIBLE MANAGED BLOCK FOR %s" host)
                                         :state "present"}}])
      flatten
      (generate-string {:pretty true})))

(defn inventory
  [{:keys [sudoer hosts users]}]
  (let [users (-> (filter (complement :remove) users)
                  (->> (map #(for [host hosts]
                               (assoc % :host host))))
                  flatten)
        admins (-> [{:ansible_user sudoer}]
                   (->> (map #(for [host hosts]
                                (-> %
                                    (merge {:host host
                                            :name "ubuntu"})))))
                   flatten)
        users-hosts (reduce #(let [{:keys [name uid host]} %2]
                               (assoc %1 (format "%s@%s" name host) {:ansible_host host
                                                                     :ansible_user name
                                                                     :uid uid})) {} users)
        admins-hosts (reduce #(let [{:keys [name host]} %2]
                                (assoc %1 (format "root@%s" host) {:ansible_host host
                                                                   :ansible_user name})) {} admins)
        res {:all {:children {:admin {:hosts admins-hosts}
                              :users {:hosts users-hosts}}}}]
    (generate-string res {:pretty true})))

(defn repos
  [{:keys [repos]}]
  (-> (for [{:keys [user org repo branch worktrees]} repos]
        (let [when-p (format "inventory_hostname.startswith(\"%s\")" user)]
          [{:name (format "Clone repo %s/%s" org repo)
            "ansible.builtin.shell" (format "ssh -o StrictHostKeyChecking=accept-new git@github.com || true && git clone git@github.com:%s/%s %s/%s" org repo repo branch)
            :args {:chdir (format "code/personal")
                   :creates (format "%s/%s" repo branch)}
            :when when-p}
           (for [worktree worktrees]
             {:name (format "Create the worktree %s for repo %s/%s" worktree org repo)
              "ansible.builtin.shell" (format "git fetch --all --tags && git worktree add ../%s %s" worktree worktree)
              :args {:chdir (format "code/personal/%s/%s" repo branch)
                     :creates (format "../%s" worktree)}
              :when when-p})]))
      flatten
      (generate-string {:pretty true})))

(defn kw->content
  [kw data]
  (case kw
    :packages (packages data)
    :repos (repos data)
    :ssh-config (ssh-config data)
    :inventory (inventory data)
    :config (config data)))

(comment
  (kw->content :packages (data-fn nil nil)))
