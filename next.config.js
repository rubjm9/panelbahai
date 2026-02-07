/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'panel-bahai.local'],
  },
  // Configuración de webpack para Web Workers
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configurar para Web Workers
      config.output.globalObject = 'self';
    }
    return config;
  },
  // Configuración para desarrollo local
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Configuración de headers de seguridad
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // CSP: Content Security Policy
    // En desarrollo, permitir 'unsafe-inline' para hot reload
    // En producción, usar política más estricta
    // Permitir unpkg.com para Lunr.js en el worker
    // Permitir Google Fonts y fonts.cdnfonts.com para estilos
    const csp = isProduction
      ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com; script-src-elem 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.cdnfonts.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.cdnfonts.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://fonts.cdnfonts.com; connect-src 'self'; frame-ancestors 'none';"
      : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com; script-src-elem 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.cdnfonts.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.cdnfonts.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://fonts.cdnfonts.com; connect-src 'self' ws: wss:; frame-ancestors 'none';";
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          // HSTS solo en producción
          ...(isProduction
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },
};

module.exports = nextConfig;