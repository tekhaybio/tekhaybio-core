import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

let r2Hostname: string | null = null;
if (process.env.R2_PUBLIC_URL) {
  try {
    const parsed = new URL(process.env.R2_PUBLIC_URL);
    r2Hostname = parsed.hostname;
  } catch {
    // Ignore invalid URL
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tekhaybio-dev.vercel.app",
        pathname: "/api/media/file/**",
      },
      // Pola remote host Vercel Blob dipertahankan untuk backward compatibility file terdahulu
      {
        protocol: "https",
        hostname: "zz3owivpclim5dxf.public.blob.vercel-storage.com",
      },
      // Cloudflare R2 public & dev domains
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      ...(r2Hostname && !r2Hostname.endsWith(".r2.dev")
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
            },
          ]
        : []),
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
      {
        pathname: "/api/r2/**",
      },
    ],
  },
};

export default withPayload(nextConfig);
