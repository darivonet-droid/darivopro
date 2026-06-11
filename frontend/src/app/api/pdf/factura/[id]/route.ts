// DARIVO PRO — Route Handler: Generar PDF factura
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: factura, error } = await supabase
    .from("facturas")
    .select("*")
    .eq("inv_id", params.id)
    .single();

  if (error || !factura)
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const res = await fetch(`${backendUrl}/api/v1/pdf/factura`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Service-Key": process.env.SERVICE_KEY!,
    },
    body: JSON.stringify(factura),
  });

  if (!res.ok) return NextResponse.json({ error: "Error PDF" }, { status: 500 });
  const data = await res.json();
  return NextResponse.json({ data });
}
