import { describe, expect, it, afterEach } from "vitest";
import { ENV, EXIT, PROCS, RUN_CMDS, RUN_DIR, RUN_SHELL_OPTS } from "../src/keys.js";
import { genericCmd, handleCmd, mktempCreateDir, mktempRemoveDir, resetRunner, runCmds, setRunner, withRunner } from "../src/run.js";

afterEach(() => resetRunner());

describe("run", () => {
  it("handles command results", () => {
    const res = handleCmd({}, { exit: 1, out: "\u001b[31mout\u001b[0m", err: "err", cmd: "x" });
    expect(res[EXIT]).toBe(1);
    expect(res[PROCS][0].out).toBe("out");
  });

  it("runs multiple commands through the runner seam", () => {
    setRunner((_shellOpts, cmd) => {
      const word = String(cmd).split(" ").at(-1);
      return { exit: 0, out: `${word}\n`, err: "", cmd };
    });
    const res = runCmds([], {
      [ENV]: "repl",
      [RUN_SHELL_OPTS]: { continue: true, err: "string", out: "string" },
      [RUN_CMDS]: ["echo one", "echo two", "echo three"]
    });
    expect(res[EXIT]).toBe(0);
    expect(res[RUN_CMDS]).toEqual(["echo three"]);
    expect(res[PROCS].map((p: any) => p.out)).toEqual(["one\n", "two\n", "three\n"]);
  });

  it("genericCmd stores keyed stdout", () => {
    const res = withRunner((_shellOpts, cmd) => ({ exit: 0, out: "value\n", err: "", cmd }), () =>
      genericCmd({ opts: {}, cmd: ["echo", "value"], key: "x" })
    );
    expect(res.x).toBe("value");
  });

  it("creates and removes temp dirs", () => {
    const made = mktempCreateDir({});
    expect(typeof made[RUN_DIR]).toBe("string");
    const removed = mktempRemoveDir(made);
    expect(removed[EXIT]).toBe(0);
  });
});
