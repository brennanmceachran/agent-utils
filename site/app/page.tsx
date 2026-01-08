import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getConcepts } from "@/lib/registry";

export default function HomePage() {
  const concepts = getConcepts();
  const featured = concepts.slice(0, 2);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-16">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                AU
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Agent Utils
                </span>
                <span className="text-xs text-muted-foreground">OpenCode-first registry</span>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/registry">Browse registry</Link>
            </Button>
          </header>

          <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Badge variant="secondary">Index-ready registry</Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Installable agent utilities for OpenCode workflows.
              </h1>
              <p className="text-lg text-muted-foreground">
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
            </div>
            <div className="space-y-4">
              {featured.map((concept) => (
                <Card key={concept.slug} className="bg-white/70">
                  <CardHeader>
                    <CardTitle>{concept.name}</CardTitle>
                    <CardDescription>{concept.summary}</CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {concept.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
