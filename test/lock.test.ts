import { describe, expect, it, afterEach } from "vitest";
import { PROCS, LOCK_DETAILS, LOCK_NAME, LOCK_OWNER } from "../src/keys.js";
import { checkRemoteTag, createTag, deleteRemoteTag, deleteTag, getRemoteTag, parseTagContent, readTag } from "../src/lock.js";
import { resetRunner, setRunner } from "../src/run.js";

afterEach(() => resetRunner());

function lastCmd(opts: any) {
  return opts[PROCS].at(-1).cmd;
}

describe("lock", () => {
  it("constructs git commands as argv vectors", () => {
    setRunner((_shellOpts, cmd) => ({ exit: 0, out: "", err: "", cmd }));
    const opts = { [LOCK_NAME]: "LOCK-DEAD" };
    expect(lastCmd(deleteTag(opts))).toEqual(["git", "tag", "-d", "LOCK-DEAD"]);
    expect(lastCmd(deleteRemoteTag(opts))).toEqual(["git", "push", "--delete", "origin", "LOCK-DEAD"]);
    expect(lastCmd(getRemoteTag(opts))).toEqual(["git", "fetch", "origin", "tag", "LOCK-DEAD", "--no-tags"]);
    expect(lastCmd(readTag(opts))).toEqual(["git", "cat-file", "-p", "LOCK-DEAD"]);
    expect(lastCmd(checkRemoteTag(opts))).toEqual(["git", "ls-remote", "--exit-code", "origin", "refs/tags/LOCK-DEAD"]);
  });

  it("passes lock details through stdin", () => {
    const calls: any[] = [];
    setRunner((shellOpts, cmd) => { calls.push({ shellOpts, cmd }); return { exit: 0, out: "", err: "", cmd }; });
    createTag({ [LOCK_NAME]: "LOCK-DEAD", [LOCK_DETAILS]: { [LOCK_OWNER]: "alberto" } });
    expect(calls[0].cmd).toEqual(["git", "tag", "-a", "LOCK-DEAD", "-F", "-"]);
    expect(calls[0].shellOpts.in).toMatch(/^>>>/);
  });

  it("parses tag content", () => {
    expect(parseTagContent('object\n>>>{:big-config.lock/owner "me"}\n')).toEqual({ [LOCK_OWNER]: "me" });
  });
});
