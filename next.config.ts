import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Gear images are capped at 5 MB; the extra room covers multipart
      // boundaries and the remaining form fields.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
