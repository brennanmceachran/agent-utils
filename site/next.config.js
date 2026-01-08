/** @type {import('next').NextConfig} */
const path = require("node:path");
const rawBasePath =
  process.env.BASE_PATH ?? (process.env.NODE_ENV === "production" ? "agent-utils" : "");
const normalizedBasePath = rawBasePath.replace(/^\/+/, "").replace(/\/+$/, "");
const basePath = normalizedBasePath ? `/${normalizedBasePath}` : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
