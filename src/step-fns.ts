import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStepFn, type StepFn, type WrappedStep } from "./core.js";
import { ENV, ERR, EXIT, STACK_TRACE, STEPS_TRACE, type Keyword, type Opts } from "./keys.js";
import { registerFunction } from "./utils.js";

export function exitWithCode(n: number): never {
  process.exit(n);
}

export function createExitStepFn(end: Keyword): StepFn {
  return createStepFn({
    afterF: (step, opts) => {
      if (step === end && opts[ENV] !== "repl") exitWithCode(opts[EXIT] ?? 0);
    }
  });
}

export function createPrintErrorStepFn(end: Keyword): StepFn {
  return createStepFn({
    beforeF: (step, opts) => {
      const err = opts[ERR];
      const exit = opts[EXIT];
      if (step !== end || !(exit > 0)) return;
      if (typeof err === "string" && err.trim().length > 0) console.error(`✖ ${err}`);
      const stack = opts[STACK_TRACE];
      if (typeof stack === "string" && stack.trim().length > 0) {
        const dir = mkdtempSync(join(tmpdir(), "big-config-"));
        const file = join(dir, "stack-trace.txt");
        writeFileSync(file, stack);
        console.error(`\nThe stack-trace has been written to ${file}`);
      }
    }
  });
}

export const tapStepFn: StepFn = createStepFn({
  beforeF: (step, opts) => {
    const g = globalThis as any;
    if (!Array.isArray(g.__bigConfigTaps)) g.__bigConfigTaps = [];
    g.__bigConfigTaps.push([step, "before", opts]);
  },
  afterF: (step, opts) => {
    const g = globalThis as any;
    if (!Array.isArray(g.__bigConfigTaps)) g.__bigConfigTaps = [];
    g.__bigConfigTaps.push([step, "after", opts]);
  }
});

export function logStepFn(f: WrappedStep, step: Keyword, opts: Opts): Opts {
  return f(step, { ...opts, [STEPS_TRACE]: [...(opts[STEPS_TRACE] ?? []), step] });
}

export const blingStepFn: StepFn = createStepFn({
  beforeF: (step) => console.error(`➜ ${step}`),
  afterF: (step, opts) => {
    if (opts[EXIT] > 0) console.error(`✖ ${step}: ${opts[ERR] ?? ""}`);
  }
});

registerFunction("big-config.step-fns/tap-step-fn", tapStepFn as any);
registerFunction("big-config.step-fns/log-step-fn", logStepFn as any);
registerFunction("big-config.step-fns/bling-step-fn", blingStepFn as any);

export { exitWithCode as "exit-with-code", createExitStepFn as "->exit-step-fn", createPrintErrorStepFn as "->print-error-step-fn", tapStepFn as "tap-step-fn", logStepFn as "log-step-fn", blingStepFn as "bling-step-fn" };
