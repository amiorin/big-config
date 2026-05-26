import { type Keyword, type Opts } from "../keys.js";
import { Construct } from "./core.js";
export declare function bucket(fqn: Keyword, ...xs: string[]): Construct[];
export declare function sqs(fqn: Keyword): Construct[];
export declare function kms(fqn: Keyword): Construct[];
export declare function provider({ region, bucket, module, assumeRole, "assume-role": assumeRoleKebab }: {
    region: string;
    bucket: string;
    module: Keyword;
    assumeRole?: string;
    "assume-role"?: string;
}): Opts;
export declare function constructsToObject(constructs: Construct[]): Opts;
export { constructsToObject as "constructs->object" };
