import { deepMerge } from "../utils.js";
import { nameOf, type Keyword, type Opts } from "../keys.js";
import { Construct, addSuffix, callerIdentity, construct, fqnToName, reference, rootArn } from "./core.js";

export function bucket(fqn: Keyword, ...xs: string[]): Construct[] {
  if (xs.length > 0) return bucket(addSuffix(fqn, `-${xs[0]}`), ...xs.slice(1));
  return [new Construct("resource", "aws_s3_bucket", fqn, [{ bucket: fqnToName(fqn, "-") }])];
}

export function sqs(fqn: Keyword): Construct[] {
  return [new Construct("resource", "aws_sqs_queue", fqn, { name: fqnToName(fqn) })];
}

export function kms(fqn: Keyword): Construct[] {
  const kmsKey = new Construct("resource", "aws_kms_key", fqn, {});
  const policy = new Construct("data", "aws_iam_policy_document", addSuffix(fqn, "-data-policy"), [{
    statement: [{
      actions: ["kms:*"],
      effect: "Allow",
      resources: ["*"],
      principals: [{ identifiers: [rootArn(callerIdentity)], type: "AWS" }]
    }]
  }]);
  return [
    callerIdentity,
    policy,
    kmsKey,
    new Construct("resource", "aws_kms_key_policy", addSuffix(fqn, "-resource-policy"), {
      key_id: reference(kmsKey, "id"),
      policy: reference(policy, "json")
    })
  ];
}

export function provider({ region, bucket, module, assumeRole, "assume-role": assumeRoleKebab }: { region: string; bucket: string; module: Keyword; assumeRole?: string; "assume-role"?: string }): Opts {
  const role = assumeRole ?? assumeRoleKebab;
  const key = `${nameOf(module)}.tfstate`;
  const assume_role = role && role.trim().length > 0 ? { assume_role: { role_arn: role } } : {};
  return {
    provider: { aws: { region, ...assume_role } },
    terraform: {
      backend: { s3: { bucket, encrypt: true, key, region, ...assume_role } },
      required_providers: { aws: { source: "hashicorp/aws", version: "~> 5.0" } },
      required_version: ">= 1.8.0"
    }
  };
}

export function constructsToObject(constructs: Construct[]): Opts {
  return deepMerge(...constructs.map((c) => construct(c)));
}

export { constructsToObject as "constructs->object" };
