// DARIVO PRO — Ficha de cliente (Server Component)
// Lectura SIEMPRE fresca: el estado de cotizaciones (presupuestos.status) y de
// facturas (facturas.inv_status) se consulta en vivo. No se cachea ningún estado.
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClienteFichaView } from "@/components/clientes/ClienteFichaView";
import { createServerClient } from "@/lib/supabase/server";
import type { Cliente, Factura, InvStatus, LineaPresupuesto, Presupuesto } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClienteFichaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();

  const { data: cliRow } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!cliRow) notFound();

  const cliente: Cliente = {
    id: cliRow.id,
    nombre: cliRow.nombre,
    telefono: cliRow.telefono ?? undefined,
    ruc: cliRow.ruc ?? undefined,
    direccion: cliRow.direccion ?? undefined,
    ciudad: cliRow.ciudad ?? undefined,
    notas: cliRow.notas ?? undefined,
    createdAt: cliRow.created_at,
  };

  // Cotizaciones del cliente — estado leído en vivo de presupuestos.status
  const { data: presRows } = await supabase
    .from("presupuestos")
    .select("id, user_id, cot_num, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url, items:presupuesto_items(svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)")
    .eq("cliente_id", params.id)
    .order("created_at", { ascending: false });

  const presupuestos: Presupuesto[] = (presRows ?? []).map((row) => ({
    id: row.id,
    tenant_id: row.user_id,
    cotNum: row.cot_num ?? undefined,
    clientName: row.client_name,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    items: (row.items ?? []).map((it: Record<string, unknown>): LineaPresupuesto => ({
      svcId: String(it.svc_id),
      catLabel: String(it.cat_label ?? ""),
      svcLabel: String(it.svc_label ?? ""),
      calcType: (it.calc_type ?? "fixed") as LineaPresupuesto["calcType"],
      basePrice: Number(it.base_price ?? 0),
      unit: String(it.unit ?? ""),
      qty: Number(it.qty ?? 0),
      unitPrice: Number(it.unit_price ?? 0),
      subtotal: Number(it.subtotal ?? 0),
    })),
    margin: Number(row.margin ?? 0),
    totalBase: Number(row.total_base ?? 0),
    totalLabor: Number(row.total_labor ?? 0),
    totalFinal: Number(row.total_final ?? 0),
    status: row.status,
    createdAt: row.created_at,
    notes: row.notes ?? undefined,
    pdfUrl: row.pdf_url ?? undefined,
  }));

  // Facturas asociadas — vinculadas vía la cotización origen (from_quote_id).
  // Estado leído en vivo de facturas.inv_status (sin copia local).
  const quoteIds = presupuestos.map((p) => p.id);
  let facturas: Factura[] = [];
  if (quoteIds.length > 0) {
    const { data: facRows } = await supabase
      .from("facturas")
      .select("*")
      .in("from_quote_id", quoteIds)
      .order("created_at", { ascending: false });

    facturas = (facRows ?? []).map((row) => ({
      invId: row.inv_id,
      tenant_id: row.user_id,
      invNum: row.inv_num,
      invDate: row.inv_date,
      invStatus: row.inv_status as InvStatus,
      tipoDoc: row.tipo_doc ?? "factura",
      clientName: row.client_name,
      clientRuc: row.client_ruc ?? undefined,
      clientDni: row.client_dni ?? undefined,
      clientDir: row.client_dir ?? undefined,
      moneda: row.moneda ?? "PEN",
      sym: row.sym ?? "S/",
      items: row.items ?? [],
      subtotalBase: Number(row.subtotal_base ?? 0),
      igvAmount: Number(row.igv_amount ?? 0),
      totalFinal: Number(row.total_final ?? 0),
      detraccion: row.detraccion_tipo ? {
        tipo: row.detraccion_tipo,
        pct: Number(row.detraccion_pct ?? 0),
        monto: Number(row.detraccion_monto ?? 0),
        neto: Number(row.neto_cobrar ?? 0),
        ctaDetracciones: row.cta_detracciones ?? undefined,
      } : undefined,
      fromQuoteId: row.from_quote_id ?? undefined,
      bizData: row.biz_data ?? { razonSocial: "", ruc: "", direccion: "", moneda: "PEN", simbolo: "S/" },
    }));
  }

  return (
    <div style={{ background: "#F8FAFF", minHeight: "100vh" }}>
      <PageHeader titulo={cliente.nombre} subtitulo={cliente.telefono ?? "Sin teléfono"} backHref="/clientes" />
      <main className="px-4 py-4">
        <ClienteFichaView cliente={cliente} presupuestos={presupuestos} facturas={facturas} />
      </main>
    </div>
  );
}
