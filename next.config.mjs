/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  devIndicators: false,

  images: {
    unoptimized: true,
  },

  // Reduz uso de memória desabilitando source maps em produção
  productionBrowserSourceMaps: false,

  experimental: {
    // Reduz o tamanho do bundle do servidor
    optimizePackageImports: [
      "@heroicons/react",
      "lucide-react",
      "recharts",
    ],
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
