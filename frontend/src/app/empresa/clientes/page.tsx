import Link from "next/link";
import { ClientesView, type ClienteConConteo } from "@/components/clientes/ClientesView";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/design-system/tokens";

export const dynamic = "force-dynamic";

export default async function EmpresaClientesPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("clientes")
    .select("*, cotizaciones(count)")
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
    cotizaciones: Array.isArray(row.cotizaciones)
      ? (row.cotizaciones[0]?.count ?? 0)
      : 0,
  }));

  const mod = empresaModulo("clientes");

  return (
    <EmpresaShell titulo={mod.label}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: T.textMid }}>
          {clientes.length} clientes · misma lógica Móvil
        </p>
        <Link
          href="/clientes"
          className="text-xs font-bold"
          style={{ color: T.blue }}
        >
          Abrir en Móvil →
        </Link>
      </div>
      <ClientesView iniciales={clientes} />
    </EmpresaShell>
  );
}
