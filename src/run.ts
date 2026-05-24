import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createWorkflow } from "./core.js";
import { ENV, ERR, EXIT, PROCS, RUN_CMDS, RUN_CMD, RUN_DIR, RUN_SHELL_OPTS, type Opts } from "./keys.js";
import { registerFunction } from "./utils.js";

export type Command = string | string[] | null | undefined;

export interface ShellOpts {
  continue?: boolean;
  out?: "string" | "inherit";
  err?: "string" | "inherit";
  dir?: string;
  cwd?: string;
  in?: string | Buffer;
  extraEnv?: Record<string, string>;
  "extra-env"?: Record<string, string>;
  [key: string]: any;
}

export interface ProcResult {
  exit: number;
  out: string;
  err: string;
  cmd: Command;
}

export type Runner = (shellOpts: ShellOpts, cmd: Command) => ProcResult;

function stripAnsi(s: string): string {
  return s.replace(/\x1B\[[0-9;]*m/g, "");
}

export function handleCmd(opts: Opts, proc: ProcResult): Opts {
  const res: ProcResult = {
    exit: proc.exit,
    out: typeof proc.out === "string" ? stripAnsi(proc.out) : proc.out,
    err: typeof proc.err === "string" ? stripAnsi(proc.err) : proc.err,
    cmd: proc.cmd
  };
  return {
    ...opts,
    [PROCS]: [...(opts[PROCS] ?? []), res],
    [EXIT]: res.exit,
    [ERR]: res.err
  };
}

export function defaultRunner(shellOpts: ShellOpts, cmd: Command): ProcResult {
  if (cmd == null) return { exit: 0, out: "", err: "", cmd };
  const cwd = shellOpts.dir ?? shellOpts.cwd;
  const env = { ...process.env, ...(shellOpts.extraEnv ?? shellOpts["extra-env"] ?? {}) };
  const encoding = "utf8" as const;
  const captureOut = shellOpts.out !== "inherit";
  const captureErr = shellOpts.err !== "inherit";
  const stdio: any = [shellOpts.in == null ? "ignore" : "pipe", captureOut ? "pipe" : "inherit", captureErr ? "pipe" : "inherit"];
  const common = { cwd, env, input: shellOpts.in, encoding, stdio };
  const proc = Array.isArray(cmd)
    ? spawnSync(cmd[0]!, cmd.slice(1), common)
    : spawnSync(cmd, { ...common, shell: true });
  const exit = typeof proc.status === "number" ? proc.status : proc.error ? 1 : 0;
  return {
    exit,
    out: typeof proc.stdout === "string" ? proc.stdout : "",
    err: typeof proc.stderr === "string" ? proc.stderr : proc.error ? proc.error.message : "",
    cmd
  };
}

export let runner: Runner = defaultRunner;

export function setRunner(next: Runner): void {
  runner = next;
}

export function resetRunner(): void {
  runner = defaultRunner;
}

export function withRunner<T>(next: Runner, f: () => T): T {
  const prev = runner;
  runner = next;
  try {
    return f();
  } finally {
    runner = prev;
  }
}

export function genericCmd({ opts, cmd, key, shellOpts }: { opts: Opts; cmd: Command; key?: string; shellOpts?: ShellOpts }): Opts {
  const mergedShellOpts: ShellOpts = { continue: true, out: "string", err: "string", ...(shellOpts ?? {}) };
  const proc = runner(mergedShellOpts, cmd);
  const next = handleCmd(opts, proc);
  return key ? { ...next, [key]: proc.out.trimEnd() } : next;
}

export function mktempCreateDir(opts: Opts): Opts {
  // Use the OS directly but still record a proc-like result for workflow parity.
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "big-config-")));
  const next = handleCmd(opts, { exit: 0, out: `${dir}\n`, err: "", cmd: "bash -c 'readlink -f $(mktemp -d)'" });
  return { ...next, [RUN_DIR]: dir, [RUN_SHELL_OPTS]: { ...(next[RUN_SHELL_OPTS] ?? {}), dir } };
}

export function mktempRemoveDir(opts: Opts): Opts {
  const dir = opts[RUN_DIR];
  if (typeof dir === "string" && dir.length > 0) rmSync(dir, { recursive: true, force: true });
  return handleCmd(opts, { exit: 0, out: "", err: "", cmd: ["rm", "-rf", dir] });
}

export function runCmd(opts: Opts): Opts {
  const env = opts[ENV];
  const baseShellOpts: ShellOpts = { ...opts[RUN_SHELL_OPTS], continue: true };
  const shellOpts: ShellOpts = env === "lib"
    ? { out: "string", err: "string", ...baseShellOpts }
    : { out: "inherit", err: "inherit", ...baseShellOpts };
  const cmds = opts[RUN_CMDS] ?? [];
  const cmd = cmds[0];
  const proc = runner(shellOpts, cmd);
  return handleCmd(opts, proc);
}

export function pushNil(opts: Opts): Opts {
  const cmds = Array.isArray(opts[RUN_CMDS]) && opts[RUN_CMDS].length > 0 ? [null, ...opts[RUN_CMDS]] : [null];
  return { ...opts, [RUN_CMDS]: cmds, [EXIT]: 0, [ERR]: null };
}

export const runCmds = createWorkflow({
  firstStep: "big-config.run/start",
  wireFn: (step) => {
    switch (step) {
      case "big-config.run/start": return [pushNil, RUN_CMD];
      case RUN_CMD: return [runCmd, RUN_CMD];
      case "big-config.run/end": return [(x) => x];
      default: return [(x) => x];
    }
  },
  nextFn: (step, _nextStep, opts) => {
    const cmds = opts[RUN_CMDS] ?? [];
    if (Array.isArray(cmds) && cmds.slice(1).length > 0 && (opts[EXIT] === 0 || opts[EXIT] == null)) {
      return [RUN_CMD, { ...opts, [RUN_CMDS]: cmds.slice(1) }];
    }
    if (step === "big-config.run/end") return [undefined, opts];
    return ["big-config.run/end", opts];
  }
});

registerFunction("big-config.run/run-cmd", runCmd);
registerFunction("big-config.run/run-cmds", runCmds as any);
registerFunction("big-config.run/mktemp-create-dir", mktempCreateDir);
registerFunction("big-config.run/mktemp-remove-dir", mktempRemoveDir);

export { genericCmd as "generic-cmd", mktempCreateDir as "mktemp-create-dir", mktempRemoveDir as "mktemp-remove-dir", runCmd as "run-cmd", runCmds as "run-cmds" };
