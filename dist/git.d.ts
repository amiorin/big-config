import { type Opts } from "./keys.js";
export declare function getRevision(revision: string, key: string, opts: Opts): Opts;
export declare function fetchOrigin(opts: Opts): Opts;
export declare function upstreamName(key: string, opts: Opts): Opts;
export declare function gitDiff(opts: Opts): Opts;
export declare function gitPush(opts: Opts): Opts;
export declare function compareRevisions(opts: Opts): Opts;
export declare const check: import("./core.js").WorkflowFn;
export { getRevision as "get-revision", fetchOrigin as "fetch-origin", upstreamName as "upstream-name", gitDiff as "git-diff", gitPush as "git-push", compareRevisions as "compare-revisions" };
