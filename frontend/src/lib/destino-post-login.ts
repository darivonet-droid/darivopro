// DARIVO PRO — Destino post-login por producto+rol real (20/07/2026).
//
// Reemplaza destinoPostLogin(hostname) (subdominios.ts) como criterio de
// enrutado tras autenticarse: antes se decidía solo por el subdominio desde
// el que se entraba (fix 19/07/2026) — ahora se decide por el rol real del
// usuario en BD/allowlist, sin importar desde qué dominio/subdominio inició
// sesión. subdominios.ts no se tocó (baseDeSubdominio sigue usándose para el
// rewrite de "/" cuando SUBDOMAIN_ROUTING_ENABLED==="1").
//
// app.darivopro.com sigue sin conectar en DNS/Vercel (verificado 20/07/2026,
// mismo estado que documenta subdominios.ts) — Móvil no tiene un destino
// "externo" propio, se sirve desde el dominio que atendió el login (ruta
// relativa /dashboard), igual que el resto de la app hoy.
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { esAdministradorDarivo, esPartnerAutorizado } from "@/lib/acceso-producto";

export type DestinoPostLogin =
  | { tipo: "ruta"; ruta: string }
  | { tipo: "externo"; url: string }
  | { tipo: "selector" };

const MOVIL_RUTA = "/dashboard";
const ADMIN_URL = "https://admin.darivopro.com/admin";
// "partners." (con "s") es el dominio real conectado — ver subdominios.ts.
const PARTNER_URL = "https://partners.darivopro.com/partner";

async function esGerenteDeEmpresa(supabase: SupabaseClient, user: User): Promise<boolean> {
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("empresa_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.empresa_id) return false;

  const { data: empresa } = await supabase
    .from("empresas")
    .select("gerente_user_id")
    .eq("id", perfil.empresa_id)
    .maybeSingle();
  return empresa?.gerente_user_id === user.id;
}

/**
 * Resuelve a dónde debe aterrizar un usuario justo tras autenticarse, según
 * su producto+rol real:
 * - Admin (allowlist `DARIVO_ADMIN_EMAILS`) → admin.darivopro.com/admin
 * - Partner (allowlist + `partners.estado`) → partners.darivopro.com/partner
 * - Empresa + Gerente (dueño real de la empresa) → selector Móvil/Empresa
 * - Empresa + Técnico, o usuario "solo" sin empresa → Móvil (/dashboard)
 */
export async function resolverDestinoPostLogin(
  supabase: SupabaseClient,
  user: User
): Promise<DestinoPostLogin> {
  if (await esAdministradorDarivo(user.email)) {
    return { tipo: "externo", url: ADMIN_URL };
  }
  if (await esPartnerAutorizado(user.email, supabase)) {
    return { tipo: "externo", url: PARTNER_URL };
  }
  if (await esGerenteDeEmpresa(supabase, user)) {
    return { tipo: "selector" };
  }
  return { tipo: "ruta", ruta: MOVIL_RUTA };
}
