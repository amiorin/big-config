import { type Keyword, type Opts } from "./keys.js";
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
export declare function ok(): Opts;
export declare function ok(opts: Opts): Opts;
export declare function choice({ onSuccess, onFailure, opts }: {
    onSuccess?: Keyword;
    onFailure?: Keyword;
    opts: Opts;
}): [Keyword | undefined, Opts];
export declare function createWorkflow(options: WorkflowOptions | KebabWorkflowOptions): WorkflowFn;
export { createWorkflow as "->workflow" };
export interface StepFnOptions {
    beforeF?: (step: Keyword, opts: Opts) => void;
    afterF?: ((step: Keyword, opts: Opts) => void) | "same" | ":same";
    "before-f"?: (step: Keyword, opts: Opts) => void;
    "after-f"?: ((step: Keyword, opts: Opts) => void) | "same" | ":same";
}
export declare function createStepFn(options: StepFnOptions): StepFn;
export { createStepFn as "->step-fn" };
