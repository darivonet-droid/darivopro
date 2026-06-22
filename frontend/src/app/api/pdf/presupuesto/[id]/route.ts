// DARIVO PRO — Generar PDF presupuesto (Next.js, sin FastAPI)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generarPdfPresupuesto } from "@/lib/pdf/generate";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: presupuesto, error } = await supabase
      .from("presupuestos")
      .select("*, items:presupuesto_items(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !presupuesto) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const url = await generarPdfPresupuesto({
      id: presupuesto.id,
      cot_num: presupuesto.cot_num,
      client_name: presupuesto.client_name,
      city: presupuesto.city,
      phone: presupuesto.phone,
      status: presupuesto.status,
      margin: presupuesto.margin,
      total_base: presupuesto.total_base,
      total_labor: presupuesto.total_labor,
      total_final: presupuesto.total_final,
      notes: presupuesto.notes,
      items: presupuesto.items ?? [],
    });

    return NextResponse.json({ data: { url } });
  } catch (e) {
    console.error("PDF presupuesto:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar PDF" },
      { status: 500 }
    );
  }
}
