// DARIVO PRO — Soporte: tickets del propio usuario (desbloqueo INC-A01/DOC-01, 16/07/2026)
// Sin cliente admin: la seguridad la da RLS (soporte_tickets_user, FOR ALL sobre auth.uid() = user_id).
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { crearTicketSoporte } from "@/lib/soporte-server";
import type { EstadoTicket, SoporteTicket } from "@/lib/soporte-types";

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

export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("soporte_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/soporte/tickets:", error);
    return NextResponse.json({ error: "No se pudieron cargar tus tickets" }, { status: 500 });
  }

  return NextResponse.json({ data: (data as TicketRow[]).map(mapRow) });
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const asunto: string = (body.asunto ?? "").trim();
  const descripcion: string = (body.descripcion ?? "").trim();
  if (!asunto || !descripcion) {
    return NextResponse.json({ error: "Asunto y descripción son obligatorios" }, { status: 400 });
  }

  const ticket = await crearTicketSoporte(supabase, user, { asunto, descripcion });
  if (!ticket) {
    return NextResponse.json({ error: "No se pudo crear el ticket" }, { status: 500 });
  }

  return NextResponse.json({ data: ticket }, { status: 201 });
}
