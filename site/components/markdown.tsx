import parse, { domToReact, type Element, type HTMLReactParserOptions } from "html-react-parser";

import { TweetEmbed } from "@/components/tweet-embed";
import { cn } from "@/lib/utils";

type MarkdownProps = {
  html: string;
  className?: string;
};

export function Markdown({ html, className }: MarkdownProps) {
  if (!html.trim()) {
    return null;
  }

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type !== "tag") {
        return;
      }

      const node = domNode as Element;

      if (node.name !== "tweetembed") {
        return;
      }

      const { id, url, variant, class: classAttr, className: classNameAttr } = node.attribs ?? {};
      const normalizedVariant = variant === "media" || variant === "default" ? variant : undefined;
      const children = node.children?.length ? domToReact(node.children, options) : null;

      return (
        <>
          <TweetEmbed
            id={id}
            url={url}
            variant={normalizedVariant}
            className={classNameAttr ?? classAttr}
          />
          {children}
        </>
      );
    },
  };

  return (
    <div
      className={cn(
        "markdown [&_ul]:list-disc [&_ol]:list-decimal [&_li]:marker:text-muted-foreground/60",
        className,
      )}
    >
      {parse(html, options)}
    </div>
  );
}
