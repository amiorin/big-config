import "../selmer-filters.js";
import { nameOf, namespaceOf, keyword } from "../keys.js";
export function addSuffix(fqn, suffix) {
    const ns = namespaceOf(fqn);
    return ns ? keyword(ns, `${nameOf(fqn)}${suffix}`) : `${nameOf(fqn)}${suffix}`;
}
export function fqnToName(fqn, c = "_") {
    const sanitize = (s) => s.replace(/[-\.]/g, c);
    const ns = namespaceOf(fqn);
    const n = sanitize(nameOf(fqn));
    return ns ? `${sanitize(ns)}${c}${n}` : n;
}
function removeHttps(url) {
    return url.replace(/^https:\/\//, "");
}
export class Construct {
    group;
    type;
    fqn;
    block;
    constructor(group, type, fqn, block) {
        this.group = group;
        this.type = type;
        this.fqn = fqn;
        this.block = block;
    }
    reference(property) {
        return `\${${nameOf(this.group)}.${nameOf(this.type)}.${fqnToName(this.fqn)}.${nameOf(property)}}`;
    }
    construct() {
        return { [nameOf(this.group)]: { [nameOf(this.type)]: { [fqnToName(this.fqn)]: this.block } } };
    }
    arn(awsAccountId, region) {
        const group = nameOf(this.group);
        const type = nameOf(this.type);
        if (group === "resource" && type === "aws_iam_role")
            return `arn:aws:iam::${awsAccountId}:role/${this.block.name}`;
        if (group === "resource" && type === "aws_iam_openid_connect_provider")
            return `arn:aws:iam::${awsAccountId}:oidc-provider/${removeHttps(this.block.url)}`;
        if (group === "resource" && type === "aws_secretsmanager_secret" && region)
            return `arn:aws:secretsmanager:${region}:${awsAccountId}:secret/${this.block.name}`;
        return undefined;
    }
    rootArn() {
        if (nameOf(this.group) === "data" && nameOf(this.type) === "aws_caller_identity" && nameOf(this.fqn) === "current" && JSON.stringify(this.block) === "{}") {
            return `arn:aws:iam::${this.reference("account_id")}:root`;
        }
        return undefined;
    }
}
export function construct(this_) {
    return this_.construct();
}
export function reference(this_, property) {
    return this_.reference(property);
}
export function arn(this_, awsAccountId, region) {
    return this_.arn(awsAccountId, region);
}
export function rootArn(this_) {
    return this_.rootArn();
}
export const callerIdentity = new Construct("data", "aws_caller_identity", "current", {});
export { addSuffix as "add-suffix", fqnToName as "fqn->name", callerIdentity as "caller-identity", rootArn as "root-arn" };
//# sourceMappingURL=core.js.map