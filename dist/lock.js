import { choice, createWorkflow } from "./core.js";
import { ERR, EXIT, LOCK_DETAILS, LOCK_KEYS, LOCK_NAME, LOCK_OWNER, TAG_CONTENT } from "./keys.js";
import { genericCmd } from "./run.js";
import { hashString, registerFunction, sortNestedMap, stableStringify } from "./utils.js";
function ednString(value) {
    if (Array.isArray(value))
        return `[${value.map(ednString).join(" ")}]`;
    if (value && typeof value === "object") {
        return `{${Object.entries(value).map(([k, v]) => `:${k} ${ednString(v)}`).join(" ")}}`;
    }
    if (typeof value === "string")
        return JSON.stringify(value);
    if (value == null)
        return "nil";
    return String(value);
}
function parseScalar(s) {
    if (s === "nil")
        return null;
    if (s === "true")
        return true;
    if (s === "false")
        return false;
    if (/^-?\d+(\.\d+)?$/.test(s))
        return Number(s);
    if (s.startsWith('"')) {
        try {
            return JSON.parse(s);
        }
        catch {
            return s.slice(1, -1);
        }
    }
    return s;
}
export function parseTagContent(tagContent) {
    const line = tagContent.split(/\r?\n/).find((x) => x.startsWith(">>>"));
    if (!line)
        return {};
    const body = line.replace(/^>>>/, "").trim();
    if (!body)
        return {};
    try {
        return JSON.parse(body);
    }
    catch { /* EDN fallback */ }
    const out = {};
    const inner = body.replace(/^\{/, "").replace(/\}$/, "");
    const re = /:([^\s\}]+)\s+("(?:\\.|[^"])*"|[^\s\}]+)/g;
    let m;
    while ((m = re.exec(inner)))
        out[m[1]] = parseScalar(m[2]);
    return out;
}
export function generateLockId(opts) {
    const lockKeys = opts[LOCK_KEYS] ?? [];
    const lockDetails = {};
    for (const k of lockKeys)
        if (Object.prototype.hasOwnProperty.call(opts, k))
            lockDetails[k] = opts[k];
    const lockName = `LOCK-${hashString(stableStringify(sortNestedMap(lockDetails)), 8).toUpperCase()}`;
    return {
        ...opts,
        [LOCK_DETAILS]: { ...lockDetails, [LOCK_OWNER]: opts[LOCK_OWNER] },
        [LOCK_NAME]: lockName,
        [EXIT]: 0,
        [ERR]: null
    };
}
export function deleteTag(opts) {
    return genericCmd({ opts, cmd: ["git", "tag", "-d", opts[LOCK_NAME]] });
}
export function createTag(opts) {
    return genericCmd({
        opts,
        shellOpts: { in: `>>>${ednString(opts[LOCK_DETAILS] ?? {})}` },
        cmd: ["git", "tag", "-a", opts[LOCK_NAME], "-F", "-"]
    });
}
export function pushTag(opts) {
    return genericCmd({ opts, cmd: ["git", "push", "origin", opts[LOCK_NAME]] });
}
export function deleteRemoteTag(opts) {
    return genericCmd({ opts, cmd: ["git", "push", "--delete", "origin", opts[LOCK_NAME]] });
}
export function getRemoteTag(opts) {
    return genericCmd({ opts, cmd: ["git", "fetch", "origin", "tag", opts[LOCK_NAME], "--no-tags"] });
}
export function readTag(opts) {
    return genericCmd({ opts, cmd: ["git", "cat-file", "-p", opts[LOCK_NAME]], key: TAG_CONTENT });
}
export function checkTag(opts) {
    const details = parseTagContent(String(opts[TAG_CONTENT] ?? ""));
    const ownership = Object.entries(details).every(([k, v]) => opts[k] === v);
    return ownership ? { ...opts, [EXIT]: 0, [ERR]: null } : { ...opts, [EXIT]: 1, [ERR]: "Different owner" };
}
export function checkRemoteTag(opts) {
    const next = genericCmd({ opts, cmd: ["git", "ls-remote", "--exit-code", "origin", `refs/tags/${opts[LOCK_NAME]}`] });
    return next[EXIT] === 2 ? { ...next, [EXIT]: 0, [ERR]: null } : { ...next, [EXIT]: 1, [ERR]: next[ERR] };
}
export const lock = createWorkflow({
    firstStep: "big-config.lock/generate-lock-id",
    wireFn: (step) => {
        switch (step) {
            case "big-config.lock/generate-lock-id": return [generateLockId, "big-config.lock/delete-tag"];
            case "big-config.lock/delete-tag": return [deleteTag, "big-config.lock/create-tag"];
            case "big-config.lock/create-tag": return [createTag, "big-config.lock/push-tag"];
            case "big-config.lock/push-tag": return [pushTag, "big-config.lock/get-remote-tag"];
            case "big-config.lock/get-remote-tag": return [(opts) => getRemoteTag(deleteTag(opts)), "big-config.lock/read-tag"];
            case "big-config.lock/read-tag": return [readTag, "big-config.lock/check-tag"];
            case "big-config.lock/check-tag": return [checkTag, "big-config.lock/end"];
            case "big-config.lock/end": return [(x) => x];
            default: return [(x) => x];
        }
    },
    nextFn: (step, nextStep, opts) => {
        switch (step) {
            case "big-config.lock/end": return [undefined, opts];
            case "big-config.lock/push-tag": return choice({ onSuccess: "big-config.lock/end", onFailure: nextStep, opts });
            case "big-config.lock/delete-tag": return [nextStep, opts];
            default: return choice({ onSuccess: nextStep, onFailure: "big-config.lock/end", opts });
        }
    }
});
registerFunction("big-config.lock/lock", lock);
registerFunction("big-config.lock/generate-lock-id", generateLockId);
registerFunction("big-config.lock/delete-tag", deleteTag);
registerFunction("big-config.lock/delete-remote-tag", deleteRemoteTag);
registerFunction("big-config.lock/check-remote-tag", checkRemoteTag);
export { generateLockId as "generate-lock-id", deleteTag as "delete-tag", createTag as "create-tag", pushTag as "push-tag", deleteRemoteTag as "delete-remote-tag", getRemoteTag as "get-remote-tag", readTag as "read-tag", checkTag as "check-tag", checkRemoteTag as "check-remote-tag", parseTagContent as "parse-tag-content" };
//# sourceMappingURL=lock.js.map