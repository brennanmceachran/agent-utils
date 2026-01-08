import path from "node:path";

import { codeToHtml } from "shiki";

import type { RegistryFile } from "@/lib/registry";
import { readRegistryFile } from "@/lib/registry";

type HighlightedFile = {
  id: string;
  label: string;
  path: string;
  target?: string;
  raw: string;
  html: string;
  language: string;
};

const THEME = "vitesse-light";

function inferLanguage(filePath: string): string {
  if (filePath.endsWith(".d.ts")) {
    return "ts";
  }

  const ext = path.extname(filePath).replace(".", "");
  switch (ext) {
    case "ts":
      return "ts";
    case "tsx":
      return "tsx";
    case "js":
      return "js";
    case "mjs":
      return "js";
    case "cjs":
      return "js";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "css":
      return "css";
    case "html":
      return "html";
    case "yml":
    case "yaml":
      return "yaml";
    case "sh":
      return "bash";
    default:
      return "text";
  }
}

function makeTabId(filePath: string) {
  return filePath.replace(/[^a-zA-Z0-9-_]/g, "-");
}

export async function buildHighlightedFiles(files: RegistryFile[]): Promise<HighlightedFile[]> {
  return Promise.all(
    files.map(async (file) => {
      const raw = readRegistryFile(file.path);
      const language = inferLanguage(file.path);
      const html = await codeToHtml(raw, {
        lang: language,
        theme: THEME,
      });
      return {
        id: makeTabId(file.path),
        label: path.basename(file.path),
        path: file.path,
        target: file.target,
        raw,
        html,
        language,
      };
    }),
  );
}
