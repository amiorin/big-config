#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ENV, EXIT, type Opts } from "./keys.js";
import { parseArgs, printStepFn, runSteps } from "./workflow.js";
import { createPrintErrorStepFn } from "./step-fns.js";

function parseCli(argv: string[]): { config?: string; args: string[] } {
  const args: string[] = [];
  let config: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--config" || a === "-c") {
      config = argv[++i];
    } else {
      args.push(a);
    }
  }
  return { config, args };
}

async function runWithConfig(configPath: string, args: string[]): Promise<Opts> {
  const full = resolve(configPath);
  if (!existsSync(full)) throw new Error(`Config file not found: ${full}`);
  const mod: any = await import(pathToFileURL(full).href);
  const maybeName = args[0];
  const exported = maybeName && typeof mod[maybeName] === "function" ? mod[maybeName] : undefined;
  const f = exported ?? (typeof mod.default === "function" ? mod.default : undefined);
  const restArgs = exported ? args.slice(1) : args;
  const baseOpts = { [ENV]: "shell", ...(mod.opts ?? {}) };
  if (f) {
    const result = f.length <= 1
      ? await f(restArgs)
      : await f([printStepFn, createPrintErrorStepFn("big-config.workflow/end")], { ...baseOpts, ...parseArgs(restArgs) });
    return result ?? { [EXIT]: 0 };
  }
  return runSteps([printStepFn, createPrintErrorStepFn("big-config.workflow/end")], { ...baseOpts, ...parseArgs(restArgs) });
}

async function main(): Promise<void> {
  const { config, args } = parseCli(process.argv.slice(2));
  const result = config
    ? await runWithConfig(config, args)
    : runSteps([printStepFn, createPrintErrorStepFn("big-config.workflow/end")], { [ENV]: "shell", ...parseArgs(args) });
  const exit = Number.isInteger(result?.[EXIT]) ? result[EXIT] : 0;
  process.exit(exit);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
