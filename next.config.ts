import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    // Increase body size limit for Server Actions (default is 1MB)
    // Set to 10MB to allow for high-quality label images
    // This applies to all Server Actions that handle FormData
    bodySizeLimit: "10mb",
  },
  // Configure allowed image domains for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Note: api.bodyParser is for Pages Router only, not needed for App Router
};

export default nextConfig;
