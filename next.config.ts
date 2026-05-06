import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.centerparcs.nl" },
      { protocol: "https", hostname: "www.centerparcs.eu" },
      { protocol: "https", hostname: "www.centerparcs.de" },
    ],
  },
};

export default nextConfig;
