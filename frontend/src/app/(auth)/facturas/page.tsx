// DARIVO PRO — Facturación (Server Component)
import { FacturasView } from "@/components/facturacion/FacturasView";
import { createServerClient } from "@/lib/supabase/server";
import type { Factura, LineaPresupuesto, Presupuesto } from "@/types";

export default async function FacturasPage() {
  const supabase = createServerClient();

  const [facturasRes, perfilRes, aprobadosRes] = await Promise.all([
    supabase.from("facturas").select("*").order("created_at", { ascending: false }),
    supabase.from("perfiles").select("ruc").single(),
    supabase
      .from("presupuestos")
      .select("id, user_id, client_name, phone, city, margin, total_base, total_labor, total_final, status, created_at, notes")
      .eq("status", "Aprobado")
      .order("created_at", { ascending: false }),
  ]);

  const facturas: Factura[] = (facturasRes.data ?? []).map((row) => ({
    invId: row.inv_id,
    tenant_id: row.user_id,
    invNum: row.inv_num,
    invDate: row.inv_date,
    invStatus: row.inv_status,
    clientName: row.client_name,
    clientRuc: row.client_ruc ?? undefined,
    clientDir: row.client_dir ?? undefined,
    moneda: row.moneda ?? "PEN",
    sym: row.sym ?? "S/",
    items: row.items ?? [],
    subtotalBase: Number(row.subtotal_base ?? 0),
    igvAmount: Number(row.igv_amount ?? 0),
    totalFinal: Number(row.total_final ?? 0),
    fromQuoteId: row.from_quote_id ?? undefined,
    bizData: row.biz_data ?? { razonSocial: "", ruc: "", direccion: "", moneda: "PEN", simbolo: "S/" },
  }));

  const aprobados: Presupuesto[] = (aprobadosRes.data ?? []).map((row) => ({
    id: row.id,
    tenant_id: row.user_id,
    clientName: row.client_name,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    items: [] as LineaPresupuesto[],
    margin: Number(row.margin ?? 0),
    totalBase: Number(row.total_base ?? 0),
    totalLabor: Number(row.total_labor ?? 0),
    totalFinal: Number(row.total_final ?? 0),
    status: row.status,
    createdAt: row.created_at,
    notes: row.notes ?? undefined,
  }));

  return (
    <FacturasView
      facturas={facturas}
      rucEmpresa={perfilRes.data?.ruc ?? ""}
      aprobados={aprobados}
    />
  );
}
