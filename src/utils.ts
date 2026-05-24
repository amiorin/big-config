import { createHash } from "node:crypto";
import { cwd } from "node:process";
import { isPlainObject, normalizeKeyword, namespaceOf, nameOf, type Keyword, type Opts } from "./keys.js";

export type AnyFn = (...args: any[]) => any;

const functionRegistry = new Map<string, AnyFn>();

export function registerFunction(name: string, fn: AnyFn): void {
  functionRegistry.set(name, fn);
}

export function unregisterFunction(name: string): void {
  functionRegistry.delete(name);
}

export function resolveRegisteredFunction(name: string): AnyFn | undefined {
  return functionRegistry.get(name);
}

export function toFn<T extends AnyFn = AnyFn>(value: unknown, defaultValue?: T): T {
  if (typeof value === "function") return value as T;
  if (typeof value === "string") {
    const fn = functionRegistry.get(value) ?? functionRegistry.get(normalizeKeyword(value));
    if (fn) return fn as T;
    if (value.startsWith(":")) {
      const key = normalizeKeyword(value);
      return (((m: Opts) => m?.[key]) as unknown) as T;
    }
    throw Object.assign(new Error(`Cannot resolve function '${value}'`), {
      data: { "big-config/err-kind": "big-config.utils/not-a-fn", value }
    });
  }
  if (value == null) {
    if (defaultValue !== undefined) return defaultValue;
    throw Object.assign(new Error("Required value is nil; expected a function, symbol or string"), {
      data: { "big-config/err-kind": "big-config.utils/not-a-fn", value }
    });
  }
  throw Object.assign(new Error("Cannot coerce value to a function"), {
    data: { "big-config/err-kind": "big-config.utils/not-a-fn", value, type: typeof value }
  });
}

export { toFn as "->fn" };

export function deepMerge<T extends Opts>(...maps: Array<Opts | undefined | null>): T {
  const result: Opts = {};
  for (const m of maps) {
    if (!m) continue;
    for (const [k, v] of Object.entries(m)) {
      if (isPlainObject(result[k]) && isPlainObject(v)) result[k] = deepMerge(result[k], v);
      else result[k] = v;
    }
  }
  return result as T;
}

export function sortNestedMap<T>(value: T): T {
  if (Array.isArray(value)) return value.map((x) => sortNestedMap(x)) as T;
  if (isPlainObject(value)) {
    const out: Opts = {};
    for (const key of Object.keys(value).sort()) out[key] = sortNestedMap(value[key]);
    return out as T;
  }
  return value;
}

export function deepSortMaps<T>(value: T): T {
  return sortNestedMap(value);
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortNestedMap(value));
}

export function hashString(value: string, length = 8): string {
  return createHash("sha256").update(value).digest("hex").slice(0, length);
}

export function portAssigner(service: unknown): number {
  const hash = parseInt(hashString(`${cwd()}${stableStringify(service)}`, 8), 16);
  return (Math.abs(hash) % 64000) + 1024;
}

export function assertArgsPresent(args: Record<string, unknown>): void {
  for (const [name, value] of Object.entries(args)) {
    if (value == null) throw new TypeError(`Argument ${name} is nil`);
  }
}

export function keywordToPath(kw: Keyword): string {
  const s = normalizeKeyword(kw);
  const ns = namespaceOf(s);
  const full = ns ? `${ns}/${nameOf(s)}` : nameOf(s);
  return full.replaceAll(".", "/");
}

export function keywordToName(kw: Keyword): string {
  const s = normalizeKeyword(kw);
  const ns = namespaceOf(s);
  const full = ns ? `${ns}-${nameOf(s)}` : nameOf(s);
  return full.replaceAll("/", "-").replaceAll(".", "-");
}

export function clone<T>(value: T): T {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((x) => clone(x)) as T;
  const out: Opts = {};
  for (const [k, v] of Object.entries(value as Opts)) out[k] = clone(v);
  return out as T;
}

export function getIn(obj: Opts | undefined | null, path: string[]): any {
  let cur: any = obj;
  for (const p of path) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function assocIn<T extends Opts>(obj: T, path: string[], value: any): T {
  if (path.length === 0) return value;
  const out: Opts = clone(obj ?? {}) as Opts;
  let cur = out;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i]!;
    cur[k] = isPlainObject(cur[k]) ? clone(cur[k]) : {};
    cur = cur[k];
  }
  cur[path[path.length - 1]!] = value;
  return out as T;
}

export function updateIn<T extends Opts>(obj: T, path: string[], f: (value: any) => any): T {
  return assocIn(obj, path, f(getIn(obj, path)));
}

export function debug<T>(body: (tap: (value: unknown) => void) => T): { result: T; taps: unknown[] } {
  const taps: unknown[] = [];
  const result = body((value) => taps.push(value));
  return { result, taps: deepSortMaps(taps) };
}
