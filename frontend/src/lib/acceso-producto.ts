/**
 * Control de acceso por producto — Doc 12 §6 · Visión §8
 * Tarea 11 — sin columna rol en BD (DT-04-02); allowlist env para plataforma/partner.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

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

/** Acceso a Darivo Pro Empresa — solo plan Business (04 §6 · Visión §8) */
export async function puedeAccederEmpresa(
  supabase: SupabaseClient,
  user: User | null
): Promise<boolean> {
  if (!user) return false;
  const { data } = await supabase
    .from("perfiles")
    .select("plan_tipo")
    .eq("id", user.id)
    .single();
  return data?.plan_tipo === "business";
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
