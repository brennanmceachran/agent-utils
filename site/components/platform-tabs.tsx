"use client";

import { useEffect, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { InstallCommand } from "@/components/install-command";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RegistryFile = {
  path: string;
  target?: string;
};

type RegistryMeta = {
  postInstall?: string;
  installPath?: string;
  [key: string]: unknown;
};

type RegistryItem = {
  name: string;
  files: RegistryFile[];
  docs?: string;
  meta?: RegistryMeta;
};

type CodeBlock = {
  id: string;
  label: string;
  path: string;
  target?: string;
  raw: string;
  html: string;
  language: string;
};

type PlatformTabsProps = {
  opencodeVariant?: RegistryItem | null;
  basePath: string;
  codeBlocks?: CodeBlock[];
};

const PLATFORM_KEY = "agent-utils-platform";
const AVAILABLE_PLATFORMS = ["opencode"] as const;

type Platform = (typeof AVAILABLE_PLATFORMS)[number];

export function PlatformTabs({ opencodeVariant, basePath, codeBlocks = [] }: PlatformTabsProps) {
  const [platform, setPlatform] = useState<Platform>("opencode");

  useEffect(() => {
    const stored = window.localStorage.getItem(PLATFORM_KEY);
    if (stored && AVAILABLE_PLATFORMS.includes(stored as Platform)) {
      setPlatform(stored as Platform);
    }
  }, []);

  const handleChange = (value: string) => {
    if (AVAILABLE_PLATFORMS.includes(value as Platform)) {
      setPlatform(value as Platform);
      window.localStorage.setItem(PLATFORM_KEY, value);
    }
  };

  return (
    <Tabs value={platform} onValueChange={handleChange}>
      <TabsList className="w-full justify-start">
        <TabsTrigger value="opencode">OpenCode</TabsTrigger>
        <TabsTrigger value="claude" disabled>
          Claude Code (soon)
        </TabsTrigger>
        <TabsTrigger value="codex" disabled>
          Codex CLI (soon)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="opencode" className="space-y-4">
        {opencodeVariant ? (
          <>
            <InstallCommand
              itemName={opencodeVariant.name}
              basePath={basePath}
              postInstall={opencodeVariant.meta?.postInstall}
              installPath={opencodeVariant.meta?.installPath}
            />
            <Card>
              <CardHeader>
                <CardTitle>Manual install</CardTitle>
                <CardDescription>Copy these files into your repo.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {opencodeVariant.files.map((file) => (
                    <li key={file.path}>
                      <span className="font-medium text-foreground">{file.target}</span>
                      <span className="text-muted-foreground">
                        {file.target ? " ← " : ""}
                        {file.path}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {codeBlocks.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Code files</CardTitle>
                  <CardDescription>Preview each file with syntax highlighting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue={codeBlocks[0].id}>
                    <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
                      {codeBlocks.map((block) => (
                        <TabsTrigger
                          key={block.id}
                          value={block.id}
                          className="rounded-full border border-border px-4 py-1 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {block.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {codeBlocks.map((block) => (
                      <TabsContent key={block.id} value={block.id} className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{block.target ?? block.path}</span>
                          <CopyButton value={block.raw} label="Copy file" />
                        </div>
                        <div className="mt-3 overflow-x-auto rounded-lg border bg-white p-3">
                          <div
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: block.html }}
                          />
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            ) : null}
            {opencodeVariant.docs ? (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>{opencodeVariant.docs}</CardDescription>
                </CardHeader>
              </Card>
            ) : null}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>OpenCode variant unavailable</CardTitle>
              <CardDescription>This concept does not yet ship an OpenCode package.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
