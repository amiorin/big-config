export const EXIT = "big-config/exit";
export const ERR = "big-config/err";
export const STACK_TRACE = "big-config/stack-trace";
export const PROCS = "big-config/procs";
export const STEPS_TRACE = "big-config/steps";
export const ENV = "big-config/env";
export const RUN_NS = "big-config.run";
export const RUN_SHELL_OPTS = `${RUN_NS}/shell-opts`;
export const RUN_CMDS = `${RUN_NS}/cmds`;
export const RUN_CMD = `${RUN_NS}/run-cmd`;
export const RUN_DIR = `${RUN_NS}/dir`;
export const RENDER_NS = "big-config.render";
export const RENDER_TEMPLATES = `${RENDER_NS}/templates`;
export const RENDER_MODULE = `${RENDER_NS}/module`;
export const RENDER_PROFILE = `${RENDER_NS}/profile`;
export const STEP_NS = "big-config.step";
export const STEP_MODULE = `${STEP_NS}/module`;
export const STEP_PROFILE = `${STEP_NS}/profile`;
export const WORKFLOW_NS = "big-config.workflow";
export const WF_STEPS = `${WORKFLOW_NS}/steps`;
export const WF_NAME = `${WORKFLOW_NS}/name`;
export const WF_PREFIX = `${WORKFLOW_NS}/prefix`;
export const WF_OBJECT_PREFIX = `${WORKFLOW_NS}/object-prefix`;
export const WF_PARAMS = `${WORKFLOW_NS}/params`;
export const WF_PATH_FN = `${WORKFLOW_NS}/path-fn`;
export const WF_OBJECT_FN = `${WORKFLOW_NS}/object-fn`;
export const WF_CREATE_FN = `${WORKFLOW_NS}/create-fn`;
export const WF_BUILD_FN = `${WORKFLOW_NS}/build-fn`;
export const WF_DELETE_FN = `${WORKFLOW_NS}/delete-fn`;
export const WF_VALIDATE_FN = `${WORKFLOW_NS}/validate-fn`;
export const WF_DESCRIBE_FN = `${WORKFLOW_NS}/describe-fn`;
export const WF_CREATE_OPTS = `${WORKFLOW_NS}/create-opts`;
export const WF_BUILD_OPTS = `${WORKFLOW_NS}/build-opts`;
export const WF_DELETE_OPTS = `${WORKFLOW_NS}/delete-opts`;
export const LOCK_NS = "big-config.lock";
export const LOCK_OWNER = `${LOCK_NS}/owner`;
export const LOCK_KEYS = `${LOCK_NS}/lock-keys`;
export const LOCK_DETAILS = `${LOCK_NS}/lock-details`;
export const LOCK_NAME = `${LOCK_NS}/lock-name`;
export const TAG_CONTENT = `${LOCK_NS}/tag-content`;
export const GIT_NS = "big-config.git";
export const GIT_PREV_REVISION = `${GIT_NS}/prev-revision`;
export const GIT_CURRENT_REVISION = `${GIT_NS}/current-revision`;
export const GIT_ORIGIN_REVISION = `${GIT_NS}/origin-revision`;
export const GIT_UPSTREAM_NAME = `${GIT_NS}/upstream-name`;
export function normalizeKeyword(k) {
    if (typeof k !== "string")
        return String(k);
    return k.startsWith(":") ? k.slice(1) : k;
}
export function keyword(nsOrName, name) {
    const ns = normalizeKeyword(nsOrName);
    if (name === undefined)
        return ns;
    return `${ns}/${normalizeKeyword(name)}`;
}
export function namespaceOf(k) {
    if (k == null)
        return undefined;
    const s = normalizeKeyword(k);
    const i = s.lastIndexOf("/");
    return i >= 0 ? s.slice(0, i) : undefined;
}
export function nameOf(k) {
    if (k == null)
        return "";
    const s = normalizeKeyword(k);
    const i = s.lastIndexOf("/");
    return i >= 0 ? s.slice(i + 1) : s;
}
export function qualify(defaultNs, k) {
    const n = normalizeKeyword(k);
    return namespaceOf(n) ? n : keyword(defaultNs, nameOf(n));
}
export function addSuffix(k, suffix) {
    const ns = namespaceOf(k);
    return ns ? keyword(ns, `${nameOf(k)}${suffix}`) : `${nameOf(k)}${suffix}`;
}
export function selectKeys(obj, keys) {
    const out = {};
    if (!obj)
        return out;
    for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(obj, k))
            out[k] = obj[k];
    }
    return out;
}
export function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}
//# sourceMappingURL=keys.js.map