// DARIVO PRO — Generar PDF factura (Next.js, sin FastAPI)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generarPdfFactura } from "@/lib/pdf/generate";
import type { EmpresaData, LineaFactura } from "@/types";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: factura, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("inv_id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !factura) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    const url = await generarPdfFactura({
      inv_num: factura.inv_num,
      inv_date: factura.inv_date,
      inv_status: factura.inv_status,
      client_name: factura.client_name,
      client_ruc: factura.client_ruc,
      client_dir: factura.client_dir,
      sym: factura.sym,
      items: (factura.items ?? []) as LineaFactura[],
      subtotal_base: factura.subtotal_base,
      igv_amount: factura.igv_amount,
      total_final: factura.total_final,
      biz_data: (factura.biz_data ?? null) as EmpresaData | null,
    });

    return NextResponse.json({ data: { url } });
  } catch (e) {
    console.error("PDF factura:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar PDF" },
      { status: 500 }
    );
  }
}
