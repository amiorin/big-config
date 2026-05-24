from big_config.utils import deep_merge, sort_nested_map
from big_tofu import create
from big_tofu.core import Construct, add_suffix, caller_identity, construct, fqn_to_name, reference, root_arn


def test_fqn_helpers_and_construct_reference():
    assert add_suffix("alpha/big-kms", "-policy") == "alpha/big-kms-policy"
    assert fqn_to_name("alpha.big/big-kms") == "alpha_big_big_kms"
    c = Construct("resource", "aws_sqs_queue", "alpha/big-sqs", {"name": "x"})
    assert c.reference("id") == "${resource.aws_sqs_queue.alpha_big_sqs.id}"
    assert c.construct() == {"resource": {"aws_sqs_queue": {"alpha_big_sqs": {"name": "x"}}}}


def test_caller_identity_root_arn():
    assert root_arn(caller_identity) == "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"


def test_create_helpers():
    assert [construct(x) for x in create.bucket("alpha/big-bucket", "foo", "bar")] == [
        {"resource": {"aws_s3_bucket": {"alpha_big_bucket_foo_bar": [{"bucket": "alpha-big-bucket-foo-bar"}]}}}
    ]
    assert [construct(x) for x in create.sqs("alpha/big-sqs")] == [
        {"resource": {"aws_sqs_queue": {"alpha_big_sqs": {"name": "alpha_big_sqs"}}}}
    ]
    kms = sort_nested_map(deep_merge(*[construct(x) for x in create.kms("alpha/big-kms")]))
    assert "data" in kms and "resource" in kms
    assert "aws_kms_key" in kms["resource"]


def test_provider():
    assert create.provider({"region": "eu-west-1", "bucket": "state", "module": "alpha"}) == {
        "provider": {"aws": {"region": "eu-west-1"}},
        "terraform": {
            "backend": {"s3": {"bucket": "state", "encrypt": True, "key": "alpha.tfstate", "region": "eu-west-1"}},
            "required_providers": {"aws": {"source": "hashicorp/aws", "version": "~> 5.0"}},
            "required_version": ">= 1.8.0",
        },
    }
