// DARIVO PRO EMPRESA — "Mi Plan" (07-MODULO-MAS-EMPRESA.md §5.5). Entrada
// directa del sidebar (posición 12) desde 22/07/2026 — movido desde
// /empresa/mas/plan tras retirar la pantalla "Más" (Visión §16 excepción de
// navegación Empresa). Mismos datos/lógica que Móvil (perfiles.plan_tipo,
// MiPlanCardEscritorio, PagoEstadoBanner) — solo cambia la ruta.
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { MiPlanCardEscritorio } from "@/components/mas/MiPlanCardEscritorio";
import { PagoEstadoBanner } from "@/components/pagos/PagoEstadoBanner";
import { createServerClient } from "@/lib/supabase/server";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

interface Props {
  searchParams?: { pago?: string };
}

export const dynamic = "force-dynamic";

export default async function EmpresaMiPlanPage({ searchParams }: Props) {
  const mod = empresaModulo("plan");
  const supabase = createServerClient();
  const { data: perfil } = await supabase.from("perfiles").select("plan_tipo").single();

  const plan = (perfil?.plan_tipo ?? "gratis") as PlanTipoPersistido;
  const pagoEstado = searchParams?.pago;

  return (
    <EmpresaShell titulo={mod.label}>
      <PagoEstadoBanner estado={pagoEstado} />
      <MiPlanCardEscritorio planTipo={plan} />
    </EmpresaShell>
  );
}
