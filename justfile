set export

AWS_PROFILE := "251213589273"

help:
    @just -f {{ justfile() }} --list --unsorted

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

# tofu
[group('tofu')]
test:
    #!/usr/bin/env -S bb --config big-infra/bb.edn
    (require '[big-config.run :refer [main]])
    (main)
