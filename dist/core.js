import { ERR, EXIT, STACK_TRACE, keyword, namespaceOf } from "./keys.js";
import { registerFunction, toFn } from "./utils.js";
export function ok(opts) {
    return { ...(opts ?? {}), [EXIT]: 0, [ERR]: null };
}
export function choice({ onSuccess, onFailure, opts }) {
    return opts[EXIT] === 0 ? [onSuccess, opts] : [onFailure, opts];
}
function compose(stepFns, f) {
    const base = (_step, opts) => f(opts);
    return stepFns.reduce((acc, next) => (step, opts) => next(acc, step, opts), base);
}
function resolveStepFns(stepFns) {
    return stepFns.map((f) => toFn(f)).reverse();
}
function tryF(f, step, opts) {
    try {
        return f(step, opts);
    }
    catch (e) {
        const err = e;
        return {
            ...opts,
            ...(err && typeof err === "object" ? err.data ?? {} : {}),
            [ERR]: err instanceof Error ? err.message : String(e),
            [EXIT]: 1,
            [STACK_TRACE]: err instanceof Error ? err.stack ?? "" : ""
        };
    }
}
function resolveNextFn(nextFn, lastStep) {
    if (nextFn)
        return nextFn;
    return (_step, nextStep, opts) => {
        if (nextStep)
            return choice({ onSuccess: nextStep, onFailure: lastStep, opts });
        return [undefined, opts];
    };
}
function normalizeWorkflowOptions(opts) {
    const anyOpts = opts;
    return {
        firstStep: anyOpts.firstStep ?? anyOpts["first-step"],
        lastStep: anyOpts.lastStep ?? anyOpts["last-step"],
        wireFn: anyOpts.wireFn ?? anyOpts["wire-fn"],
        nextFn: anyOpts.nextFn ?? anyOpts["next-fn"]
    };
}
export function createWorkflow(options) {
    const { firstStep, wireFn, nextFn } = normalizeWorkflowOptions(options);
    if (!firstStep)
        throw new TypeError(":first-step is required");
    if (!wireFn)
        throw new TypeError(":wire-fn is required");
    const ns = namespaceOf(firstStep);
    const lastStep = normalizeWorkflowOptions(options).lastStep ?? (ns ? keyword(ns, "end") : "end");
    function workflow(stepFns, opts) {
        if (arguments.length === 0)
            return [firstStep, lastStep];
        if (opts == null)
            throw new TypeError("opts should never be nil");
        const resolved = resolveStepFns(stepFns ?? []);
        let step = firstStep;
        let current = opts;
        while (step) {
            const [impl, nextStepFromWire] = wireFn(step, resolved);
            const wrapped = compose(resolved, impl ?? ((x) => x));
            current = tryF(wrapped, step, current);
            if (current == null)
                throw Object.assign(new Error("opts must never be nil"), { data: { step } });
            const exit = current[EXIT];
            if (!Number.isInteger(exit) || exit < 0)
                throw Object.assign(new Error(":big-config/exit must be a natural number"), { data: current });
            const [nextStep, nextOpts] = resolveNextFn(nextFn, lastStep)(step, nextStepFromWire, current);
            step = nextStep;
            current = nextOpts;
        }
        return current;
    }
    return workflow;
}
export { createWorkflow as "->workflow" };
export function createStepFn(options) {
    const beforeF = options.beforeF ?? options["before-f"];
    const afterF0 = options.afterF ?? options["after-f"];
    if (!beforeF && !afterF0)
        throw new TypeError("At least one f needs to be provided");
    if (!beforeF && (afterF0 === "same" || afterF0 === ":same"))
        throw new TypeError(":before-f must be a f with :after-f :same");
    return (f, step, opts) => {
        beforeF?.(step, opts);
        const nextOpts = f(step, opts);
        const afterF = afterF0 == null ? undefined : afterF0 === "same" || afterF0 === ":same" ? beforeF : afterF0;
        if (typeof afterF === "function")
            afterF(step, nextOpts);
        return nextOpts;
    };
}
export { createStepFn as "->step-fn" };
// Register commonly referenced function names for string-based middleware lookup.
registerFunction("big-config.core/ok", ok);
//# sourceMappingURL=core.js.map