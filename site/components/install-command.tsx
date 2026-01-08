"use client";

import { useEffect, useMemo, useState } from "react";

import { CopyButton } from "@/components/copy-button";

type InstallCommandProps = {
  itemName: string;
  basePath: string;
  postInstall?: string;
  installPath?: string;
};

export function InstallCommand({
  itemName,
  basePath,
  postInstall,
  installPath,
}: InstallCommandProps) {
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const command = useMemo(() => {
    const normalizedBase = basePath ? basePath.replace(/\/$/, "") : "";
    const fileName = installPath || `${itemName}.json`;
    const url = `${origin || "https://your-site-url"}${normalizedBase}/${fileName}`;
    const base = `npx shadcn@latest add ${url}`;
    if (!postInstall) {
      return base;
    }
    return `${base} && ${postInstall}`;
  }, [origin, basePath, itemName, installPath, postInstall]);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
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
      <pre className="mt-4 overflow-x-auto rounded-xl border border-foreground/10 bg-foreground px-4 py-3 text-xs text-background shadow-inner">
        <code className="font-mono">{command}</code>
      </pre>
    </div>
  );
}
