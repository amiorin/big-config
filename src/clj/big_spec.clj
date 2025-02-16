(ns big-spec
  (:require [clojure.spec.alpha :as s]))

(s/def ::aws-account-id string?)
(s/def ::region string?)
(s/def ::module string?)

(s/def ::args (s/keys :req-un [::aws-account-id ::region ::module]))
