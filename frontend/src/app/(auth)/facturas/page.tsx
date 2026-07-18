// DARIVO PRO — Facturación (Server Component)
// Lista CLIENTES con al menos una factura (no documentos sueltos) — misma
// fuente de datos que Clientes, filtrada por facturas.cliente_id (FK real).
// Ver detalle/estado/PDF de cada factura en la ficha del cliente (§6).
import { redirect } from "next/navigation";
import { FacturasView, type ClienteConFacturas } from "@/components/facturacion/FacturasView";
import { createServerClient } from "@/lib/supabase/server";
import { obtenerContextoAcceso } from "@/lib/rol-empleado";
import type { LineaCotizacion, Cotizacion } from "@/types";

export const dynamic = "force-dynamic";

export default async function FacturasPage() {
  // Rol Técnico (Tarea 2, CLAUDE.md 17/07/2026): Factura OFF por defecto,
  // el Gerente la activa por técnico individual.
  const contexto = await obtenerContextoAcceso();
  if (contexto.rol === "tecnico" && !contexto.facturaHabilitada) redirect("/cotizaciones");

  const supabase = createServerClient();

  const [clientesRes, perfilRes, aprobadosRes] = await Promise.all([
    supabase
      .from("clientes")
      .select("*, facturas!inner(inv_id, inv_num, inv_status, total_final, sym)")
      .order("nombre"),
    supabase.from("perfiles").select("ruc").single(),
    supabase
      .from("cotizaciones")
      .select("id, user_id, client_name, phone, city, margin, total_base, total_labor, total_final, status, created_at, notes")
      .eq("status", "Aprobado")
      .order("created_at", { ascending: false }),
  ]);

  const clientes: ClienteConFacturas[] = (clientesRes.data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono ?? undefined,
    ruc: row.ruc ?? undefined,
    direccion: row.direccion ?? undefined,
    ciudad: row.ciudad ?? undefined,
    email: row.email ?? undefined,
    notas: row.notas ?? undefined,
    createdAt: row.created_at,
    facturas: (row.facturas ?? []).map((f: Record<string, unknown>) => ({
      invId: String(f.inv_id),
      invNum: String(f.inv_num),
      invStatus: String(f.inv_status),
      totalFinal: Number(f.total_final ?? 0),
      sym: String(f.sym ?? "S/"),
    })),
  }));

  const aprobados: Cotizacion[] = (aprobadosRes.data ?? []).map((row) => ({
    id: row.id,
    tenant_id: row.user_id,
    clientName: row.client_name,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    items: [] as LineaCotizacion[],
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
      clientes={clientes}
      rucEmpresa={perfilRes.data?.ruc ?? ""}
      aprobados={aprobados}
    />
  );
}
