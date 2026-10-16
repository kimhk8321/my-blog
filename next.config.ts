import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ["/admin/:path*", "/api/admin/:path*"].map((source) => ({
      source,
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0" },
        { key: "X-Robots-Tag", value: "noindex, nofollow, nosnippet" },
      ],
    }));
  },
};

export default nextConfig;
