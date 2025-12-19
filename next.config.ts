import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 只在 CI 环境（GitHub Actions）启用静态导出
  // 本地开发时保持服务端渲染模式以支持 API routes
  ...(process.env.GITHUB_ACTIONS && { output: "export" }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
