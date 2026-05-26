import { type Opts } from "./keys.js";
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
export declare function handleCmd(opts: Opts, proc: ProcResult): Opts;
export declare function defaultRunner(shellOpts: ShellOpts, cmd: Command): ProcResult;
export declare let runner: Runner;
export declare function setRunner(next: Runner): void;
export declare function resetRunner(): void;
export declare function withRunner<T>(next: Runner, f: () => T): T;
export declare function genericCmd({ opts, cmd, key, shellOpts }: {
    opts: Opts;
    cmd: Command;
    key?: string;
    shellOpts?: ShellOpts;
}): Opts;
export declare function mktempCreateDir(opts: Opts): Opts;
export declare function mktempRemoveDir(opts: Opts): Opts;
export declare function runCmd(opts: Opts): Opts;
export declare function pushNil(opts: Opts): Opts;
export declare const runCmds: import("./core.js").WorkflowFn;
export { genericCmd as "generic-cmd", mktempCreateDir as "mktemp-create-dir", mktempRemoveDir as "mktemp-remove-dir", runCmd as "run-cmd", runCmds as "run-cmds" };
