import "../selmer-filters.js";
import { nameOf, namespaceOf, keyword, type Keyword, type Opts } from "../keys.js";

export function addSuffix(fqn: Keyword, suffix: string): Keyword {
  const ns = namespaceOf(fqn);
  return ns ? keyword(ns, `${nameOf(fqn)}${suffix}`) : `${nameOf(fqn)}${suffix}`;
}

export function fqnToName(fqn: Keyword, c = "_"): string {
  const sanitize = (s: string) => s.replace(/[-\.]/g, c);
  const ns = namespaceOf(fqn);
  const n = sanitize(nameOf(fqn));
  return ns ? `${sanitize(ns)}${c}${n}` : n;
}

function removeHttps(url: string): string {
  return url.replace(/^https:\/\//, "");
}

export interface To {
  reference(property: Keyword): string;
  construct(): Opts;
  arn(awsAccountId: string, region?: string): string | undefined;
  rootArn(): string | undefined;
}

export class Construct implements To {
  constructor(public group: Keyword, public type: Keyword, public fqn: Keyword, public block: any) {}

  reference(property: Keyword): string {
    return `\${${nameOf(this.group)}.${nameOf(this.type)}.${fqnToName(this.fqn)}.${nameOf(property)}}`;
  }

  construct(): Opts {
    return { [nameOf(this.group)]: { [nameOf(this.type)]: { [fqnToName(this.fqn)]: this.block } } };
  }

  arn(awsAccountId: string, region?: string): string | undefined {
    const group = nameOf(this.group);
    const type = nameOf(this.type);
    if (group === "resource" && type === "aws_iam_role") return `arn:aws:iam::${awsAccountId}:role/${this.block.name}`;
    if (group === "resource" && type === "aws_iam_openid_connect_provider") return `arn:aws:iam::${awsAccountId}:oidc-provider/${removeHttps(this.block.url)}`;
    if (group === "resource" && type === "aws_secretsmanager_secret" && region) return `arn:aws:secretsmanager:${region}:${awsAccountId}:secret/${this.block.name}`;
    return undefined;
  }

  rootArn(): string | undefined {
    if (nameOf(this.group) === "data" && nameOf(this.type) === "aws_caller_identity" && nameOf(this.fqn) === "current" && JSON.stringify(this.block) === "{}") {
      return `arn:aws:iam::${this.reference("account_id")}:root`;
    }
    return undefined;
  }
}

export function construct(this_: Construct): Opts {
  return this_.construct();
}

export function reference(this_: Construct, property: Keyword): string {
  return this_.reference(property);
}

export function arn(this_: Construct, awsAccountId: string, region?: string): string | undefined {
  return this_.arn(awsAccountId, region);
}

export function rootArn(this_: Construct): string | undefined {
  return this_.rootArn();
}

export const callerIdentity = new Construct("data", "aws_caller_identity", "current", {});

export { addSuffix as "add-suffix", fqnToName as "fqn->name", callerIdentity as "caller-identity", rootArn as "root-arn" };
