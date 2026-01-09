import type { Code, Html, Parent, Root } from "mdast";

import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { codeToHtml } from "shiki";
import { visit } from "unist-util-visit";

const THEME = "vitesse-light";

function remarkShiki() {
  return async (tree: Root) => {
    const tasks: Promise<void>[] = [];
    visit(tree, "code", (node: Code, index, parent: Parent | null | undefined) => {
      if (!parent || typeof index !== "number") return;
      const lang = node.lang || "text";
      tasks.push(
        codeToHtml(node.value, { lang, theme: THEME }).then((html) => {
          const htmlNode: Html = { type: "html", value: html };
          parent.children[index] = htmlNode;
        }),
      );
    });
    await Promise.all(tasks);
  };
}

export async function renderMarkdown(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkShiki)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);

  return result.toString();
}
