/** @type {import('next').NextConfig} */
const path = require("node:path");
const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";

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
