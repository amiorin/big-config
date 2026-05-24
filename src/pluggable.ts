import { createWorkflow, type KebabWorkflowOptions, type StepFn, type WorkflowFn, type WorkflowOptions } from "./core.js";
import { normalizeKeyword, type Keyword, type Opts } from "./keys.js";

export type HandleStepFn = (f: (opts: Opts) => Opts, step: Keyword, stepFns: StepFn[], opts: Opts) => Opts;

const handlers = new Map<Keyword, HandleStepFn>();

export function handleStep(f: (opts: Opts) => Opts, step: Keyword, stepFns: StepFn[], opts: Opts): Opts {
  const handler = handlers.get(normalizeKeyword(step));
  if (handler) return handler(f, normalizeKeyword(step), stepFns, opts);
  return f(opts);
}

export function registerHandleStep(step: Keyword, handler: HandleStepFn): void {
  handlers.set(normalizeKeyword(step), handler);
}

export function removeHandleStep(step: Keyword): void {
  handlers.delete(normalizeKeyword(step));
}

export function clearHandleSteps(): void {
  handlers.clear();
}

export { registerHandleStep as defmethod, removeHandleStep as "remove-method" };

export function createWorkflowStar(options: WorkflowOptions | KebabWorkflowOptions): WorkflowFn {
  const anyOpts = options as any;
  const wireFn = anyOpts.wireFn ?? anyOpts["wire-fn"];
  const wrappedOptions = {
    ...anyOpts,
    wireFn: (step: Keyword, stepFns: StepFn[]) => {
      const [f, nextStep] = wireFn(step, stepFns);
      return [(opts: Opts) => handleStep(f, step, stepFns, opts), nextStep] as [(opts: Opts) => Opts, Keyword?];
    }
  } as WorkflowOptions;
  return createWorkflow(wrappedOptions);
}

export { createWorkflowStar as "->workflow*" };
