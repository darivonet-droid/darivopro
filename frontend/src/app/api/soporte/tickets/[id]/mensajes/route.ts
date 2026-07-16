// DARIVO PRO — Soporte: mensajes de un ticket propio (desbloqueo INC-A01/DOC-01, 16/07/2026)
// RLS (soporte_mensajes_user) exige que el ticket pertenezca al usuario autenticado.
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { AutorMensaje, SoporteMensaje } from "@/lib/soporte-types";

interface MensajeRow {
  id: string;
  ticket_id: string;
  autor_tipo: AutorMensaje;
  autor_user_id: string | null;
  mensaje: string;
  created_at: string;
}

function mapRow(r: MensajeRow): SoporteMensaje {
  return {
    id: r.id,
    ticketId: r.ticket_id,
    autorTipo: r.autor_tipo,
    autorUserId: r.autor_user_id,
    mensaje: r.mensaje,
    createdAt: r.created_at,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("soporte_mensajes")
    .select("*")
    .eq("ticket_id", params.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("GET /api/soporte/tickets/[id]/mensajes:", error);
    return NextResponse.json({ error: "No se pudieron cargar los mensajes" }, { status: 500 });
  }

  return NextResponse.json({ data: (data as MensajeRow[]).map(mapRow) });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const mensaje: string = (body.mensaje ?? "").trim();
  if (!mensaje) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

  const { data, error } = await supabase
    .from("soporte_mensajes")
    .insert({
      ticket_id: params.id,
      autor_tipo: "usuario" satisfies AutorMensaje,
      autor_user_id: user.id,
      mensaje,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("POST /api/soporte/tickets/[id]/mensajes:", error);
    return NextResponse.json({ error: "No se pudo enviar el mensaje" }, { status: 500 });
  }

  await supabase
    .from("soporte_tickets")
    .update({ ultima_respuesta_at: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json({ data: mapRow(data as MensajeRow) }, { status: 201 });
}
