// DARIVO PRO EMPRESA — Nueva factura, capa de presentación de escritorio
// (06-MODULO-FACTURAS-EMPRESA.md §4.2). Misma consulta que la ruta Móvil
// equivalente (app/(auth)/facturas/nueva/page.tsx).
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { NuevaFacturaFormEscritorio } from "@/components/facturacion/NuevaFacturaFormEscritorio";
import { createServerClient } from "@/lib/supabase/server";
import type { Cliente, EmpresaData, LineaCotizacion, Cotizacion } from "@/types";
import type { TipoComprobante } from "@/lib/factura-utils";

export const dynamic = "force-dynamic";

export default async function EmpresaNuevaFacturaPage({
  searchParams,
}: {
  searchParams: { cotizacion?: string; tipo?: string };
}) {
  const supabase = createServerClient();

  const [perfilRes, facturasRes, aprobadosRes, clientesRes] = await Promise.all([
    supabase.from("perfiles").select("*").single(),
    supabase.from("facturas").select("inv_num"),
    supabase
      .from("cotizaciones")
      .select("*, items:cotizacion_items(*)")
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
  const tipoInicial: TipoComprobante = searchParams.tipo === "boleta" ? "boleta" : "factura";

  const aprobados: Cotizacion[] = (aprobadosRes.data ?? []).map((row) => ({
    id: row.id,
    tenant_id: row.user_id,
    clientName: row.client_name,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    items: (row.items ?? []).map((it: Record<string, unknown>): LineaCotizacion => ({
      svcId: String(it.svc_id),
      catLabel: String(it.cat_label ?? ""),
      svcLabel: String(it.svc_label ?? ""),
      calcType: (it.calc_type ?? "fixed") as LineaCotizacion["calcType"],
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
    email: row.email ?? undefined,
    notas: row.notas ?? undefined,
    createdAt: row.created_at,
  }));

  return (
    <EmpresaShell titulo="Nueva factura">
      <NuevaFacturaFormEscritorio
        empresa={empresa}
        numerosExistentes={numerosExistentes}
        aprobados={aprobados}
        clientes={clientes}
        cotizacionId={searchParams.cotizacion}
        tipoInicial={tipoInicial}
        volverHref="/empresa/facturas"
      />
    </EmpresaShell>
  );
}
