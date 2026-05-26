import { createHash } from "node:crypto";
import { cwd } from "node:process";
import { isPlainObject, normalizeKeyword, namespaceOf, nameOf } from "./keys.js";
const functionRegistry = new Map();
export function registerFunction(name, fn) {
    functionRegistry.set(name, fn);
}
export function unregisterFunction(name) {
    functionRegistry.delete(name);
}
export function resolveRegisteredFunction(name) {
    return functionRegistry.get(name);
}
export function toFn(value, defaultValue) {
    if (typeof value === "function")
        return value;
    if (typeof value === "string") {
        const fn = functionRegistry.get(value) ?? functionRegistry.get(normalizeKeyword(value));
        if (fn)
            return fn;
        if (value.startsWith(":")) {
            const key = normalizeKeyword(value);
            return ((m) => m?.[key]);
        }
        throw Object.assign(new Error(`Cannot resolve function '${value}'`), {
            data: { "big-config/err-kind": "big-config.utils/not-a-fn", value }
        });
    }
    if (value == null) {
        if (defaultValue !== undefined)
            return defaultValue;
        throw Object.assign(new Error("Required value is nil; expected a function, symbol or string"), {
            data: { "big-config/err-kind": "big-config.utils/not-a-fn", value }
        });
    }
    throw Object.assign(new Error("Cannot coerce value to a function"), {
        data: { "big-config/err-kind": "big-config.utils/not-a-fn", value, type: typeof value }
    });
}
export { toFn as "->fn" };
export function deepMerge(...maps) {
    const result = {};
    for (const m of maps) {
        if (!m)
            continue;
        for (const [k, v] of Object.entries(m)) {
            if (isPlainObject(result[k]) && isPlainObject(v))
                result[k] = deepMerge(result[k], v);
            else
                result[k] = v;
        }
    }
    return result;
}
export function sortNestedMap(value) {
    if (Array.isArray(value))
        return value.map((x) => sortNestedMap(x));
    if (isPlainObject(value)) {
        const out = {};
        for (const key of Object.keys(value).sort())
            out[key] = sortNestedMap(value[key]);
        return out;
    }
    return value;
}
export function deepSortMaps(value) {
    return sortNestedMap(value);
}
export function stableStringify(value) {
    return JSON.stringify(sortNestedMap(value));
}
export function hashString(value, length = 8) {
    return createHash("sha256").update(value).digest("hex").slice(0, length);
}
export function portAssigner(service) {
    const hash = parseInt(hashString(`${cwd()}${stableStringify(service)}`, 8), 16);
    return (Math.abs(hash) % 64000) + 1024;
}
export function assertArgsPresent(args) {
    for (const [name, value] of Object.entries(args)) {
        if (value == null)
            throw new TypeError(`Argument ${name} is nil`);
    }
}
export function keywordToPath(kw) {
    const s = normalizeKeyword(kw);
    const ns = namespaceOf(s);
    const full = ns ? `${ns}/${nameOf(s)}` : nameOf(s);
    return full.replaceAll(".", "/");
}
export function keywordToName(kw) {
    const s = normalizeKeyword(kw);
    const ns = namespaceOf(s);
    const full = ns ? `${ns}-${nameOf(s)}` : nameOf(s);
    return full.replaceAll("/", "-").replaceAll(".", "-");
}
export function clone(value) {
    if (value == null || typeof value !== "object")
        return value;
    if (Array.isArray(value))
        return value.map((x) => clone(x));
    const out = {};
    for (const [k, v] of Object.entries(value))
        out[k] = clone(v);
    return out;
}
export function getIn(obj, path) {
    let cur = obj;
    for (const p of path) {
        if (cur == null)
            return undefined;
        cur = cur[p];
    }
    return cur;
}
export function assocIn(obj, path, value) {
    if (path.length === 0)
        return value;
    const out = clone(obj ?? {});
    let cur = out;
    for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        cur[k] = isPlainObject(cur[k]) ? clone(cur[k]) : {};
        cur = cur[k];
    }
    cur[path[path.length - 1]] = value;
    return out;
}
export function updateIn(obj, path, f) {
    return assocIn(obj, path, f(getIn(obj, path)));
}
export function debug(body) {
    const taps = [];
    const result = body((value) => taps.push(value));
    return { result, taps: deepSortMaps(taps) };
}
//# sourceMappingURL=utils.js.map