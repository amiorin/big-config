import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render as selmerRender, withoutEscaping, type RenderOptions } from "selmer";
import "./selmer-filters.js";
import { createWorkflow } from "./core.js";
import { RENDER_MODULE, RENDER_PROFILE, RENDER_TEMPLATES, STEP_MODULE, STEP_PROFILE, type Opts } from "./keys.js";
import { normalizeDelimiters, type BigConfigDelimiters, whitespaceControl } from "./selmer-filters.js";
import { toFn } from "./utils.js";

export type TransformOption = "raw" | ":raw" | "only" | ":only";
export type FileMap = Record<string, string> | Map<string, string>;
export type Transform = [string | ((key: string, data: Opts) => string), string?, FileMap?, BigConfigDelimiters?, ...TransformOption[]];

export interface TemplateSpec extends Opts {
  template: string;
  "target-dir": string;
  targetDir?: string;
  overwrite?: boolean | "delete" | ":delete";
  transform?: Transform[];
  "data-fn"?: unknown;
  dataFn?: unknown;
  "template-fn"?: unknown;
  templateFn?: unknown;
  "post-process-fn"?: unknown;
  postProcessFn?: unknown;
}

export const nonReplacedExts = new Set(["jpg", "jpeg", "png", "gif", "bmp", "bin"]);
export { nonReplacedExts as "*non-replaced-exts*" };

const templateKeys = new Set([
  "template", "target-dir", "targetDir", "overwrite", "data-fn", "dataFn", "template-fn", "templateFn", "post-process-fn", "postProcessFn", "transform"
]);

function selmer(input: string, data: Opts, delimiters?: BigConfigDelimiters): string {
  const d = normalizeDelimiters(delimiters);
  const opts: RenderOptions = {
    tagOpen: d.tagOpen,
    tagClose: d.tagClose,
    filterOpen: d.filterOpen,
    filterClose: d.filterClose,
    tagSecond: d.tagSecond,
    shortCommentSecond: d.shortCommentSecond
  };
  return withoutEscaping(() => selmerRender(whitespaceControl(input, delimiters), data, opts));
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) throw Object.assign(new Error(`Template directory not found: ${dir}`), { data: { dir } });
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(p));
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

function ensureParent(file: string): void {
  mkdirSync(dirname(file), { recursive: true });
}

function fileExt(file: string): string {
  const ext = extname(file).replace(/^\./, "").toLowerCase();
  return ext;
}

export function copyDir({ srcDir, targetDir, data, delimiters }: { srcDir: string; targetDir: string; data?: Opts; delimiters?: BigConfigDelimiters }): void {
  for (const srcFile of walkFiles(srcDir)) {
    const rel = relative(srcDir, srcFile);
    const targetFile = join(targetDir, rel);
    ensureParent(targetFile);
    const replaceable = !nonReplacedExts.has(fileExt(srcFile));
    if (data && replaceable) {
      const content = selmer(readFileSync(srcFile, "utf8"), data, delimiters);
      writeFileSync(targetFile, content);
    } else {
      cpSync(srcFile, targetFile);
    }
    try { chmodSync(targetFile, statSync(srcFile).mode); } catch { /* best effort */ }
  }
}

function entriesOfFiles(files?: FileMap): Array<[string, string]> {
  if (!files) return [];
  if (files instanceof Map) return [...files.entries()];
  return Object.entries(files);
}

function isDelimiterObject(x: unknown): x is BigConfigDelimiters {
  return !!x && typeof x === "object" && !Array.isArray(x) && !(x instanceof Map);
}

function parseTransform(spec: any[]): {
  src: string | ((key: string, data: Opts) => string);
  target?: string;
  files?: FileMap;
  delimiters?: BigConfigDelimiters;
  opts: Set<"raw" | "only">;
} {
  if (!Array.isArray(spec) || spec.length === 0) throw new Error("Invalid transform entry");
  const [src, ...rest0] = spec;
  let rest = [...rest0];
  const opts = new Set<"raw" | "only">();
  rest = rest.filter((x) => {
    if (x === "raw" || x === ":raw") { opts.add("raw"); return false; }
    if (x === "only" || x === ":only") { opts.add("only"); return false; }
    return true;
  });
  let target: string | undefined;
  let files: FileMap | undefined;
  let delimiters: BigConfigDelimiters | undefined;
  if (typeof rest[0] === "string") target = rest.shift();
  if (rest[0] instanceof Map) files = rest.shift();
  else if (isDelimiterObject(rest[0])) {
    const maybe = rest[0] as Record<string, unknown>;
    const delimiterKeys = ["tagOpen", "tag-open", "tagClose", "tag-close", "filterOpen", "filter-open", "filterClose", "filter-close", "tagSecond", "tag-second", "shortCommentSecond", "short-comment-second"];
    if (delimiterKeys.some((k) => k in maybe)) delimiters = rest.shift() as BigConfigDelimiters;
    else files = rest.shift() as FileMap;
  }
  if (!delimiters && isDelimiterObject(rest[0])) delimiters = rest.shift() as BigConfigDelimiters;
  return { src, target, files, delimiters, opts };
}

export function copyTemplateDir(args: {
  templateDir: string;
  targetDir: string;
  data: Opts;
  src: string | ((key: string, data: Opts) => string);
  target?: string;
  files?: FileMap;
  delimiters?: BigConfigDelimiters;
  opts?: Iterable<TransformOption>;
}): void {
  const data = args.data ?? {};
  const opts = new Set([...(args.opts ?? [])].map((x) => String(x).replace(/^:/, "")));
  const raw = opts.has("raw");
  const only = opts.has("only");
  const targetSuffix = args.target ? selmer(args.target, data, args.delimiters) : "";
  const targetBase = targetSuffix ? join(args.targetDir, targetSuffix) : args.targetDir;
  const files = entriesOfFiles(args.files);

  if (typeof args.src === "function") {
    if (files.length === 0) throw new Error("Files is required when src is a function");
    for (const [key, to] of files) {
      const rawContent = String(args.src(key, data));
      const content = raw ? rawContent : selmer(rawContent, data, args.delimiters);
      const targetFile = join(targetBase, selmer(to, data, args.delimiters));
      ensureParent(targetFile);
      writeFileSync(targetFile, content);
    }
    return;
  }

  const srcRendered = selmer(args.src, data, args.delimiters);
  const srcDir = join(args.templateDir, srcRendered);
  if (files.length === 0) {
    copyDir({ srcDir, targetDir: targetBase, data: raw ? undefined : data, delimiters: args.delimiters });
    return;
  }

  if (!only) copyDir({ srcDir, targetDir: targetBase, data: raw ? undefined : data, delimiters: args.delimiters });
  for (const [from, to] of files) {
    const renderedTo = selmer(to, data, args.delimiters);
    const srcFile = join(srcDir, from);
    const targetFile = join(targetBase, renderedTo);
    if (!only) rmSync(join(targetBase, from), { force: true });
    ensureParent(targetFile);
    const replaceable = !raw && !nonReplacedExts.has(fileExt(srcFile));
    if (replaceable) writeFileSync(targetFile, selmer(readFileSync(srcFile, "utf8"), data, args.delimiters));
    else cpSync(srcFile, targetFile);
    try { chmodSync(targetFile, statSync(srcFile).mode); } catch { /* best effort */ }
  }
}

export function resolveTemplateDir(template: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const packageRoot = dirname(here.endsWith(`${resolve(".").split(/[\\/]/).pop()}`) ? here : here);
  const candidates = [
    isAbsolute(template) ? template : undefined,
    resolve(process.cwd(), template),
    resolve(process.cwd(), "src", "resources", template),
    resolve(process.cwd(), "resources", template),
    resolve(here, "..", template),
    resolve(here, "..", "resources", template),
    resolve(here, "..", "resources", "big-config", template),
    resolve(packageRoot, "resources", template),
    resolve(packageRoot, "resources", "big-config", template)
  ].filter(Boolean) as string[];
  for (const c of candidates) if (existsSync(c) && statSync(c).isDirectory()) return realpathSync(c);
  throw Object.assign(new Error("Template resource not found"), { data: { template, candidates } });
}

function templateTargetDir(edn: TemplateSpec): string {
  return edn["target-dir"] ?? edn.targetDir;
}

function getMultiOption(value: unknown): unknown[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function render(opts: Opts): Opts {
  const templates = opts[RENDER_TEMPLATES] as TemplateSpec[] | undefined;
  if (templates == null) throw new TypeError(":big-config.render/templates should never be nil");
  for (const inputEdn of templates) {
    const dataFn = toFn<(data: Opts, opts: Opts) => Opts>(inputEdn["data-fn"] ?? inputEdn.dataFn, (data) => data);
    const templateFn = toFn<(data: Opts, edn: TemplateSpec) => TemplateSpec>(inputEdn["template-fn"] ?? inputEdn.templateFn, (_data, edn) => edn);
    const dataBase: Opts = {};
    for (const [k, v] of Object.entries(inputEdn)) if (!templateKeys.has(k)) dataBase[k] = v;
    const data = dataFn({
      ...dataBase,
      module: opts[STEP_MODULE] ?? opts[RENDER_MODULE],
      profile: opts[STEP_PROFILE] ?? opts[RENDER_PROFILE]
    }, opts);
    const edn = templateFn(data, inputEdn);
    const template = edn.template;
    const targetDir = templateTargetDir(edn);
    if (!template || !targetDir) throw Object.assign(new Error("Invalid template"), { data: { edn } });
    if (!edn.transform) throw new TypeError(":transform not defined");
    if (edn.transform.length === 0) throw new TypeError(":transform is an empty list");
    const templateDir = resolveTemplateDir(template);
    if (existsSync(targetDir)) {
      if (edn.overwrite === "delete" || edn.overwrite === ":delete") rmSync(targetDir, { recursive: true, force: true });
      else if (!edn.overwrite) throw Object.assign(new Error(`${targetDir} already exists (and :overwrite was not true).`), { data: {} });
    }
    for (const spec of edn.transform) {
      const parsed = parseTransform(spec as any[]);
      copyTemplateDir({
        templateDir,
        targetDir,
        data,
        src: parsed.src,
        target: parsed.target,
        files: parsed.files,
        delimiters: parsed.delimiters,
        opts: parsed.opts
      });
    }
    for (const f0 of getMultiOption(edn["post-process-fn"] ?? edn.postProcessFn)) {
      const f = toFn<(edn: TemplateSpec, data: Opts) => void>(f0, () => undefined);
      f(edn, data);
    }
  }
  return { ...opts, "big-config/exit": 0, "big-config/err": null };
}

export const templates = createWorkflow({
  firstStep: "big-config.render/start",
  wireFn: (step) => {
    switch (step) {
      case "big-config.render/start": return [render, "big-config.render/end"];
      case "big-config.render/end": return [(x) => x];
      default: return [(x) => x];
    }
  }
});

export function discover(parentDir: string): string[] {
  const out: string[] = [];
  function walk(dir: string, depth: number): void {
    if (depth > 2) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const p = join(dir, entry.name);
      out.push(relative(parentDir, p));
      walk(p, depth + 1);
    }
  }
  walk(parentDir, 1);
  return out.filter(Boolean);
}

export { copyDir as "copy-dir", copyTemplateDir as "copy-template-dir", whitespaceControl };
