// DARIVO PRO — Clientes (Server Component)
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientesView } from "@/components/clientes/ClientesView";
import { createServerClient } from "@/lib/supabase/server";
import type { Cliente } from "@/types";

export default async function ClientesPage() {
  const supabase = createServerClient();
  const { data } = await supabase.from("clientes").select("*").order("nombre");

  const clientes: Cliente[] = (data ?? []).map((row) => ({
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
    <div>
      <PageHeader titulo="Clientes" subtitulo={`${clientes.length} registrados`} />
      <main className="px-4 py-4">
        <ClientesView iniciales={clientes} />
      </main>
    </div>
  );
}
