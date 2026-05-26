import "./selmer-filters.js";
import { type Opts } from "./keys.js";
import { type BigConfigDelimiters, whitespaceControl } from "./selmer-filters.js";
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
export declare const nonReplacedExts: Set<string>;
export { nonReplacedExts as "*non-replaced-exts*" };
export declare function copyDir({ srcDir, targetDir, data, delimiters }: {
    srcDir: string;
    targetDir: string;
    data?: Opts;
    delimiters?: BigConfigDelimiters;
}): void;
export declare function copyTemplateDir(args: {
    templateDir: string;
    targetDir: string;
    data: Opts;
    src: string | ((key: string, data: Opts) => string);
    target?: string;
    files?: FileMap;
    delimiters?: BigConfigDelimiters;
    opts?: Iterable<TransformOption>;
}): void;
export declare function resolveTemplateDir(template: string): string;
export declare function render(opts: Opts): Opts;
export declare const templates: import("./core.js").WorkflowFn;
export declare function discover(parentDir: string): string[];
export { copyDir as "copy-dir", copyTemplateDir as "copy-template-dir", whitespaceControl };
