import { createWorkflow } from "./core.js";
import { normalizeKeyword } from "./keys.js";
const handlers = new Map();
export function handleStep(f, step, stepFns, opts) {
    const handler = handlers.get(normalizeKeyword(step));
    if (handler)
        return handler(f, normalizeKeyword(step), stepFns, opts);
    return f(opts);
}
export function registerHandleStep(step, handler) {
    handlers.set(normalizeKeyword(step), handler);
}
export function removeHandleStep(step) {
    handlers.delete(normalizeKeyword(step));
}
export function clearHandleSteps() {
    handlers.clear();
}
export { registerHandleStep as defmethod, removeHandleStep as "remove-method" };
export function createWorkflowStar(options) {
    const anyOpts = options;
    const wireFn = anyOpts.wireFn ?? anyOpts["wire-fn"];
    const wrappedOptions = {
        ...anyOpts,
        wireFn: (step, stepFns) => {
            const [f, nextStep] = wireFn(step, stepFns);
            return [(opts) => handleStep(f, step, stepFns, opts), nextStep];
        }
    };
    return createWorkflow(wrappedOptions);
}
export { createWorkflowStar as "->workflow*" };
//# sourceMappingURL=pluggable.js.map