import { type StepFn, type WrappedStep } from "./core.js";
import { type Keyword, type Opts } from "./keys.js";
export declare function exitWithCode(n: number): never;
export declare function createExitStepFn(end: Keyword): StepFn;
export declare function createPrintErrorStepFn(end: Keyword): StepFn;
export declare const tapStepFn: StepFn;
export declare function logStepFn(f: WrappedStep, step: Keyword, opts: Opts): Opts;
export declare const blingStepFn: StepFn;
export { exitWithCode as "exit-with-code", createExitStepFn as "->exit-step-fn", createPrintErrorStepFn as "->print-error-step-fn", tapStepFn as "tap-step-fn", logStepFn as "log-step-fn", blingStepFn as "bling-step-fn" };
