import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  // Sin esto, el runtimeCaching de abajo REEMPLAZA por completo el de next-pwa
  // por defecto (imágenes, fuentes, JS/CSS, páginas) en vez de extenderlo — la
  // landing y el resto de páginas fuera de la lista de abajo se quedaban sin
  // ninguna estrategia de caché offline.
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Admin y Empresa son paneles de escritorio, no PWA instalable — deben
      // comportarse como páginas web normales, sin caché offline. Esta regla
      // va primero (gana la primera coincidencia) para excluirlos antes de
      // que apliquen las reglas de abajo o el caching por defecto de next-pwa.
      {
        urlPattern: /^https?:\/\/[^/]+\/(admin|empresa)(\/.*)?$/i,
        handler: "NetworkOnly",
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(cotizaciones|facturas|clientes).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "darivo-listas",
          expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
          networkTimeoutSeconds: 8,
        },
      },
      {
        urlPattern: /\/(cotizaciones|facturas|clientes|dashboard)(\/)?$/i,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "darivo-pages" },
      },
      // Partner es su propia PWA instalable (manifest propio, ver
      // partner-manifest.json) — caché independiente, sin compartir
      // "darivo-pages" con Móvil (regla absoluta 15/07/2026: no mezclar PWA
      // de Partner con la de Móvil).
      {
        urlPattern: /\/partner(\/)?$/i,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "darivo-partner-pages" },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default withPWA(nextConfig);
