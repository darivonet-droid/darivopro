/**
 * Control de acceso por producto — Doc 12 §6 · Visión §8
 * Tarea 11 — sin columna rol en BD (DT-04-02); allowlist env para plataforma/partner.
 */

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

export function esPartnerAutorizado(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = emailsAllowlist("DARIVO_PARTNER_EMAILS");
  if (list.size === 0) return false;
  return list.has(email.toLowerCase());
}

/** Usuario Móvil solo = Gerente implícito (Visión §5 · 04 §2) */
export function puedeAccederEmpresa(user: User | null): boolean {
  return !!user?.email;
}

export type ProductoProtegido = "admin" | "empresa" | "partner";

export function verificarAccesoProducto(
  producto: ProductoProtegido,
  user: User | null
): { ok: true } | { ok: false; razon: string } {
  if (!user) return { ok: false, razon: "no_sesion" };

  switch (producto) {
    case "admin":
      if (!esAdministradorDarivo(user.email)) {
        return { ok: false, razon: "admin_denegado" };
      }
      return { ok: true };
    case "partner":
      if (!esPartnerAutorizado(user.email)) {
        return { ok: false, razon: "partner_denegado" };
      }
      return { ok: true };
    case "empresa":
      if (!puedeAccederEmpresa(user)) {
        return { ok: false, razon: "empresa_denegado" };
      }
      return { ok: true };
    default:
      return { ok: false, razon: "desconocido" };
  }
}
