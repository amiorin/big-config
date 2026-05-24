import { createStepFn, ok, type StepFn, type WorkflowFn } from "./core.js";
import { check as gitCheck, gitPush } from "./git.js";
import { lock } from "./lock.js";
import { createWorkflowStar as pluggableWorkflowStar } from "./pluggable.js";
import { templates as renderTemplates } from "./render.js";
import { runCmds } from "./run.js";
import { unlockAny } from "./unlock.js";
import {
  ENV,
  ERR,
  EXIT,
  RUN_CMDS,
  RUN_CMD,
  RUN_SHELL_OPTS,
  RENDER_MODULE,
  RENDER_PROFILE,
  RENDER_TEMPLATES,
  WF_CREATE_FN,
  WF_CREATE_OPTS,
  WF_DELETE_FN,
  WF_DELETE_OPTS,
  WF_DESCRIBE_FN,
  WF_NAME,
  WF_OBJECT_FN,
  WF_OBJECT_PREFIX,
  WF_PARAMS,
  WF_PATH_FN,
  WF_PREFIX,
  WF_STEPS,
  WF_VALIDATE_FN,
  WORKFLOW_NS,
  addSuffix,
  namespaceOf,
  nameOf,
  qualify,
  selectKeys,
  type Keyword,
  type Opts
} from "./keys.js";
import { assertArgsPresent, clone, hashString, keywordToName, keywordToPath, registerFunction, toFn } from "./utils.js";

export type WorkflowFunction = (stepFns: Array<StepFn | string>, opts: Opts) => Opts;
export type OptsFn = (opts: Opts) => Opts;

const START = `${WORKFLOW_NS}/start`;
const END = `${WORKFLOW_NS}/end`;
const LOCK = `${WORKFLOW_NS}/lock`;
const GIT_CHECK = `${WORKFLOW_NS}/git-check`;
const RENDER = `${WORKFLOW_NS}/render`;
const CREATE = `${WORKFLOW_NS}/create`;
const DELETE = `${WORKFLOW_NS}/delete`;
const VALIDATE = `${WORKFLOW_NS}/validate`;
const DESCRIBE = `${WORKFLOW_NS}/describe`;
const EXEC = `${WORKFLOW_NS}/exec`;
const GIT_PUSH = `${WORKFLOW_NS}/git-push`;
const UNLOCK_ANY = `${WORKFLOW_NS}/unlock-any`;

export const printStepFn: StepFn = createStepFn({
  beforeF: (step, opts) => {
    const failed = opts[EXIT] != null && opts[EXIT] !== 0;
    const prefix = failed ? "✖" : "➜";
    let msg: string | undefined;
    if (step === LOCK) msg = `Lock (owner ${opts["big-config.lock/owner"] ?? ""})`;
    else if (step === UNLOCK_ANY) msg = "Unlock any";
    else if (step === GIT_CHECK) msg = "Checking if the working directory is clean";
    else if (step === RENDER) msg = `Rendering workflow: ${opts[WF_NAME] ?? ""}`;
    else if (step === RUN_CMD) msg = `Running:\n> ${(opts[RUN_CMDS] ?? [])[0] ?? ""}`;
    if (msg) console.error(`${prefix} ${msg}`);
  },
  afterF: (step, opts) => {
    if (opts[EXIT] > 0 && (step === GIT_CHECK || step === RUN_CMD)) {
      console.error(`✖ ${step === GIT_CHECK ? "Working directory is NOT clean" : `Failed running:\n> ${(opts[RUN_CMDS] ?? [])[0] ?? ""}`}`);
    }
  }
});

function resolveFn<T extends Function>(key: string, opts: Opts, defaultValue?: T): T {
  const f = opts[key];
  if (f == null) {
    if (defaultValue !== undefined) return defaultValue;
    throw Object.assign(new Error(`\`${key}\` not defined`), { data: opts });
  }
  return toFn<T & ((...args: any[]) => any)>(f as any) as any;
}

export function selectGlobals(opts: Opts): Opts {
  const globals = opts.globals ?? [ENV, RUN_SHELL_OPTS, RENDER_MODULE, RENDER_PROFILE, WF_PREFIX, WF_OBJECT_PREFIX, "globals"];
  return selectKeys(opts, globals);
}

export function runSteps(stepFns: Array<StepFn | string>, opts: Opts): Opts {
  const globalsOpts = selectGlobals(opts);
  const createOpts = { ...(opts[WF_CREATE_OPTS] ?? {}), ...globalsOpts };
  const deleteOpts = { ...(opts[WF_DELETE_OPTS] ?? {}), ...globalsOpts };
  let optsStar: Opts = opts;
  let queuedSteps = (opts[WF_STEPS] ?? []).map((step: Keyword) => namespaceOf(step) ? step : qualify(WORKFLOW_NS, step));

  const wf = pluggableWorkflowStar({
    firstStep: START,
    lastStep: END,
    wireFn: (step) => {
      switch (step) {
        case START: return [ok, undefined];
        case LOCK: return [(o: Opts) => lock(stepFns, o), undefined];
        case GIT_CHECK: return [(o: Opts) => gitCheck(stepFns, o), undefined];
        case RENDER: return [(o: Opts) => renderTemplates(stepFns, o), undefined];
        case CREATE: return [(o: Opts) => resolveFn<WorkflowFunction>(WF_CREATE_FN, opts)(stepFns, o), undefined];
        case DELETE: return [(o: Opts) => resolveFn<WorkflowFunction>(WF_DELETE_FN, opts)(stepFns, o), undefined];
        case VALIDATE: return [(o: Opts) => resolveFn<WorkflowFunction>(WF_VALIDATE_FN, opts, (_s, x) => ok(x))(stepFns, o), undefined];
        case DESCRIBE: return [(o: Opts) => resolveFn<WorkflowFunction>(WF_DESCRIBE_FN, opts, (_s, x) => ok(x))(stepFns, o), undefined];
        case EXEC: return [(o: Opts) => runCmds(stepFns, o), undefined];
        case GIT_PUSH: return [gitPush, undefined];
        case UNLOCK_ANY: return [(o: Opts) => unlockAny(stepFns, o), undefined];
        case END: return [(x: Opts) => x, undefined];
        default: return [(x: Opts) => x, undefined];
      }
    },
    nextFn: (step, _nextStep, stepOpts) => {
      if (step === CREATE || step === DELETE) {
        optsStar = { ...optsStar, [EXIT]: stepOpts[EXIT], [ERR]: stepOpts[ERR], [step]: [...(optsStar[step] ?? []), stepOpts] };
      } else {
        optsStar = stepOpts;
      }
      if (step === END) return [undefined, optsStar];
      if (stepOpts[EXIT] > 0) return [END, optsStar];
      const nextStep = queuedSteps[0];
      queuedSteps = queuedSteps.slice(1);
      if (nextStep) return [nextStep, nextStep === CREATE ? createOpts : nextStep === DELETE ? deleteOpts : optsStar];
      return [END, optsStar];
    }
  });
  return wf(stepFns, optsStar);
}

export const parseArgSteps = new Set(["lock", "git-check", "render", "create", "delete", "validate", "describe", "exec", "git-push", "unlock-any"]);
export { parseArgSteps as "*parse-args-steps*" };

function tokenize(strOrArgs: string | string[]): string[] {
  if (Array.isArray(strOrArgs)) return [...strOrArgs];
  const trimmed = strOrArgs.trim();
  return trimmed.length === 0 ? [] : trimmed.split(/\s+/);
}

export function parseArgs(strOrArgs: string | string[]): Opts {
  const xs = tokenize(strOrArgs);
  const steps: Keyword[] = [];
  const cmds: string[] = [];
  let i = 0;
  while (i < xs.length) {
    const token = xs[i]!;
    const tokenName = nameOf(token);
    if (parseArgSteps.has(tokenName) && !namespaceOf(token)) {
      steps.push(tokenName);
      i += 1;
    } else if (token === "--") {
      const rest = xs.slice(i + 1);
      if (rest.length === 0) throw Object.assign(new Error("-- cannot be without a command"), { data: {} });
      if (!steps.includes("exec")) steps.push("exec");
      cmds.push(rest.join(" "));
      i = xs.length;
    } else {
      if (!steps.includes("exec")) steps.push("exec");
      cmds.push(token.replaceAll(":", " "));
      i += 1;
    }
  }
  return { [WF_STEPS]: steps, [RUN_CMDS]: cmds };
}

function parsePath(path: string): string[] {
  return path.split("/").filter((x) => x.length > 0);
}

function buildPath(parts: string[], profile: string, suffix: string): string {
  return [...parts, `${profile}-${suffix}`].join("/");
}

export function newPrefix(opts: Opts, firstStep: Keyword): Opts {
  const prefix = opts[WF_PREFIX] ?? ".dist";
  const objectPrefix = opts[WF_OBJECT_PREFIX] ?? "tofu";
  const profile = opts[RENDER_PROFILE] ?? "default";
  const dirs = parsePath(prefix);
  const objectDirs = parsePath(objectPrefix);
  const last = dirs[dirs.length - 1] ?? "";
  const profileFound = last.startsWith(profile);
  const prevHash = profileFound ? (last.split("-").at(-1) ?? "") : "";
  const baseDirs = profileFound ? dirs.slice(0, -1) : dirs;
  const baseObjectDirs = profileFound ? objectDirs.slice(0, -1) : objectDirs;
  const suffix = hashString(`${firstStep}${prevHash}`, 8);
  return {
    ...opts,
    [WF_PREFIX]: buildPath(baseDirs, profile, suffix),
    [WF_OBJECT_PREFIX]: buildPath(baseObjectDirs, profile, suffix)
  };
}

export function path(opts: Opts, name: Keyword): string {
  return `${opts[WF_PREFIX] ?? ".dist"}/${keywordToPath(name)}`;
}

export function prepare(opts: Opts, overrides: Opts): Opts {
  assertArgsPresent({ opts, overrides, name: opts?.[WF_NAME] });
  const prefix = overrides[WF_PREFIX];
  const objectPrefix = overrides[WF_OBJECT_PREFIX];
  const pathFn = overrides[WF_PATH_FN] ?? ((o: Opts) => `${prefix ?? ".dist"}/${keywordToPath(o[WF_NAME])}`);
  const objectFn = overrides[WF_OBJECT_FN] ?? ((o: Opts) => `${objectPrefix ?? "tofu"}/${keywordToName(o[WF_NAME])}`);
  const merged = { ...opts, ...overrides };
  const dir = pathFn(merged);
  const object = objectFn(merged);
  const params = overrides[WF_PARAMS] ?? {};
  const templates = (merged[RENDER_TEMPLATES] ?? []).map((tpl: Opts) => ({ ...tpl, ...params, "target-dir": dir, "target-object": object }));
  return {
    ...merged,
    [RENDER_TEMPLATES]: templates,
    [RUN_SHELL_OPTS]: { ...(merged[RUN_SHELL_OPTS] ?? {}), dir }
  };
}

export function mergeParams(tools: Keyword[], params: Opts, opts: Opts): Opts {
  let out = clone(opts);
  for (const tool of tools) {
    for (const root of [WF_CREATE_OPTS, WF_DELETE_OPTS]) {
      const existing = out[root]?.[tool]?.[WF_PARAMS] ?? {};
      out = {
        ...out,
        [root]: {
          ...(out[root] ?? {}),
          [tool]: {
            ...(out[root]?.[tool] ?? {}),
            [WF_PARAMS]: { ...params, ...existing }
          }
        }
      };
    }
  }
  return out;
}

const ENV_PREFIX = "BC_PAR_";

export function readBcPars(opts: Opts, env: Record<string, string | undefined> = process.env): Opts {
  const paramsFromEnv: Opts = {};
  for (const [k, v] of Object.entries(env)) {
    if (!k.startsWith(ENV_PREFIX) || v == null) continue;
    const param = k.slice(ENV_PREFIX.length).toLowerCase().replaceAll("_", "-").replaceAll(".", "-");
    paramsFromEnv[param] = v;
  }
  return { ...opts, [WF_PARAMS]: { ...(opts[WF_PARAMS] ?? {}), ...paramsFromEnv } };
}

const workflowRegistry = new Map<Keyword, WorkflowFunction>();

export function registerWorkflow(name: Keyword, workflow: WorkflowFunction): void {
  workflowRegistry.set(name, workflow);
}

export function unregisterWorkflow(name: Keyword): void {
  workflowRegistry.delete(name);
}

export function createWorkflowStar(options: { firstStep?: Keyword; lastStep?: Keyword; pipeline?: any[]; "first-step"?: Keyword; "last-step"?: Keyword }): WorkflowFn {
  const firstStep = options.firstStep ?? options["first-step"];
  const lastStep = options.lastStep ?? options["last-step"];
  const pipeline = options.pipeline;
  if (!firstStep) throw new TypeError(":first-step is required");
  if (!Array.isArray(pipeline)) throw new TypeError(":pipeline must be like [::tool/tofu ...\n::tool/ansible ...");
  return ((stepFns: Array<StepFn | string>, opts: Opts): Opts => {
    const actualLastStep = lastStep ?? (namespaceOf(firstStep) ? `${namespaceOf(firstStep)}/end` : "end");
    const globalsOpts = newPrefix(selectGlobals(opts), firstStep);
    const stepToOptsAndFn = new Map<Keyword, [Opts, OptsFn]>();
    for (let i = 0; i < pipeline.length; i += 2) {
      const step = pipeline[i] as Keyword;
      const tuple = pipeline[i + 1] ?? [];
      const args = tuple[0] ?? [];
      const optsFn = tuple[1] == null ? ((x: Opts) => x) : toFn<OptsFn>(tuple[1]);
      const stepOpts = opts[addSuffix(step, "-opts")] ?? {};
      stepToOptsAndFn.set(step, [{ ...parseArgs(args), ...globalsOpts, ...stepOpts }, optsFn]);
    }
    const steps = pipeline.filter((_, i) => i % 2 === 0) as Keyword[];
    const stepsSet = new Set(steps);
    const stepToNext = new Map<Keyword, Keyword | undefined>();
    const sequence = [firstStep, ...steps, actualLastStep, undefined] as Array<Keyword | undefined>;
    for (let i = 0; i < sequence.length - 1; i++) stepToNext.set(sequence[i]!, sequence[i + 1]);
    let optsStar: Opts = opts;

    const stepToFn = (step: Keyword): ((opts: Opts) => Opts) => {
      if (step === firstStep) return ok;
      if (step === actualLastStep) return (x) => x;
      const registered = workflowRegistry.get(step) ?? opts[step];
      if (typeof registered !== "function") throw Object.assign(new Error(`Workflow '${step}' is not registered`), { data: { step } });
      return (o: Opts) => registered(stepFns, o);
    };

    const wf = pluggableWorkflowStar({
      firstStep,
      lastStep: actualLastStep,
      wireFn: (step) => [stepToFn(step), stepToNext.get(step)],
      nextFn: (step, nextStep, stepOpts) => {
        if (stepsSet.has(step)) {
          optsStar = { ...optsStar, [EXIT]: stepOpts[EXIT], [ERR]: stepOpts[ERR], [step]: stepOpts };
        } else {
          optsStar = stepOpts;
        }
        if (step === actualLastStep || step === END) return [undefined, optsStar];
        if (stepOpts[EXIT] > 0) return [actualLastStep, optsStar];
        const [newOpts, optsFn] = stepToOptsAndFn.get(nextStep as Keyword) ?? [optsStar, (x: Opts) => x];
        return [nextStep, optsFn(newOpts)];
      }
    });
    return wf(stepFns, opts);
  }) as WorkflowFn;
}

registerFunction("big-config.workflow/run-steps", runSteps as any);
registerFunction("big-config.workflow/parse-args", parseArgs);
registerFunction("big-config.workflow/prepare", prepare);

export { createWorkflowStar as "->workflow*", parseArgs as "parse-args", selectGlobals as "select-globals", newPrefix as "new-prefix", mergeParams as "merge-params", readBcPars as "read-bc-pars", runSteps as "run-steps" };
