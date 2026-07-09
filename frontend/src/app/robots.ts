import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://darivopro.com";

// Bloquea las áreas privadas de los 4 paneles (rutas de app tras login) y deja
// indexable la web pública de marketing. Sitemap en <dominio>/sitemap.xml.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/empresa",
        "/partner",
        "/onboarding",
        "/dashboard",
        "/clientes",
        "/cotizaciones",
        "/facturas",
        "/cierre",
        "/ia",
        "/mas",
        "/ajustes",
        "/recuperar",
        "/nueva-contrasena",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
