# agent-utils

Utilities and registry items for OpenCode agents.

## Install Ralph loop (one step)

```bash
npx shadcn@latest add https://brennanmceachran.github.io/agent-utils/ralph-loop-opencode.json
```

Restart OpenCode after install.

## Install Next.js MCP (OpenCode)

```bash
npx shadcn@latest add https://brennanmceachran.github.io/agent-utils/nextjs-mcp-opencode.json && node .opencode/bin/merge-mcp.mjs
```

Requires Next.js 16+ and a running dev server. Restart OpenCode after install.

## Usage

```text
/ralph @path/to/prompt.md [max]
/ralph stop
```

## Prompt template (example)

Copy this into a file like `prompt.md` and edit it.

```markdown
# Ralph Prompt

Goal:
Context:
Constraints:
Inputs:
Outputs:
Success criteria:
```

## Notes

- Files are installed into `.opencode/` in your repo; commit them if you want.
