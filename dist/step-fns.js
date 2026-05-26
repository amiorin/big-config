import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStepFn } from "./core.js";
import { ENV, ERR, EXIT, STACK_TRACE, STEPS_TRACE } from "./keys.js";
import { registerFunction } from "./utils.js";
export function exitWithCode(n) {
    process.exit(n);
}
export function createExitStepFn(end) {
    return createStepFn({
        afterF: (step, opts) => {
            if (step === end && opts[ENV] !== "repl")
                exitWithCode(opts[EXIT] ?? 0);
        }
    });
}
export function createPrintErrorStepFn(end) {
    return createStepFn({
        beforeF: (step, opts) => {
            const err = opts[ERR];
            const exit = opts[EXIT];
            if (step !== end || !(exit > 0))
                return;
            if (typeof err === "string" && err.trim().length > 0)
                console.error(`✖ ${err}`);
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
export const tapStepFn = createStepFn({
    beforeF: (step, opts) => {
        const g = globalThis;
        if (!Array.isArray(g.__bigConfigTaps))
            g.__bigConfigTaps = [];
        g.__bigConfigTaps.push([step, "before", opts]);
    },
    afterF: (step, opts) => {
        const g = globalThis;
        if (!Array.isArray(g.__bigConfigTaps))
            g.__bigConfigTaps = [];
        g.__bigConfigTaps.push([step, "after", opts]);
    }
});
export function logStepFn(f, step, opts) {
    return f(step, { ...opts, [STEPS_TRACE]: [...(opts[STEPS_TRACE] ?? []), step] });
}
export const blingStepFn = createStepFn({
    beforeF: (step) => console.error(`➜ ${step}`),
    afterF: (step, opts) => {
        if (opts[EXIT] > 0)
            console.error(`✖ ${step}: ${opts[ERR] ?? ""}`);
    }
});
registerFunction("big-config.step-fns/tap-step-fn", tapStepFn);
registerFunction("big-config.step-fns/log-step-fn", logStepFn);
registerFunction("big-config.step-fns/bling-step-fn", blingStepFn);
export { exitWithCode as "exit-with-code", createExitStepFn as "->exit-step-fn", createPrintErrorStepFn as "->print-error-step-fn", tapStepFn as "tap-step-fn", logStepFn as "log-step-fn", blingStepFn as "bling-step-fn" };
//# sourceMappingURL=step-fns.js.map