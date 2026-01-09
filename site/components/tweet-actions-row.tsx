"use client";

import { useEffect, useState } from "react";

import { Heart, Link2, MessageCircle } from "lucide-react";
import type { EnrichedTweet } from "react-tweet";
import { Verified, VerifiedBusiness, VerifiedGovernment, formatNumber } from "react-tweet";

import { cn } from "@/lib/utils";

type TweetActionsRowProps = {
  tweetUrl: string;
  likeUrl: string;
  replyUrl: string;
  likeCount: number;
  user: EnrichedTweet["user"];
  className?: string;
};

type VerifiedBadgeType = "default" | "government" | "business";

function getVerifiedBadge(user: EnrichedTweet["user"]) {
  if (!(user.verified || user.is_blue_verified || user.verified_type)) {
    return null;
  }

  let badge: VerifiedBadgeType = "default";
  if (user.verified_type === "Government") {
    badge = "government";
  } else if (user.verified_type === "Business") {
    badge = "business";
  }

  const icon =
    badge === "government" ? (
      <VerifiedGovernment />
    ) : badge === "business" ? (
      <VerifiedBusiness />
    ) : (
      <Verified />
    );

  const colorClass =
    badge === "business"
      ? ""
      : user.is_blue_verified
        ? "text-[#1d9bf0]"
        : "text-[rgb(130,154,171)]";

  return (
    <span className={cn("flex h-4 w-4 items-center justify-center text-[0.7rem]", colorClass)}>
      {icon}
    </span>
  );
}

export function TweetActionsRow({
  tweetUrl,
  likeUrl,
  replyUrl,
  likeCount,
  user,
  className,
}: TweetActionsRowProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tweetUrl);
      setCopied(true);
    } catch (error) {
      setCopied(false);
    }
  };

  const verifiedBadge = getVerifiedBadge(user);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-[0.75rem] text-muted-foreground",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={likeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-slate-600 transition hover:text-rose-500"
        >
          <Heart className="h-3.5 w-3.5" fill="currentColor" />
          <span className="font-semibold text-slate-700">{formatNumber(likeCount)}</span>
        </a>
        <a
          href={replyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-slate-600 transition hover:text-blue-600"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="font-semibold">Reply</span>
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-slate-600 transition hover:text-emerald-600"
        >
          <Link2 className="h-3.5 w-3.5" />
          <span className="font-semibold">{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[0.7rem]">
        <a
          href={tweetUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-muted-foreground/60 opacity-70 transition hover:opacity-100 hover:text-muted-foreground"
        >
          Open in X
        </a>
        <a
          href={user.url}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-slate-900 transition hover:text-slate-950"
        >
          @{user.screen_name}
        </a>
        <a
          href={user.url}
          target="_blank"
          rel="noreferrer"
          className="relative flex h-7 w-7 items-center justify-center"
        >
          <img
            src={user.profile_image_url_https}
            alt={user.screen_name}
            className="h-7 w-7 rounded-full border border-white/80"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {verifiedBadge ? (
            <span className="absolute -bottom-2 -right-2 text-[0.65rem] leading-none">
              {verifiedBadge}
            </span>
          ) : null}
        </a>
      </div>
    </div>
  );
}
