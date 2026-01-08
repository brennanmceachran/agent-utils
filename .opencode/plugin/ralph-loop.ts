import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "@opencode-ai/plugin";

import {
  CONTROL_PREFIX,
  DEFAULT_MAX_ITERATIONS,
  DONE_TOKEN,
  hasDone,
  isPathInside,
  lintPrompt,
  loadJson,
  normalizeRelToken,
  parseControl,
  rmTargetsFromArgs,
  saveJson,
  splitShellSegments,
  stripArg,
  stripEnvPrefixes,
  textFromParts,
  tokenize,
} from "../ralph/ralph-utils";

type RalphSession = {
  enabled: boolean;
  promptPath: string; // repo-relative
  maxIterations: number;
  iteration: number;
};

type RalphState = {
  version: 1;
  sessions: Record<string, RalphSession>;
};

type ChatMessageInput = {
  sessionID: string;
};

type ChatMessageOutput = {
  parts: unknown[];
};

type SessionMessage = {
  info?: {
    role?: string;
  };
  parts?: unknown[];
};

type SessionMessagesResponse = {
  data?: SessionMessage[];
};

type IdleEvent = {
  type: string;
  properties: {
    sessionID: string;
  };
};

type IdleEventInput = {
  event: IdleEvent;
};

type ToolExecuteInput = {
  sessionID: string;
  tool: string;
};

type ToolExecuteOutput = {
  args?: {
    command?: string;
    filePath?: string;
  };
};

export const RalphLoopPlugin: Plugin = async ({ client, worktree }) => {
  const stateFile = path.join(worktree, ".opencode", "ralph", "state.json");
  const state = await loadJson<RalphState>(stateFile, { version: 1, sessions: {} });

  const toast = async (
    message: string,
    variant: "info" | "success" | "warning" | "error" = "info",
  ): Promise<void> => {
    await client.tui.showToast({ body: { title: "Ralph", message, variant } });
  };

  const persist = () => saveJson(stateFile, state);

  const stop = async (sessionID: string, reason: string) => {
    const s = state.sessions?.[sessionID];
    if (!s?.enabled) return;
    s.enabled = false;
    await persist();
    await toast(`Stopped: ${reason}`, "warning");
  };

  const start = async (sessionID: string, promptArg: string, maxArg?: string) => {
    const raw = stripArg(promptArg);
    const abs = path.isAbsolute(raw) ? raw : path.resolve(worktree, raw);

    let real = abs;
    try {
      real = await fs.realpath(abs);
    } catch {
      // ignore
    }

    if (!isPathInside(worktree, real)) {
      await toast(`Refusing to start: prompt file is outside repo (${promptArg})`, "error");
      return;
    }

    try {
      if (!(await fs.stat(real)).isFile()) throw new Error("not file");
    } catch {
      await toast(`Refusing to start: prompt file not found (${promptArg})`, "error");
      return;
    }

    const md = await fs.readFile(real, "utf8");
    const lintErrors = lintPrompt(md);
    if (lintErrors.length) {
      await toast(`Prompt file lint failed:\n- ${lintErrors.join("\n- ")}`, "error");
      return;
    }

    const maxIterations =
      maxArg && /^[0-9]+$/.test(String(maxArg)) ? Number(maxArg) : DEFAULT_MAX_ITERATIONS;
    state.sessions[sessionID] = {
      enabled: true,
      promptPath: path.relative(worktree, real),
      maxIterations,
      iteration: 0,
    };

    await persist();
    await toast(
      `Enabled (max ${maxIterations}) using ${state.sessions[sessionID].promptPath}`,
      "success",
    );
  };

  const guardBash = (command: string, session: RalphSession) => {
    const cmd = String(command ?? "").trim();
    if (!cmd) return;

    const worktreeAbs = path.resolve(worktree);
    const promptAbs = path.resolve(worktreeAbs, session.promptPath);
    const promptRel = normalizeRelToken(session.promptPath);

    let simulatedCwd = worktreeAbs;

    const assertInside = (absPath: string, operation: string) => {
      if (!isPathInside(worktreeAbs, absPath)) {
        throw new Error(`Ralph safety: refusing to ${operation} outside repo`);
      }
    };

    const resolveFromCwd = (maybePath: string) =>
      path.isAbsolute(maybePath) ? path.resolve(maybePath) : path.resolve(simulatedCwd, maybePath);

    for (const seg of splitShellSegments(cmd)) {
      const tokens = stripEnvPrefixes(tokenize(seg));
      const a = tokens[0] ?? "";
      const b = tokens[1] ?? "";
      if (!a) continue;

      // Track `cd` so relative destructive ops resolve correctly.
      if (a === "cd") {
        const dest = tokens[1];
        if (!dest || dest === "-") throw new Error("Ralph safety: refusing ambiguous cd");

        if (/[`$]/.test(String(dest))) {
          throw new Error("Ralph safety: refusing non-literal cd target");
        }

        const normalized = normalizeRelToken(String(dest));
        if (
          normalized.startsWith("~") ||
          normalized.startsWith("$HOME") ||
          normalized.startsWith("${HOME}")
        ) {
          throw new Error("Ralph safety: refusing cd to home paths");
        }

        const next = resolveFromCwd(String(dest));
        assertInside(next, "cd");
        simulatedCwd = next;
        continue;
      }

      if (a === "sudo") throw new Error("Ralph safety: sudo is disabled");
      if (a === "git" && b === "push") throw new Error("Ralph safety: git push is disabled");
      if (a === "git" && b === "clean" && tokens.some((t) => String(t).includes("-f"))) {
        throw new Error("Ralph safety: git clean with -f is disabled");
      }

      const isRm = a === "rm" || a === "rmdir";
      const isGitRm = a === "git" && b === "rm";
      const isMv = a === "mv";
      const isGitMv = a === "git" && b === "mv";

      // Prevent prompt file moves/renames (and prevent moving files outside repo).
      if (isMv || isGitMv) {
        const offset = isGitMv ? 2 : 1;
        const paths = rmTargetsFromArgs(tokens.slice(offset));
        for (const rawTok of paths) {
          const raw = String(rawTok);
          if (/[`$]/.test(raw)) throw new Error("Ralph safety: refusing non-literal mv path");
          const abs = resolveFromCwd(raw);
          if (abs === promptAbs)
            throw new Error("Ralph safety: cannot move/rename the prompt file");
          assertInside(abs, "move files");
        }
        continue;
      }

      if (!isRm && !isGitRm) continue;

      const offset = isGitRm ? 2 : 1;
      const targets = rmTargetsFromArgs(tokens.slice(offset));

      for (const rawTok of targets) {
        const raw = String(rawTok);
        if (/[`$]/.test(raw)) throw new Error("Ralph safety: refusing non-literal rm target");
        const normalizedForWipe = normalizeRelToken(raw).replace(/\/+$/, "");

        // Block the classic "oops" wipes.
        if (normalizedForWipe === "" || normalizedForWipe === "." || normalizedForWipe === "*") {
          throw new Error("Ralph safety: refusing repo wipe");
        }

        if (raw === "/" || raw === "/*") throw new Error("Ralph safety: refusing disk wipe");

        if (
          normalizedForWipe.startsWith("~") ||
          normalizedForWipe.startsWith("$HOME") ||
          normalizedForWipe.startsWith("${HOME}")
        ) {
          throw new Error("Ralph safety: refusing home paths");
        }

        // Protect the prompt file.
        if (normalizedForWipe === promptRel) {
          throw new Error("Ralph safety: cannot delete the prompt file");
        }

        const abs = resolveFromCwd(raw);
        if (abs === promptAbs) throw new Error("Ralph safety: cannot delete the prompt file");
        if (abs === worktreeAbs) throw new Error("Ralph safety: refusing to delete repo root");

        assertInside(abs, "delete files");
      }
    }
  };

  const runIteration = async (sessionID: string, session: RalphSession) => {
    if (session.iteration >= session.maxIterations) {
      await stop(sessionID, `max iterations reached (${session.maxIterations})`);
      return;
    }

    const promptReal = path.join(worktree, session.promptPath);
    const promptContents = await fs.readFile(promptReal, "utf8");

    session.iteration += 1;
    await persist();
    await toast(`Iteration ${session.iteration}/${session.maxIterations}`, "info");

    const msg = [
      `<ralph_iteration number="${session.iteration}" max="${session.maxIterations}">`,
      "<ralph_rules>",
      "- Task spec: follow the content in <task_prompt_file>.",
      "- Read `## Progress` as you may have already started coding and done some work.",
      "- Focus: pick the single most useful next step you can complete now.",
      "- Make concrete progress in implementing the features/functionality described in that doc. Do this by coding in this repo/working directory.",
      "- Once you are done, update the prompt file, especially `## Progress`, to be accurate with your progress so far.",
      "- In `## Progress`, record: what you changed, current status, next step, and any verification results/errors.",
      "- Keep the prompt file concise and current; it is durable memory (chat may be compacted).",
      "- Use ## Acceptance Criteria to define done; use ## Verification to prove it.",
      "- If a command is blocked/denied, do not retry it; choose a safer alternative and note it in ## Progress.",
      "- If stuck, log the blocker and what you tried in ## Progress, then attempt the next best approach.",
      `- Completion: only when fully complete and verified, end your final message with a line containing only: ${DONE_TOKEN}`,
      "</ralph_rules>",
      `<task_prompt_file path="${session.promptPath}">`,
      promptContents,
      "</task_prompt_file>",
      "</ralph_iteration>",
    ].join("\n");

    await client.session.prompt({
      path: { id: sessionID },
      body: { agent: "ralph", parts: [{ type: "text", text: msg }] },
    });
  };

  return {
    "chat.message": async (input: ChatMessageInput, output: ChatMessageOutput) => {
      const text = textFromParts(output.parts);
      if (!text.includes(CONTROL_PREFIX)) return;

      const control = parseControl(text);
      if (!control) return toast("Could not parse RALPH_CONTROL JSON", "error");

      const arg1 = String(control.arg1 ?? "").trim();
      const arg2 = String(control.arg2 ?? "").trim();

      if (!arg1) return toast("Usage: /ralph @prompt.md [max]  OR  /ralph stop", "error");
      if (arg1 === "stop") return stop(input.sessionID, "manual stop");

      return start(input.sessionID, arg1, arg2);
    },

    event: async ({ event }: IdleEventInput) => {
      if (event.type !== "session.idle") return;
      const sessionID = event.properties.sessionID;
      const session = state.sessions?.[sessionID];
      if (!session?.enabled) return;

      try {
        const messagesResult = (await client.session.messages({
          path: { id: sessionID },
          query: { limit: 25 },
        })) as SessionMessagesResponse;
        const messages = messagesResult.data ?? [];
        const lastAssistant = [...messages].reverse().find((m) => m.info?.role === "assistant");
        if (lastAssistant && hasDone(textFromParts(lastAssistant.parts ?? [])))
          return stop(sessionID, DONE_TOKEN);
      } catch {
        // ignore
      }

      return runIteration(sessionID, session);
    },

    "tool.execute.before": async (input: ToolExecuteInput, output: ToolExecuteOutput) => {
      const session = state.sessions?.[input.sessionID];
      if (!session?.enabled) return;

      if (input.tool === "bash") {
        guardBash(output.args?.command, session);
        return;
      }

      if (input.tool === "read" || input.tool === "write" || input.tool === "edit") {
        const filePath = output.args?.filePath;
        if (typeof filePath !== "string" || !filePath) return;
        const abs = path.isAbsolute(filePath) ? filePath : path.resolve(worktree, filePath);
        if (!isPathInside(worktree, abs))
          throw new Error("Ralph safety: file access outside repo is disabled");
      }
    },
  };
};
