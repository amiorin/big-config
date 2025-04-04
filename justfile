set export

AWS_PROFILE := "251213589273"
AWS_ACCOUNT_ID := AWS_PROFILE
AWS_ASSUME_ROLE := ""

# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# test all
test: test-big-infra test-big-config

# format and clean-ns all
tidy:
    clojure-lsp clean-ns
    cd big-infra && clojure-lsp clean-ns
    clojure-lsp format
    cd big-infra && clojure-lsp format

# test big-config
[group('clojure')]
test-big-config:
    clojure -M:test

# test big-infra
[group('tofu')]
test-big-infra:
    cd big-infra && clojure -M:test

# check the AWS identity
[group('tofu')]
get-caller-identity:
    aws sts get-caller-identity

# crate bucket for tofu states
[group('tofu')]
create-bucket account region:
    aws s3 mb s3://tf-state-{{ account }}-{{ region }}

# tofu opts|init|plan|apply|destroy|lock|unlock-any|ci|reset|auto-apply
[group('tofu')]
tofu action module profile:
    #!/usr/bin/env -S bb --config big-infra/bb.edn
    (require '[big-config.tofu :refer [main]])
    (require '[tofu.aero-readers])
    (main {:args [:{{ action }} :{{ module }} :{{ profile }}]
           :config "big-infra/big-config.edn"})

# tofu opts|init|plan|apply|destroy|lock|unlock-any|ci|reset|auto-apply
[group('tofu')]
clone-and-tofu action module profile:
    #!/usr/bin/env -S bb --config big-infra/bb.edn
    (require '[big-config.clone :refer [main]])
    (main {:args [:{{ action }} :{{ module }} :{{ profile }}]
           :repo "https://amiorin@github.com/amiorin/big-config.git"})

# invoked by recipe test
[group('private')]
test-wf-exit:
    #!/usr/bin/env -S bb --config big-infra/bb.edn
    (require '[babashka.classpath :refer [add-classpath get-classpath]]
             '[clojure.string :as str])
    (add-classpath (str (System/getProperty "user.dir") "/test/clj"))
    (require '[big-config.step-fns-test :refer [wf-exit]])
    (wf-exit)


# print babashka classpath
[group('private')]
bb-classpath:
    #!/usr/bin/env -S bb --config big-infra/bb.edn
    (require '[babashka.classpath :refer [add-classpath get-classpath]]
             '[clojure.string :as str])
    (add-classpath (str (System/getProperty "user.dir") "/test/clj"))
    (-> (get-classpath)
        (str/split #":")
        sort
        (->> (run! println)))
