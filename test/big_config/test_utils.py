import pytest

from big_config import ERR, EXIT, STEPS, core
from big_config import utils

START = "test.utils/start"
END = "test.utils/end"
BAR = "test.utils/bar"


def a_step_fn(f, step, opts):
    opts = {**opts, STEPS: [*opts.get(STEPS, []), [step, "start-a"]]}
    opts = f(step, opts)
    return {**opts, STEPS: [*opts.get(STEPS, []), [step, "end-a"]]}


def b_step_fn(f, step, opts):
    opts = {**opts, STEPS: [*opts.get(STEPS, []), [step, "start-b"]]}
    opts = f(step, opts)
    return {**opts, STEPS: [*opts.get(STEPS, []), [step, "end-b"]]}


def test_step_fns_by_name_and_callable():
    def wire(step, _):
        if step == START:
            return lambda opts: {**opts, EXIT: 0, ERR: None}, END
        return lambda x: x, None

    wf = core.workflow({"first_step": START, "wire_fn": wire})
    actual = wf([f"{__name__}/a_step_fn", b_step_fn], {BAR: "baz"})
    assert actual == {
        ERR: None,
        EXIT: 0,
        STEPS: [
            [START, "start-a"],
            [START, "start-b"],
            [START, "end-b"],
            [START, "end-a"],
            [END, "start-a"],
            [END, "start-b"],
            [END, "end-b"],
            [END, "end-a"],
        ],
        BAR: "baz",
    }


def inc(x):
    return x + 1


def test_to_fn():
    assert utils.to_fn(inc) is inc
    assert utils.to_fn(f"{__name__}/inc")(1) == 2
    default = lambda: "default"
    assert utils.to_fn(None, default) is default
    with pytest.raises(utils.BigConfigError, match="Required value is nil") as e1:
        utils.to_fn(None)
    assert e1.value.data[utils.ERR_KIND] == utils.NOT_A_FN
    with pytest.raises(utils.BigConfigError, match="Cannot coerce value to a function") as e2:
        utils.to_fn(42)
    assert e2.value.data["value"] == 42


def test_keyword_helpers_and_deep_merge():
    assert utils.keyword_to_path("big-config.core/foo") == "big-config/core/foo"
    assert utils.keyword_to_name("big-config.core/foo") == "big-config-core-foo"
    assert utils.deep_merge({"a": {"b": 1}}, {"a": {"c": 2}}) == {"a": {"b": 1, "c": 2}}
