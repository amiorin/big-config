help:
    @just --list --unsorted

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

# tofu apply
[group('tofu')]
apply aws-account-id region module:
    cd tofu/{{ aws-account-id }}/{{ region }}/{{ module }} && \
    direnv exec . tofu apply
