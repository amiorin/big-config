from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from . import ERR, EXIT
from .core import workflow
from .run import generic_cmd

PREV_REVISION = "big-config.git/prev-revision"
CURRENT_REVISION = "big-config.git/current-revision"
ORIGIN_REVISION = "big-config.git/origin-revision"
UPSTREAM_NAME = "big-config.git/upstream-name"


def get_revision(revision: str, key: str, opts: Mapping[str, Any]) -> dict[str, Any]:
    rev = opts.get(revision, revision)
    if not isinstance(rev, str):
        raise ValueError(f"Revision is neither a string nor a keyword: {revision}")
    return generic_cmd(opts=opts, cmd=["git", "rev-parse", rev], key=key)


def fetch_origin(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "fetch", "origin"])


def upstream_name(key: str, opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "rev-parse", "--abbrev-ref", "@{upstream}"], key=key)


def git_diff(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "diff", "--quiet"])


def git_push(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "push"])


def compare_revisions(opts: Mapping[str, Any]) -> dict[str, Any]:
    ok_revisions = opts.get(PREV_REVISION) == opts.get(ORIGIN_REVISION) or opts.get(CURRENT_REVISION) == opts.get(ORIGIN_REVISION)
    return {**opts, **({EXIT: 0, ERR: None} if ok_revisions else {EXIT: 1, ERR: "The local revisions don't match the remote revision"})}


def _wire(step: str, _step_fns: list[Any]):
    if step == "big-config.git/git-diff":
        return git_diff, "big-config.git/fetch-origin"
    if step == "big-config.git/fetch-origin":
        return fetch_origin, "big-config.git/upstream-name"
    if step == "big-config.git/upstream-name":
        return lambda opts: upstream_name(UPSTREAM_NAME, opts), "big-config.git/pre-revision"
    if step == "big-config.git/pre-revision":
        return lambda opts: get_revision("HEAD~1", PREV_REVISION, opts), "big-config.git/current-revision"
    if step == "big-config.git/current-revision":
        return lambda opts: get_revision("HEAD", CURRENT_REVISION, opts), "big-config.git/origin-revision"
    if step == "big-config.git/origin-revision":
        return lambda opts: get_revision(UPSTREAM_NAME, ORIGIN_REVISION, opts), "big-config.git/compare-revisions"
    if step == "big-config.git/compare-revisions":
        return compare_revisions, "big-config.git/end"
    return lambda x: x, None


check = workflow({"first_step": "big-config.git/git-diff", "wire_fn": _wire})
