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
      // A gallery accepts up to four 5 MB images; the extra room covers
      // multipart boundaries and the remaining form fields.
      bodySizeLimit: "22mb",
    },
  },
};

export default nextConfig;
