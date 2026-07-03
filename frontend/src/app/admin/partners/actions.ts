"use server";

import { revalidatePath } from "next/cache";
import {
  createPartnerRecord,
  listPartners,
  updatePartnerEstado,
} from "@/lib/ecosystem-store";
import type { EstadoPartner, PartnerRegistro } from "@/lib/partners-types";

export async function getPartnersAction(): Promise<PartnerRegistro[]> {
  return listPartners();
}

export async function createPartnerAction(
  nombre: string,
  email: string
): Promise<{ ok: true; partner: PartnerRegistro } | { ok: false; error: string }> {
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
  const updated = await updatePartnerEstado(id, estado);
  if (updated) {
    revalidatePath("/admin/partners");
    revalidatePath("/partner");
  }
  return { ok: !!updated };
}
