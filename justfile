# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# create the template
create name:
    clojure -Sdeps '{:deps {io.github.amiorin/big-config {:local/root "."}}}' \
    -Tnew create \
    :template amiorin/big-config \
    :name {{ name }} \
    :aws-account-id 251213589273 \
    :region eu-west-1 \
    :overwrite :delete
