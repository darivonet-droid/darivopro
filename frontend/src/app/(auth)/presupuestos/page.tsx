// DARIVO PRO — Presupuestos (Server Component)
import Link from "next/link";
import { PresupuestosList } from "@/components/presupuesto/PresupuestosList";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";
import type { Presupuesto, LineaPresupuesto } from "@/types";

export default async function PresupuestosPage() {
  const supabase = createServerClient();
  // Select only columns used by UI + card expansion; skip presupuesto_items.id/created_at
  const { data } = await supabase
    .from("presupuestos")
    .select("id, user_id, cot_num, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url, items:presupuesto_items(svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)")
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

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFF" }}>
      <header className="px-5 pb-5 pt-6" style={{ background: T.navy }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black" style={{ color: T.white }}>
              Cotizaciones
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: T.textLight }}>
              {presupuestos.length} en total
            </p>
          </div>
          <Link
            href="/presupuestos/nuevo"
            className="rounded-xl px-4 py-2.5 text-sm font-bold"
            style={{ background: T.blue, color: T.white }}
          >
            + Nuevo
          </Link>
        </div>
      </header>

      <main className="px-4 py-4">
        <PresupuestosList iniciales={presupuestos} />
      </main>
    </div>
  );
}
