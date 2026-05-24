from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from selmer import add_filter, render as selmer_render


def _namespace(fqn: str) -> str | None:
    fqn = str(fqn).lstrip(":")
    return fqn.rsplit("/", 1)[0] if "/" in fqn else None


def _name(fqn: str) -> str:
    return str(fqn).lstrip(":").rsplit("/", 1)[-1]


def add_suffix(fqn: str, suffix: str) -> str:
    ns = _namespace(fqn)
    nm = _name(fqn)
    return f"{ns}/{nm}{suffix}" if ns else f"{nm}{suffix}"


def fqn_to_name(fqn: str, c: str = "_") -> str:
    sanitize = lambda s: str(s).replace("-", c).replace(".", c)
    ns = _namespace(fqn)
    nm = sanitize(_name(fqn))
    return f"{sanitize(ns)}{c}{nm}" if ns else nm


def _remove_https(url: Any) -> str:
    return str(url).removeprefix("https://")


add_filter("remove-https", _remove_https)


@dataclass(frozen=True)
class Construct:
    group: str
    type: str
    fqn: str
    block: Any

    def reference(self, property: str) -> str:
        return f"${{{self.group}.{self.type}.{fqn_to_name(self.fqn)}.{str(property).lstrip(':').rsplit('/', 1)[-1]}}}"

    def construct(self) -> dict[str, Any]:
        return {self.group: {self.type: {fqn_to_name(self.fqn): self.block}}}

    def arn(self, aws_account_id: str, region: str | None = None) -> str | None:
        ctx = {"aws-account-id": aws_account_id, "region": region, "block": self.block}
        if self.group == "resource" and self.type == "aws_iam_role":
            return selmer_render("arn:aws:iam::{{ aws-account-id }}:role/{{ block.name }}", ctx)
        if self.group == "resource" and self.type == "aws_iam_openid_connect_provider":
            return selmer_render("arn:aws:iam::{{ aws-account-id }}:oidc-provider/{{ block.url|remove-https }}", ctx)
        if region is not None and self.group == "resource" and self.type == "aws_secretsmanager_secret":
            return selmer_render("arn:aws:secretsmanager:{{ region }}:{{ aws-account-id }}:secret/{{ block.name }}", ctx)
        return None

    def root_arn(self) -> str | None:
        if self.group == "data" and self.type == "aws_caller_identity" and str(self.fqn).lstrip(":") == "current" and self.block == {}:
            return f"arn:aws:iam::{self.reference('account_id')}:root"
        return None


caller_identity = Construct("data", "aws_caller_identity", "current", {})


def reference(this: Construct, property: str) -> str:
    return this.reference(property)


def construct(this: Construct) -> dict[str, Any]:
    return this.construct()


def arn(this: Construct, aws_account_id: str, region: str | None = None) -> str | None:
    return this.arn(aws_account_id, region)


def root_arn(this: Construct) -> str | None:
    return this.root_arn()
