/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Brand logos are served from Firebase Storage; nothing else is
    // loaded remotely, so this stays narrow rather than allowing any host.
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

module.exports = nextConfig;
