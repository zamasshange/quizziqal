import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
    resolveAlias: {
      "@/lib/quizzical": path.join(__dirname, "lib/quizzical/lib"),
    },
  },
};

export default nextConfig;
