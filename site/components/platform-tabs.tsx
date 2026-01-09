"use client";

import { CopyButton } from "@/components/copy-button";
import { InstallCommand } from "@/components/install-command";
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
  installCommand: string;
  installCommandHtml?: string;
  codeBlocks?: CodeBlock[];
};

export function PlatformTabs({
  opencodeVariant,
  installCommand,
  installCommandHtml,
  codeBlocks = [],
}: PlatformTabsProps) {
  if (!opencodeVariant) {
    return (
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="text-sm font-semibold text-foreground">OpenCode variant unavailable</p>
        <p>This concept does not yet ship an OpenCode package.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="cli" className="min-w-0 max-w-full space-y-6">
      <TabsList className="w-full max-w-full justify-start gap-4 border-0 bg-transparent p-0 shadow-none">
        <TabsTrigger
          value="cli"
          className="rounded-none border-b-2 border-transparent px-0 pb-2 text-xs font-semibold text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent"
        >
          CLI
        </TabsTrigger>
        <TabsTrigger
          value="manual"
          className="rounded-none border-b-2 border-transparent px-0 pb-2 text-xs font-semibold text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent"
        >
          Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cli" className="space-y-4">
        <InstallCommand
          command={installCommand}
          highlightedHtml={installCommandHtml}
          postInstall={opencodeVariant.meta?.postInstall}
          variant="plain"
        />
      </TabsContent>

      <TabsContent value="manual" className="min-w-0 max-w-full space-y-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Manual install</p>
            <p className="text-sm text-muted-foreground">
              Copy these files into your repo so OpenCode can load them.
            </p>
          </div>
          <ol className="min-w-0 space-y-3 text-sm text-muted-foreground">
            {opencodeVariant.files.map((file) => (
              <li key={file.path} className="min-w-0 flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-muted-foreground/60" />
                <div className="min-w-0 space-y-1">
                  <span className="block max-w-full break-all font-mono text-foreground">
                    {file.target ?? file.path}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {file.target ? "Place the file at this path." : "Target path not specified."}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {codeBlocks.length ? (
          <div className="space-y-3 pt-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Code files</p>
              <p className="text-sm text-muted-foreground">Preview and copy each file below.</p>
            </div>
            <Tabs defaultValue={codeBlocks[0].id} className="min-w-0 max-w-full">
              <div className="rounded-2xl border border-border/60 bg-white/80">
                <div className="border-b border-border/60 px-3 pt-3">
                  <TabsList className="flex w-full flex-nowrap justify-start gap-4 border-0 bg-transparent px-0 pb-2 shadow-none overflow-x-auto">
                    {codeBlocks.map((block) => (
                      <TabsTrigger
                        key={block.id}
                        value={block.id}
                        className="whitespace-nowrap rounded-none border-b-2 border-transparent px-0 pb-2 text-xs font-semibold font-mono tracking-normal text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent"
                      >
                        {block.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {codeBlocks.map((block) => (
                  <TabsContent key={block.id} value={block.id} className="min-w-0 px-3 pb-3 pt-2">
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span className="min-w-0 flex-1 truncate font-mono">
                        {block.target ?? block.path}
                      </span>
                      <CopyButton value={block.raw} label="Copy file" />
                    </div>
                    <div className="mt-3 border-t border-border/60 pt-3">
                      <div className="overflow-x-auto">
                        <div
                          className="text-[13px]"
                          dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
