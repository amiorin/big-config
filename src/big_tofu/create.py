from __future__ import annotations

from typing import Any

from big_config.utils import deep_merge, sort_nested_map
from big_tofu.core import Construct, add_suffix, caller_identity, construct, fqn_to_name, reference, root_arn


def bucket(fqn: str, *xs: str) -> list[Construct]:
    if xs:
        current = fqn
        for x in xs:
            current = add_suffix(current, f"-{x}")
        return bucket(current)
    return [Construct("resource", "aws_s3_bucket", fqn, [{"bucket": fqn_to_name(fqn, "-")}])]


def sqs(fqn: str) -> list[Construct]:
    return [Construct("resource", "aws_sqs_queue", fqn, {"name": fqn_to_name(fqn)})]


def kms(fqn: str) -> list[Construct]:
    kms_key = Construct("resource", "aws_kms_key", fqn, {})
    policy = Construct(
        "data",
        "aws_iam_policy_document",
        add_suffix(fqn, "-data-policy"),
        [
            {
                "statement": [
                    {
                        "actions": ["kms:*"],
                        "effect": "Allow",
                        "resources": ["*"],
                        "principals": [{"identifiers": [root_arn(caller_identity)], "type": "AWS"}],
                    }
                ]
            }
        ],
    )
    return [
        caller_identity,
        policy,
        kms_key,
        Construct(
            "resource",
            "aws_kms_key_policy",
            add_suffix(fqn, "-resource-policy"),
            {"key_id": reference(kms_key, "id"), "policy": reference(policy, "json")},
        ),
    ]


def provider(config: dict[str, Any]) -> dict[str, Any]:
    region = config.get("region")
    bucket_name = config.get("bucket")
    module = config.get("module")
    assume_role_value = config.get("assume-role", config.get("assume_role"))
    key = f"{str(module).lstrip(':').rsplit('/', 1)[-1]}.tfstate"
    assume_role = {"assume_role": {"role_arn": assume_role_value}} if assume_role_value and str(assume_role_value).strip() else {}
    return {
        "provider": {"aws": {"region": region, **assume_role}},
        "terraform": {
            "backend": {"s3": {"bucket": bucket_name, "encrypt": True, "key": key, "region": region, **assume_role}},
            "required_providers": {"aws": {"source": "hashicorp/aws", "version": "~> 5.0"}},
            "required_version": ">= 1.8.0",
        },
    }


__all__ = ["bucket", "sqs", "kms", "provider", "deep_merge", "sort_nested_map", "construct"]
