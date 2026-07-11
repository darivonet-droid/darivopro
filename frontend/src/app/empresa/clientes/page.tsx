import { EmpresaClientesPanel, type EmpresaClienteRow } from "@/components/empresa/EmpresaClientesPanel";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmpresaClientesPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("clientes")
    .select("id, nombre, telefono, ciudad, cotizaciones(status, total_final)")
    .order("nombre");

  const clientes: EmpresaClienteRow[] = (data ?? []).map((row) => {
    const cots = (row.cotizaciones ?? []) as { status: string; total_final: number | string }[];
    return {
      id: row.id,
      nombre: row.nombre,
      ciudad: row.ciudad ?? undefined,
      telefono: row.telefono ?? undefined,
      cotizacionesCount: cots.length,
      aprobadasCount: cots.filter((c) => c.status === "Aprobado").length,
      totalFinal: cots.reduce((acc, c) => acc + Number(c.total_final ?? 0), 0),
    };
  });

  const mod = empresaModulo("clientes");

  return (
    <EmpresaShell titulo={mod.label}>
      <EmpresaClientesPanel iniciales={clientes} />
    </EmpresaShell>
  );
}
