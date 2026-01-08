import { tool } from "@opencode-ai/plugin";

const QUALITY_PRESETS = {
  fast: {
    effort: "low",
    directive: "Keep it quick; use only the most relevant sources.",
  },
  balanced: {
    effort: "medium",
    directive: "Cover the main angles; resolve contradictions if they appear.",
  },
  deep: {
    effort: "high",
    directive:
      "Follow second-order leads and resolve contradictions until extra sources stop adding value.",
  },
} as const;

type Quality = keyof typeof QUALITY_PRESETS;

function buildPrompt({
  reason,
  query,
  additionalContext,
  quality,
}: {
  reason: string;
  query: string;
  additionalContext?: string;
  quality: Quality;
}) {
  const preset = QUALITY_PRESETS[quality];
  const contextBlock = additionalContext
    ? `Additional context (optional): ${additionalContext}`
    : "Additional context (optional):";

  return [
    "Hi, I’m stuck and need help with a research task.",
    "",
    `Reason: ${reason}`,
    `Search queries: ${query}`,
    contextBlock,
    `Depth: ${quality}`,
    "",
    "Please search the web and send back:",
    "- A 2-4 sentence summary",
    "- Key findings or caveats (bullets)",
    "- Sources with full URLs",
    "",
    "If anything is ambiguous, cover the plausible interpretations and state your assumptions instead of asking questions.",
    "Please don’t edit any code or files.",
    preset.directive,
  ].join("\n");
}

async function runCodex({
  prompt,
  effort,
}: {
  prompt: string;
  effort: string;
}) {
  const args = [
    "exec",
    "--enable",
    "web_search_request",
    "--sandbox",
    "read-only",
    "-c",
    `model_reasoning_effort=${effort}`,
    prompt,
  ];

  const proc = Bun.spawn(["codex", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    const message = stderr.trim() || `codex exec failed with exit code ${exitCode}`;
    throw new Error(message);
  }

  return stdout.trim();
}

export default tool({
  description:
    "Run a web search and return a concise summary with source links. Expect 5-10 minutes for deep queries; only run parallel calls for separate deep dives (one run can handle multiple related queries).",
  args: {
    reason: tool.schema
      .string()
      .describe(
        "Describe the core reason you’re reaching for web search and the decision or output you’re aiming for.",
      ),
    query: tool.schema
      .string()
      .describe(
        'List the search queries you want run; use new lines or ";" to include multiple angles in one run. Only split into parallel calls for distinct deep dives.',
      ),
    additional_context: tool.schema
      .string()
      .optional()
      .describe(
        "Add constraints or background: versions, product names, prior findings, relevant files/code, or must-include sources.",
      ),
    quality: tool.schema
      .enum(["fast", "balanced", "deep"])
      .describe(
        "Fast = quick scan, balanced = normal depth, deep = thorough with follow-up leads (deep can take 5-10 minutes).",
      ),
  },
  async execute(args) {
    const quality = args.quality as Quality;
    const prompt = buildPrompt({
      reason: args.reason,
      query: args.query,
      additionalContext: args.additional_context,
      quality,
    });

    const effort = QUALITY_PRESETS[quality].effort;
    return runCodex({
      prompt,
      effort,
    });
  },
});
