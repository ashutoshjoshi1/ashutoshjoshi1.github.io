import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repository = process.env.GITHUB_REPOSITORY ?? "";
const [owner = "", repo = ""] = repository.split("/");
const isUserOrOrgPages = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const basePath = isGithubActions && !isUserOrOrgPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  // Skip strict mode
  reactStrictMode: false,
  // Static export for GitHub Pages (outputs to /out)
  output: "export",
  // Helps direct-link routing behavior on static hosting
  trailingSlash: true,
  // Required for static export
  images: {
    unoptimized: true,
  },
  // Use repo subpath when this is a project page (owner/repo)
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    googleAnalyticsId: process.env.NODE_ENV === "production" ? process.env.GA_MEASUREMENT_ID : "",
  }
};

export default nextConfig;
