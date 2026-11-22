import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  experimental: {
    // Folder-to-case-study morphs use React's <ViewTransition>.
    viewTransition: true,
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
