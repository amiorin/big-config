help:
    @just -f {{ justfile() }} --list --unsorted

# generate the main.tf.json
[group('tofu')]
create aws-account-id region ns fn:
    clj -X:dev big-config.main/create \
      :aws-account-id \"{{ aws-account-id }}\" \
      :region \"{{ region }}\" \
      :ns \"{{ ns }}\" \
      :fn \"{{ fn }}\"

# check the AWS identity
[group('tofu')]
get-caller-identity aws-account-id:
    cd tofu/{{ aws-account-id }} && \
    direnv exec . aws sts get-caller-identity

# tofu init
[group('tofu')]
init aws-account-id region ns:
    cd tofu/{{ aws-account-id }}/{{ region }}/{{ ns }} && \
    direnv exec . tofu init

# tofu plan
[group('tofu')]
plan aws-account-id region ns:
    cd tofu/{{ aws-account-id }}/{{ region }}/{{ ns }} && \
    direnv exec . tofu plan

# tofu git check
[group('tofu')]
git-check:
    clj -X big-config.git/check

# tofu acquire lock
[group('tofu')]
lock-acquire aws-account-id region ns owner:
    clj -X big-config.lock/acquire \
      :aws-account-id \"{{ aws-account-id }}\" \
      :region \"{{ region }}\" \
      :ns \"{{ ns }}\" \
      :owner \"{{ owner }}\"

# tofu release lock
[group('tofu')]
lock-release aws-account-id region ns owner:
    @clj -X big-config.lock/release \
      :aws-account-id \"{{ aws-account-id }}\" \
      :region \"{{ region }}\" \
      :ns \"{{ ns }}\" \
      :owner \"{{ owner }}\"

# tofu apply
[group('tofu')]
apply aws-account-id region ns owner:
    @clj -X big-config.main/tofu-apply \
      :aws-account-id \"{{ aws-account-id }}\" \
      :region \"{{ region }}\" \
      :ns \"{{ ns }}\" \
      :owner \"{{ owner }}\" \
      :lock-keys '[:aws-account-id :region :ns :owner]' \
      :tofu-apply-cmd "\"bash -c 'cd tofu/251213589273/eu-west-1/tofu.module-a.main && direnv exec . tofu apply -auto-approve'\""


# tofu destroy
[group('tofu')]
destroy aws-account-id region ns owner:
    just -f {{ justfile() }} lock-acquire {{ aws-account-id }} {{ region }} {{ ns }} {{ owner }}
    -cd tofu/{{ aws-account-id }}/{{ region }}/{{ ns }} && \
    direnv exec . tofu destroy
    just -f {{ justfile() }} lock-release {{ aws-account-id }} {{ region }} {{ ns }} {{ owner }}
