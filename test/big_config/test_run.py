from pathlib import Path

from big_config import ENV, EXIT, PROCS, core, run


def test_run_cmds_with_three_commands():
    actual = run.run_cmds(
        [],
        {
            ENV: "repl",
            run.SHELL_OPTS: {"continue": True, "err": "string", "out": "string"},
            run.CMDS: ["echo one", "echo two", "echo three"],
        },
    )
    assert actual == {
        ENV: "repl",
        run.SHELL_OPTS: {"continue": True, "err": "string", "out": "string"},
        run.CMDS: ["echo three"],
        PROCS: [
            {"exit": 0, "out": "one\n", "err": "", "cmd": ["echo", "one"]},
            {"exit": 0, "out": "two\n", "err": "", "cmd": ["echo", "two"]},
            {"exit": 0, "out": "three\n", "err": "", "cmd": ["echo", "three"]},
        ],
        EXIT: 0,
        "big-config/err": "",
    }


def test_mktemp_create_pwd_and_delete():
    PWD = "test.run/pwd"
    START = "test.run/start"
    CLEAN = "test.run/clean"
    END = "test.run/end"

    def pwd(opts):
        return run.generic_cmd(opts=opts, cmd="pwd", shell_opts={"dir": opts[run.DIR]}, key=PWD)

    def wire(step, _):
        if step == START:
            return run.mktemp_create_dir, PWD
        if step == PWD:
            return pwd, CLEAN
        if step == CLEAN:
            return run.mktemp_remove_dir, END
        return lambda x: x, None

    wf = core.workflow({"first_step": START, "wire_fn": wire})
    opts = wf([], {})
    assert opts[run.DIR] == opts[PWD]
    assert [p["exit"] for p in opts[PROCS]] == [0, 0, 0]
    assert not Path(opts[run.DIR]).exists()
