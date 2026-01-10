import Link from "next/link";
import type { CSSProperties } from "react";

import { CopyButton } from "@/components/copy-button";
import { TweetEmbed } from "@/components/tweet-embed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildInstallCommand, getBasePath, getDefaultOrigin } from "@/lib/install";
import { getConcepts, getItemsByConcept, readRegistryFile } from "@/lib/registry";

const heroStyle = {
  "--hero-amber": "rgba(226, 232, 240, 0.35)",
  "--hero-teal": "rgba(191, 219, 254, 0.3)",
  "--hero-ink": "rgba(15, 23, 42, 0.04)",
} as CSSProperties;

type TweetPreview = {
  id?: string;
  url?: string;
};

export default async function HomePage() {
  const concepts = getConcepts();
  const featured = concepts.slice(0, 6);
  const basePath = getBasePath();
  const origin = getDefaultOrigin(basePath);

  const installCommands = new Map<string, string>();
  const tweetPreviews = new Map<string, TweetPreview>();

  for (const concept of featured) {
    const items = getItemsByConcept(concept.slug);
    const installItem = items[0];

    if (installItem) {
      const command = buildInstallCommand({
        origin,
        basePath,
        itemName: installItem.name,
        installPath: installItem.meta?.installPath,
        postInstall: installItem.meta?.postInstall,
      });
      installCommands.set(concept.slug, command);
    }

    try {
      const overview = readRegistryFile(`registry/${concept.slug}/content/overview.mdx`);
      const urlMatch = overview.match(/<TweetEmbed[^>]*url=["']([^"']+)["']/);
      const idMatch = overview.match(/<TweetEmbed[^>]*id=["']([^"']+)["']/);
      if (urlMatch || idMatch) {
        tweetPreviews.set(concept.slug, {
          url: urlMatch?.[1],
          id: idMatch?.[1],
        });
      }
    } catch (error) {
      // Ignore missing overview files.
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900" style={heroStyle}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,var(--hero-amber),transparent_70%)] blur-3xl" />
          <div className="absolute right-[-140px] top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,var(--hero-teal),transparent_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--hero-ink)_1px,transparent_1px),linear-gradient(to_bottom,var(--hero-ink)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                AU
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  Agent Utils
                </span>
                <span className="text-sm font-medium text-slate-900">Registry</span>
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

          <section className="flex flex-col items-center text-center" id="top">
            <Badge className="w-fit bg-white/80 text-slate-800">OpenCode utility registry</Badge>
            <div className="mt-6 max-w-3xl space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Build an OpenCode stack that ships.
              </h1>
              <p className="text-lg leading-relaxed text-slate-600">
                Agent Utils is a static registry of installable agents, MCP servers, tools, and
                workflows. Every entry ships raw files, install commands, and usage guidance so
                teams can adopt automation with confidence.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/registry">Explore the registry</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#concepts">See live concepts</Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">What you can install</CardTitle>
                <CardDescription>
                  Build a stack of utilities that fits how your team ships.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="flex flex-wrap gap-2">
                  {["Agents", "MCP servers", "Tools", "Workflow scripts", "Runbooks"].map(
                    (item) => (
                      <Badge
                        key={item}
                        variant="outline"
                        className="border-slate-200 text-slate-700"
                      >
                        {item}
                      </Badge>
                    ),
                  )}
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>Installable in one command, inspectable in Git.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>Concept pages teach the workflow, not just the config.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>Designed to be copied, committed, and shared with your team.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">Install flow</CardTitle>
                <CardDescription>Three steps to integrate a new utility.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 text-sm text-slate-600">
                  {[
                    "Pick a concept and read the usage notes.",
                    "Run the install command and commit the files.",
                    "Follow the prompts to run the workflow as designed.",
                  ].map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6" id="concepts">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Live concepts
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Start with utilities teams are shipping today.
                </h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/registry">Browse all utilities</Link>
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((concept) => {
                const installForConcept = installCommands.get(concept.slug);
                const tweetPreview = tweetPreviews.get(concept.slug);

                return (
                  <Card
                    key={concept.slug}
                    className="group relative flex h-full flex-col border-slate-200/70 bg-white/80 transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                  >
                    <Link
                      href={`/registry/${concept.slug}`}
                      className="absolute inset-0 z-10"
                      aria-label={`Open ${concept.name}`}
                    >
                      <span className="sr-only">Open {concept.name}</span>
                    </Link>
                    <CardHeader className="relative z-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{concept.name}</CardTitle>
                          <CardDescription className={tweetPreview ? "line-clamp-2" : undefined}>
                            {concept.summary}
                          </CardDescription>
                        </div>
                        {installForConcept ? (
                          <div className="relative z-20">
                            <CopyButton
                              value={installForConcept}
                              label="Copy install command"
                              title="Copy install command"
                              iconOnly
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 border-slate-200/80 bg-white/90"
                            />
                          </div>
                        ) : null}
                      </div>

                      {!tweetPreview ? (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {concept.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="border-slate-200 text-slate-600"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </CardHeader>
                    {tweetPreview ? (
                      <CardContent className="relative z-0 p-0 -mt-3">
                        <div className="relative z-20 overflow-hidden rounded-b-2xl">
                          <TweetEmbed
                            url={tweetPreview.url}
                            id={tweetPreview.id}
                            variant="media"
                            className="shadow-none"
                          />
                        </div>
                      </CardContent>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
