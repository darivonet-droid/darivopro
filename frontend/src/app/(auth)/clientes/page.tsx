// DARIVO PRO — Clientes (Server Component)
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientesView, type ClienteConConteo } from "@/components/clientes/ClientesView";
import { createServerClient } from "@/lib/supabase/server";

// Lectura siempre fresca: refleja altas/bajas y nº de cotizaciones reales
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = createServerClient();
  // cotizaciones(count) usa la FK cliente_id → clientes (migración 014).
  // facturas(count) usa la FK facturas.cliente_id → clientes (migración
  // 20260717120000) — "Clientes" solo muestra quienes AÚN NO tienen factura;
  // en cuanto generan una, pasan a listarse en "Facturas" (misma fuente de
  // datos, ver app/(auth)/facturas/page.tsx).
  const { data } = await supabase
    .from("clientes")
    .select("*, cotizaciones(count), facturas(count)")
    .order("nombre");

  const clientes: ClienteConConteo[] = (data ?? [])
    .filter((row) => {
      const facturasCount = Array.isArray(row.facturas) ? (row.facturas[0]?.count ?? 0) : 0;
      return facturasCount === 0;
    })
    .map((row) => ({
      id: row.id,
      nombre: row.nombre,
      telefono: row.telefono ?? undefined,
      ruc: row.ruc ?? undefined,
      direccion: row.direccion ?? undefined,
      ciudad: row.ciudad ?? undefined,
      notas: row.notas ?? undefined,
      createdAt: row.created_at,
      cotizaciones: Array.isArray(row.cotizaciones) ? (row.cotizaciones[0]?.count ?? 0) : 0,
    }));

  return (
    <div>
      <PageHeader titulo="Clientes" subtitulo={`${clientes.length} registrados`} />
      <main className="px-4 py-4">
        <ClientesView iniciales={clientes} />
      </main>
    </div>
  );
}
