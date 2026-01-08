import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getConcepts, getItemsByConcept } from "@/lib/registry";

export default function RegistryPage() {
  const concepts = getConcepts();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Registry
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Discover reusable agent utilities.
          </h1>
          <p className="text-muted-foreground">
            Each concept ships OpenCode-ready files plus install guidance.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {concepts.map((concept) => {
            const variants = getItemsByConcept(concept.slug);
            return (
              <Link key={concept.slug} href={`/registry/${concept.slug}`}>
                <Card className="h-full transition hover:border-slate-400">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {concept.name}
                      <span className="text-xs text-muted-foreground">
                        {variants.length} variant
                        {variants.length === 1 ? "" : "s"}
                      </span>
                    </CardTitle>
                    <CardDescription>{concept.summary}</CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {concept.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
