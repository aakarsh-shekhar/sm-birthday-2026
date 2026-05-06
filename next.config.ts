import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Requests hit middleware first; Next clones the body with a size cap. Explicit 10MB matches the
  // framework default and avoids truncation for admin image uploads before the route runs.
  experimental: {
    proxyClientMaxBodySize: "10mb",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.centerparcs.nl" },
      { protocol: "https", hostname: "www.centerparcs.eu" },
      { protocol: "https", hostname: "www.centerparcs.de" },
    ],
  },
};

export default nextConfig;
