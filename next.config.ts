import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' + 'unsafe-eval' required by Next.js framework runtime;
  // Vercel Live for preview comments
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://lh3.googleusercontent.com https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  "connect-src 'self' https://api.upstash.com https://*.upstash.io https://api.resend.com https://secure.osb.pf wss://ws.pusherapp.com https://vercel.live wss://*.pusher.com https://*.tile.openstreetmap.org",
  "frame-src 'self' https://secure.osb.pf https://vercel.live",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://secure.osb.pf",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
