/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Server Actions
  },

  // Environment variables available on the client
  env: {
    NEXT_PUBLIC_CLIENT_ID: process.env.CLIENT_ID,
  },

  // Disable image optimization for external Discord CDN images
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
