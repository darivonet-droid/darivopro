import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(presupuestos|facturas|clientes).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "darivo-listas",
          expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
          networkTimeoutSeconds: 8,
        },
      },
      {
        urlPattern: /\/(presupuestos|facturas|clientes|dashboard)(\/)?$/i,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "darivo-pages" },
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
};

export default withPWA(nextConfig);
