(ns big-spec
  (:require [clojure.spec.alpha :as s]))

(s/def ::aws-account-id string?)
(s/def ::region string?)
(s/def ::module string?)
(s/def ::owner string?)

(s/def ::config (s/keys :req-un [::aws-account-id ::region ::module]))
(s/def ::config-with-owner (s/and ::config
                                  (s/keys :req-un [::owner])))
