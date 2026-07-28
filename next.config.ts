import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stellar.expert",
        pathname: "/img/assets/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/Nodus-protocol/**",
      },
    ],
  },
  async headers() {
    const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const getOrigin = (urlStr: string) => {
      try {
        const url = new URL(urlStr);
        return url.origin;
      } catch {
        return "";
      }
    };

    const rpcOrigin = getOrigin(rpcUrl);
    const apiOrigin = getOrigin(apiUrl);

    const connectSrc = [
      "'self'",
      rpcOrigin,
      apiOrigin,
      "https://soroban-testnet.stellar.org",
      "https://stellar.expert",
      "https://ipfs.io",
      "https://raw.githubusercontent.com",
    ].filter(Boolean).join(" ");

    const cspHeader = [
      "default-src 'self'",
      `connect-src ${connectSrc}`,
      "img-src 'self' blob: data: https://stellar.expert https://ipfs.io https://raw.githubusercontent.com",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;