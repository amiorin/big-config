import { describe, expect, it, afterEach } from "vitest";
import { ok } from "../src/core.js";
import { resetRunner, setRunner } from "../src/run.js";
import {
  createWorkflowStar,
  mergeParams,
  newPrefix,
  parseArgs,
  path,
  prepare,
  readBcPars,
  registerWorkflow,
  runSteps,
  selectGlobals,
  unregisterWorkflow
} from "../src/workflow.js";
import {
  ENV,
  EXIT,
  RENDER_PROFILE,
  RENDER_TEMPLATES,
  RUN_CMDS,
  RUN_SHELL_OPTS,
  WF_CREATE_OPTS,
  WF_DELETE_OPTS,
  WF_NAME,
  WF_PARAMS,
  WF_PREFIX,
  WF_STEPS
} from "../src/keys.js";

afterEach(() => {
  resetRunner();
  unregisterWorkflow("test/s1");
  unregisterWorkflow("test/s2");
});

describe("workflow", () => {
  it("parses CLI args", () => {
    expect(parseArgs("render")).toEqual({ [WF_STEPS]: ["render"], [RUN_CMDS]: [] });
    expect(parseArgs("render lock")).toEqual({ [WF_STEPS]: ["render", "lock"], [RUN_CMDS]: [] });
    expect(parseArgs("render tofu:init")).toEqual({ [WF_STEPS]: ["render", "exec"], [RUN_CMDS]: ["tofu init"] });
    expect(parseArgs(["render", "--", "tofu", "init", "-auto-approve"])).toEqual({
      [WF_STEPS]: ["render", "exec"],
      [RUN_CMDS]: ["tofu init -auto-approve"]
    });
    expect(() => parseArgs("render --")).toThrow(/-- cannot/);
  });

  it("selects globals", () => {
    expect(selectGlobals({ [ENV]: "prod", [RUN_SHELL_OPTS]: { dir: "/tmp" }, other: "junk" })).toEqual({
      [ENV]: "prod",
      [RUN_SHELL_OPTS]: { dir: "/tmp" }
    });
    expect(selectGlobals({ globals: ["foo"], foo: 1, bar: 2 })).toEqual({ foo: 1 });
  });

  it("builds paths and prepares templates", () => {
    expect(path({}, "tofu")).toBe(".dist/tofu");
    expect(path({ [WF_PREFIX]: "custom" }, "foo/bar")).toBe("custom/foo/bar");
    const prefixed = newPrefix({ [WF_PREFIX]: "target", [RENDER_PROFILE]: "prod" }, "test/start");
    expect(prefixed[WF_PREFIX]).toMatch(/^target\/prod-/);

    const prepared = prepare({ [WF_NAME]: "tofu", [RENDER_TEMPLATES]: [{ template: "t1" }] }, { [WF_PREFIX]: "dist", [WF_PARAMS]: { p: 1 } });
    expect(prepared[RUN_SHELL_OPTS].dir).toBe("dist/tofu");
    expect(prepared[RENDER_TEMPLATES]).toEqual([{ template: "t1", p: 1, "target-dir": "dist/tofu", "target-object": "tofu/tofu" }]);
  });

  it("merges params and reads BC_PAR overrides", () => {
    const opts = {
      [WF_CREATE_OPTS]: { "tools/tofu-opts": { [WF_PARAMS]: { a: 1 } } },
      [WF_DELETE_OPTS]: { "tools/tofu-opts": { [WF_PARAMS]: { a: 1 } } }
    };
    const merged = mergeParams(["tools/tofu-opts"], { b: 2 }, opts);
    expect(merged[WF_CREATE_OPTS]["tools/tofu-opts"][WF_PARAMS]).toEqual({ a: 1, b: 2 });
    expect(readBcPars({}, { BC_PAR_ZONE_ID: "123", OTHER: "junk" })).toEqual({ [WF_PARAMS]: { "zone-id": "123" } });
  });

  it("runs built-in steps", () => {
    setRunner((_shellOpts, cmd) => ({ exit: cmd === "false" ? 1 : 0, out: "", err: cmd === "false" ? "bad" : "", cmd }));
    const success = runSteps([], { [WF_STEPS]: ["render", "exec"], [RUN_CMDS]: ["true"], [RENDER_TEMPLATES]: [], [ENV]: "lib" });
    expect(success[EXIT]).toBe(0);
    const failure = runSteps([], { [WF_STEPS]: ["exec"], [RUN_CMDS]: ["false"], [ENV]: "lib" });
    expect(failure[EXIT]).toBe(1);
  });

  it("runs validate and describe hooks", () => {
    const called: string[] = [];
    const res = runSteps([], {
      [WF_STEPS]: ["validate", "describe"],
      "big-config.workflow/validate-fn": (_stepFns: unknown, opts: any) => { called.push("validate"); return ok(opts); },
      "big-config.workflow/describe-fn": (_stepFns: unknown, opts: any) => { called.push("describe"); return ok(opts); },
      [ENV]: "lib"
    });
    expect(res[EXIT]).toBe(0);
    expect(called).toEqual(["validate", "describe"]);
  });

  it("composes registered workflow pipeline steps", () => {
    registerWorkflow("test/s1", (_stepFns, opts) => ok(opts));
    registerWorkflow("test/s2", (_stepFns, opts) => ok(opts));
    const wf = createWorkflowStar({ firstStep: "test/start", pipeline: ["test/s1", ["pwd"], "test/s2", ["pwd"]] });
    const res = wf([], { [ENV]: "lib" });
    expect(res[EXIT]).toBe(0);
    expect(res["test/s1"][WF_STEPS]).toEqual(["exec"]);
    expect(res["test/s2"][WF_STEPS]).toEqual(["exec"]);
  });
});
