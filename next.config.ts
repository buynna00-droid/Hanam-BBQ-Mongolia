import type { NextConfig } from "next";
import { blobPublicOrigin } from "./lib/storage-config";
const blobOrigin = blobPublicOrigin();
const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      ...(blobOrigin
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(blobOrigin).hostname,
              pathname: "/menu/**",
            },
          ]
        : []),
      ...(process.env.S3_PUBLIC_URL
        ? [
            {
              protocol: new URL(process.env.S3_PUBLIC_URL).protocol.slice(
                0,
                -1,
              ) as "https",
              hostname: new URL(process.env.S3_PUBLIC_URL).hostname,
              pathname:
                new URL(process.env.S3_PUBLIC_URL).pathname.replace(/\/$/, "") +
                "/**",
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
export default config;
