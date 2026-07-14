import { CierreViewEscritorio } from "@/components/cierre/CierreViewEscritorio";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmpresaCierrePage() {
  const supabase = createServerClient();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [{ count: cotizaciones }, { count: facturas }, { data: facs }] =
    await Promise.all([
      supabase
        .from("cotizaciones")
        .select("*", { count: "exact", head: true })
        .gte("created_at", inicioMes.toISOString()),
      supabase
        .from("facturas")
        .select("*", { count: "exact", head: true })
        .gte("created_at", inicioMes.toISOString()),
      supabase
        .from("facturas")
        .select("total_final, inv_status")
        .gte("created_at", inicioMes.toISOString()),
    ]);

  const ingresosMes = (facs ?? [])
    .filter((f) => f.inv_status === "Cobrada")
    .reduce((s, f) => s + Number(f.total_final ?? 0), 0);

  const mod = empresaModulo("cierre");

  return (
    <EmpresaShell titulo={mod.label}>
      <CierreViewEscritorio
        resumenExpediente={{
          cotizaciones: cotizaciones ?? 0,
          facturas: facturas ?? 0,
          ingresosMes,
        }}
      />
    </EmpresaShell>
  );
}
