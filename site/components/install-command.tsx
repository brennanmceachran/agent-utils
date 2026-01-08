"use client";

import { useEffect, useMemo, useState } from "react";

import { CopyButton } from "@/components/copy-button";

type InstallCommandProps = {
  itemName: string;
  basePath: string;
  postInstall?: string;
};

export function InstallCommand({ itemName, basePath, postInstall }: InstallCommandProps) {
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const command = useMemo(() => {
    const normalizedBase = basePath ? basePath.replace(/\/$/, "") : "";
    const url = `${origin || "https://your-site-url"}${normalizedBase}/${itemName}.json`;
    const base = `npx shadcn@latest add ${url}`;
    if (!postInstall) {
      return base;
    }
    return `${base} && ${postInstall}`;
  }, [origin, basePath, itemName, postInstall]);

  return (
    <div className="rounded-xl border bg-background/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">CLI install</p>
          <p className="text-xs text-muted-foreground">
            Uses the same host and base path as this registry.
            {postInstall ? " Includes the post-install step." : ""}
          </p>
        </div>
        <CopyButton value={command} />
      </div>
      <code className="mt-3 block rounded-lg bg-muted/60 px-3 py-2 text-xs text-slate-800">
        {command}
      </code>
    </div>
  );
}
