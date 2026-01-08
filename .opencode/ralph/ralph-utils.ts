import fs from "node:fs/promises";
import path from "node:path";

export const CONTROL_PREFIX = "RALPH_CONTROL:";
export const DONE_TOKEN = "RALPH_DONE";
export const DEFAULT_MAX_ITERATIONS = 25;

export const REQUIRED_SECTIONS = [
  "Goal",
  "Acceptance Criteria",
  "Verification",
  "Progress",
] as const;
export const REQUIRED_NONEMPTY = ["Goal", "Acceptance Criteria", "Verification"] as const;

export const isPathInside = (root: string, target: string) => {
  const rel = path.relative(root, target);
  return rel === "" || (!rel.startsWith(`..${path.sep}`) && rel !== "..");
};

export const stripArg = (value: unknown) => {
  const s = String(value ?? "").trim();
  const unquoted =
    (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))
      ? s.slice(1, -1)
      : s;
  return unquoted.startsWith("@") ? unquoted.slice(1) : unquoted;
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sectionBody = (md: string, title: string) => {
  const re = new RegExp(
    `^#{1,6}\\s+${escapeRe(title)}\\s*$\\r?\\n([\\s\\S]*?)(?=^#{1,6}\\s+|\\Z)`,
    "im",
  );
  const m = re.exec(md);
  return m ? m[1].trim() : null;
};

export const lintPrompt = (md: string) => {
  const errors: string[] = [];

  for (const s of REQUIRED_SECTIONS) {
    if (sectionBody(md, s) === null) errors.push(`Missing section heading: ${s}`);
  }

  for (const s of REQUIRED_NONEMPTY) {
    const body = sectionBody(md, s);
    if (body !== null && !body) errors.push(`Section must not be empty: ${s}`);
  }

  return errors;
};

export const loadJson = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
};

export const saveJson = async (filePath: string, value: unknown) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

type TextPartLike = { type: "text"; text: string };

export const textFromParts = (parts: unknown[]) =>
  (Array.isArray(parts) ? parts : [])
    .filter((p): p is TextPartLike => {
      if (typeof p !== "object" || p === null) return false;
      const candidate = p as { type?: unknown; text?: unknown };
      return candidate.type === "text" && typeof candidate.text === "string";
    })
    .map((p) => p.text)
    .join("\n");

export const hasDone = (text: string) =>
  String(text)
    .split(/\r?\n/)
    .some((l) => l.trim() === DONE_TOKEN);

export const parseControl = (text: string) => {
  const line = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.startsWith(CONTROL_PREFIX));

  if (!line) return null;

  try {
    return JSON.parse(line.slice(CONTROL_PREFIX.length).trim()) as {
      arg1?: unknown;
      arg2?: unknown;
      arg3?: unknown;
    };
  } catch {
    return null;
  }
};

export const tokenize = (cmd: string) => {
  const out: string[] = [];
  let cur = "";
  let q: '"' | "'" | null = null;

  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];

    if (q) {
      if (c === q) q = null;
      else cur += c;
      continue;
    }

    if (c === '"' || c === "'") {
      q = c;
      continue;
    }

    if (/\s/.test(c)) {
      if (cur) out.push(cur);
      cur = "";
      continue;
    }

    cur += c;
  }

  if (cur) out.push(cur);
  return out;
};

export const normalizeRelToken = (t: string) =>
  String(t).replace(/\\/g, "/").replace(/^\.\//, "").trim();

export const splitShellSegments = (command: string) => {
  const segments: string[] = [];
  let cur = "";
  let q: '"' | "'" | null = null;

  const flush = () => {
    const trimmed = cur.trim();
    if (trimmed) segments.push(trimmed);
    cur = "";
  };

  for (let i = 0; i < command.length; i++) {
    const c = command[i];

    if (q) {
      if (c === q) q = null;
      cur += c;
      continue;
    }

    if (c === '"' || c === "'") {
      q = c;
      cur += c;
      continue;
    }

    // Split on unquoted ;, &&, ||, and newlines.
    if (c === ";" || c === "\n") {
      flush();
      continue;
    }

    if (c === "&" && command[i + 1] === "&") {
      flush();
      i++;
      continue;
    }

    if (c === "|" && command[i + 1] === "|") {
      flush();
      i++;
      continue;
    }

    cur += c;
  }

  flush();
  return segments;
};

const envAssignmentRe = /^[A-Za-z_][A-Za-z0-9_]*=.*/;

export const stripEnvPrefixes = (tokens: string[]) => {
  let i = 0;
  if (tokens[i] === "env") i++;
  while (i < tokens.length && envAssignmentRe.test(tokens[i] ?? "")) i++;
  return tokens.slice(i);
};

export const rmTargetsFromArgs = (args: string[]) => {
  const targets: string[] = [];
  let passthrough = false;

  for (const a of args) {
    if (!passthrough && a === "--") {
      passthrough = true;
      continue;
    }

    if (!passthrough && a.startsWith("-")) continue;
    targets.push(a);
  }

  return targets;
};
