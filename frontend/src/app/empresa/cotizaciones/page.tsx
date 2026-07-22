// DARIVO PRO EMPRESA — Lista global de cotizaciones
// (05-MODULO-COTIZACIONES-EMPRESA.md §3.1). Corrección 22/07/2026: este
// archivo era un redirect a /empresa/clientes porque el MD afirmaba que "no
// existe lista global" — Móvil §3 confirma expresamente que sí existe
// (`/cotizaciones`, decisión vigente desde 07/2026) y el MD de Empresa se
// corrigió para reflejarlo. No es ítem del sidebar (igual que en Móvil) —
// se accede vía CTA/pills en Inicio, "Ver todos →" y la ficha del Cliente.
// Reutiliza el mismo componente que Móvil (CotizacionesList) — misma
// lógica, solo cambia la presentación del header/shell.
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { CotizacionesList } from "@/components/cotizacion/CotizacionesList";
import { createServerClient } from "@/lib/supabase/server";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import type { Cotizacion, LineaCotizacion } from "@/types";

export const dynamic = "force-dynamic";

export default async function EmpresaCotizacionesPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("cotizaciones")
    .select(
      "id, user_id, cot_num, client_name, phone, city, margin, total_base, total_labor, total_final, status, notes, created_at, pdf_url, items:cotizacion_items(svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)"
    )
    .order("created_at", { ascending: false });

  const cotizaciones: Cotizacion[] = (data ?? []).map((row) => ({
    id: row.id,
    tenant_id: row.user_id,
    cotNum: row.cot_num ?? undefined,
    clientName: row.client_name,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    items: (row.items ?? []).map((it: Record<string, unknown>): LineaCotizacion => ({
      svcId: String(it.svc_id),
      catLabel: String(it.cat_label ?? ""),
      svcLabel: String(it.svc_label ?? ""),
      calcType: (it.calc_type as LineaCotizacion["calcType"]) ?? "fixed",
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
    <EmpresaShell titulo="Cotizaciones">
      <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        {cotizaciones.length} en total
      </p>
      <div className="max-w-3xl">
        <CotizacionesList
          iniciales={cotizaciones}
          nuevaCotizacionHref="/empresa/cotizaciones/nuevo"
          nuevaFacturaHref="/empresa/facturas/nueva"
        />
      </div>
    </EmpresaShell>
  );
}
