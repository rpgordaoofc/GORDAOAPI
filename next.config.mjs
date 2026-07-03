/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },

  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://gordao0ofc.discloud.app/:path*",
      },
    ];
  },
};

export default nextConfig;
