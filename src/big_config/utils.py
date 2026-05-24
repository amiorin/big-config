from __future__ import annotations

import importlib
import os
import re
import sys
from collections.abc import Callable, Mapping, Sequence
from copy import deepcopy
from pathlib import Path
from typing import Any, TypeVar

T = TypeVar("T")

ERR_KIND = "big-config/err-kind"
NOT_A_FN = "big-config.utils/not-a-fn"
REQUIRED = object()


class BigConfigError(Exception):
    """Exception carrying structured context data."""

    def __init__(self, message: str, data: Mapping[str, Any] | None = None):
        super().__init__(message)
        self.data = dict(data or {})


def ex_info(message: str, data: Mapping[str, Any] | None = None) -> BigConfigError:
    return BigConfigError(message, data)


def namespace(value: str | None) -> str | None:
    if value is None:
        return None
    s = str(value).lstrip(":")
    return s.rsplit("/", 1)[0] if "/" in s else None


def name(value: str) -> str:
    s = str(value).lstrip(":")
    return s.rsplit("/", 1)[-1]


def keyword(ns: str | None, n: str) -> str:
    ns = str(ns).lstrip(":") if ns else None
    return f"{ns}/{n}" if ns else str(n)


def has_namespace(value: str) -> bool:
    return namespace(value) is not None


def deep_merge(*maps: Mapping[str, Any] | None) -> dict[str, Any]:
    """Recursively merge dictionaries; later values win."""

    result: dict[str, Any] = {}
    for m in maps:
        if not m:
            continue
        for k, v in m.items():
            if isinstance(v, Mapping) and isinstance(result.get(k), Mapping):
                result[k] = deep_merge(result[k], v)  # type: ignore[arg-type]
            else:
                result[k] = deepcopy(v)
    return result


def _sort_key(value: Any) -> str:
    return str(value)


def sort_nested_map(value: Any) -> Any:
    if isinstance(value, Mapping):
        return {k: sort_nested_map(value[k]) for k in sorted(value.keys(), key=_sort_key)}
    if isinstance(value, (list, tuple)):
        return [sort_nested_map(x) for x in value]
    return value


def deep_sort_maps(data: Any) -> Any:
    return sort_nested_map(data)


def port_assigner(service: Any) -> int:
    # Python's hash is intentionally randomized, so use a stable byte sum.
    seed = f"{Path.cwd()}{service}".encode()
    value = 0
    for byte in seed:
        value = (value * 31 + byte) & 0xFFFFFFFF
    return abs(value) % 64000 + 1024


def assert_args_present(**kwargs: Any) -> None:
    for k, v in kwargs.items():
        if v is None:
            raise ValueError(f"Argument {k} is nil")


def _clj_to_py_module(module: str) -> str:
    return module.replace("-", "_")


def _clj_to_py_attr(attr: str) -> str:
    return attr.replace("-", "_").replace("->", "to_").replace("?", "_p").replace("!", "_bang")


def _candidate_modules(module: str) -> list[str]:
    py = _clj_to_py_module(module)
    candidates = [py]
    # Legacy namespace strings often use dashes while Python packages use underscores.
    if py.startswith("big_config."):
        candidates.append(py)
    elif py.startswith("big-config."):
        candidates.append(py.replace("big-config", "big_config", 1))
    if py.startswith("big_tofu."):
        candidates.append(py)
    elif py.startswith("big-tofu."):
        candidates.append(py.replace("big-tofu", "big_tofu", 1))
    # Tests commonly resolve by final module name while pytest imports them as
    # top-level modules under test/.
    candidates.append(py.rsplit(".", 1)[-1])
    return list(dict.fromkeys(candidates))


def requiring_resolve(ref: str) -> Callable[..., Any]:
    """Resolve ``module.attr`` or slash-style ``module/attr`` references."""

    if not isinstance(ref, str) or not ref.strip():
        raise BigConfigError("Cannot resolve blank reference", {"value": ref})
    s = ref.strip().lstrip(":")
    if "/" in s:
        module_name, attr = s.rsplit("/", 1)
    else:
        module_name, attr = s.rsplit(".", 1)
    attr_candidates = [attr, _clj_to_py_attr(attr)]
    errors: list[Exception] = []
    for candidate_module in _candidate_modules(module_name):
        try:
            module = importlib.import_module(candidate_module)
        except Exception as exc:  # noqa: BLE001
            errors.append(exc)
            continue
        for candidate_attr in dict.fromkeys(attr_candidates):
            if hasattr(module, candidate_attr):
                resolved = getattr(module, candidate_attr)
                if callable(resolved):
                    return resolved
                raise BigConfigError("Resolved value is not callable", {"value": ref, "resolved": resolved})
    # If pytest loaded a module under a package name, find it by suffix.
    suffix = _clj_to_py_module(module_name).rsplit(".", 1)[-1]
    for loaded_name, module in list(sys.modules.items()):
        if loaded_name == suffix or loaded_name.endswith("." + suffix):
            for candidate_attr in dict.fromkeys(attr_candidates):
                if hasattr(module, candidate_attr):
                    resolved = getattr(module, candidate_attr)
                    if callable(resolved):
                        return resolved
    raise BigConfigError("Cannot resolve symbol", {"value": ref, "errors": [str(e) for e in errors]})


def to_fn(v: Any, default: Any = REQUIRED) -> Callable[..., Any]:
    """Coerce a callable or resolvable symbol/string into a callable."""

    if callable(v):
        return v
    if isinstance(v, str) and v.strip():
        return requiring_resolve(v)
    if v is None:
        if default is REQUIRED:
            raise BigConfigError(
                "Required value is nil; expected a function, symbol or string",
                {ERR_KIND: NOT_A_FN, "value": v},
            )
        return default
    raise BigConfigError(
        "Cannot coerce value to a function",
        {ERR_KIND: NOT_A_FN, "value": v, "type": type(v).__name__},
    )


def keyword_to_path(kw: str) -> str:
    full = str(kw).lstrip(":")
    return full.replace(".", "/")


def keyword_to_name(kw: str) -> str:
    full = str(kw).lstrip(":").replace("/", "-")
    return full.replace(".", "-")


def update_in(mapping: Mapping[str, Any], path: Sequence[Any], fn: Callable[[Any], Any]) -> dict[str, Any]:
    root = deepcopy(dict(mapping))
    cur: dict[Any, Any] = root
    for key in path[:-1]:
        nxt = cur.get(key)
        if not isinstance(nxt, Mapping):
            nxt = {}
        else:
            nxt = dict(nxt)
        cur[key] = nxt
        cur = nxt  # type: ignore[assignment]
    cur[path[-1]] = fn(cur.get(path[-1]))
    return root


def assoc_in(mapping: Mapping[str, Any], path: Sequence[Any], value: Any) -> dict[str, Any]:
    return update_in(mapping, path, lambda _old: value)


def strip_ansi(s: str) -> str:
    return re.sub(r"\x1B\[[0-9;]+m", "", s)


# Compatibility aliases available through getattr(module, "->fn") if desired.
globals()["->fn"] = to_fn
