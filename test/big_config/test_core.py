import pytest

from big_config import core


def test_step_fn_requires_at_least_one_hook():
    with pytest.raises(ValueError):
        core.step_fn({})


def test_step_fn_same_requires_before_f():
    with pytest.raises(ValueError):
        core.step_fn({"after_f": "same"})
