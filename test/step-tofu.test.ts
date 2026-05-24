import { describe, expect, it } from "vitest";
import { parse } from "../src/step.js";
import { Construct, callerIdentity, construct, fqnToName, reference, rootArn } from "../src/big-tofu/core.js";
import { bucket, kms, provider, sqs } from "../src/big-tofu/create.js";

describe("legacy step parser", () => {
  it("parses module/profile syntax", () => {
    expect(parse("build exec -- module profile ansible-playbook main.yml --tags focus")).toEqual([
      ["build", "exec"],
      ["ansible-playbook main.yml --tags focus"],
      "module",
      "profile"
    ]);
    expect(parse("build tofu:init tofu:plan unlock-any -- module profile -auto-approve")).toEqual([
      ["build", "exec", "unlock-any"],
      ["tofu init -auto-approve", "tofu plan -auto-approve"],
      "module",
      "profile"
    ]);
  });
});

describe("big-tofu", () => {
  it("creates references and constructs", () => {
    const c = new Construct("resource", "aws_sqs_queue", "alpha/big-sqs", { name: "q" });
    expect(reference(c, "id")).toBe("${resource.aws_sqs_queue.alpha_big_sqs.id}");
    expect(construct(c)).toEqual({ resource: { aws_sqs_queue: { alpha_big_sqs: { name: "q" } } } });
    expect(fqnToName("alpha/big-sqs", "-")).toBe("alpha-big-sqs");
  });

  it("creates stdlib resources", () => {
    expect(bucket("alpha/big-bucket", "foo", "bar")[0].fqn).toBe("alpha/big-bucket-foo-bar");
    expect(sqs("alpha/big-sqs")[0].block).toEqual({ name: "alpha_big_sqs" });
    expect(rootArn(callerIdentity)).toBe("arn:aws:iam::${data.aws_caller_identity.current.account_id}:root");
    expect(kms("alpha/big-kms")).toHaveLength(4);
    expect(provider({ region: "eu-west-1", bucket: "state", module: "tofu" }).terraform.backend.s3.key).toBe("tofu.tfstate");
  });
});
