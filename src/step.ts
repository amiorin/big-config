import { ok, type StepFn } from "./core.js";
import { gitPush, check as gitCheck } from "./git.js";
import { lock } from "./lock.js";
import { templates as renderTemplates } from "./render.js";
import { runCmds } from "./run.js";
import { unlockAny } from "./unlock.js";
import { ENV, RUN_CMDS, WF_STEPS, STEP_MODULE, STEP_PROFILE, type Opts } from "./keys.js";
import { printStepFn } from "./workflow.js";
import { createExitStepFn, createPrintErrorStepFn } from "./step-fns.js";

const legacySteps = new Set(["lock", "git-check", "build", "render", "exec", "git-push", "unlock-any"]);

export { printStepFn as "print-step-fn", printStepFn };

export function parse(s: string): [string[], string[], string | undefined, string | undefined] {
  const xs = s.trim().length === 0 ? [] : s.trim().split(/\s+/);
  const steps: string[] = [];
  let cmds: string[] = [];
  let i = 0;
  while (i < xs.length) {
    const token = xs[i]!;
    if (legacySteps.has(token)) {
      steps.push(token);
      i += 1;
      continue;
    }
    if (token === "--") {
      const module = xs[i + 1];
      const profile = xs[i + 2];
      const globalArgs = xs.slice(i + 3).join(":") || undefined;
      if (cmds.length > 0) cmds = cmds.map((cmd) => `${cmd}${globalArgs ? `:${globalArgs}` : ""}`);
      else if (globalArgs) cmds = [globalArgs];
      cmds = cmds.map((cmd) => cmd.replaceAll(":", " "));
      return [steps, cmds, module, profile];
    }
    if (!steps.includes("exec")) steps.push("exec");
    cmds.push(token);
    i += 1;
  }
  cmds = cmds.map((cmd) => cmd.replaceAll(":", " "));
  return [steps, cmds, undefined, undefined];
}

export function parseModuleAndProfile(s: string): { module?: string; profile?: string } {
  const [, , module, profile] = parse(s);
  return { module, profile };
}

export function runStep(stepFns: Array<StepFn | string>, opts: Opts): Opts {
  let current = opts;
  for (const step of opts[WF_STEPS] ?? []) {
    switch (step) {
      case "lock": current = lock(stepFns, current); break;
      case "git-check": current = gitCheck(stepFns, current); break;
      case "build": current = ok(current); break; // Legacy build step placeholder; no build helper is part of this rewrite.
      case "render": current = renderTemplates(stepFns, current); break;
      case "exec": current = runCmds(stepFns, current); break;
      case "git-push": current = gitPush(current); break;
      case "unlock-any": current = unlockAny(stepFns, current); break;
      default: current = ok(current);
    }
    if ((current["big-config/exit"] ?? 0) > 0) break;
  }
  return current;
}

export function runSteps(s: string, opts: Opts = { [ENV]: "repl" }, stepFns?: Array<StepFn | string>): Opts {
  const [steps, cmds, module, profile] = parse(s);
  const finalStepFns = stepFns ?? [printStepFn, createExitStepFn("big-config.step/end"), createPrintErrorStepFn("big-config.step/end")];
  const merged = {
    [ENV]: "repl",
    ...(opts ?? {}),
    [WF_STEPS]: steps,
    [RUN_CMDS]: cmds,
    [STEP_MODULE]: module,
    [STEP_PROFILE]: profile
  };
  const result = runStep(finalStepFns, merged);
  return { ...result, "big-config/exit": result["big-config/exit"] ?? 0, "big-config/err": result["big-config/err"] ?? null };
}

export { parseModuleAndProfile as "parse-module-and-profile", runStep as "run-step", runSteps as "run-steps" };
