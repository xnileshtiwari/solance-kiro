import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.31.105'],
  env: {
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  },
};

export default nextConfig;
