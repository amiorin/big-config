(ns user
  (:require
   [big-config.main :as bc]))

(bc/tofu-facade {:args ["plan" :module-a :dev]
                 :env :repl})
