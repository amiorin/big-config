import { type StepFn } from "./core.js";
import { type Opts } from "./keys.js";
import { printStepFn } from "./workflow.js";
export { printStepFn as "print-step-fn", printStepFn };
export declare function parse(s: string): [string[], string[], string | undefined, string | undefined];
export declare function parseModuleAndProfile(s: string): {
    module?: string;
    profile?: string;
};
export declare function runStep(stepFns: Array<StepFn | string>, opts: Opts): Opts;
export declare function runSteps(s: string, opts?: Opts, stepFns?: Array<StepFn | string>): Opts;
export { parseModuleAndProfile as "parse-module-and-profile", runStep as "run-step", runSteps as "run-steps" };
