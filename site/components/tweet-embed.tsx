import type { CSSProperties } from "react";
import type { EnrichedTweet } from "react-tweet";

import { enrichTweet } from "react-tweet";
import { getTweet } from "react-tweet/api";

import { TweetActionsRow } from "@/components/tweet-actions-row";
import { cn } from "@/lib/utils";

const MP4_TYPE = "video/mp4";

type TweetEmbedProps = {
  id?: string;
  url?: string;
  className?: string;
  variant?: "full" | "media";
};

type TweetResponse = Awaited<ReturnType<typeof getTweet>>;

type TweetData = NonNullable<TweetResponse>;

type MediaItem = NonNullable<TweetData["mediaDetails"]>[number];

type MediaVideo = Extract<MediaItem, { type: "video" | "animated_gif" }>;

type VideoSource = {
  src: string;
  type: string;
};

type MediaPhotoSource = {
  src: string;
  width?: number;
  height?: number;
  alt: string;
};

type TweetEntity = EnrichedTweet["entities"][number];

const clampStyle: CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

function getTweetId({ id, url }: { id?: string; url?: string }) {
  if (id) {
    return id;
  }

  if (!url) {
    return null;
  }

  const match = url.match(/status\/(\d+)/);
  return match?.[1] ?? null;
}

function getFallbackUrl(id: string, url?: string) {
  return url ?? `https://x.com/i/web/status/${id}`;
}

function getVideoMedia(tweet: TweetResponse): MediaVideo | null {
  const media = tweet?.mediaDetails?.find(
    (item) => item.type === "video" || item.type === "animated_gif",
  );

  if (!media) {
    return null;
  }

  return media;
}

function pickBestMp4FromMedia(media: MediaVideo | null): VideoSource | null {
  if (!media?.video_info?.variants?.length) {
    return null;
  }

  const mp4Variants = media.video_info.variants.filter(
    (variant) => variant.content_type === MP4_TYPE,
  );

  if (!mp4Variants.length) {
    return null;
  }

  const best = [...mp4Variants].sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];

  return best ? { src: best.url, type: best.content_type } : null;
}

function parseResolutionScore(url: string) {
  const match = url.match(/\/(\d+)x(\d+)\//);

  if (!match) {
    return 0;
  }

  return Number(match[1]) * Number(match[2]);
}

function pickBestMp4FromTweetVideo(video: TweetData["video"] | undefined): VideoSource | null {
  const mp4Variants = (video?.variants ?? []).filter((variant) => variant.type === MP4_TYPE);

  if (!mp4Variants.length) {
    return null;
  }

  const best = [...mp4Variants].sort(
    (a, b) => parseResolutionScore(b.src) - parseResolutionScore(a.src),
  )[0];

  return best ?? null;
}

function getPhoto(tweet: TweetResponse): MediaPhotoSource | null {
  const photo = tweet?.photos?.[0];

  if (photo) {
    return {
      src: photo.url,
      width: photo.width,
      height: photo.height,
      alt: "Tweet image",
    };
  }

  const mediaPhoto = tweet?.mediaDetails?.find((item) => item.type === "photo");

  if (!mediaPhoto || mediaPhoto.type !== "photo") {
    return null;
  }

  return {
    src: mediaPhoto.media_url_https,
    width: mediaPhoto.original_info?.width,
    height: mediaPhoto.original_info?.height,
    alt: "Tweet image",
  };
}

function getVideoAspectRatio(media: MediaVideo | null, video: TweetData["video"] | undefined) {
  if (media?.video_info?.aspect_ratio?.length === 2) {
    return `${media.video_info.aspect_ratio[0]} / ${media.video_info.aspect_ratio[1]}`;
  }

  if (video?.aspectRatio?.length === 2) {
    return `${video.aspectRatio[0]} / ${video.aspectRatio[1]}`;
  }

  return "16 / 9";
}

function getImageAspectRatio(photo: MediaPhotoSource | null) {
  if (photo?.width && photo.height) {
    return `${photo.width} / ${photo.height}`;
  }

  return "16 / 9";
}

function renderTweetText(entities: TweetEntity[]) {
  return entities.map((entity) => {
    if (entity.type === "media") {
      return null;
    }

    const key = `${entity.type}-${entity.indices.join("-")}`;

    if (entity.type === "text") {
      return <span key={key}>{entity.text}</span>;
    }

    return (
      <a
        key={key}
        href={entity.href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-slate-700 underline decoration-transparent underline-offset-2 transition hover:text-slate-900 hover:decoration-slate-300"
      >
        {entity.text}
      </a>
    );
  });
}

function TweetEmbedFallback({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm",
        className,
      )}
    >
      Tweet unavailable.{" "}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground underline decoration-border/80 underline-offset-4"
      >
        Open in X
      </a>
      .
    </div>
  );
}

export async function TweetEmbed({ id, url, className, variant = "full" }: TweetEmbedProps) {
  const tweetId = getTweetId({ id, url });

  if (!tweetId) {
    return null;
  }

  const fallbackUrl = getFallbackUrl(tweetId, url);
  let tweet: TweetResponse;

  try {
    tweet = await getTweet(tweetId);
  } catch (error) {
    return <TweetEmbedFallback url={fallbackUrl} className={className} />;
  }

  if (!tweet) {
    return <TweetEmbedFallback url={fallbackUrl} className={className} />;
  }

  const tweetData = enrichTweet(tweet);
  const tweetUrl = tweetData.url ?? fallbackUrl;
  const videoMedia = getVideoMedia(tweet);
  const photo = getPhoto(tweet);
  const mp4Variant = pickBestMp4FromMedia(videoMedia) ?? pickBestMp4FromTweetVideo(tweet.video);
  const aspectRatio = mp4Variant
    ? getVideoAspectRatio(videoMedia, tweet.video)
    : getImageAspectRatio(photo);
  const poster = tweet.video?.poster ?? videoMedia?.media_url_https;
  const hasMedia = Boolean(mp4Variant || photo);

  if (variant === "media") {
    if (!mp4Variant && !photo) {
      return null;
    }

    return (
      <div
        className={cn(
          "overflow-hidden rounded-b-2xl border border-border/70 bg-card/80 shadow-sm",
          className,
        )}
      >
        {mp4Variant ? (
          <div className="relative w-full bg-slate-950" style={{ aspectRatio: "16 / 9" }}>
            <video
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster={poster}
              aria-label="Tweet video"
              crossOrigin="anonymous"
            >
              <source src={mp4Variant.src} type={mp4Variant.type} />
              <track kind="captions" srcLang="en" label="English" src="data:text/vtt,WEBVTT" />
            </video>
          </div>
        ) : photo ? (
          <div className="relative w-full bg-slate-950" style={{ aspectRatio: "16 / 9" }}>
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur",
        className,
      )}
    >
      {mp4Variant ? (
        <div className="relative w-full bg-slate-950" style={{ aspectRatio }}>
          <video
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
            poster={poster}
            aria-label="Tweet video"
            crossOrigin="anonymous"
          >
            <source src={mp4Variant.src} type={mp4Variant.type} />
            <track kind="captions" srcLang="en" label="English" src="data:text/vtt,WEBVTT" />
          </video>
        </div>
      ) : photo ? (
        <div className="relative w-full bg-slate-950" style={{ aspectRatio }}>
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            className="h-full w-full object-contain"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        </div>
      ) : null}

      <div className={cn("bg-card/80 px-6 py-4", hasMedia ? "border-t border-border/70" : "")}>
        <div className="relative">
          <p className="pr-16 text-sm leading-snug text-slate-700" style={clampStyle}>
            {renderTweetText(tweetData.entities)}
          </p>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-0 right-1 z-10 whitespace-nowrap rounded-full bg-card/95 px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground shadow-sm transition hover:text-foreground"
          >
            Show more
          </a>
        </div>
        <TweetActionsRow
          tweetUrl={tweetUrl}
          likeUrl={tweetData.like_url}
          replyUrl={tweetData.reply_url}
          likeCount={tweetData.favorite_count}
          user={tweetData.user}
          className="mt-3"
        />
      </div>
    </div>
  );
}
