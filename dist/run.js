import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createWorkflow } from "./core.js";
import { ENV, ERR, EXIT, PROCS, RUN_CMDS, RUN_CMD, RUN_DIR, RUN_SHELL_OPTS } from "./keys.js";
import { registerFunction } from "./utils.js";
function stripAnsi(s) {
    return s.replace(/\x1B\[[0-9;]*m/g, "");
}
export function handleCmd(opts, proc) {
    const res = {
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
export function defaultRunner(shellOpts, cmd) {
    if (cmd == null)
        return { exit: 0, out: "", err: "", cmd };
    const cwd = shellOpts.dir ?? shellOpts.cwd;
    const env = { ...process.env, ...(shellOpts.extraEnv ?? shellOpts["extra-env"] ?? {}) };
    const encoding = "utf8";
    const captureOut = shellOpts.out !== "inherit";
    const captureErr = shellOpts.err !== "inherit";
    const stdio = [shellOpts.in == null ? "ignore" : "pipe", captureOut ? "pipe" : "inherit", captureErr ? "pipe" : "inherit"];
    const common = { cwd, env, input: shellOpts.in, encoding, stdio };
    const proc = Array.isArray(cmd)
        ? spawnSync(cmd[0], cmd.slice(1), common)
        : spawnSync(cmd, { ...common, shell: true });
    const exit = typeof proc.status === "number" ? proc.status : proc.error ? 1 : 0;
    return {
        exit,
        out: typeof proc.stdout === "string" ? proc.stdout : "",
        err: typeof proc.stderr === "string" ? proc.stderr : proc.error ? proc.error.message : "",
        cmd
    };
}
export let runner = defaultRunner;
export function setRunner(next) {
    runner = next;
}
export function resetRunner() {
    runner = defaultRunner;
}
export function withRunner(next, f) {
    const prev = runner;
    runner = next;
    try {
        return f();
    }
    finally {
        runner = prev;
    }
}
export function genericCmd({ opts, cmd, key, shellOpts }) {
    const mergedShellOpts = { continue: true, out: "string", err: "string", ...(shellOpts ?? {}) };
    const proc = runner(mergedShellOpts, cmd);
    const next = handleCmd(opts, proc);
    return key ? { ...next, [key]: proc.out.trimEnd() } : next;
}
export function mktempCreateDir(opts) {
    // Use the OS directly but still record a proc-like result for workflow parity.
    const dir = realpathSync(mkdtempSync(join(tmpdir(), "big-config-")));
    const next = handleCmd(opts, { exit: 0, out: `${dir}\n`, err: "", cmd: "bash -c 'readlink -f $(mktemp -d)'" });
    return { ...next, [RUN_DIR]: dir, [RUN_SHELL_OPTS]: { ...(next[RUN_SHELL_OPTS] ?? {}), dir } };
}
export function mktempRemoveDir(opts) {
    const dir = opts[RUN_DIR];
    if (typeof dir === "string" && dir.length > 0)
        rmSync(dir, { recursive: true, force: true });
    return handleCmd(opts, { exit: 0, out: "", err: "", cmd: ["rm", "-rf", dir] });
}
export function runCmd(opts) {
    const env = opts[ENV];
    const baseShellOpts = { ...opts[RUN_SHELL_OPTS], continue: true };
    const shellOpts = env === "lib"
        ? { out: "string", err: "string", ...baseShellOpts }
        : { out: "inherit", err: "inherit", ...baseShellOpts };
    const cmds = opts[RUN_CMDS] ?? [];
    const cmd = cmds[0];
    const proc = runner(shellOpts, cmd);
    return handleCmd(opts, proc);
}
export function pushNil(opts) {
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
        if (step === "big-config.run/end")
            return [undefined, opts];
        return ["big-config.run/end", opts];
    }
});
registerFunction("big-config.run/run-cmd", runCmd);
registerFunction("big-config.run/run-cmds", runCmds);
registerFunction("big-config.run/mktemp-create-dir", mktempCreateDir);
registerFunction("big-config.run/mktemp-remove-dir", mktempRemoveDir);
export { genericCmd as "generic-cmd", mktempCreateDir as "mktemp-create-dir", mktempRemoveDir as "mktemp-remove-dir", runCmd as "run-cmd", runCmds as "run-cmds" };
//# sourceMappingURL=run.js.map