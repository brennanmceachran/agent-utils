type BuildInstallCommandArgs = {
  origin: string;
  basePath: string;
  itemName: string;
  installPath?: string;
  postInstall?: string;
};

export function getBasePath() {
  const fallback = process.env.NODE_ENV === "production" ? "agent-utils" : "";
  const raw = process.env.BASE_PATH || fallback;
  const trimmed = raw.replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "";
}

export function getDefaultOrigin(basePath: string) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || "3002";
    return `http://localhost:${port}`;
  }

  const repo = process.env.GITHUB_REPOSITORY;
  if (repo?.includes("/")) {
    const [owner, name] = repo.split("/");
    if (owner && name) {
      return basePath ? `https://${owner}.github.io` : `https://${owner}.github.io/${name}`;
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://your-site-url";
}

export function buildInstallCommand({
  origin,
  basePath,
  itemName,
  installPath,
  postInstall,
}: BuildInstallCommandArgs) {
  const normalizedBase = basePath ? basePath.replace(/\/$/, "") : "";
  const effectiveBase = normalizedBase && origin.endsWith(normalizedBase) ? "" : normalizedBase;
  const fileName = installPath || `${itemName}.json`;
  const url = `${origin}${effectiveBase}/${fileName}`;
  const base = `npx shadcn@latest add ${url}`;
  if (!postInstall) {
    return base;
  }
  return `${base} && ${postInstall}`;
}
