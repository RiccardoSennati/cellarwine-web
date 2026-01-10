import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Note: serverActions.bodySizeLimit was removed as we now use direct upload to Supabase Storage
  // If needed in the future, check Next.js 16+ documentation for the correct syntax
};

export default nextConfig;
