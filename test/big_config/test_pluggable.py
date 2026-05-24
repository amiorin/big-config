from big_config import EXIT, core, pluggable

START = "test.pluggable/start"
MIDDLE = "test.pluggable/middle"
END = "test.pluggable/end"


def test_handle_step_default_calls_wire_fn_function():
    def wire_fn(step, _):
        if step == START:
            return core.ok, END
        return lambda x: x, None

    wf = pluggable.workflow_star({"first_step": START, "wire_fn": wire_fn})
    assert wf([], {})[EXIT] == 0


def test_handle_step_override():
    def wire_fn(step, _):
        if step == START:
            return core.ok, END
        return lambda x: x, None

    wf = pluggable.workflow_star({"first_step": START, "wire_fn": wire_fn})

    def handler(_f, _step, _step_fns, opts):
        return {**core.ok(opts), "overridden": True}

    pluggable.defmethod(START, handler)
    try:
        res = wf([], {})
        assert res[EXIT] == 0
        assert res["overridden"] is True
    finally:
        pluggable.remove_method(START)


def test_pluggable_workflow_threading():
    def wire_fn(step, _):
        if step == START:
            return core.ok, MIDDLE
        if step == MIDDLE:
            return core.ok, END
        return lambda x: x, None

    wf = pluggable.workflow_star({"first_step": START, "wire_fn": wire_fn})

    def handler(_f, _step, _step_fns, opts):
        return {**core.ok(opts), "middle-val": 123}

    pluggable.defmethod(MIDDLE, handler)
    try:
        res = wf([], {"initial": True})
        assert res["initial"] is True
        assert res["middle-val"] == 123
        assert res[EXIT] == 0
    finally:
        pluggable.remove_method(MIDDLE)


def test_step_fns_are_invoked_in_pluggable_workflow():
    def wire_fn(step, _):
        if step == START:
            return core.ok, END
        return lambda x: x, None

    wf = pluggable.workflow_star({"first_step": START, "wire_fn": wire_fn})
    called = {"value": False}

    def my_step_fn(f, step, opts):
        called["value"] = True
        return f(step, opts)

    res = wf([my_step_fn], {})
    assert res[EXIT] == 0
    assert called["value"] is True
