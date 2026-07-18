/**
 * Control de acceso por producto — Doc 12 §6 · Visión §8
 * Tarea 11 — sin columna rol en BD (DT-04-02); allowlist env para plataforma/partner.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

function emailsAllowlist(envKey: string): Set<string> {
  const raw = process.env[envKey] ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function esAdministradorDarivo(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = emailsAllowlist("DARIVO_ADMIN_EMAILS");
  if (list.size === 0) return false;
  return list.has(email.toLowerCase());
}

/**
 * Autorización a Panel Partner: allowlist de email + estado real en `partners`.
 * Antes solo gateaba por allowlist — un partner marcado `Suspendido` en BD
 * pero con el email aún en `DARIVO_PARTNER_EMAILS` conservaba acceso completo
 * (DT-04-02, auditoría 12/07/2026). Si no hay fila en `partners` para ese
 * email, se mantiene el comportamiento anterior (solo allowlist) — no se
 * introduce un nuevo motivo de bloqueo para ese caso límite.
 */
export async function esPartnerAutorizado(
  email: string | null | undefined,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!email) return false;
  const list = emailsAllowlist("DARIVO_PARTNER_EMAILS");
  if (list.size === 0) return false;
  if (!list.has(email.toLowerCase())) return false;

  const { data } = await supabase
    .from("partners")
    .select("estado")
    .eq("email", email)
    .maybeSingle();

  return data?.estado !== "Suspendido";
}

/**
 * Acceso a Darivo Pro Empresa — solo plan Business (04 §6 · Visión §8) Y
 * solo el Gerente (dueño de la empresa), nunca un Técnico invitado.
 *
 * Tarea 2 (CLAUDE.md 17/07/2026): invitarEmpleadoAction copia el plan_tipo
 * del Gerente al perfil del Técnico invitado (para que no quede varado en
 * el límite del plan gratis) — sin este chequeo extra de rol, ese mismo
 * plan_tipo='business' heredado le habría abierto la puerta al panel de
 * escritorio de Empresa completo, que es exclusivo del Gerente (Cotización
 * es lo único que ve un Técnico, siempre por Móvil).
 */
export async function puedeAccederEmpresa(
  supabase: SupabaseClient,
  user: User | null
): Promise<boolean> {
  if (!user) return false;
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_tipo, empresa_id")
    .eq("id", user.id)
    .single();
  if (perfil?.plan_tipo !== "business") return false;
  if (!perfil.empresa_id) return true; // usuario solo, sin empresa asociada aún

  const { data: empresa } = await supabase
    .from("empresas")
    .select("gerente_user_id")
    .eq("id", perfil.empresa_id)
    .maybeSingle();
  // Si no hay fila de empresa (o el usuario no es su gerente_user_id), es un
  // Técnico invitado — sin acceso al panel de escritorio.
  return empresa?.gerente_user_id === user.id;
}

/**
 * Guardia de defensa-en-profundidad para Server Actions del Panel Admin
 * (mejora de seguridad pendiente documentada en CLAUDE.md, 15/07/2026):
 * hasta ahora estas Server Actions confiaban por completo en que
 * middleware.ts protegiera /admin/* sin re-verificar el rol internamente —
 * si el matcher del middleware cambiara alguna vez sin darse cuenta de esa
 * dependencia implícita, quedarían expuestas sin ningún otro chequeo.
 * Devuelve un mensaje de error listo para el shape { ok: false, error } que
 * ya usan todas ellas, o null si el usuario autenticado es Administrador Darivo.
 */
export async function errorSiNoEsAdmin(): Promise<string | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!esAdministradorDarivo(user?.email)) return "No autorizado";
  return null;
}

export type ProductoProtegido = "admin" | "empresa" | "partner";

export async function verificarAccesoProducto(
  producto: ProductoProtegido,
  user: User | null,
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; razon: string }> {
  if (!user) return { ok: false, razon: "no_sesion" };

  switch (producto) {
    case "admin":
      if (!esAdministradorDarivo(user.email)) {
        return { ok: false, razon: "admin_denegado" };
      }
      return { ok: true };
    case "partner":
      if (!(await esPartnerAutorizado(user.email, supabase))) {
        return { ok: false, razon: "partner_denegado" };
      }
      return { ok: true };
    case "empresa":
      if (!(await puedeAccederEmpresa(supabase, user))) {
        return { ok: false, razon: "empresa_denegado" };
      }
      return { ok: true };
    default:
      return { ok: false, razon: "desconocido" };
  }
}
