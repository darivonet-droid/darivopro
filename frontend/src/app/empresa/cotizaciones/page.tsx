import Link from "next/link";
import { PresupuestosList } from "@/components/presupuesto/PresupuestosList";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/design-system/tokens";
import type { LineaPresupuesto, Presupuesto } from "@/types";

export const dynamic = "force-dynamic";

export default async function EmpresaCotizacionesPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("presupuestos")
    .select(
      "id, user_id, cot_num, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url, items:presupuesto_items(svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)"
    )
    .order("created_at", { ascending: false });

  const presupuestos: Presupuesto[] = (data ?? []).map((row) => ({
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
      calcType: (it.calc_type as LineaPresupuesto["calcType"]) ?? "fixed",
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

  const mod = empresaModulo("cotizaciones");

  return (
    <EmpresaShell titulo={mod.label}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: T.textMid }}>
          {presupuestos.length} cotizaciones
        </p>
        <Link
          href="/cotizaciones/nuevo"
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: T.blue }}
        >
          + Nueva cotización
        </Link>
      </div>
      <PresupuestosList iniciales={presupuestos} />
    </EmpresaShell>
  );
}
