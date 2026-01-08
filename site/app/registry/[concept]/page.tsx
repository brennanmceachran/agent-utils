import Link from "next/link";
import { notFound } from "next/navigation";

import { PlatformTabs } from "@/components/platform-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildHighlightedFiles } from "@/lib/highlight";
import { getConceptBySlug, getConcepts, getItemsByConcept } from "@/lib/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getConcepts().map((concept) => ({ concept: concept.slug }));
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ concept: string }>;
}) {
  const { concept: conceptSlug } = await params;
  const concept = getConceptBySlug(conceptSlug);

  if (!concept) {
    notFound();
  }

  const variants = getItemsByConcept(concept.slug);
  const opencodeVariant = variants.find((item) => item.meta?.platform === "opencode");
  const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";
  const codeBlocks = opencodeVariant ? await buildHighlightedFiles(opencodeVariant.files) : [];

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
          <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                AU
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  Agent Utils
                </span>
                <span className="text-sm text-muted-foreground">OpenCode-first registry</span>
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

          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0 space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary">Concept</Badge>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    {concept.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">{concept.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {concept.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary">
                    {variants.length} {variants.length === 1 ? "variant" : "variants"}
                  </Badge>
                  {opencodeVariant ? <Badge variant="outline">OpenCode ready</Badge> : null}
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Why teams adopt it</CardTitle>
                    <CardDescription>
                      The outcomes this concept is designed to unlock.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {concept.why.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What ships with it</CardTitle>
                    <CardDescription>
                      Core capabilities included in the OpenCode variant.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {concept.what.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Common use cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {concept.useCases.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="min-w-0 space-y-6 lg:sticky lg:top-10">
              <PlatformTabs
                opencodeVariant={opencodeVariant}
                basePath={basePath}
                codeBlocks={codeBlocks}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
