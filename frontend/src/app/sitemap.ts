import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://darivopro.com";

// Rutas públicas reales del sitio (grupo (public) + raíz). Las áreas privadas
// tras login no se incluyen. /terminos y /privacidad se publican en la misma sesión.
const RUTAS_PUBLICAS = ["", "/precios", "/login", "/registro", "/contacto", "/terminos", "/privacidad"];

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS_PUBLICAS.map((ruta) => ({
    url: `${SITE_URL}${ruta}`,
    changeFrequency: "monthly",
    priority: ruta === "" ? 1 : 0.7,
  }));
}
