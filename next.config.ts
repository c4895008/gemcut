import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出，用于 GitHub Pages 部署
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
