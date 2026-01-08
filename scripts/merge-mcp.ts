#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { applyEdits, modify, parse } from "jsonc-parser";

const args = process.argv.slice(2);
const options = {
  keep: false,
  force: false,
};
const payloadArgs: string[] = [];

for (const arg of args) {
  if (arg === "--keep") {
    options.keep = true;
    continue;
  }
  if (arg === "--force") {
    options.force = true;
    continue;
  }
  if (arg.startsWith("-")) {
    console.error(`Unknown option: ${arg}`);
    process.exit(1);
  }
  payloadArgs.push(arg);
}

type McpEntry = Record<string, unknown>;

type McpPayload = {
  mcp?: Record<string, McpEntry>;
};

function detectEol(text: string) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function parseJsonc(text: string, label: string) {
  const errors: { error: number; offset: number; length: number }[] = [];
  const data = parse(text, errors, { allowTrailingComma: true, disallowComments: false });
  if (errors.length) {
    const first = errors[0];
    throw new Error(`Failed to parse ${label} at offset ${first.offset}.`);
  }
  if (!data || typeof data !== "object") {
    throw new Error(`Expected ${label} to be an object.`);
  }
  return data as Record<string, unknown>;
}

function readPayload(filePath: string): McpPayload {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = parseJsonc(raw, filePath);
  return data as McpPayload;
}

function resolvePayloads(cwd: string, explicit: string[]) {
  if (explicit.length) {
    return explicit.map((item) => path.resolve(cwd, item));
  }

  const payloadDir = path.join(cwd, ".opencode", "mcp");
  if (!fs.existsSync(payloadDir)) {
    return [];
  }

  const entries = fs.readdirSync(payloadDir, { withFileTypes: true });
  return entries
    .filter((entry) =>
      entry.isFile() &&
      (entry.name.endsWith(".json") || entry.name.endsWith(".jsonc")),
    )
    .map((entry) => path.join(payloadDir, entry.name));
}

function getConfigPath(cwd: string) {
  const jsoncPath = path.join(cwd, "opencode.jsonc");
  if (fs.existsSync(jsoncPath)) return jsoncPath;
  return path.join(cwd, "opencode.json");
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function main() {
  const cwd = process.cwd();
  const payloadFiles = resolvePayloads(cwd, payloadArgs);

  if (!payloadFiles.length) {
    console.log("No MCP payloads found. Nothing to merge.");
    return;
  }

  const payloads = payloadFiles.map((filePath) => ({ filePath, payload: readPayload(filePath) }));
  const mcpEntries: [string, McpEntry][] = [];

  for (const { filePath, payload } of payloads) {
    if (!payload.mcp || typeof payload.mcp !== "object") {
      console.warn(`Skipping ${filePath}: missing mcp object.`);
      continue;
    }
    for (const [name, entry] of Object.entries(payload.mcp)) {
      if (!entry || typeof entry !== "object") {
        console.warn(`Skipping ${filePath}: mcp.${name} is not an object.`);
        continue;
      }
      mcpEntries.push([name, entry]);
    }
  }

  if (!mcpEntries.length) {
    console.log("No valid MCP entries found. Nothing to merge.");
    return;
  }

  const configPath = getConfigPath(cwd);
  const configExists = fs.existsSync(configPath);
  let configText = configExists ? fs.readFileSync(configPath, "utf8") : "{}\n";
  const eol = detectEol(configText);

  const configData = parseJsonc(configText, path.basename(configPath));
  const existingMcp =
    configData.mcp && typeof configData.mcp === "object"
      ? (configData.mcp as Record<string, unknown>)
      : {};

  const added: string[] = [];
  const skipped: string[] = [];
  const updated: string[] = [];

  for (const [name, entry] of mcpEntries) {
    const exists = Object.prototype.hasOwnProperty.call(existingMcp, name);
    if (exists && !options.force) {
      skipped.push(name);
      continue;
    }

    const edits = modify(
      configText,
      ["mcp", name],
      entry,
      {
        formattingOptions: {
          insertSpaces: true,
          tabSize: 2,
          eol,
        },
      },
    );

    if (edits.length) {
      configText = applyEdits(configText, edits);
    }

    if (exists) {
      updated.push(name);
    } else {
      added.push(name);
    }
  }

  if (added.length || updated.length) {
    const normalized = configText.endsWith(eol) ? configText : `${configText}${eol}`;
    fs.writeFileSync(configPath, normalized, "utf8");
    console.log(`Updated ${path.basename(configPath)}.`);
  } else {
    console.log(`No changes needed in ${path.basename(configPath)}.`);
  }

  if (!options.keep) {
    const payloadDir = path.join(cwd, ".opencode", "mcp");
    const appliedDir = path.join(payloadDir, ".applied");
    ensureDir(appliedDir);

    for (const filePath of payloadFiles) {
      const relative = path.relative(payloadDir, filePath);
      if (relative.startsWith("..") || relative.startsWith(`.${path.sep}`)) {
        continue;
      }
      if (relative.startsWith(`.applied${path.sep}`)) {
        continue;
      }

      const baseName = path.basename(filePath);
      let target = path.join(appliedDir, baseName);
      if (fs.existsSync(target)) {
        const stamp = Date.now();
        target = path.join(appliedDir, `${baseName}.${stamp}`);
      }
      fs.renameSync(filePath, target);
    }
  }

  if (added.length) {
    console.log(`Added MCP servers: ${added.join(", ")}`);
  }
  if (updated.length) {
    console.log(`Updated MCP servers: ${updated.join(", ")}`);
  }
  if (skipped.length) {
    console.log(`Skipped existing MCP servers: ${skipped.join(", ")}`);
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`MCP merge failed: ${message}`);
  process.exit(1);
}
