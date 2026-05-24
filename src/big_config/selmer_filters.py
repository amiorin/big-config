from __future__ import annotations

import os
from typing import Any

from selmer import add_filter


def lookup_env(x: Any) -> str | None:
    return os.environ.get(str(x))


def to_file(n: Any) -> str:
    return str(n).replace(".", "/").replace("-", "_")


add_filter("lookup-env", lookup_env)
add_filter("->file", to_file)


def _delim(delimiters: dict[str, Any], key: str, default: str) -> str:
    value = delimiters.get(key, delimiters.get(key.replace("-", "_"), default))
    return str(value)


def whitespace_control(s: str, delimiters: dict[str, Any] | None = None) -> str:
    """Implement Selmer's ``{{-`` / ``-}}`` whitespace trim workaround."""

    delimiters = delimiters or {}
    d = {
        "tag-open": _delim(delimiters, "tag-open", "{"),
        "tag-close": _delim(delimiters, "tag-close", "}"),
        "filter-open": _delim(delimiters, "filter-open", "{"),
        "filter-close": _delim(delimiters, "filter-close", "}"),
        "tag-second": _delim(delimiters, "tag-second", "%"),
    }
    opening_tags = {
        d["tag-open"] + d["filter-open"] + "-",
        d["tag-open"] + d["tag-second"] + "-",
    }
    closing_tags = {
        "-" + d["tag-close"] + d["filter-close"],
        "-" + d["tag-second"] + d["tag-close"],
    }
    output = ""
    tag = ""
    i = 0
    while i < len(s):
        x = s[i]
        tag = (tag + x)[-3:]
        if tag in opening_tags:
            output = output[:-2].rstrip() + tag[:2]
        elif tag in closing_tags:
            output = output[:-2] + tag[1:3]
            i += 1
            while i < len(s) and s[i].isspace():
                i += 1
            continue
        else:
            output += x
        i += 1
    return output
