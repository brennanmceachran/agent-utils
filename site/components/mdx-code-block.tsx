import parse from "html-react-parser";

import { isValidElement } from "react";
import type { ReactNode } from "react";

import { highlightSnippet } from "@/lib/highlight";
import { cn } from "@/lib/utils";

type MdxCodeBlockProps = {
  children?: ReactNode;
  className?: string;
};

function extractLanguage(className?: string) {
  if (!className) {
    return "text";
  }

  const match = className.match(/language-([\w-]+)/);
  return match?.[1] ?? "text";
}

function normalizeCode(children: ReactNode) {
  if (typeof children === "string") {
    return children;
  }

  if (Array.isArray(children)) {
    return children.join("");
  }

  return "";
}

type CodeElementProps = {
  children?: ReactNode;
  className?: string;
};

export async function MdxCodeBlock({ children, className }: MdxCodeBlockProps) {
  const codeElement = Array.isArray(children) ? children[0] : children;

  if (!isValidElement<CodeElementProps>(codeElement)) {
    return (
      <div
        className={cn(
          "mt-3 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-foreground",
          className,
        )}
      >
        <pre className="mdx-pre">{children}</pre>
      </div>
    );
  }

  const { children: codeChildren, className: codeClassName } = codeElement.props;
  const rawCode = normalizeCode(codeChildren);
  const language = extractLanguage(codeClassName);

  if (!rawCode.trim()) {
    return null;
  }

  const html = await highlightSnippet(rawCode.trimEnd(), language);

  return (
    <div
      className={cn(
        "mt-3 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-foreground",
        className,
      )}
    >
      <div className="text-[13px]">{parse(html)}</div>
    </div>
  );
}
