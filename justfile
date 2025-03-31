set export

AWS_PROFILE := "251213589273"
AWS_ACCOUNT_ID := AWS_PROFILE
AWS_ASSUME_ROLE := ""

# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# test big-config
[group('clojure')]
test:
    clojure -M:test

# check the AWS identity
[group('tofu')]
get-caller-identity:
    aws sts get-caller-identity

# tofu opts|init|plan|apply|destroy|lock|unlock-any
[group('tofu')]
tofu action module profile:
    #!/usr/bin/env -S bb --config big-infra/bb.edn
    (require '[big-config.tofu :refer [main]])
    (main {:args [:{{ action }} :{{ module }} :{{ profile }}]
           :config "big-infra/big-config.edn"})

# invoked by recipe test
[group('private')]
test-wf-exit:
    #!/usr/bin/env -S bb --config big-infra/bb.edn -cp src/clj:test/clj
    (require '[big-config.step-fns-test :refer [wf-exit]])
    (wf-exit)
