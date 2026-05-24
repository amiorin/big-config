import { ERR, EXIT, STACK_TRACE, keyword, namespaceOf, nameOf, type Keyword, type Opts } from "./keys.js";
import { registerFunction, toFn, type AnyFn } from "./utils.js";

export type StepImplementation = (opts: Opts) => Opts;
export type WrappedStep = (step: Keyword, opts: Opts) => Opts;
export type StepFn = (f: WrappedStep, step: Keyword, opts: Opts) => Opts;
export type WireFn = (step: Keyword, stepFns: StepFn[]) => [StepImplementation, Keyword?];
export type NextFn = (step: Keyword, nextStep: Keyword | undefined, opts: Opts) => [Keyword | undefined | null, Opts];

export interface WorkflowOptions {
  firstStep: Keyword;
  lastStep?: Keyword;
  wireFn: WireFn;
  nextFn?: NextFn;
}

export interface KebabWorkflowOptions {
  "first-step": Keyword;
  "last-step"?: Keyword;
  "wire-fn": WireFn;
  "next-fn"?: NextFn;
}

export interface WorkflowFn {
  (): [Keyword, Keyword];
  (stepFns: Array<StepFn | string>, opts: Opts): Opts;
}

export function ok(): Opts;
export function ok(opts: Opts): Opts;
export function ok(opts?: Opts): Opts {
  return { ...(opts ?? {}), [EXIT]: 0, [ERR]: null };
}

export function choice({ onSuccess, onFailure, opts }: { onSuccess?: Keyword; onFailure?: Keyword; opts: Opts }): [Keyword | undefined, Opts] {
  return opts[EXIT] === 0 ? [onSuccess, opts] : [onFailure, opts];
}

function compose(stepFns: StepFn[], f: StepImplementation): WrappedStep {
  const base: WrappedStep = (_step, opts) => f(opts);
  return stepFns.reduce<WrappedStep>((acc, next) => (step, opts) => next(acc, step, opts), base);
}

function resolveStepFns(stepFns: Array<StepFn | string>): StepFn[] {
  return stepFns.map((f) => toFn<StepFn>(f)).reverse();
}

function tryF(f: WrappedStep, step: Keyword, opts: Opts): Opts {
  try {
    return f(step, opts);
  } catch (e) {
    const err = e as Error & { data?: Opts };
    return {
      ...opts,
      ...(err && typeof err === "object" ? err.data ?? {} : {}),
      [ERR]: err instanceof Error ? err.message : String(e),
      [EXIT]: 1,
      [STACK_TRACE]: err instanceof Error ? err.stack ?? "" : ""
    };
  }
}

function resolveNextFn(nextFn: NextFn | undefined, lastStep: Keyword): NextFn {
  if (nextFn) return nextFn;
  return (_step, nextStep, opts) => {
    if (nextStep) return choice({ onSuccess: nextStep, onFailure: lastStep, opts });
    return [undefined, opts];
  };
}

function normalizeWorkflowOptions(opts: WorkflowOptions | KebabWorkflowOptions): WorkflowOptions {
  const anyOpts = opts as any;
  return {
    firstStep: anyOpts.firstStep ?? anyOpts["first-step"],
    lastStep: anyOpts.lastStep ?? anyOpts["last-step"],
    wireFn: anyOpts.wireFn ?? anyOpts["wire-fn"],
    nextFn: anyOpts.nextFn ?? anyOpts["next-fn"]
  };
}

export function createWorkflow(options: WorkflowOptions | KebabWorkflowOptions): WorkflowFn {
  const { firstStep, wireFn, nextFn } = normalizeWorkflowOptions(options);
  if (!firstStep) throw new TypeError(":first-step is required");
  if (!wireFn) throw new TypeError(":wire-fn is required");
  const ns = namespaceOf(firstStep);
  const lastStep = normalizeWorkflowOptions(options).lastStep ?? (ns ? keyword(ns, "end") : "end");

  function workflow(): [Keyword, Keyword];
  function workflow(stepFns: Array<StepFn | string>, opts: Opts): Opts;
  function workflow(stepFns?: Array<StepFn | string>, opts?: Opts): [Keyword, Keyword] | Opts {
    if (arguments.length === 0) return [firstStep, lastStep];
    if (opts == null) throw new TypeError("opts should never be nil");
    const resolved = resolveStepFns(stepFns ?? []);
    let step: Keyword | undefined | null = firstStep;
    let current: Opts = opts;
    while (step) {
      const [impl, nextStepFromWire] = wireFn(step, resolved);
      const wrapped = compose(resolved, impl ?? ((x) => x));
      current = tryF(wrapped, step, current);
      if (current == null) throw Object.assign(new Error("opts must never be nil"), { data: { step } });
      const exit = current[EXIT];
      if (!Number.isInteger(exit) || exit < 0) throw Object.assign(new Error(":big-config/exit must be a natural number"), { data: current });
      const [nextStep, nextOpts] = resolveNextFn(nextFn, lastStep)(step, nextStepFromWire, current);
      step = nextStep;
      current = nextOpts;
    }
    return current;
  }
  return workflow as WorkflowFn;
}

export { createWorkflow as "->workflow" };

export interface StepFnOptions {
  beforeF?: (step: Keyword, opts: Opts) => void;
  afterF?: ((step: Keyword, opts: Opts) => void) | "same" | ":same";
  "before-f"?: (step: Keyword, opts: Opts) => void;
  "after-f"?: ((step: Keyword, opts: Opts) => void) | "same" | ":same";
}

export function createStepFn(options: StepFnOptions): StepFn {
  const beforeF = options.beforeF ?? options["before-f"];
  const afterF0 = options.afterF ?? options["after-f"];
  if (!beforeF && !afterF0) throw new TypeError("At least one f needs to be provided");
  if (!beforeF && (afterF0 === "same" || afterF0 === ":same")) throw new TypeError(":before-f must be a f with :after-f :same");
  return (f, step, opts) => {
    beforeF?.(step, opts);
    const nextOpts = f(step, opts);
    const afterF = afterF0 == null ? undefined : afterF0 === "same" || afterF0 === ":same" ? beforeF : afterF0;
    if (typeof afterF === "function") afterF(step, nextOpts);
    return nextOpts;
  };
}

export { createStepFn as "->step-fn" };

// Register commonly referenced function names for string-based middleware lookup.
registerFunction("big-config.core/ok", ok as AnyFn);
