from __future__ import annotations

import importlib
import importlib.resources
import os
import shutil
import sys
import tempfile
from collections.abc import Callable, Iterable, Mapping
from pathlib import Path
from typing import Any

from selmer import render as selmer_render
from selmer import without_escaping

from . import core
from .selmer_filters import whitespace_control  # registers filters as a side effect
from .utils import BigConfigError, to_fn

TEMPLATES = "big-config.render/templates"
MODULE = "big-config.render/module"
PROFILE = "big-config.render/profile"
STEP_MODULE = "big-config.step/module"
STEP_PROFILE = "big-config.step/profile"

NON_REPLACED_EXTS: set[str] = {"jpg", "jpeg", "png", "gif", "bmp", "bin"}

# Top-level package under which target packages ship their template data. It is
# force-included into the wheel as a namespace package, so consumers can resolve
# templates through importlib.resources instead of materialising a ./resources
# symlink in the working directory.
RESOURCES_PACKAGE = "resources"

_TEMPLATE_KEYS = {
    "template",
    "target-dir",
    "target_dir",
    "overwrite",
    "data-fn",
    "data_fn",
    "template-fn",
    "template_fn",
    "post-process-fn",
    "post_process_fn",
    "transform",
}
_DELIMITER_KEYS = {"tag-open", "tag-close", "filter-open", "filter-close", "tag-second", "short-comment-second", "tag_open", "tag_close", "filter_open", "filter_close", "tag_second", "short_comment_second"}


def _selmer_opts(delimiters: Mapping[str, Any] | None = None) -> dict[str, Any]:
    delimiters = delimiters or {}
    return {
        "tag_open": str(delimiters.get("tag-open", delimiters.get("tag_open", "{"))),
        "tag_close": str(delimiters.get("tag-close", delimiters.get("tag_close", "}"))),
        "filter_open": str(delimiters.get("filter-open", delimiters.get("filter_open", "{"))),
        "filter_close": str(delimiters.get("filter-close", delimiters.get("filter_close", "}"))),
        "tag_second": str(delimiters.get("tag-second", delimiters.get("tag_second", "%"))),
        "short_comment_second": str(delimiters.get("short-comment-second", delimiters.get("short_comment_second", "#"))),
    }


def selmer(s: str, data: Mapping[str, Any] | None = None, delimiters: Mapping[str, Any] | None = None) -> str:
    prepared = whitespace_control(s, dict(delimiters or {}))
    return without_escaping(lambda: selmer_render(prepared, dict(data or {}), **_selmer_opts(delimiters)))


def _extension(path: Path | str) -> str:
    suffix = Path(path).suffix
    return suffix[1:].lower() if suffix.startswith(".") else suffix.lower()


def copy_dir(*, src_dir: str | os.PathLike[str], target_dir: str | os.PathLike[str], data: Mapping[str, Any] | None = None, delimiters: Mapping[str, Any] | None = None) -> None:
    src = Path(src_dir)
    target = Path(target_dir)
    for path in src.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(src)
        target_file = target / rel
        target_file.parent.mkdir(parents=True, exist_ok=True)
        replaceable = _extension(path) not in NON_REPLACED_EXTS
        if data is not None and replaceable:
            content = path.read_text(encoding="utf-8")
            target_file.write_text(selmer(content, data, delimiters), encoding="utf-8")
            shutil.copymode(path, target_file)
        elif data is None and replaceable:
            # Text-like copy preserving exact bytes and permissions.
            shutil.copy2(path, target_file)
        else:
            shutil.copy2(path, target_file)


def _is_delimiters(value: Any) -> bool:
    return isinstance(value, Mapping) and bool(set(value.keys()) & _DELIMITER_KEYS)


def _is_option(value: Any) -> bool:
    return str(value).lstrip(":") in {"raw", "only"}


def _parse_transform_spec(spec: Iterable[Any]) -> dict[str, Any]:
    items = list(spec)
    if not items:
        raise ValueError("transform item must not be empty")
    src = items.pop(0)
    target = None
    files = None
    delimiters = None
    opts: list[str] = []
    if items and isinstance(items[0], str) and not _is_option(items[0]):
        target = items.pop(0)
    if items and isinstance(items[0], Mapping) and not _is_delimiters(items[0]):
        files = dict(items.pop(0))
    if items and _is_delimiters(items[0]):
        delimiters = dict(items.pop(0))
    while items:
        item = items.pop(0)
        if not _is_option(item):
            raise ValueError(f"invalid transform option: {item}")
        opts.append(str(item).lstrip(":"))
    return {"src": src, "target": target, "files": files, "delimiters": delimiters, "opts": opts}


def _source_as_fn(src: Any, template_dir: Path) -> Callable[[Any, Mapping[str, Any]], str] | None:
    if callable(src):
        return src
    if not isinstance(src, str):
        return None
    # Treat strings as directories when they exist under the template directory.
    if (template_dir / src).exists():
        return None
    try:
        return to_fn(src)
    except Exception:  # noqa: BLE001
        return None


def _delete_path(path: Path) -> None:
    if path.is_dir() and not path.is_symlink():
        shutil.rmtree(path)
    elif path.exists() or path.is_symlink():
        path.unlink()


def copy_template_dir(*, template_dir: str | os.PathLike[str], target_dir: str | os.PathLike[str], data: Mapping[str, Any], src: Any, target: str | None = None, files: Mapping[Any, str] | None = None, delimiters: Mapping[str, Any] | None = None, opts: Iterable[str] | None = None) -> None:
    template_path = Path(template_dir)
    target_path = Path(target_dir)
    opts_set = {str(x).lstrip(":") for x in (opts or [])}
    raw = "raw" in opts_set
    only = "only" in opts_set
    rendered_target = f"/{selmer(target, data, delimiters)}" if target is not None else ""

    src_fn = _source_as_fn(src, template_path)
    if src_fn is not None:
        if not files:
            raise BigConfigError("Files is required when src is a symbol", {})
        for key, to in files.items():
            content = src_fn(key, data)
            if not raw:
                content = selmer(str(content), data, delimiters)
            target_file = target_path / rendered_target.lstrip("/") / selmer(str(to), data, delimiters)
            target_file.parent.mkdir(parents=True, exist_ok=True)
            target_file.write_text(str(content), encoding="utf-8")
        return

    rendered_src = selmer(str(src), data, delimiters)
    source_dir = template_path / rendered_src
    if files:
        with tempfile.TemporaryDirectory(prefix="big-config") as tmp:
            intermediate = Path(tmp)
            inter_target = intermediate / rendered_target.lstrip("/")
            if not only:
                copy_dir(src_dir=source_dir, target_dir=inter_target)
            for from_name, to_name in files.items():
                _delete_path(inter_target / str(from_name))
                destination = inter_target / selmer(str(to_name), data, delimiters)
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source_dir / str(from_name), destination)
            if raw:
                copy_dir(src_dir=intermediate, target_dir=target_path)
            else:
                copy_dir(src_dir=intermediate, target_dir=target_path, data=data, delimiters=delimiters)
    else:
        destination = target_path / rendered_target.lstrip("/")
        if raw:
            copy_dir(src_dir=source_dir, target_dir=destination)
        else:
            copy_dir(src_dir=source_dir, target_dir=destination, data=data, delimiters=delimiters)


def _candidate_template_dirs(template: str) -> list[Path]:
    p = Path(template)
    candidates = []
    if p.is_absolute() or p.exists():
        candidates.append(p)
    cwd = Path.cwd()
    candidates.extend(
        [
            cwd / template,
            cwd / "src" / "resources" / template,
            cwd / "env" / "test" / "resources" / template,
            cwd / "test" / "resources" / template,
            cwd / "resources" / template,
        ]
    )
    seen: set[str] = set()
    unique: list[Path] = []
    for candidate in candidates:
        key = str(candidate)
        if key not in seen:
            unique.append(candidate)
            seen.add(key)
    return unique


def _resource_roots() -> list[Path]:
    # Filesystem roots of the installed ``resources`` package, if importable.
    # A regular on-disk install yields a single concrete path; namespace and
    # editable installs yield a MultiplexedPath spanning several directories
    # (e.g. site-packages plus an editable source tree), enumerated via the
    # package's __path__. Returns an empty list when ``resources`` is absent so
    # callers fall back to the working-directory candidates.
    try:
        anchor = importlib.resources.files(RESOURCES_PACKAGE)
    except (ImportError, TypeError, ValueError):
        return []
    try:
        return [Path(os.fspath(anchor))]
    except TypeError:
        package = sys.modules.get(RESOURCES_PACKAGE) or importlib.import_module(RESOURCES_PACKAGE)
        return [Path(entry) for entry in getattr(package, "__path__", [])]


def _resource_template_dir(template: str) -> Path | None:
    for root in _resource_roots():
        candidate = root / template
        if candidate.is_dir():
            return candidate.resolve()
    return None


def find_template_dir(template: str) -> Path:
    for candidate in _candidate_template_dirs(template):
        if candidate.exists() and candidate.is_dir():
            return candidate.resolve()
    resource_dir = _resource_template_dir(template)
    if resource_dir is not None:
        return resource_dir
    raise BigConfigError("Template resource not found", {"template": template})


def _multi_option(opts: Mapping[str, Any], *keys: str) -> list[Any]:
    value = None
    for key in keys:
        if key in opts:
            value = opts[key]
            break
    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        return list(value)
    return [value]


def _template_get(edn: Mapping[str, Any], dashed: str, underscored: str | None = None, default: Any = None) -> Any:
    if dashed in edn:
        return edn[dashed]
    if underscored and underscored in edn:
        return edn[underscored]
    return default


def render(opts: Mapping[str, Any]) -> dict[str, Any]:
    templates0 = opts.get(TEMPLATES)
    if templates0 is None:
        raise ValueError(":big-config.render/templates should never be nil")
    for edn0 in templates0:
        edn = dict(edn0)
        data_fn = to_fn(_template_get(edn, "data-fn", "data_fn"), lambda data, _opts: data)
        template_fn = to_fn(_template_get(edn, "template-fn", "template_fn"), lambda _data, current_edn: current_edn)
        data = {k: v for k, v in edn.items() if k not in _TEMPLATE_KEYS}
        data.update(
            {
                "module": opts.get(STEP_MODULE, opts.get(MODULE)),
                "profile": opts.get(STEP_PROFILE, opts.get(PROFILE)),
            }
        )
        data = data_fn(data, opts)
        edn = dict(template_fn(data, edn))
        template = _template_get(edn, "template")
        target_dir = _template_get(edn, "target-dir", "target_dir")
        if not isinstance(template, str) or not template.strip() or not isinstance(target_dir, str) or not target_dir.strip():
            raise BigConfigError("Invalid template", {"template": template, "target-dir": target_dir})
        transform = _template_get(edn, "transform")
        if transform is None:
            raise ValueError(":transform not defined")
        transform = list(transform)
        if not transform:
            raise ValueError(":transform is an empty list")
        template_dir = find_template_dir(template)
        target_path = Path(target_dir)
        overwrite = _template_get(edn, "overwrite")
        if target_path.exists():
            if overwrite:
                if str(overwrite).lstrip(":") == "delete":
                    shutil.rmtree(target_path)
            else:
                raise BigConfigError(f"{target_dir} already exists (and :overwrite was not true).", {})
        for spec0 in transform:
            spec = _parse_transform_spec(spec0)
            copy_template_dir(template_dir=template_dir, target_dir=target_path, data=data, **spec)
        for post in _multi_option(edn, "post-process-fn", "post_process_fn"):
            post_fn = to_fn(post, lambda _edn, _data: None)
            post_fn(edn, data)
    return core.ok(opts)


templates = core.workflow(
    {
        "first_step": "big-config.render/start",
        "wire_fn": lambda step, _step_fns: (render, "big-config.render/end") if step == "big-config.render/start" else (lambda x: x, None),
    }
)


def discover(parent_dir: str | os.PathLike[str]) -> list[str]:
    parent = Path(parent_dir)
    result: list[str] = []
    for p in parent.rglob("*"):
        if p.is_dir():
            rel = str(p.relative_to(parent))
            if rel:
                result.append(rel)
    return result
