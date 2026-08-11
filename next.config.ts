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
      // Seeded demo catalogue imagery only. Gear uploaded through the app is
      // always served from Cloudinary above.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
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
