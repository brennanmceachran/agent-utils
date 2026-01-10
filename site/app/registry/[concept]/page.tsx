import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTweet } from "react-tweet/api";

import { PlatformTabs } from "@/components/platform-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConceptContent } from "@/lib/concept-content";
import { buildHighlightedFiles, highlightSnippet } from "@/lib/highlight";
import { buildInstallCommand, getBasePath, getDefaultOrigin } from "@/lib/install";
import { getConceptBySlug, getConcepts, getItemsByConcept, readRegistryFile } from "@/lib/registry";
import { cn } from "@/lib/utils";

const MEDIA_TYPE = "video/mp4";

type TweetResponse = Awaited<ReturnType<typeof getTweet>>;

type TweetMedia = {
  image?: string;
  video?: string;
};

function extractTweetSource(overview: string) {
  const urlMatch = overview.match(/<TweetEmbed[^>]*url=["']([^"']+)["']/);
  const idMatch = overview.match(/<TweetEmbed[^>]*id=["']([^"']+)["']/);
  const url = urlMatch?.[1];
  const id = idMatch?.[1] ?? (url ? url.match(/status\/(\d+)/)?.[1] : undefined);

  return { id, url };
}

function pickBestVideo(tweet: TweetResponse) {
  const media = tweet?.mediaDetails?.find(
    (item) => item.type === "video" || item.type === "animated_gif",
  );
  const mediaVariants = media?.video_info?.variants ?? [];
  const tweetVariants = tweet?.video?.variants ?? [];

  const mp4Variants = [
    ...mediaVariants
      .filter((variant) => variant.content_type === MEDIA_TYPE)
      .map((variant) => ({ url: variant.url, bitrate: variant.bitrate ?? 0 })),
    ...tweetVariants
      .filter((variant) => variant.type === MEDIA_TYPE)
      .map((variant) => ({ url: variant.src, bitrate: 0 })),
  ];

  if (!mp4Variants.length) {
    return undefined;
  }

  const best = [...mp4Variants].sort((a, b) => b.bitrate - a.bitrate)[0];
  return best?.url;
}

function pickPoster(tweet: TweetResponse) {
  const poster = tweet?.video?.poster;
  if (poster) {
    return poster;
  }

  const media = tweet?.mediaDetails?.find((item) => item.type === "video");
  if (media?.media_url_https) {
    return media.media_url_https;
  }

  const photo = tweet?.photos?.[0]?.url;
  if (photo) {
    return photo;
  }

  const mediaPhoto = tweet?.mediaDetails?.find((item) => item.type === "photo");
  return mediaPhoto?.media_url_https;
}

async function getTweetMedia(conceptSlug: string): Promise<TweetMedia | null> {
  try {
    const overview = readRegistryFile(`registry/${conceptSlug}/content/overview.mdx`);
    const { id } = extractTweetSource(overview);

    if (!id) {
      return null;
    }

    const tweet = await getTweet(id);
    if (!tweet) {
      return null;
    }

    return {
      image: pickPoster(tweet),
      video: pickBestVideo(tweet),
    };
  } catch (error) {
    return null;
  }
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ concept: string }>;
}): Promise<Metadata> {
  const { concept: conceptSlug } = await params;
  const concept = getConceptBySlug(conceptSlug);

  if (!concept) {
    return {};
  }

  const basePath = getBasePath();
  const origin = getDefaultOrigin(basePath);
  const originUrl = new URL(origin);
  const originPath = originUrl.pathname === "/" ? "" : originUrl.pathname.replace(/\/$/, "");
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const githubBasePath = repoName && !repoName.endsWith(".github.io") ? `/${repoName}` : "";
  const resolvedBasePath =
    basePath || originPath || (originUrl.hostname.endsWith(".github.io") ? githubBasePath : "");
  const canonicalUrl = new URL(`${resolvedBasePath}/registry/${concept.slug}/`, originUrl.origin);
  const fallbackImage = new URL(
    `${resolvedBasePath}/registry/${concept.slug}/opengraph-image`,
    originUrl.origin,
  ).toString();
  const tweetMedia = await getTweetMedia(concept.slug);
  const imageUrls = [fallbackImage, tweetMedia?.image].filter(Boolean) as string[];

  return {
    referrer: "no-referrer",
    metadataBase: new URL(origin),
    title: `${concept.name} | Agent Utils Registry`,
    description: concept.summary,
    alternates: {
      canonical: canonicalUrl.toString(),
    },
    openGraph: {
      title: `${concept.name} | Agent Utils`,
      description: concept.summary,
      type: "article",
      url: canonicalUrl,
      images: imageUrls.map((url) => ({ url })),
      videos: tweetMedia?.video ? [{ url: tweetMedia.video, type: MEDIA_TYPE }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${concept.name} | Agent Utils`,
      description: concept.summary,
      images: imageUrls,
    },
  };
}

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

  const concepts = getConcepts().sort((a, b) => a.name.localeCompare(b.name));
  const variants = getItemsByConcept(concept.slug);
  const opencodeVariant = variants.find((item) => item.meta?.platform === "opencode");
  const basePath = getBasePath();
  const codeBlocks = opencodeVariant ? await buildHighlightedFiles(opencodeVariant.files) : [];
  const content = await getConceptContent(concept.slug);
  const Overview = content.overview;
  const Quickstart = content.quickstart;
  const Usage = content.usage;
  const Examples = content.examples;
  const Notes = content.notes;
  const origin = getDefaultOrigin(basePath);
  const installCommand = opencodeVariant
    ? buildInstallCommand({
        origin,
        basePath,
        itemName: opencodeVariant.name,
        installPath: opencodeVariant.meta?.installPath,
        postInstall: opencodeVariant.meta?.postInstall,
      })
    : "";
  const installCommandHtml = installCommand ? await highlightSnippet(installCommand, "bash") : "";

  const toc = [
    {
      id: "overview",
      label: "Overview",
      visible: Boolean(Overview),
    },
    { id: "install", label: "Installation", visible: true },
    { id: "usage", label: "Usage", visible: Boolean(Usage) },
    {
      id: "examples",
      label: "Examples",
      visible: Boolean(Examples),
    },
    { id: "notes", label: "Notes", visible: Boolean(Notes) },
  ].filter((item) => item.visible);

  return (
    <main className="min-h-screen bg-background">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
          <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        </div>

        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="flex w-full items-center gap-6 px-4 py-3 sm:px-6 xl:px-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                AU
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  Agent Utils
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/registry" className="hover:text-foreground">
                Registry
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <a
                  href="https://github.com/brennanmceachran/agent-utils"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/registry">Browse registry</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="relative w-full px-4 pb-16 pt-6 sm:px-6 xl:px-10">
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(200px,240px)_minmax(0,720px)_minmax(0,1fr)] xl:grid-cols-[minmax(240px,1fr)_minmax(0,760px)_minmax(240px,1fr)]">
            <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:justify-self-start lg:overflow-y-auto lg:pr-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Registry
                  </p>
                  <nav className="space-y-1">
                    {concepts.map((item) => {
                      const active = item.slug === concept.slug;
                      return (
                        <Link
                          key={item.slug}
                          href={`/registry/${item.slug}`}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                            active
                              ? "bg-foreground text-background shadow-sm"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )}
                        >
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </aside>

            <div className="min-w-0 max-w-full lg:justify-self-center">
              <div className="space-y-14">
                <section className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {opencodeVariant ? <Badge variant="outline">OpenCode ready</Badge> : null}
                    <Badge variant="outline">
                      {variants.length} {variants.length === 1 ? "variant" : "variants"}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                      {concept.name}
                    </h1>
                    <p className="text-lg text-muted-foreground">{concept.summary}</p>
                  </div>

                  {Overview ? (
                    <section id="overview" className="scroll-mt-24 space-y-6">
                      <div className="markdown">
                        <Overview />
                      </div>
                    </section>
                  ) : null}
                </section>

                <section id="install" className="scroll-mt-24 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Installation
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Install
                      </h2>
                    </div>
                    <div className="min-w-[220px]">
                      <select
                        aria-label="Platform"
                        defaultValue="opencode"
                        className="w-full rounded-xl border border-border/70 bg-white/80 px-3 py-2 text-sm font-medium text-foreground shadow-sm"
                      >
                        <option value="opencode">OpenCode</option>
                        <option value="claude" disabled>
                          Claude Code (soon)
                        </option>
                        <option value="codex" disabled>
                          Codex CLI (soon)
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-white/80 p-6 shadow-sm">
                    <PlatformTabs
                      opencodeVariant={opencodeVariant}
                      installCommand={installCommand}
                      installCommandHtml={installCommandHtml}
                      codeBlocks={codeBlocks}
                    />
                  </div>
                </section>

                {Quickstart ? (
                  <section className="space-y-6">
                    <Card className="bg-white/80">
                      <CardHeader>
                        <CardTitle>Quick start</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="markdown">
                          <Quickstart />
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                ) : null}

                {Usage ? (
                  <section id="usage" className="scroll-mt-24 space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Usage
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        How to use it well
                      </h2>
                    </div>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="markdown">
                          <Usage />
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                ) : null}

                {Examples ? (
                  <section id="examples" className="scroll-mt-24 space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Examples
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Shared runs
                      </h2>
                    </div>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="markdown">
                          <Examples />
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                ) : null}

                {Notes ? (
                  <section id="notes" className="scroll-mt-24 space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Notes
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Notes
                      </h2>
                    </div>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="markdown">
                          <Notes />
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                ) : null}
              </div>
            </div>

            <aside className="hidden xl:flex xl:flex-col xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)] xl:justify-self-end xl:overflow-y-auto xl:pl-2">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  On this page
                </p>
                <nav className="space-y-2 text-sm text-muted-foreground">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-md px-2 py-1 transition hover:bg-muted/60 hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
