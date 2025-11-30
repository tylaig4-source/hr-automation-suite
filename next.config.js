/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar React Strict Mode para melhor debugging
  reactStrictMode: true,

  // Configurações de imagens
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Configuração experimental
  experimental: {
    // Otimizações de performance
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_APP_NAME: "HR Automation Suite",
    NEXT_PUBLIC_APP_VERSION: "0.1.0",
  },
};

module.exports = nextConfig;

