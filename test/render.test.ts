import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { RENDER_MODULE, RENDER_TEMPLATES } from "../src/keys.js";
import { copyTemplateDir, render, whitespaceControl } from "../src/render.js";

const dirs: string[] = [];
function tempDir(): string {
  const d = mkdtempSync(join(tmpdir(), "big-config-render-test-"));
  dirs.push(d);
  return d;
}

afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe("render", () => {
  it("renders templates from an absolute local dependency path", () => {
    const root = tempDir();
    const template = join(root, "template");
    const target = join(root, "target");
    mkdirSync(join(template, "root"), { recursive: true });
    writeFileSync(join(template, "root", "hello.txt"), "Hello {{ module }} {{ name }}");

    const res = render({
      [RENDER_MODULE]: "infra",
      [RENDER_TEMPLATES]: [{ template, "target-dir": target, overwrite: true, transform: [["root"]], name: "world" }]
    });
    expect(res["big-config/exit"]).toBe(0);
    expect(readFileSync(join(target, "hello.txt"), "utf8")).toBe("Hello infra world");
  });

  it("supports function sources and raw transforms", () => {
    const root = tempDir();
    copyTemplateDir({
      templateDir: root,
      targetDir: join(root, "target"),
      data: { module: "infra" },
      src: () => "{{ module }}",
      files: { inventory: "inventory.txt" }
    });
    copyTemplateDir({
      templateDir: root,
      targetDir: join(root, "target"),
      data: { module: "infra" },
      src: () => "{{ module }}",
      files: { raw: "raw.txt" },
      opts: ["raw"]
    });
    expect(readFileSync(join(root, "target", "inventory.txt"), "utf8")).toBe("infra");
    expect(readFileSync(join(root, "target", "raw.txt"), "utf8")).toBe("{{ module }}");
  });

  it("implements Selmer whitespace control workaround", () => {
    expect(whitespaceControl("a {{- name -}} b")).toBe("a{{ name }}b");
  });
});
