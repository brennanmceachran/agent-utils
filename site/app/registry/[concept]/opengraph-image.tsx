import { ImageResponse } from "next/og";
import { getTweet } from "react-tweet/api";

import { buildInstallCommand, getBasePath, getDefaultOrigin } from "@/lib/install";
import { getConceptBySlug, getConcepts, getItemsByConcept, readRegistryFile } from "@/lib/registry";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const dynamicParams = false;

const MEDIA_TYPE = "video/mp4";

type TweetResponse = Awaited<ReturnType<typeof getTweet>>;

type TweetMedia = {
  image?: string;
  hasVideo?: boolean;
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

    const video = pickBestVideo(tweet);

    return {
      image: pickPoster(tweet),
      hasVideo: Boolean(video),
    };
  } catch (error) {
    return null;
  }
}

function buildInstallPreview(conceptSlug: string) {
  const items = getItemsByConcept(conceptSlug);
  const installItem = items.find((item) => item.meta?.platform === "opencode") ?? items[0];
  const basePath = getBasePath();
  const origin = getDefaultOrigin(basePath);
  const fallbackCommand = "npx shadcn@latest add https://your-site-url/registry.json";
  const installCommand = installItem
    ? buildInstallCommand({
        origin,
        basePath,
        itemName: installItem.name,
        installPath: installItem.meta?.installPath,
        postInstall: installItem.meta?.postInstall,
      })
    : fallbackCommand;
  const baseCommand = installCommand.split(" && ")[0];
  const commandParts = baseCommand.split(" ");
  const commandUrl = commandParts.length > 1 ? commandParts[commandParts.length - 1] : baseCommand;
  const commandPrefix = commandParts.length > 1 ? commandParts.slice(0, -1).join(" ") : "";
  const targetPath =
    installItem?.files?.[0]?.target ??
    installItem?.files?.[0]?.path ??
    `~/.opencode/${conceptSlug}.md`;

  return { commandPrefix, commandUrl, targetPath };
}

export function generateStaticParams() {
  return getConcepts().map((concept) => ({ concept: concept.slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ concept: string }>;
}) {
  const { concept: conceptSlugParam } = await params;
  const concept = getConceptBySlug(conceptSlugParam);
  const conceptSlug = concept?.slug ?? conceptSlugParam;
  const title = concept?.name ?? "Agent Utils";
  const summary = concept?.summary ?? "Installable OpenCode utilities.";
  const tweetMedia = await getTweetMedia(conceptSlug);
  const installPreview = buildInstallPreview(conceptSlug);
  const brandFont = "Space Grotesk, ui-sans-serif, system-ui, sans-serif";
  const monoFont =
    "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        fontFamily: brandFont,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-180px",
            top: "20px",
            width: "380px",
            height: "380px",
            background:
              "radial-gradient(circle at center, rgba(226, 232, 240, 0.9), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-200px",
            top: "80px",
            width: "420px",
            height: "420px",
            background:
              "radial-gradient(circle at center, rgba(191, 219, 254, 0.7), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.35,
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
          padding: "64px",
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "16px",
              backgroundColor: "#0f172a",
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.08em",
            }}
          >
            AU
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                color: "#475569",
              }}
            >
              Agent Utils
            </span>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Registry</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "48px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              flex: 1,
              maxWidth: tweetMedia?.image ? "520px" : "600px",
            }}
          >
            <div
              style={{
                alignSelf: "flex-start",
                padding: "10px 18px",
                borderRadius: "999px",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.24em",
                color: "#475569",
              }}
            >
              OpenCode utility registry
            </div>
            <div style={{ fontSize: "62px", fontWeight: 600, lineHeight: 1.05 }}>{title}</div>
            <div style={{ fontSize: "26px", lineHeight: 1.4, color: "#475569" }}>{summary}</div>
            <div style={{ fontSize: "18px", color: "#64748b" }}>
              Installable utilities with guided workflows.
            </div>
          </div>

          <div style={{ width: "420px", display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "100%",
                borderRadius: "28px",
                background: "linear-gradient(140deg, #0f172a 0%, #1f2937 100%)",
                padding: "28px",
                color: "#e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                boxShadow: "0 28px 60px rgba(15, 23, 42, 0.25)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  color: "#94a3b8",
                }}
              >
                Install preview
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {installPreview.commandPrefix ? (
                  <div style={{ fontFamily: monoFont, fontSize: "18px" }}>
                    {installPreview.commandPrefix}
                  </div>
                ) : null}
                <div
                  style={{
                    fontFamily: monoFont,
                    fontSize: "18px",
                    color: "#7dd3fc",
                    wordBreak: "break-all",
                  }}
                >
                  {installPreview.commandUrl}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "18px",
                  backgroundColor: "rgba(15, 23, 42, 0.45)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <span style={{ fontSize: "18px", color: "#94a3b8" }}>→</span>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  ✓
                </div>
                <div style={{ fontFamily: monoFont, fontSize: "16px" }}>
                  {installPreview.targetPath}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {tweetMedia?.image ? (
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "380px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            zIndex: 4,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "270px",
              borderRadius: "28px",
              overflow: "hidden",
              position: "relative",
              transform: "rotate(-2deg)",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              boxShadow: "0 30px 70px rgba(15, 23, 42, 0.25)",
              backgroundColor: "#ffffff",
              display: "flex",
            }}
          >
            <img
              src={tweetMedia.image}
              alt="Tweet preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "50% 6%",
              }}
            />
            {tweetMedia.hasVideo ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "72px",
                  height: "72px",
                  borderRadius: "999px",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(15, 23, 42, 0.65)",
                  border: "2px solid rgba(248, 250, 252, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.35)",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ display: "block" }}
                >
                  <path d="M8 5v14l11-7z" fill="#f8fafc" />
                </svg>
              </div>
            ) : null}
            <div
              style={{
                position: "absolute",
                bottom: "18px",
                right: "18px",
                padding: "8px 14px",
                borderRadius: "999px",
                backgroundColor: "rgba(248, 250, 252, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#0f172a",
              }}
            >
              Field demo
            </div>
          </div>
          <div style={{ fontSize: "14px", color: "#64748b", letterSpacing: "0.24em" }}>
            LIVE WORKFLOW PREVIEW
          </div>
        </div>
      ) : null}
    </div>,
    size,
  );
}
