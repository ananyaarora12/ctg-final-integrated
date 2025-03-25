/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure webpack to handle global values properly
  webpack: (config) => {
    return config
  },
  images: {
    domains: ['randomuser.me', 'samarthanam.org', 'source.unsplash.com', 'www.google.com', 'images.unsplash.com'],
    unoptimized: true,
  },
};

export default nextConfig; 