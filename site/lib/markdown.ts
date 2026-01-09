import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { codeToHtml } from "shiki";
import { visit } from "unist-util-visit";

const THEME = "vitesse-light";

type CodeNode = {
  type: "code";
  lang?: string | null;
  value: string;
};

type ParentNode = {
  children: Array<CodeNode | { type: string; value?: string }>;
};

function remarkShiki() {
  return async (tree: ParentNode) => {
    const tasks: Promise<void>[] = [];
    visit(tree, "code", (node: CodeNode, index, parent) => {
      if (!parent || typeof index !== "number") return;
      const lang = node.lang || "text";
      tasks.push(
        codeToHtml(node.value, { lang, theme: THEME }).then((html) => {
          parent.children[index] = { type: "html", value: html };
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
