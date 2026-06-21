// DARIVO PRO — Nueva factura
import { NuevaFacturaForm } from "@/components/facturacion/NuevaFacturaForm";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";
import type { Cliente, EmpresaData, LineaPresupuesto, Presupuesto } from "@/types";

export default async function NuevaFacturaPage({
  searchParams,
}: {
  searchParams: { presupuesto?: string };
}) {
  const supabase = createServerClient();

  const [perfilRes, facturasRes, aprobadosRes, clientesRes] = await Promise.all([
    supabase.from("perfiles").select("*").single(),
    supabase.from("facturas").select("inv_num"),
    supabase
      .from("presupuestos")
      .select("*, items:presupuesto_items(*)")
      .eq("status", "Aprobado")
      .order("created_at", { ascending: false }),
    supabase.from("clientes").select("*").order("nombre"),
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
        cta_detracciones: perfil.cta_detracciones ?? undefined,
      }
    : null;

  const numerosExistentes = (facturasRes.data ?? []).map((r) => r.inv_num as string);

  const aprobados: Presupuesto[] = (aprobadosRes.data ?? []).map((row) => ({
    id: row.id,
    tenant_id: row.user_id,
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
  }));

  const clientes: Cliente[] = (clientesRes.data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono ?? undefined,
    ruc: row.ruc ?? undefined,
    direccion: row.direccion ?? undefined,
    ciudad: row.ciudad ?? undefined,
    notas: row.notas ?? undefined,
    createdAt: row.created_at,
  }));

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFF" }}>
      <header className="px-5 pb-4 pt-6" style={{ background: T.navy }}>
        <h1 className="text-xl font-black" style={{ color: "#FFFFFF" }}>Nueva factura</h1>
        <p className="text-xs" style={{ color: "#94A3B8" }}>Boleta o factura · IGV 18%</p>
      </header>
      <NuevaFacturaForm
        empresa={empresa}
        numerosExistentes={numerosExistentes}
        aprobados={aprobados}
        clientes={clientes}
        presupuestoId={searchParams.presupuesto}
      />
    </div>
  );
}
