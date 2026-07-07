// DARIVO PRO — Generar PDF cotizacion (Next.js, sin FastAPI)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generarPdfCotizacion } from "@/lib/pdf/generate";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: cotizacion, error } = await supabase
      .from("presupuestos")
      .select("*, items:presupuesto_items(cat_label, svc_label, qty, unit, unit_price, subtotal)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !cotizacion) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Return cached PDF URL if already generated (avoids re-render + re-upload)
    if (cotizacion.pdf_url) {
      return NextResponse.json({ data: { url: cotizacion.pdf_url } });
    }

    const url = await generarPdfCotizacion({
      id: cotizacion.id,
      cot_num: cotizacion.cot_num,
      client_name: cotizacion.client_name,
      city: cotizacion.city,
      phone: cotizacion.phone,
      status: cotizacion.status,
      margin: cotizacion.margin,
      total_base: cotizacion.total_base,
      total_labor: cotizacion.total_labor,
      total_final: cotizacion.total_final,
      notes: cotizacion.notes,
      items: cotizacion.items ?? [],
    });

    // Persist URL so subsequent requests return instantly
    supabase
      .from("presupuestos")
      .update({ pdf_url: url })
      .eq("id", params.id)
      .then(({ error: updErr }) => {
        if (updErr) console.warn("pdf_url cache save:", updErr.message);
      });

    return NextResponse.json({ data: { url } });
  } catch (e) {
    console.error("PDF cotizacion:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar PDF" },
      { status: 500 }
    );
  }
}
