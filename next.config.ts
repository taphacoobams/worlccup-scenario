import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/manager", destination: "/dashboard", permanent: false },
      { source: "/manager/login", destination: "/login", permanent: false },
      {
        source: "/manager/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/manager/dashboard/:path*",
        destination: "/dashboard/:path*",
        permanent: false,
      },
      { source: "/fr", destination: "/", permanent: true },
      { source: "/fr/:path*", destination: "/:path*", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
