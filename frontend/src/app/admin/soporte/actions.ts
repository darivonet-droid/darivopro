"use server";

import { revalidatePath } from "next/cache";
import { actualizarEstadoTicket } from "@/lib/admin-queries";
import type { EstadoTicket } from "@/lib/soporte-types";

/** Cambia el estado de un ticket de soporte (09-PANEL-ADMIN-SOPORTE.md §8, §14 v1.3) */
export async function cambiarEstadoTicketAction(
  ticketId: string,
  estado: EstadoTicket
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await actualizarEstadoTicket(ticketId, estado);
  if ("error" in result) return { ok: false, error: result.error };

  revalidatePath("/admin/soporte");
  return { ok: true };
}
