// DARIVO PRO — Creación de ticket de soporte, compartida entre /api/soporte/tickets
// y /api/darivo/chat (escalado automático de Darivo). Server-only.
import { enviarTicketRecibido } from "@/lib/email/send";
import type { createServerClient } from "@/lib/supabase/server";
import type { EstadoTicket, SoporteTicket } from "@/lib/soporte-types";

type SupabaseServer = ReturnType<typeof createServerClient>;

interface TicketRow {
  id: string;
  user_id: string;
  user_email: string | null;
  user_nombre: string | null;
  plan_snapshot: string | null;
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  created_at: string;
  ultima_respuesta_at: string | null;
}

function mapRow(r: TicketRow): SoporteTicket {
  return {
    id: r.id,
    userId: r.user_id,
    userEmail: r.user_email ?? "",
    userNombre: r.user_nombre ?? "",
    plan: r.plan_snapshot ?? "",
    asunto: r.asunto,
    descripcion: r.descripcion,
    estado: r.estado,
    createdAt: r.created_at,
    ultimaRespuesta: r.ultima_respuesta_at,
  };
}

/** Crea un ticket real para el usuario autenticado y dispara el email de "recibido" (best-effort). */
export async function crearTicketSoporte(
  supabase: SupabaseServer,
  user: { id: string; email?: string | null },
  input: { asunto: string; descripcion: string }
): Promise<SoporteTicket | null> {
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("razon_social, plan_tipo")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("soporte_tickets")
    .insert({
      user_id: user.id,
      user_email: user.email ?? "",
      user_nombre: perfil?.razon_social ?? "",
      plan_snapshot: perfil?.plan_tipo ?? "gratis",
      asunto: input.asunto,
      descripcion: input.descripcion,
      estado: "Abierto" satisfies EstadoTicket,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("crearTicketSoporte:", error);
    return null;
  }

  const row = data as TicketRow;
  if (row.user_email) {
    void enviarTicketRecibido(row.user_email, {
      nombre: row.user_nombre || "cliente Darivo Pro",
      numeroTicket: `TCK-${row.id.slice(0, 8).toUpperCase()}`,
      resumen: row.asunto,
    });
  }

  return mapRow(row);
}
