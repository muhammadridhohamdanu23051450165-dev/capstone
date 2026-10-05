import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  outputFileTracingIncludes: {
    '/**': ['./data/database.sqlite'],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
