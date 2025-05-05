# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# create the template
create name:
    clojure -Sdeps '{:deps {io.github.amiorin/big-config {:local/root "."}}}' \
    -Tnew create \
    :template amiorin/big-config \
    :name {{ name }} \
    :target-dir dist \
    :aws-account-id-dev 228169653347 \
    :aws-account-id-prod 706922411989 \
    :aws-profile big_admin_dacore_role_v2_dev \
    :aws-region eu-west-1 \
    :overwrite :delete
    cd dist && bb smoke-test
