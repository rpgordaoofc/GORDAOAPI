/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

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
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
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
