help:
    @just -f {{ justfile() }} --list --unsorted

# clean
[group('tofu')]
clean:
    rm -rf tofu/tofu.consumer.main/.terraform

# check the AWS identity
[group('tofu')]
get-caller-identity module:
    cd tofu/{{ module }} && \
    direnv exec . aws sts get-caller-identity

# tofu init|plan|apply|destroy|lock|unlock-any
[group('tofu')]
tofu cmd module profile:
    @clj -X big-config.main/tofu-facade \
      :args '["{{ cmd }}" :{{ module }} :{{ profile }}]'
