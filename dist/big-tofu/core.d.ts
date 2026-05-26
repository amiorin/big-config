import "../selmer-filters.js";
import { type Keyword, type Opts } from "../keys.js";
export declare function addSuffix(fqn: Keyword, suffix: string): Keyword;
export declare function fqnToName(fqn: Keyword, c?: string): string;
export interface To {
    reference(property: Keyword): string;
    construct(): Opts;
    arn(awsAccountId: string, region?: string): string | undefined;
    rootArn(): string | undefined;
}
export declare class Construct implements To {
    group: Keyword;
    type: Keyword;
    fqn: Keyword;
    block: any;
    constructor(group: Keyword, type: Keyword, fqn: Keyword, block: any);
    reference(property: Keyword): string;
    construct(): Opts;
    arn(awsAccountId: string, region?: string): string | undefined;
    rootArn(): string | undefined;
}
export declare function construct(this_: Construct): Opts;
export declare function reference(this_: Construct, property: Keyword): string;
export declare function arn(this_: Construct, awsAccountId: string, region?: string): string | undefined;
export declare function rootArn(this_: Construct): string | undefined;
export declare const callerIdentity: Construct;
export { addSuffix as "add-suffix", fqnToName as "fqn->name", callerIdentity as "caller-identity", rootArn as "root-arn" };
