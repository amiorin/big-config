import pytest

from big_config import ENV, EXIT, core
from big_config import render, run, workflow as sut
from big_config.utils import BigConfigError

S1 = "test.workflow/s1"
S2 = "test.workflow/s2"
START = "test.workflow/start"


def s1(step_fns, opts):
    return sut.run_steps(step_fns, opts)


def s2(step_fns, opts):
    return sut.run_steps(step_fns, opts)


def setup_module(_module):
    sut.register_workflow_step(S1, s1)
    sut.register_workflow_step(S2, s2)


def teardown_module(_module):
    sut.unregister_workflow_step(S1)
    sut.unregister_workflow_step(S2)


def test_parse_args():
    assert sut.parse_args("render") == {sut.STEPS: ["render"], run.CMDS: []}
    assert sut.parse_args("render lock") == {sut.STEPS: ["render", "lock"], run.CMDS: []}
    assert sut.parse_args("render tofu:init") == {sut.STEPS: ["render", "exec"], run.CMDS: ["tofu init"]}
    assert sut.parse_args("render -- tofu init") == {sut.STEPS: ["render", "exec"], run.CMDS: ["tofu init"]}
    assert sut.parse_args("validate describe") == {sut.STEPS: ["validate", "describe"], run.CMDS: []}
    assert sut.parse_args(["render", "--", "tofu", "init", "-auto-approve"]) == {
        sut.STEPS: ["render", "exec"],
        run.CMDS: ["tofu init -auto-approve"],
    }
    with pytest.raises(BigConfigError, match="-- cannot be without a command"):
        sut.parse_args("render --")


def test_select_globals_defaults_and_explicit():
    opts = {ENV: "prod", run.SHELL_OPTS: {"dir": "/tmp"}, "other": "junk"}
    assert sut.select_globals(opts) == {ENV: "prod", run.SHELL_OPTS: {"dir": "/tmp"}}
    assert sut.select_globals({"globals": ["foo"], "foo": 1, "bar": 2}) == {"foo": 1}


def test_path():
    assert sut.path({}, "tofu") == ".dist/tofu"
    assert sut.path({sut.PREFIX: "custom"}, "tofu") == "custom/tofu"
    assert sut.path({}, "foo/bar") == ".dist/foo/bar"


def test_new_prefix():
    opts = sut.new_prefix({}, START)
    assert opts[sut.PREFIX].startswith(".dist/default-")
    opts = sut.new_prefix({sut.PREFIX: "target", render.PROFILE: "prod"}, START)
    assert opts[sut.PREFIX].startswith("target/prod-")
    opts1 = sut.new_prefix({}, START)
    opts2 = sut.new_prefix(opts1, START)
    assert opts1[sut.PREFIX] != opts2[sut.PREFIX]
    assert opts2[sut.PREFIX].startswith(".dist/default-")


def test_prepare():
    opts = {sut.NAME: "tofu", render.TEMPLATES: [{"template": "t1"}]}
    prepared = sut.prepare(opts, {sut.PREFIX: "dist", sut.PARAMS: {"p": 1}})
    assert prepared[run.SHELL_OPTS]["dir"] == "dist/tofu"
    assert prepared[render.TEMPLATES] == [{"template": "t1", "p": 1, "target-dir": "dist/tofu", "target-object": "tofu/tofu"}]


def test_merge_params():
    opts = {
        sut.CREATE_OPTS: {"tools/tofu-opts": {sut.PARAMS: {"a": 1}}},
        sut.DELETE_OPTS: {"tools/tofu-opts": {sut.PARAMS: {"a": 1}}},
    }
    merged = sut.merge_params(["tools/tofu-opts"], {"b": 2}, opts)
    assert merged[sut.CREATE_OPTS]["tools/tofu-opts"][sut.PARAMS] == {"a": 1, "b": 2}
    assert merged[sut.DELETE_OPTS]["tools/tofu-opts"][sut.PARAMS] == {"a": 1, "b": 2}


def test_read_bc_pars():
    env = {"BC_PAR_ZONE_ID": "123", "OTHER": "junk"}
    assert sut.read_bc_pars({}, env) == {sut.PARAMS: {"zone-id": "123"}}


def test_workflow_star():
    with pytest.raises(ValueError):
        sut.workflow_star({"first_step": START, "pipeline": {}})

    wf = sut.workflow_star({"first_step": START, "pipeline": [S1, ["true"], S2, ["true"]]})
    res = wf([], {ENV: "lib"})
    assert res[EXIT] == 0
    assert res[S1] is not None
    assert res[S2] is not None
    assert res[S1][sut.STEPS] == ["exec"]
    assert res[S2][sut.STEPS] == ["exec"]


def test_run_steps_success_and_failure():
    res = sut.run_steps([], {sut.STEPS: ["render", "exec"], run.CMDS: ["true"], render.TEMPLATES: [], ENV: "lib"})
    assert res[EXIT] == 0
    res = sut.run_steps([], {sut.STEPS: ["exec"], run.CMDS: ["false"], ENV: "lib"})
    assert res[EXIT] > 0


def test_run_steps_validate_and_describe():
    called = []

    def validate(_step_fns, opts):
        called.append("validate")
        return core.ok(opts)

    def describe(_step_fns, opts):
        called.append("describe")
        return core.ok(opts)

    res = sut.run_steps([], {sut.STEPS: ["validate", "describe"], sut.VALIDATE_FN: validate, sut.DESCRIBE_FN: describe, ENV: "lib"})
    assert res[EXIT] == 0
    assert called == ["validate", "describe"]
