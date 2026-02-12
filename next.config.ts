import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  output: 'standalone',
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
