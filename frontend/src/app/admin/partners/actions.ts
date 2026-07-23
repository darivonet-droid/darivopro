"use server";

import { revalidatePath } from "next/cache";
import {
  actualizarComisionConfig,
  createPartnerRecord,
  listPartners,
  updatePartnerAccesoMovil,
  updatePartnerEstado,
} from "@/lib/ecosystem-store";
import { errorSiNoEsAdmin, adminAutenticadoOError } from "@/lib/acceso-producto";
import type { EstadoPartner, PartnerRegistro } from "@/lib/partners-types";

export async function getPartnersAction(): Promise<PartnerRegistro[]> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) throw new Error(errorAuth);
  return listPartners();
}

export async function createPartnerAction(
  nombre: string,
  email: string
): Promise<{ ok: true; partner: PartnerRegistro } | { ok: false; error: string }> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
  if (!nombre.trim() || !email.trim()) {
    return { ok: false, error: "Nombre y correo requeridos" };
  }
  const partner = await createPartnerRecord(nombre, email);
  revalidatePath("/admin/partners");
  revalidatePath("/partner");
  return { ok: true, partner };
}

export async function setPartnerEstadoAction(
  id: string,
  estado: EstadoPartner
): Promise<{ ok: boolean }> {
  // Identidad real del administrador: suspender un Partner revoca su Plan
  // Business regalado, y esa degradación a `gratis` debe quedar firmada en el
  // log de auditoría de planes. Mismo criterio de autorización que antes.
  const auth = await adminAutenticadoOError();
  if (!auth.ok) return { ok: false };
  const updated = await updatePartnerEstado(id, estado, {
    adminUserId: auth.adminUserId,
    adminEmail: auth.adminEmail,
  });
  if (updated) {
    revalidatePath("/admin/partners");
    revalidatePath("/partner");
  }
  return { ok: !!updated };
}

/**
 * Toggle "Acceso a Móvil" por partner — Etapa 7 (21/07/2026), decisión 2.
 * Activación manual y explícita desde Admin, nunca automática.
 */
export async function setPartnerAccesoMovilAction(
  id: string,
  accesoMovil: boolean
): Promise<{ ok: boolean }> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false };
  const updated = await updatePartnerAccesoMovil(id, accesoMovil);
  if (updated) {
    revalidatePath("/admin/partners");
    revalidatePath("/partner");
  }
  return { ok: !!updated };
}

/** "Configurar tabla de comisiones" — 06-PANEL-ADMIN-PARTNERS.md §5/§8. */
export async function actualizarComisionConfigAction(
  id: string,
  porcentaje: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false, error: errorAuth };
  const result = await actualizarComisionConfig(id, porcentaje);
  if (result.ok) {
    revalidatePath("/admin/partners");
    revalidatePath("/partner");
  }
  return result;
}
