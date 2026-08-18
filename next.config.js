/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Allow external images from images.unsplash.com used with next/image
nextConfig.images = {
  domains: ['images.unsplash.com'],
};

module.exports = nextConfig;
