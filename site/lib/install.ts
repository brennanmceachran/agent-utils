import path from "node:path";

type BuildInstallCommandArgs = {
  origin: string;
  basePath: string;
  itemName: string;
  installPath?: string;
  postInstall?: string;
};

export function getBasePath() {
  const isDev = process.env.NODE_ENV === "development";
  const rawBasePath = process.env.BASE_PATH;

  if (rawBasePath) {
    const trimmed = rawBasePath.replace(/^\/+|\/+$/g, "");
    return trimmed ? `/${trimmed}` : "";
  }

  if (isDev) {
    return "";
  }

  const cwdName = path.basename(process.cwd());
  const repoName = cwdName === "site" ? path.basename(path.resolve(process.cwd(), "..")) : cwdName;
  const fallback = repoName || "agent-utils";
  return `/${fallback}`;
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
      const isUserPage = name === `${owner}.github.io`;
      if (isUserPage) {
        return basePath ? `https://${owner}.github.io${basePath}` : `https://${owner}.github.io`;
      }
      return `https://${owner}.github.io/${name}`;
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
