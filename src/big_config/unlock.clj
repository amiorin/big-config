(ns big-config.unlock
  (:require [big-config.core :as core]
            [big-config.lock :as lock]
            [big-config.utils :as u]))

(def unlock-any
  (core/create-workflow
   {:first-step :big-config.unlock/generate-lock-id
    :wire-fn (fn [step]
               (case step
                 :big-config.unlock/generate-lock-id [lock/generate-lock-id :big-config.unlock/delete-tag]
                 :big-config.unlock/delete-tag [lock/delete-tag :big-config.unlock/delete-remote-tag]
                 :big-config.unlock/delete-remote-tag [lock/delete-remote-tag :big-config.unlock/check-remote-tag]
                 :big-config.unlock/check-remote-tag [lock/check-remote-tag :big-config.unlock/end]
                 :big-config.unlock/end [identity nil]
                 [identity nil]))
    :next-fn (fn [_step next-step opts]
               (if next-step [next-step opts] [nil opts]))}))

(u/register-function 'big-config.unlock/unlock-any unlock-any)
