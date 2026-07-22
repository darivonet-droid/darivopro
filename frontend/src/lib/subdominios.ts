// DARIVO PRO — Subdominios reales *.darivopro.com → sección base del panel.
//
// Fuente única de verdad de este mapa (antes duplicado a mano en
// middleware.ts, causa del bug de admin.darivopro.com del 19/07/2026: la
// clave "partner" no coincidía con el dominio real "partners.darivopro.com").
//
// Verificado vía API de Vercel (get_project) el 19/07/2026 — dominios
// realmente conectados al proyecto: darivopro.com, www.darivopro.com,
// admin.darivopro.com, empresa.darivopro.com, partners.darivopro.com (con
// "s"). "app.darivopro.com" y "partner.darivopro.com" (sin "s") NO están
// conectados y no resuelven DNS — no usar esos hostnames en enlaces nuevos.
export const SUBDOMINIOS: Record<string, string> = {
  app: "/dashboard", // Darivo Pro Móvil (subdominio aún no conectado en Vercel)
  empresa: "/empresa", // Darivo Pro Empresa
  admin: "/admin", // Darivo Pro Admin
  partners: "/partner", // Panel Partner — dominio real es "partners." (con s)
};

/** Devuelve la sección base del subdominio *.darivopro.com, o null si no aplica (apex, localhost, IP). */
export function baseDeSubdominio(host: string | null | undefined): string | null {
  if (!host) return null;
  const h = host.split(":")[0].toLowerCase();
  const sufijo = ".darivopro.com";
  if (!h.endsWith(sufijo)) return null;
  const sub = h.slice(0, -sufijo.length);
  return SUBDOMINIOS[sub] ?? null;
}

// `destinoPostLogin(hostname)` (fix 19/07/2026) fue eliminada en la auditoría
// RBAC del 21/07/2026: quedó sin ningún caller desde que login/middleware/
// callback resuelven por rol real (destino-post-login.ts, 20/07/2026), y
// mantener un helper que mapea subdominio→panel invitaba a reusarlo como
// fuente de verdad de rol — el subdominio es SOLO ruteo, nunca rol.
// `baseDeSubdominio` (rewrite de "/" bajo SUBDOMAIN_ROUTING_ENABLED) se queda.
