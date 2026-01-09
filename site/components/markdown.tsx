import parse from "html-react-parser";

import { cn } from "@/lib/utils";

type MarkdownProps = {
  html: string;
  className?: string;
};

export function Markdown({ html, className }: MarkdownProps) {
  if (!html.trim()) {
    return null;
  }

  return <div className={cn("markdown", className)}>{parse(html)}</div>;
}
