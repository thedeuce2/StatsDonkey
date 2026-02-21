/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure we aren't doing anything fancy with path aliases during build
  transpilePackages: ['lucide-react']
};

export default nextConfig;
