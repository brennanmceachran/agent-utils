"use client";

import parse from "html-react-parser";

import { CopyButton } from "@/components/copy-button";

type InstallCommandProps = {
  command: string;
  postInstall?: string;
  variant?: "card" | "plain";
  highlightedHtml?: string;
};

export function InstallCommand({
  command,
  postInstall,
  variant = "card",
  highlightedHtml,
}: InstallCommandProps) {
  const containerClassName =
    variant === "card"
      ? "rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur"
      : "space-y-4";

  return (
    <div className={containerClassName}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            CLI install
          </p>
          <p className="text-sm text-muted-foreground">
            Uses the same host and base path as this registry.
            {postInstall ? " Includes the post-install step." : ""}
          </p>
        </div>
        <CopyButton value={command} label="Copy" />
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-foreground">
        {highlightedHtml ? parse(highlightedHtml) : <code className="font-mono">{command}</code>}
      </div>
    </div>
  );
}
