import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const options = {
  keep: false,
  force: false,
};
const payloadArgs = [];
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
function detectEol(text) {
  return text.includes(`\r
`)
    ? `\r
`
    : `
`;
}
function stripJsonComments(input) {
  let out = "";
  let inString = false;
  let stringChar = "";
  let escaped = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (inString) {
      out += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      out += char;
      continue;
    }
    if (char === "/" && next === "/") {
      while (
        i < input.length &&
        input[i] !==
          `
`
      ) {
        i += 1;
      }
      out += `
`;
      continue;
    }
    if (char === "/" && next === "*") {
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) {
        i += 1;
      }
      i += 1;
      continue;
    }
    out += char;
  }
  return out;
}
function stripTrailingCommas(input) {
  let out = "";
  let inString = false;
  let stringChar = "";
  let escaped = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (inString) {
      out += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      out += char;
      continue;
    }
    if (char === ",") {
      let j = i + 1;
      while (j < input.length && /\s/.test(input[j] ?? "")) {
        j += 1;
      }
      if (j < input.length && (input[j] === "}" || input[j] === "]")) {
        continue;
      }
    }
    out += char;
  }
  return out;
}
function parseJsonc(text, label) {
  const sanitized = stripTrailingCommas(stripJsonComments(text));
  let data;
  try {
    data = JSON.parse(sanitized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse error";
    throw new Error(`Failed to parse ${label}: ${message}`);
  }
  if (!data || typeof data !== "object") {
    throw new Error(`Expected ${label} to be an object.`);
  }
  return data;
}
function readPayload(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = parseJsonc(raw, filePath);
  return data;
}
function resolvePayloads(cwd, explicit) {
  if (explicit.length) {
    return explicit.map((item) => path.resolve(cwd, item));
  }
  const payloadDir = path.join(cwd, ".opencode", "mcp");
  if (!fs.existsSync(payloadDir)) {
    return [];
  }
  const entries = fs.readdirSync(payloadDir, { withFileTypes: true });
  return entries
    .filter(
      (entry) => entry.isFile() && (entry.name.endsWith(".json") || entry.name.endsWith(".jsonc")),
    )
    .map((entry) => path.join(payloadDir, entry.name));
}
function getConfigPath(cwd) {
  const jsoncPath = path.join(cwd, "opencode.jsonc");
  if (fs.existsSync(jsoncPath)) return jsoncPath;
  return path.join(cwd, "opencode.json");
}
function ensureDir(dirPath) {
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
  const mcpEntries = [];
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
  const configText = configExists
    ? fs.readFileSync(configPath, "utf8")
    : `{}
`;
  const eol = detectEol(configText);
  const configData = parseJsonc(configText, path.basename(configPath));
  const configObject = configData;
  const existingMcp =
    configObject.mcp && typeof configObject.mcp === "object" ? configObject.mcp : {};
  const added = [];
  const skipped = [];
  const updated = [];
  for (const [name, entry] of mcpEntries) {
    const exists = Object.prototype.hasOwnProperty.call(existingMcp, name);
    if (exists && !options.force) {
      skipped.push(name);
      continue;
    }
    existingMcp[name] = entry;
    if (exists) {
      updated.push(name);
    } else {
      added.push(name);
    }
  }
  if (added.length || updated.length) {
    configObject.mcp = existingMcp;
    const normalized = JSON.stringify(configObject, null, 2);
    const output = normalized.endsWith(eol) ? normalized : `${normalized}${eol}`;
    fs.writeFileSync(configPath, output, "utf8");
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
