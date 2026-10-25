import type { NextConfig } from "next";

/**
 * Static export: the whole site is plain files, so it can be hosted cheaply
 * and reliably on GitHub Pages or any static host. BASE_PATH lets the same
 * build serve from a project sub-path (github.io/OceanTurningPoints) before a
 * custom domain is attached; with oceanturningpoints.org it stays empty.
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
};

export default nextConfig;
