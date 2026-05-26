import { addFilter } from "selmer";
export function normalizeDelimiters(delimiters = {}) {
    return {
        tagOpen: delimiters.tagOpen ?? delimiters["tag-open"] ?? "{",
        tagClose: delimiters.tagClose ?? delimiters["tag-close"] ?? "}",
        filterOpen: delimiters.filterOpen ?? delimiters["filter-open"] ?? "{",
        filterClose: delimiters.filterClose ?? delimiters["filter-close"] ?? "}",
        tagSecond: delimiters.tagSecond ?? delimiters["tag-second"] ?? "%",
        shortCommentSecond: delimiters.shortCommentSecond ?? delimiters["short-comment-second"] ?? "#"
    };
}
export function whitespaceControl(input, delimiters = {}) {
    const d = normalizeDelimiters(delimiters);
    const openingTags = new Set([`${d.tagOpen}${d.filterOpen}-`, `${d.tagOpen}${d.tagSecond}-`]);
    const closingTags = new Set([`-${d.tagClose}${d.filterClose}`, `-${d.tagSecond}${d.tagClose}`]);
    let output = "";
    let rest = input;
    let tag = "";
    while (rest.length > 0) {
        const x = rest.slice(0, 1);
        rest = rest.slice(1);
        tag = `${tag}${x}`;
        if (tag.length === 4)
            tag = tag.slice(1);
        if (openingTags.has(tag)) {
            output = `${output.slice(0, Math.max(0, output.length - 2)).trimEnd()}${tag.slice(0, 2)}`;
        }
        else if (closingTags.has(tag)) {
            output = `${output.slice(0, Math.max(0, output.length - 2))}${tag.slice(1, 3)}`;
            rest = rest.trimStart();
        }
        else {
            output += x;
        }
    }
    return output;
}
// Match the filters BigConfig installs into Selmer at load time.
addFilter("lookup-env", (x) => process.env[String(x)]);
addFilter("->file", (n) => String(n).replaceAll(".", "/").replaceAll("-", "_"));
addFilter("remove-https", (url) => String(url).replace(/^https:\/\//, ""));
//# sourceMappingURL=selmer-filters.js.map