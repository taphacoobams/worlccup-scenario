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
      { source: "/groups", destination: "/groupes", permanent: true },
      { source: "/groups/:path*", destination: "/groupes/:path*", permanent: true },
      { source: "/fixtures", destination: "/matchs", permanent: true },
      { source: "/fixtures/:path*", destination: "/matchs/:path*", permanent: true },
      { source: "/teams", destination: "/equipes", permanent: true },
      { source: "/teams/:path*", destination: "/equipes/:path*", permanent: true },
      { source: "/players", destination: "/joueurs", permanent: true },
      { source: "/statistics", destination: "/statistiques", permanent: true },
    ];
  },
};

export default nextConfig;
