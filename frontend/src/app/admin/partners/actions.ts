"use server";

import { revalidatePath } from "next/cache";
import {
  actualizarComisionConfig,
  createPartnerRecord,
  listPartners,
  updatePartnerEstado,
} from "@/lib/ecosystem-store";
import { errorSiNoEsAdmin } from "@/lib/acceso-producto";
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
  const errorAuth = await errorSiNoEsAdmin();
  if (errorAuth) return { ok: false };
  const updated = await updatePartnerEstado(id, estado);
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
