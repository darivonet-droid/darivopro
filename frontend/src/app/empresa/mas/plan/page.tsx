// DARIVO PRO EMPRESA — "Mi plan" (Tarea 5b, CLAUDE.md 17/07/2026)
// Mismos datos/lógica que Móvil (perfiles.plan_tipo, CheckoutPlanButton real,
// PagoEstadoBanner) — solo la presentación cambia a ADMIN_COLORS dentro de
// EmpresaShell (antes enlazaba literalmente a /mas/plan, la ruta Móvil).
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { MiPlanCardEscritorio } from "@/components/mas/MiPlanCardEscritorio";
import { PagoEstadoBanner } from "@/components/pagos/PagoEstadoBanner";
import { createServerClient } from "@/lib/supabase/server";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";

interface Props {
  searchParams?: { pago?: string };
}

export const dynamic = "force-dynamic";

export default async function EmpresaMiPlanPage({ searchParams }: Props) {
  const supabase = createServerClient();
  const { data: perfil } = await supabase.from("perfiles").select("plan_tipo").single();

  const plan = (perfil?.plan_tipo ?? "gratis") as PlanTipoPersistido;
  const pagoEstado = searchParams?.pago;

  return (
    <EmpresaShell titulo="Mi plan">
      <PagoEstadoBanner estado={pagoEstado} />
      <MiPlanCardEscritorio planTipo={plan} />
    </EmpresaShell>
  );
}
