import { describe, expect, it } from "vitest";
import { createStepFn, createWorkflow, ok, type StepFn } from "../src/core.js";
import { EXIT, ERR, STEPS_TRACE } from "../src/keys.js";

const aStepFn: StepFn = (f, step, opts) => {
  const started = { ...opts, [STEPS_TRACE]: [...(opts[STEPS_TRACE] ?? []), [step, "start-a"]] };
  const next = f(step, started);
  return { ...next, [STEPS_TRACE]: [...(next[STEPS_TRACE] ?? []), [step, "end-a"]] };
};

const bStepFn: StepFn = (f, step, opts) => {
  const started = { ...opts, [STEPS_TRACE]: [...(opts[STEPS_TRACE] ?? []), [step, "start-b"]] };
  const next = f(step, started);
  return { ...next, [STEPS_TRACE]: [...(next[STEPS_TRACE] ?? []), [step, "end-b"]] };
};

describe("core", () => {
  it("validates step-fn options", () => {
    expect(() => createStepFn({})).toThrow(/At least one/);
    expect(() => createStepFn({ afterF: "same" })).toThrow(/before-f/);
  });

  it("threads opts and wraps step-fns in order", () => {
    const wf = createWorkflow({
      firstStep: "test/start",
      wireFn: (step) => {
        switch (step) {
          case "test/start": return [(opts) => ({ ...ok(opts), "test/bar": "baz" }), "test/end"];
          case "test/end": return [(opts) => opts];
          default: return [(opts) => opts];
        }
      }
    });
    const res = wf([aStepFn, bStepFn], {});
    expect(res[EXIT]).toBe(0);
    expect(res[ERR]).toBeNull();
    expect(res["test/bar"]).toBe("baz");
    expect(res[STEPS_TRACE]).toEqual([
      ["test/start", "start-a"],
      ["test/start", "start-b"],
      ["test/start", "end-b"],
      ["test/start", "end-a"],
      ["test/end", "start-a"],
      ["test/end", "start-b"],
      ["test/end", "end-b"],
      ["test/end", "end-a"]
    ]);
  });

  it("captures exceptions into opts", () => {
    const wf = createWorkflow({
      firstStep: "test/start",
      wireFn: (step) => step === "test/start"
        ? [() => { throw Object.assign(new Error("boom"), { data: { extra: 1 } }); }, "test/end"]
        : [(opts) => opts]
    });
    const res = wf([], {});
    expect(res[EXIT]).toBe(1);
    expect(res[ERR]).toBe("boom");
    expect(res.extra).toBe(1);
  });
});
