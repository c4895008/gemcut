import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 启用静态导出，生成纯 HTML 文件
  basePath: "/gemcut", // GitHub Pages 子路径
  images: {
    unoptimized: true, // GitHub Pages 不支持 Next.js 图片优化
  },
};

export default nextConfig;
