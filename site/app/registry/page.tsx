import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getConcepts, getItemsByConcept, getRegistryItems } from "@/lib/registry";

export default function RegistryPage() {
  const concepts = getConcepts();
  const registryItems = getRegistryItems();
  const totalFiles = registryItems.reduce((count, item) => count + item.files.length, 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 top-16 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
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
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/registry">Browse registry</Link>
              </Button>
            </div>
          </header>

          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <Badge variant="secondary">Registry</Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Discover reusable agent utilities.
              </h1>
              <p className="text-lg text-muted-foreground">
                Each concept ships OpenCode-ready files, install guidance, and the context needed to
                adopt it quickly.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-white/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">{concepts.length}</CardTitle>
                  <CardDescription>Concepts indexed</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-white/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">{registryItems.length}</CardTitle>
                  <CardDescription>Utilities published</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-white/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">{totalFiles}</CardTitle>
                  <CardDescription>Files ready to install</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            {concepts.map((concept) => {
              const variants = getItemsByConcept(concept.slug);
              return (
                <Link key={concept.slug} href={`/registry/${concept.slug}`} className="group">
                  <Card className="h-full transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {concept.name}
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {variants.length} variant{variants.length === 1 ? "" : "s"}
                        </span>
                      </CardTitle>
                      <CardDescription>{concept.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {concept.tags.map((tag) => (
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
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
