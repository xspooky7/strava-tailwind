/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["http://195.201.112.203/"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
