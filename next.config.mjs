/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['d3o5xota0a1fcr.cloudfront.net'],
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
}

export default nextConfig
