import { createWorkflow } from "./core.js";
import { ERR, EXIT, GIT_CURRENT_REVISION, GIT_ORIGIN_REVISION, GIT_PREV_REVISION, GIT_UPSTREAM_NAME, type Opts } from "./keys.js";
import { genericCmd } from "./run.js";
import { registerFunction } from "./utils.js";

export function getRevision(revision: string, key: string, opts: Opts): Opts {
  const resolved = Object.prototype.hasOwnProperty.call(opts, revision) ? opts[revision] : revision;
  if (typeof resolved !== "string") throw Object.assign(new Error("Revision is neither a string nor a keyword"), { data: { revision, key, opts } });
  return genericCmd({ opts, cmd: ["git", "rev-parse", resolved], key });
}

export function fetchOrigin(opts: Opts): Opts {
  return genericCmd({ opts, cmd: ["git", "fetch", "origin"] });
}

export function upstreamName(key: string, opts: Opts): Opts {
  return genericCmd({ opts, cmd: ["git", "rev-parse", "--abbrev-ref", "@{upstream}"], key });
}

export function gitDiff(opts: Opts): Opts {
  return genericCmd({ opts, cmd: ["git", "diff", "--quiet"] });
}

export function gitPush(opts: Opts): Opts {
  return genericCmd({ opts, cmd: ["git", "push"] });
}

export function compareRevisions(opts: Opts): Opts {
  const res = opts[GIT_PREV_REVISION] === opts[GIT_ORIGIN_REVISION] || opts[GIT_CURRENT_REVISION] === opts[GIT_ORIGIN_REVISION];
  return res
    ? { ...opts, [EXIT]: 0, [ERR]: null }
    : { ...opts, [EXIT]: 1, [ERR]: "The local revisions don't match the remote revision" };
}

export const check = createWorkflow({
  firstStep: "big-config.git/git-diff",
  wireFn: (step) => {
    switch (step) {
      case "big-config.git/git-diff": return [gitDiff, "big-config.git/fetch-origin"];
      case "big-config.git/fetch-origin": return [fetchOrigin, "big-config.git/upstream-name"];
      case "big-config.git/upstream-name": return [(opts) => upstreamName(GIT_UPSTREAM_NAME, opts), "big-config.git/pre-revision"];
      case "big-config.git/pre-revision": return [(opts) => getRevision("HEAD~1", GIT_PREV_REVISION, opts), "big-config.git/current-revision"];
      case "big-config.git/current-revision": return [(opts) => getRevision("HEAD", GIT_CURRENT_REVISION, opts), "big-config.git/origin-revision"];
      case "big-config.git/origin-revision": return [(opts) => getRevision(GIT_UPSTREAM_NAME, GIT_ORIGIN_REVISION, opts), "big-config.git/compare-revisions"];
      case "big-config.git/compare-revisions": return [compareRevisions, "big-config.git/end"];
      case "big-config.git/end": return [(x) => x];
      default: return [(x) => x];
    }
  }
});

registerFunction("big-config.git/check", check as any);
registerFunction("big-config.git/git-push", gitPush);

export { getRevision as "get-revision", fetchOrigin as "fetch-origin", upstreamName as "upstream-name", gitDiff as "git-diff", gitPush as "git-push", compareRevisions as "compare-revisions" };
