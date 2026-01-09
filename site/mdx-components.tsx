import type { MDXComponents } from "mdx/types";

import { MdxCodeBlock } from "@/components/mdx-code-block";
import { TweetEmbed } from "@/components/tweet-embed";

const components = {
  TweetEmbed,
  pre: MdxCodeBlock,
} satisfies MDXComponents;

export function useMDXComponents(overrides: MDXComponents = {}): MDXComponents {
  return { ...components, ...overrides };
}
