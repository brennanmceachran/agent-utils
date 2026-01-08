#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/.bun/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/umd/main.js
var require_main = __commonJS((exports, module) => {
  (function(factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
      var v = factory(__require, exports);
      if (v !== undefined)
        module.exports = v;
    } else if (typeof define === "function" && define.amd) {
      define(["require", "exports", "./impl/format", "./impl/edit", "./impl/scanner", "./impl/parser"], factory);
    }
  })(function(require2, exports2) {
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.applyEdits = exports2.modify = exports2.format = exports2.printParseErrorCode = exports2.ParseErrorCode = exports2.stripComments = exports2.visit = exports2.getNodeValue = exports2.getNodePath = exports2.findNodeAtOffset = exports2.findNodeAtLocation = exports2.parseTree = exports2.parse = exports2.getLocation = exports2.SyntaxKind = exports2.ScanError = exports2.createScanner = undefined;
    const formatter = require2("./impl/format");
    const edit = require2("./impl/edit");
    const scanner = require2("./impl/scanner");
    const parser = require2("./impl/parser");
    exports2.createScanner = scanner.createScanner;
    var ScanError;
    (function(ScanError2) {
      ScanError2[ScanError2["None"] = 0] = "None";
      ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
      ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
      ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
      ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
      ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
      ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
    })(ScanError || (exports2.ScanError = ScanError = {}));
    var SyntaxKind;
    (function(SyntaxKind2) {
      SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
      SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
      SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
      SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
      SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
      SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
      SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
      SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
      SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
      SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
      SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
      SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
      SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
      SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
      SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
      SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
      SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
    })(SyntaxKind || (exports2.SyntaxKind = SyntaxKind = {}));
    exports2.getLocation = parser.getLocation;
    exports2.parse = parser.parse;
    exports2.parseTree = parser.parseTree;
    exports2.findNodeAtLocation = parser.findNodeAtLocation;
    exports2.findNodeAtOffset = parser.findNodeAtOffset;
    exports2.getNodePath = parser.getNodePath;
    exports2.getNodeValue = parser.getNodeValue;
    exports2.visit = parser.visit;
    exports2.stripComments = parser.stripComments;
    var ParseErrorCode;
    (function(ParseErrorCode2) {
      ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
      ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
      ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
      ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
      ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
      ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
      ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
      ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
      ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
      ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
      ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
      ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
      ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
      ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
      ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
      ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
    })(ParseErrorCode || (exports2.ParseErrorCode = ParseErrorCode = {}));
    function printParseErrorCode(code) {
      switch (code) {
        case 1:
          return "InvalidSymbol";
        case 2:
          return "InvalidNumberFormat";
        case 3:
          return "PropertyNameExpected";
        case 4:
          return "ValueExpected";
        case 5:
          return "ColonExpected";
        case 6:
          return "CommaExpected";
        case 7:
          return "CloseBraceExpected";
        case 8:
          return "CloseBracketExpected";
        case 9:
          return "EndOfFileExpected";
        case 10:
          return "InvalidCommentToken";
        case 11:
          return "UnexpectedEndOfComment";
        case 12:
          return "UnexpectedEndOfString";
        case 13:
          return "UnexpectedEndOfNumber";
        case 14:
          return "InvalidUnicode";
        case 15:
          return "InvalidEscapeCharacter";
        case 16:
          return "InvalidCharacter";
      }
      return "<unknown ParseErrorCode>";
    }
    exports2.printParseErrorCode = printParseErrorCode;
    function format(documentText, range, options) {
      return formatter.format(documentText, range, options);
    }
    exports2.format = format;
    function modify(text, path, value, options) {
      return edit.setProperty(text, path, value, options);
    }
    exports2.modify = modify;
    function applyEdits(text, edits) {
      let sortedEdits = edits.slice(0).sort((a, b) => {
        const diff = a.offset - b.offset;
        if (diff === 0) {
          return a.length - b.length;
        }
        return diff;
      });
      let lastModifiedOffset = text.length;
      for (let i = sortedEdits.length - 1;i >= 0; i--) {
        let e = sortedEdits[i];
        if (e.offset + e.length <= lastModifiedOffset) {
          text = edit.applyEdit(text, e);
        } else {
          throw new Error("Overlapping edit");
        }
        lastModifiedOffset = e.offset;
      }
      return text;
    }
    exports2.applyEdits = applyEdits;
  });
});

// scripts/merge-mcp.ts
var import_jsonc_parser = __toESM(require_main(), 1);
import fs from "node:fs";
import path from "node:path";
var args = process.argv.slice(2);
var options = {
  keep: false,
  force: false
};
var payloadArgs = [];
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
`) ? `\r
` : `
`;
}
function parseJsonc(text, label) {
  const errors = [];
  const data = import_jsonc_parser.parse(text, errors, { allowTrailingComma: true, disallowComments: false });
  if (errors.length) {
    const first = errors[0];
    throw new Error(`Failed to parse ${label} at offset ${first.offset}.`);
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
  return entries.filter((entry) => entry.isFile() && (entry.name.endsWith(".json") || entry.name.endsWith(".jsonc"))).map((entry) => path.join(payloadDir, entry.name));
}
function getConfigPath(cwd) {
  const jsoncPath = path.join(cwd, "opencode.jsonc");
  if (fs.existsSync(jsoncPath))
    return jsoncPath;
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
  let configText = configExists ? fs.readFileSync(configPath, "utf8") : `{}
`;
  const eol = detectEol(configText);
  const configData = parseJsonc(configText, path.basename(configPath));
  const existingMcp = configData.mcp && typeof configData.mcp === "object" ? configData.mcp : {};
  const added = [];
  const skipped = [];
  const updated = [];
  for (const [name, entry] of mcpEntries) {
    const exists = Object.prototype.hasOwnProperty.call(existingMcp, name);
    if (exists && !options.force) {
      skipped.push(name);
      continue;
    }
    const edits = import_jsonc_parser.modify(configText, ["mcp", name], entry, {
      formattingOptions: {
        insertSpaces: true,
        tabSize: 2,
        eol
      }
    });
    if (edits.length) {
      configText = import_jsonc_parser.applyEdits(configText, edits);
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
