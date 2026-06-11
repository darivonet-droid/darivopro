// DARIVO PRO — Nueva factura (Server Component)
import { PageHeader } from "@/components/ui/PageHeader";
import { NuevaFacturaForm } from "@/components/facturacion/NuevaFacturaForm";
import { createServerClient } from "@/lib/supabase/server";
import type { EmpresaData, Presupuesto } from "@/types";

export default async function NuevaFacturaPage() {
  const supabase = createServerClient();

  const [perfilRes, countRes, aprobadosRes] = await Promise.all([
    supabase.from("perfiles").select("*").single(),
    supabase.from("facturas").select("inv_id", { count: "exact", head: true }),
    supabase
      .from("presupuestos")
      .select("*, items:presupuesto_items(*)")
      .eq("status", "Aprobado")
      .order("created_at", { ascending: false }),
  ]);

  const perfil = perfilRes.data;
  const empresa: EmpresaData | null = perfil?.razon_social && perfil?.ruc
    ? {
        razonSocial: perfil.razon_social,
        ruc: perfil.ruc,
        direccion: perfil.direccion ?? "",
        telefono: perfil.telefono ?? undefined,
        moneda: perfil.moneda ?? "PEN",
        simbolo: perfil.simbolo ?? "S/",
      }
    : null;

  const numeroSugerido = `F001-${String((countRes.count ?? 0) + 1).padStart(6, "0")}`;

  const aprobados: Presupuesto[] = (aprobadosRes.data ?? []).map((row) => ({
    id: row.id,
    tenant_id: row.user_id,
    clientName: row.client_name,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    items: (row.items ?? []).map((it: Record<string, unknown>) => ({
      svcId: String(it.svc_id),
      catLabel: String(it.cat_label ?? ""),
      svcLabel: String(it.svc_label ?? ""),
      calcType: (it.calc_type ?? "fixed") as Presupuesto["items"][number]["calcType"],
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
  }));

  return (
    <div>
      <PageHeader titulo="Nueva factura" subtitulo="Formato SUNAT con IGV 18%" backHref="/facturas" />
      <NuevaFacturaForm empresa={empresa} numeroSugerido={numeroSugerido} aprobados={aprobados} />
    </div>
  );
}
