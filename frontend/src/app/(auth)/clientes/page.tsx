// DARIVO PRO — Clientes (Server Component)
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientesView, type ClienteConConteo } from "@/components/clientes/ClientesView";
import { createServerClient } from "@/lib/supabase/server";

// Lectura siempre fresca: refleja altas/bajas y nº de cotizaciones reales
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = createServerClient();
  // presupuestos(count) usa la FK cliente_id → clientes (migración 014)
  const { data } = await supabase
    .from("clientes")
    .select("*, presupuestos(count)")
    .order("nombre");

  const clientes: ClienteConConteo[] = (data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono ?? undefined,
    ruc: row.ruc ?? undefined,
    direccion: row.direccion ?? undefined,
    ciudad: row.ciudad ?? undefined,
    notas: row.notas ?? undefined,
    createdAt: row.created_at,
    cotizaciones: Array.isArray(row.presupuestos) ? (row.presupuestos[0]?.count ?? 0) : 0,
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
