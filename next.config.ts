import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.chariow.com" },
      { protocol: "https", hostname: "assets.cdn.chariow.com" },
      { protocol: "https", hostname: "cdn.axazara.com" },
      { protocol: "https", hostname: "assets.cdn.moneroo.io" },
      { protocol: "https", hostname: "vimeo.com" },
      { protocol: "https", hostname: "player.vimeo.com" },
    ],
  },
};

export default nextConfig;
