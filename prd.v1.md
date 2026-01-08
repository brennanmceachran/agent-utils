# PRD v1 - Agent Utils Registry (OpenCode-first)

## Goal

Build a Shadcn-compatible, index-ready registry for OpenCode agent utilities,
backed by a fully static Next.js 16 site that lets users browse, install, and
copy files without any server-side dependency.

## Context

Agent tooling is exploding across OpenCode, Claude Code, and Codex CLI. The
registry provides a single place to discover, inspect, and install reusable
agent utilities (starting with the Ralph Loop and Web Research tool). The
registry must behave like a Shadcn component registry: users can browse a
catalog, copy files, or run a CLI install command that writes repo-scoped files.

We are OpenCode-first for v1. Claude Code and Codex CLI variants come later, but
we will structure the repo so they can be added cleanly.

## Principles and Constraints

- Single, index-ready registry output only. No legacy or dual output.
- No `files[].content` anywhere in the published registry JSON.
- Flat registry root: `/registry.json` and `/<item>.json` must be at root.
- Raw files must be publicly accessible at the `files[].path` URLs.
- Repo-scoped installs only (no user/global installs in v1).
- OpenCode-only variants in v1, but platform metadata must be future-proof.
- UI should show disabled placeholders for future platforms (Claude Code, Codex CLI).
- Fully static website build (Next.js App Router with `output: "export"`).
- Static output must be deployable to GitHub Pages (no server APIs; basePath/assetPrefix support).
- Registry JSON and raw files must be served from the same origin as the site.
- Use Bun runtime/package manager and TypeScript for scripts and tooling.
- Prefer TypeScript (`.ts`/`.tsx`) for new code wherever possible.
- Design should feel modern and deliberate while using shadcn/ui default typography and color tokens.
- If anything is unclear, use webresearch/webfetch to resolve it before proceeding.

## Scope

### In scope (v1)

- Restructure registry file layout to `registry/<concept>/<platform>/...`.
- Update `registry.json` item names, paths, and metadata.
- Add concept metadata to drive the website content.
- Build script that outputs index-ready registry JSON and raw files.
- Next.js 16 static site that reads the registry and renders install UX.
- Validation script for registry structure and index compliance.

### Out of scope (v1)

- Claude Code and Codex CLI variants.
- User-scoped installs or dotfile installers.
- Registry index submission (must be eligible, not submitted yet).
- Backwards compatibility with the current `r/` output.

## Data Model

### Concept

A concept is the canonical utility (example: `ralph-loop`, `webresearch`).
Concept data is stored in `registry/<concept>/concept.json` to provide
UI-friendly content (summary, why, what, use cases, tags).

### Variant

A variant is a platform-specific implementation of a concept (v1 only uses
`opencode`). Each variant is its own registry item.

### Registry item naming

- Pattern: `<concept>-<platform>`
- Examples:
  - `ralph-loop-opencode`
  - `webresearch-opencode`

### Required metadata (registry item)

- `meta.concept`: concept slug (example: `ralph-loop`).
- `meta.platform`: platform slug (example: `opencode`).
- `meta.kind`: array of capabilities (example: `["agent", "command", "plugin"]`).

## Target Layout

### Source of truth

- `registry.json` at repo root.
- `registry/<concept>/<platform>/...` for raw files.
- `registry/<concept>/concept.json` for site copy.

### Example (v1)

- `registry/ralph-loop/opencode/.opencode/agent/ralph.md`
- `registry/ralph-loop/opencode/.opencode/command/ralph.md`
- `registry/ralph-loop/opencode/.opencode/plugin/ralph-loop.ts`
- `registry/ralph-loop/opencode/.opencode/ralph/ralph-utils.ts`
- `registry/ralph-loop/opencode/.opencode/types/shims.d.ts`
- `registry/webresearch/opencode/.opencode/tool/webresearch.ts`

## Build Output (Index-Ready Only)

The build output must be index-eligible from day one.

- `site/public/registry.json` (copied from root `registry.json`)
- `site/public/<item>.json` (one file per item, flat at root)
- `site/public/registry/<concept>/<platform>/...` (raw files)

All registry JSON and raw files must live under `site/public` so the site and
registry share the same GitHub Pages origin.

Constraints:

- No `files[].content` in any output JSON.
- Output JSON must be flat at the site root.
- `files[].path` must resolve to an accessible file in `site/public/registry/...`.

## Website Requirements (Next.js 16)

### Must haves

- Static export (`output: "export"`) with zero runtime server dependency.
- Publishable on GitHub Pages (basePath/assetPrefix support and `.nojekyll`).
- Home page with featured concepts and short positioning copy.
- `/registry` list view with search and filters (concept, kind, tags).
- `/registry/[concept]` detail page with platform tabs (default: OpenCode).
- Clear install CTA:
  - Primary: CLI install command
  - Secondary: manual copy instructions
- Syntax-highlighted code blocks with copy buttons.
- Global platform preference (stored in localStorage, default `opencode`).

### Content sources

- Registry item fields (`title`, `description`, `docs`).
- Concept metadata file (`registry/<concept>/concept.json`).
- Raw file contents (rendered as copyable blocks).
- Data should be read at build time for static export (no runtime API fetches required).

## Phases

### Phase 1 - Registry Restructure + Metadata (OpenCode)

**Purpose:** Make the registry concept-first and platform-ready, without adding
non-OpenCode variants.

**Tasks**

- [x] Rename registry items to the new naming convention.
  - [x] Set registry name to `agent-utils`.
  - [x] `opencode-ralph` -> `ralph-loop-opencode`
  - [x] `opencode-webresearch` -> `webresearch-opencode`
- [x] Move registry files to `registry/<concept>/<platform>/...`.
  - [x] Move Ralph loop files into `registry/ralph-loop/opencode/...`
  - [x] Move Web Research tool into `registry/webresearch/opencode/...`
- [x] Update `registry.json` to point at new file paths.
- [x] Add `meta.concept`, `meta.platform`, and `meta.kind` to each item.
- [x] Clarify that `~` in `files[].target` means project root (repo-scoped).
- [x] Add `registry/<concept>/concept.json` for:
  - [x] `ralph-loop`
  - [x] `webresearch`

**Good looks like**

- Files live under `registry/<concept>/<platform>`.
- `registry.json` paths and names match the new layout.
- Every item includes `meta.concept` and `meta.platform`.

**Great looks like**

- Concept metadata is rich enough to power the site without extra edits.
- `meta.kind` is accurate and future-proof (agent, command, plugin, tool).

**Additional information**

- https://opencode.ai/docs/config/ - project config scope and directory lookup rules.
- https://opencode.ai/docs/agents/ - agent file format and location conventions.
- https://opencode.ai/docs/commands/ - command file format and location conventions.
- https://opencode.ai/docs/custom-tools/ - tool file format and registration behavior.
- https://opencode.ai/docs/plugins/ - plugin structure and loading rules.
- https://ui.shadcn.com/docs/registry/registry-json - registry schema and item requirements.
- https://ui.shadcn.com/docs/registry/registry-item-json - per-item schema fields and constraints.

### Phase 2 - Index-Ready Build Output

**Purpose:** Produce a single, compliant registry output (no `content`, flat root).

**Tasks**

- [x] Add build script (TypeScript, `scripts/build-registry.ts`).
  - [x] Run via Bun (`bun run --bun scripts/build-registry.ts`).
  - [x] Read root `registry.json`.
  - [x] Emit `site/public/registry.json`.
  - [x] Emit `site/public/<item>.json` (one per item).
  - [x] Copy raw files into `site/public/registry/...`.
  - [x] Fail fast if any file is missing.
  - [x] If any `files[].content` exists in source or output, fail (do not strip).
- [x] Do not rely on any existing build scripts (none exist today).
- [x] Remove or ignore legacy `r/` output; it must not be published.
- [x] Wire the script into the site build pipeline.
  - [x] `site/package.json` should run the build script before `next build` using Bun.

**Good looks like**

- Output JSON is flat and contains zero `content` fields.
- `site/public/registry/...` mirrors `registry/...` exactly.

**Great looks like**

- The build script is deterministic, idempotent, and safe to re-run.
- Build output is index-eligible without further changes.

**Additional information**

- https://ui.shadcn.com/docs/registry/registry-index - index eligibility requirements (flat root, no inline content).
- https://ui.shadcn.com/docs/registry/registry-json - registry schema for validation.
- https://bun.sh/docs/cli/run - running TypeScript scripts via Bun.
- https://bun.com/docs/runtime/typescript - TypeScript support and tsconfig guidance for Bun.

### Phase 3 - Next.js 16 Static Registry Site

**Purpose:** Provide a premium browsing and install experience for the registry.

**Tasks**

- [x] Scaffold Next.js 16 site under `site/` (App Router).
- [x] Use Bun for dependency management and scripts (`bun install`, `bun run --bun build`).
- [x] Configure `next.config.js` with `output: "export"`.
- [x] Configure GitHub Pages compatibility:
  - [x] Support `BASE_PATH` env for repo name.
  - [x] Set `assetPrefix` when `BASE_PATH` is set.
  - [x] Enable `trailingSlash` for static hosting.
  - [x] Emit `.nojekyll` in `site/out` after export.
- [x] Create routes:
  - [x] `/` landing
  - [x] `/registry` catalog
  - [x] `/registry/[concept]` detail
- [x] Implement platform preference (default `opencode`).
- [x] Render install UX:
  - [x] CLI install command (must point to same host/basePath as the site).
  - [x] Use the shadcn CLI format: `npx shadcn@latest add <item-json-url>`.
  - [x] Manual install file list.
  - [x] Code tabs / copyable blocks.
- [x] Show platform tabs with disabled placeholders for Claude Code and Codex CLI.
- [x] Use shadcn/ui components + Tailwind as UI primitives.
- [x] Add Shiki-based syntax highlighting in server components.
- [x] Apply a deliberate design system (non-default typography, color, layout).

**Good looks like**

- Static export succeeds and pages render without JS errors.
- Install blocks are clear and immediately usable.

**Great looks like**

- The site feels premium and distinct, not default or boilerplate.
- Copy-paste UX is fast and frictionless.

**Additional information**

- https://nextjs.org/docs/app/building-your-application/deploying/static-exports - static export configuration and constraints.
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output - `output` config reference.
- https://docs.github.com/en/pages - GitHub Pages deployment constraints and behavior.
- https://ui.shadcn.com/docs/installation - shadcn/ui setup and Tailwind integration.
- https://ui.shadcn.com/docs/components - shadcn/ui component catalog and usage.
- https://bun.com/guides/ecosystem/nextjs - running Next.js with Bun.
- https://github.com/shikijs/shiki - syntax highlighting integration details.

### Phase 4 - Validation and Governance

**Purpose:** Make it hard to ship broken registry output.

**Tasks**

- [x] Add validation script (TypeScript, `scripts/validate-registry.ts`).
  - [x] Run via Bun (`bun run --bun scripts/validate-registry.ts`).
  - [x] Ensure all `files[].path` exist.
- [x] Ensure all `files[].target` are repo-scoped paths.
- [x] Ensure no JSON output contains `content` (fail if present, do not strip).

  - [x] Ensure flat root output exists.
- [ ] Add Bun script hooks to run validation in CI (optional for v1).

**Good looks like**

- Validation fails on missing files or invalid paths.

**Great looks like**

- Validation doubles as a preflight check before publishing.

**Additional information**

- https://ui.shadcn.com/docs/registry/registry-item-json - file and target rules.
- https://ui.shadcn.com/docs/registry/registry-json - top-level registry schema.
- https://ui.shadcn.com/docs/registry/registry-index - index compliance checklist.
- https://bun.sh/docs/cli/run - running validation scripts via Bun.

### Phase 5 - Future Expansion (Deferred)

**Purpose:** Prepare for Claude Code and Codex CLI variants later.

- No implementation in v1.
- Keep `meta.platform` and concept layout consistent for easy expansion.

**Additional information**

- https://docs.claude.com/en/docs/claude-code/slash-commands - Claude Code project commands.
- https://docs.claude.com/en/docs/claude-code/skills - Claude Code Skills layout.
- https://developers.openai.com/codex/guides/agents-md - Codex `AGENTS.md` guidance.
- https://developers.openai.com/codex/skills - Codex skills layout and locations.

## Acceptance Criteria

- Registry layout is concept-first and platform-ready.
- Registry output is index-eligible by default (flat root, no `content`).
- All OpenCode utilities install cleanly from registry item JSON.
- Next.js site is fully static and renders all concepts with install UX.
- Validation script catches missing files and index violations.

## Verification

Verification steps are listed by phase below.

### Phase 1 verification (Current Status: Verified)

- Confirm new layout exists:
  - `registry/ralph-loop/opencode/.opencode/agent/ralph.md`
  - `registry/webresearch/opencode/.opencode/tool/webresearch.ts`
- Confirm `registry.json` paths match the new layout.
- Confirm each item has `meta.concept`, `meta.platform`, `meta.kind`.
- Confirm `registry/<concept>/concept.json` files exist and contain summary text.

### Phase 2 verification (Current Status: Verified)

- Run build script:
  - `bun run --bun scripts/build-registry.ts`
- Confirm output files exist:
  - `site/public/registry.json`
  - `site/public/ralph-loop-opencode.json`
  - `site/public/webresearch-opencode.json`
- Confirm output JSON contains no `content` fields:
  - `rg "\"content\"" site/public/*.json` returns no matches.
- Confirm raw files are copied into `site/public/registry/...`.

### Phase 3 verification (Current Status: Verified)

- Build the site:
  - `cd site && bun install`
  - `bun run --bun build`
- Confirm static output exists:
  - `site/out/index.html`
  - `site/out/registry/index.html`
  - `site/out/registry/ralph-loop/index.html`
  - `site/out/.nojekyll`
- Confirm registry JSON is accessible in output:
  - `site/out/registry.json`
  - `site/out/ralph-loop-opencode.json`
- Confirm `next.config.js` includes `output: "export"` and basePath/assetPrefix handling.
- Confirm CLI install command uses `npx shadcn@latest add <item-json-url>` with the site host + basePath.

### Phase 4 verification (Current Status: Verified)

- Run validation:
  - `bun run --bun scripts/validate-registry.ts`
- Confirm validation exits with code 0.

## Progress

- Changes: moved OpenCode registry files into `registry/ralph-loop/opencode/.opencode` and `registry/webresearch/opencode/.opencode`; updated `registry.json` names, paths, and `meta.*` fields, plus repo-scoped target note; added concept metadata files at `registry/ralph-loop/concept.json` and `registry/webresearch/concept.json`; verified Phase 1 layout/metadata via file reads; added `scripts/build-registry.ts` to emit registry outputs, copy raw files, and remove legacy `site/public/r` output; re-ran the build script to generate `site/public` outputs; scaffolded the `site/` Next.js app with config, Tailwind, shadcn/ui primitives, registry data loader, and initial pages with install CTA and platform tabs; added localStorage-backed platform preference in `site/components/platform-tabs.tsx`; added Shiki-powered code tabs with copy buttons in the concept detail view; ran `bun install` and `bun run --bun build` to verify static export; added `scripts/validate-registry.ts` and ran it successfully; fixed root `package.json` scripts to use `bun run --cwd site` so `bun run dev` works from the repo root.
- Status: Complete (Phase 1-4 verified).
- Current focus: Optional CI hook decision.
- Next steps:
  - Decide whether to add an optional CI hook for validation.
- Verification: Phase 1 checks passed (read `registry.json`, both concept files, and required source files). Phase 2 checks passed (build script ran, outputs present, no `content` fields found). Phase 3 checks passed (`site/out` files generated, `.nojekyll` present). Phase 4 checks passed (`bun run --bun scripts/validate-registry.ts`).
- Notes:
  - Output must be index-ready only. No secondary outputs or legacy paths.

## Appendix

Reserved for future notes.
