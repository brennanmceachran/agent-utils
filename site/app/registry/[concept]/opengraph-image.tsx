import { ImageResponse } from "next/og";

import { getConceptBySlug, getConcepts } from "@/lib/registry";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const dynamicParams = false;

export function generateStaticParams() {
  return getConcepts().map((concept) => ({ concept: concept.slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: { concept: string };
}) {
  const concept = getConceptBySlug(params.concept);
  const title = concept?.name ?? "Agent Utils";
  const summary = concept?.summary ?? "Installable OpenCode utilities.";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#f8fafc",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "22px",
          textTransform: "uppercase",
          letterSpacing: "0.28em",
          color: "#cbd5f5",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "16px",
            background: "#f8fafc",
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          AU
        </div>
        Agent Utils Registry
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ fontSize: "64px", fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: "28px", lineHeight: 1.4, color: "#e2e8f0" }}>{summary}</div>
      </div>

      <div style={{ fontSize: "22px", color: "#94a3b8" }}>
        Installable OpenCode utilities with guided workflows.
      </div>
    </div>,
    size,
  );
}
