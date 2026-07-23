// DARIVO PRO EMPRESA — Expediente mensual, generación real de ZIP
// (09-MODULO-CIERRE-EMPRESA.md §6.2). Incluye las facturas emitidas del
// período (mismo PDF que ya genera /api/pdf/factura/[id], cacheado en
// facturas.pdf_url) y un CSV de los gastos registrados del período —
// useGastos.ts es 100% local/localStorage, así que los gastos llegan en el
// body en vez de consultarse en Supabase. Envío a gestoría — fuera de
// alcance por ahora (pedido explícito del propietario, 23/07/2026): esta
// ruta solo genera y devuelve el ZIP para descarga.
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { createServerClient } from "@/lib/supabase/server";
import { generarPdfFactura } from "@/lib/pdf/generate";
import type { Detraccion, EmpresaData, InvStatus, LineaFactura, TipoDetraccion } from "@/types";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

interface GastoZip {
  proveedor: string;
  categoria: string;
  fecha: string;
  total: number;
  metodoPago: string;
  estado: string;
}

function csv(v: string | number) {
  return `"${String(v).replace(/"/g, '""')}"`;
}

export async function POST(req: NextRequest) {
  try {
    const { mes, anio, gastos } = (await req.json()) as { mes: number; anio: number; gastos: GastoZip[] };
    if (typeof mes !== "number" || mes < 0 || mes > 11 || typeof anio !== "number") {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const inicio = new Date(anio, mes, 1);
    const fin = new Date(anio, mes + 1, 1);

    const { data: facturas, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", inicio.toISOString())
      .lt("created_at", fin.toISOString());

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: perfilLogo } = await supabase
      .from("perfiles")
      .select("logo_url")
      .eq("id", user.id)
      .single();

    const zip = new JSZip();
    const carpetaFacturas = zip.folder("facturas-sunat");

    for (const factura of facturas ?? []) {
      let url: string | null =
        factura.pdf_url && !factura.pdf_url.includes("/object/public/") ? factura.pdf_url : null;

      if (!url) {
        let bizFactura = (factura.biz_data ?? null) as EmpresaData | null;
        if (bizFactura) bizFactura = { ...bizFactura, logoUrl: perfilLogo?.logo_url ?? null };

        const detraccion: Detraccion | undefined = factura.detraccion_tipo
          ? {
              tipo: factura.detraccion_tipo as TipoDetraccion,
              pct: Number(factura.detraccion_pct ?? 0),
              monto: Number(factura.detraccion_monto ?? 0),
              neto: Number(factura.neto_cobrar ?? 0),
              ctaDetracciones: factura.cta_detracciones ?? undefined,
            }
          : undefined;

        url = await generarPdfFactura({
          inv_num: factura.inv_num,
          inv_date: factura.inv_date,
          inv_status: factura.inv_status as InvStatus,
          tipo_doc: factura.tipo_doc,
          client_name: factura.client_name,
          client_ruc: factura.client_ruc,
          client_dni: factura.client_dni,
          client_dir: factura.client_dir,
          sym: factura.sym,
          items: (factura.items ?? []) as LineaFactura[],
          subtotal_base: factura.subtotal_base,
          igv_amount: factura.igv_amount,
          total_final: factura.total_final,
          detraccion,
          biz_data: bizFactura,
        });

        // Cachea igual que /api/pdf/factura/[id] (fire-and-forget)
        supabase
          .from("facturas")
          .update({ pdf_url: url })
          .eq("inv_id", factura.inv_id)
          .then(({ error: updErr }) => {
            if (updErr) console.warn("factura pdf_url cache save:", updErr.message);
          });
      }

      const pdfRes = await fetch(url);
      if (pdfRes.ok) {
        const buf = await pdfRes.arrayBuffer();
        const nombreFactura = `factura-${String(factura.inv_num ?? factura.inv_id).replace(/\//g, "-")}.pdf`;
        carpetaFacturas?.file(nombreFactura, buf);
      }
    }

    const filasGastos = (gastos ?? []).map((g) =>
      [g.fecha, g.proveedor, g.categoria, g.total.toFixed(2), g.metodoPago, g.estado].map(csv).join(",")
    );
    const csvGastos = ["Fecha,Proveedor,Categoría,Total,Método de pago,Estado", ...filasGastos].join("\n");
    zip.file("gastos-registrados.csv", csvGastos);

    const totalGastos = (gastos ?? []).reduce((s, g) => s + (g.total ?? 0), 0);
    const resumen = [
      `Expediente mensual — ${MESES[mes]} ${anio}`,
      `Generado: ${new Date().toLocaleString("es-PE")}`,
      "",
      `Facturas emitidas: ${(facturas ?? []).length}`,
      `Gastos registrados: ${(gastos ?? []).length}`,
      `Total gastos: S/ ${totalGastos.toFixed(2)}`,
    ].join("\n");
    zip.file("resumen.txt", resumen);

    const buffer = await zip.generateAsync({ type: "uint8array" });

    // Cast: TS (lib.dom + Node ArrayBufferLike) marca Uint8Array como no
    // asignable a BodyInit por el genérico SharedArrayBuffer — Next.js sí
    // acepta Uint8Array en runtime sin problema.
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="expediente-${mes + 1}-${anio}.zip"`,
      },
    });
  } catch (e) {
    console.error("Expediente ZIP:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar el expediente" },
      { status: 500 }
    );
  }
}
