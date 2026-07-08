import { PageHeader } from "@/components/ui/PageHeader";
import { CierreView } from "@/components/cierre/CierreView";
import { createServerClient } from "@/lib/supabase/server";

export default async function CierrePage() {
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

  return (
    <div>
      <PageHeader
        titulo="Gastos"
        subtitulo="Registra y gestiona todos tus gastos"
      />
      <main className="px-4 py-4">
        <CierreView
          resumenExpediente={{
            cotizaciones: cotizaciones ?? 0,
            facturas: facturas ?? 0,
            ingresosMes,
          }}
        />
      </main>
    </div>
  );
}
