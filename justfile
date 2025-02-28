help:
    @just -f {{ justfile() }} --list --unsorted

# generate the main.tf.json
[group('tofu')]
create-tf-json aws-account-id region module:
    clj -X tofu/create-tf-json \
      :aws-account-id \"{{ aws-account-id }}\" \
      :region \"{{ region }}\" \
      :module \"{{ module }}\" > tofu/{{ aws-account-id }}/{{ region }}/{{ module }}/main.tf.json

# check the AWS identity
[group('tofu')]
get-caller-identity aws-account-id:
    cd tofu/{{ aws-account-id }} && \
    direnv exec . aws sts get-caller-identity

# tofu init
[group('tofu')]
init aws-account-id region module:
    cd tofu/{{ aws-account-id }}/{{ region }}/{{ module }} && \
    direnv exec . tofu init

# tofu plan
[group('tofu')]
plan aws-account-id region module:
    cd tofu/{{ aws-account-id }}/{{ region }}/{{ module }} && \
    direnv exec . tofu plan

# tofu acquire lock
[group('tofu')]
lock-acquire aws-account-id region module owner:
    clj -X lock/acquire \
      :aws-account-id \"{{ aws-account-id }}\" \
      :region \"{{ region }}\" \
      :module \"{{ module }}\" \
      :owner \"{{ owner }}\"

# tofu release lock
[group('tofu')]
lock-release aws-account-id region module:
    clj -X lock/release \
      :aws-account-id \"{{ aws-account-id }}\" \
      :region \"{{ region }}\" \
      :module \"{{ module }}\"

# tofu apply
[group('tofu')]
apply aws-account-id region module owner:
    just -f {{ justfile() }} lock-acquire {{ aws-account-id }} {{ region }} {{ module }} {{ owner }}
    cd tofu/{{ aws-account-id }}/{{ region }}/{{ module }} && \
    direnv exec . tofu apply
    just -f {{ justfile() }} lock-release {{ aws-account-id }} {{ region }} {{ module }}

# tofu destroy
[group('tofu')]
destroy aws-account-id region module owner:
    just -f {{ justfile() }} lock-acquire {{ aws-account-id }} {{ region }} {{ module }} {{ owner }}
    cd tofu/{{ aws-account-id }}/{{ region }}/{{ module }} && \
    direnv exec . tofu destroy
    just -f {{ justfile() }} lock-release {{ aws-account-id }} {{ region }} {{ module }}
