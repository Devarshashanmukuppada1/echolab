/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react', 'lucide-react'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  transpilePackages: ['lucide-react'],
  logging: {
    fetches: {
      fullUrl: true,
      logging: ['detailed', 'cached'],
    },
  },
}

export default nextConfig
