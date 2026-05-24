import filecmp
import shutil
from pathlib import Path

import pytest

from big_config import render as sut


def content(key, _data):
    if key == "inventory":
        return "{{ module }}"
    if key == "config":
        return "<< module >>"
    raise KeyError(key)


def assert_dirs_equal(actual: Path, expected: Path):
    cmp = filecmp.dircmp(actual, expected)
    assert cmp.left_only == []
    assert cmp.right_only == []
    assert cmp.diff_files == []
    for sub in cmp.common_dirs:
        assert_dirs_equal(actual / sub, expected / sub)


def test_copy_template_dir(tmp_path):
    prefix = Path("test/fixtures")
    transforms = [
        [content, {"inventory": "inventory.json"}],
        [content, {"inventory": "inventory-raw.json"}, "raw"],
        [content, {"config": "config.json"}, {"tag-open": "<", "tag-close": ">", "filter-open": "<", "filter-close": ">"}],
        ["root"],
        ["root", "role", {"root-config.json": "config.json"}, {"tag-open": "<", "tag-close": ">", "filter-open": "<", "filter-close": ">"}],
        ["root", "{{ module }}", {"root-config.json": "{{ module }}.json"}, "only"],
        ["nested"],
        ["nested", "{{ module }}"],
        ["{{ module }}", "{{ module }}"],
        ["binary"],
    ]
    for counter, transform in enumerate(transforms):
        target_dir = tmp_path / f"copy-{counter}"
        spec = sut._parse_transform_spec(transform)
        sut.copy_template_dir(template_dir=prefix / "source", target_dir=target_dir, data={"module": "infra"}, **spec)
        if counter == 9:
            assert (target_dir / "Keyboard.png").read_bytes() == (prefix / "source/binary/Keyboard.png").read_bytes()
        else:
            assert_dirs_equal(target_dir, prefix / "target" / f"copy-{counter}")


def test_render_function(tmp_path):
    transforms = [
        {"template": "template", "transform": [["root"], ["role", "role", {"tasks.yml": "tasks.yml"}, "only", "raw"]]},
        {"template": "template", "transform": [["root"], ["role", "role", {"tasks.yml": "tasks.yml"}, "only"]]},
    ]
    for counter, edn in enumerate(transforms):
        target_dir = tmp_path / f"render-{counter}"
        sut.render({"big-config.step/module": "infra", sut.TEMPLATES: [{**edn, "target-dir": str(target_dir)}]})
        assert_dirs_equal(target_dir, Path("test/fixtures/target") / f"render-{counter}")


def test_binary_files_raise_when_non_replaced_exts_is_empty(tmp_path, monkeypatch):
    monkeypatch.setattr(sut, "NON_REPLACED_EXTS", set())
    with pytest.raises(UnicodeDecodeError):
        sut.copy_dir(src_dir="test/fixtures/source/binary", target_dir=tmp_path / "copy-9", data={})
