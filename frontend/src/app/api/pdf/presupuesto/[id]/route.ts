// DARIVO PRO — Route Handler: Generar PDF presupuesto
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: presupuesto, error } = await supabase
    .from("presupuestos")
    .select("*, items:presupuesto_items(*)")
    .eq("id", params.id)
    .single();

  if (error || !presupuesto)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const res = await fetch(`${backendUrl}/api/v1/pdf/presupuesto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Key": process.env.SERVICE_KEY!,
    },
    body: JSON.stringify(presupuesto),
  });

  if (!res.ok) return NextResponse.json({ error: "Error PDF" }, { status: 500 });
  const data = await res.json();
  return NextResponse.json({ data });
}
