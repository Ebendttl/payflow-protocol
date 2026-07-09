/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing from workspace packages
  transpilePackages: ['@payflow/sdk'],
  // Disable ESLint during build (handled separately by CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build for now (contributors implement stubs)
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/rpc',
        destination:
          process.env.NEXT_PUBLIC_HORIZON_RPC_URL || 'https://soroban-testnet.stellar.org',
      },
    ];
  },
};

module.exports = nextConfig;
