import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除 output: "export"，使用默认的服务端渲染模式
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
