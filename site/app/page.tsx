import Link from "next/link";

import { InstallCommand } from "@/components/install-command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { highlightSnippet } from "@/lib/highlight";
import { buildInstallCommand, getBasePath, getDefaultOrigin } from "@/lib/install";
import { getConcepts, getRegistryItems } from "@/lib/registry";

export default async function HomePage() {
  const concepts = getConcepts();
  const registryItems = getRegistryItems();
  const featured = concepts.slice(0, 3);
  const totalFiles = registryItems.reduce((count, item) => count + item.files.length, 0);
  const featuredItem = registryItems[0];
  const basePath = getBasePath();
  const origin = getDefaultOrigin(basePath);
  const installCommand = featuredItem
    ? buildInstallCommand({
        origin,
        basePath,
        itemName: featuredItem.name,
        installPath: featuredItem.meta?.installPath,
        postInstall: featuredItem.meta?.postInstall,
      })
    : "";
  const installCommandHtml = installCommand ? await highlightSnippet(installCommand, "bash") : "";

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute right-[-140px] top-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                AU
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  Agent Utils
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/registry">Registry</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/registry">Browse registry</Link>
              </Button>
            </div>
          </header>

          <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Badge variant="secondary">Index-ready registry</Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Installable agent utilities for OpenCode workflows.
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                A single, static registry that ships raw files, install commands, and concept
                context so teams can adopt automation safely.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/registry">Explore utilities</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/registry/ralph-loop">View Ralph Loop</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-white/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">{concepts.length}</CardTitle>
                    <CardDescription>Concepts in the registry</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-white/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">{registryItems.length}</CardTitle>
                    <CardDescription>Installable utilities</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-white/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">{totalFiles}</CardTitle>
                    <CardDescription>Raw files ready to ship</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              {featuredItem ? (
                <InstallCommand
                  command={installCommand}
                  highlightedHtml={installCommandHtml}
                  postInstall={featuredItem.meta?.postInstall}
                />
              ) : null}
              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle>Built for repeatable automation</CardTitle>
                  <CardDescription>
                    Everything needed to install utilities safely and consistently.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span>Index-ready metadata for fast discovery.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span>CLI installs that mirror shadcn registry flows.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span>Curated concept context so teams know what to adopt.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Featured utilities
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Start with the most adopted concepts.
                </h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/registry">View full registry</Link>
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((concept) => (
                <Link key={concept.slug} href={`/registry/${concept.slug}`} className="group">
                  <Card className="h-full transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {concept.name}
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Concept
                        </span>
                      </CardTitle>
                      <CardDescription>{concept.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {concept.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition group-hover:translate-x-1">
                        View details {"->"}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
