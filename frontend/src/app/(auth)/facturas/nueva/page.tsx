// DARIVO PRO — Nueva factura
import { redirect } from "next/navigation";
import { NuevaFacturaForm, type ClienteConUltimaCotizacion } from "@/components/facturacion/NuevaFacturaForm";
import { createServerClient } from "@/lib/supabase/server";
import { obtenerContextoAcceso } from "@/lib/rol-empleado";
import { T } from "@/lib/theme";
import type { EmpresaData, LineaCotizacion, Cotizacion } from "@/types";
import type { TipoComprobante } from "@/lib/factura-utils";

export default async function NuevaFacturaPage({
  searchParams,
}: {
  searchParams: { cotizacion?: string; tipo?: string; cliente?: string };
}) {
  // Rol Técnico (Tarea 2, CLAUDE.md 17/07/2026): Factura OFF por defecto.
  const contexto = await obtenerContextoAcceso();
  if (contexto.rol === "tecnico" && !contexto.facturaHabilitada) redirect("/cotizaciones");

  const supabase = createServerClient();

  const [perfilRes, facturasRes, aprobadosRes, clientesRes] = await Promise.all([
    supabase.from("perfiles").select("*").single(),
    supabase.from("facturas").select("inv_num"),
    supabase
      .from("cotizaciones")
      .select("*, items:cotizacion_items(*)")
      .eq("status", "Aprobado")
      .order("created_at", { ascending: false }),
    supabase
      .from("clientes")
      .select(
        "*, cotizaciones(id, user_id, client_name, phone, city, margin, total_base, total_labor, total_final, status, created_at, notes, items:cotizacion_items(*))"
      )
      .order("nombre"),
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
        logoUrl: perfil.logo_url ?? null,
      }
    : null;

  const numerosExistentes = (facturasRes.data ?? []).map((r) => r.inv_num as string);
  const tipoInicial: TipoComprobante = searchParams.tipo === "boleta" ? "boleta" : "factura";

  // Mismo mapeo para las cotizaciones "Aprobado" (banner) y para la última
  // cotización de cada cliente (autocompletado al elegir "Cliente guardado").
  const mapCotizacionRow = (row: Record<string, unknown>, clienteId?: string): Cotizacion => ({
    id: row.id as string,
    tenant_id: row.user_id as string,
    clienteId,
    clientName: row.client_name as string,
    phone: (row.phone as string) ?? undefined,
    city: (row.city as string) ?? undefined,
    items: ((row.items as Record<string, unknown>[]) ?? []).map((it): LineaCotizacion => ({
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
    status: row.status as Cotizacion["status"],
    createdAt: row.created_at as string,
    notes: (row.notes as string) ?? undefined,
  });

  const aprobados: Cotizacion[] = (aprobadosRes.data ?? []).map((row) => mapCotizacionRow(row));

  const clientes: ClienteConUltimaCotizacion[] = (clientesRes.data ?? []).map((row) => {
    const cotizacionesRows: Record<string, unknown>[] = Array.isArray(row.cotizaciones) ? row.cotizaciones : [];
    const ultima = cotizacionesRows
      .slice()
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
      .at(-1);
    return {
      id: row.id,
      nombre: row.nombre,
      telefono: row.telefono ?? undefined,
      ruc: row.ruc ?? undefined,
      direccion: row.direccion ?? undefined,
      ciudad: row.ciudad ?? undefined,
      email: row.email ?? undefined,
      notas: row.notas ?? undefined,
      createdAt: row.created_at,
      ultimaCotizacion: ultima ? String(ultima.created_at) : undefined,
      cotizacionAsociada: ultima ? mapCotizacionRow(ultima, row.id) : undefined,
    };
  });

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
        cotizacionId={searchParams.cotizacion}
        tipoInicial={tipoInicial}
        clienteIdInicial={searchParams.cliente}
      />
    </div>
  );
}
