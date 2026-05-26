export interface BigConfigDelimiters {
    tagOpen?: string;
    tagClose?: string;
    filterOpen?: string;
    filterClose?: string;
    tagSecond?: string;
    shortCommentSecond?: string;
    "tag-open"?: string;
    "tag-close"?: string;
    "filter-open"?: string;
    "filter-close"?: string;
    "tag-second"?: string;
    "short-comment-second"?: string;
}
export declare function normalizeDelimiters(delimiters?: BigConfigDelimiters): Required<Pick<BigConfigDelimiters, "tagOpen" | "tagClose" | "filterOpen" | "filterClose" | "tagSecond" | "shortCommentSecond">>;
export declare function whitespaceControl(input: string, delimiters?: BigConfigDelimiters): string;
