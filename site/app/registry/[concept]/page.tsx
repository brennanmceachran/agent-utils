import { notFound } from "next/navigation";

import { PlatformTabs } from "@/components/platform-tabs";
import { Badge } from "@/components/ui/badge";
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Concept
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">{concept.name}</h1>
            <p className="text-muted-foreground">{concept.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {concept.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why teams adopt it</CardTitle>
                <CardDescription>The outcomes this concept is designed to unlock.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {concept.why.map((item) => (
                    <li key={item}>• {item}</li>
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
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {concept.what.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common use cases</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {concept.useCases.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <PlatformTabs
              opencodeVariant={opencodeVariant}
              basePath={basePath}
              codeBlocks={codeBlocks}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
