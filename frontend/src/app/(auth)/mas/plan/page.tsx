import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { MiPlanCard } from "@/components/mas/MiPlanCard";
import { PagoEstadoBanner } from "@/components/pagos/PagoEstadoBanner";
import { createServerClient } from "@/lib/supabase/server";
import type { PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import { T } from "@/lib/theme";

interface Props {
  searchParams?: { pago?: string };
}

export default async function MiPlanPage({ searchParams }: Props) {
  const supabase = createServerClient();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_tipo")
    .single();

  const plan = (perfil?.plan_tipo ?? "gratis") as PlanTipoPersistido;
  const pagoEstado = searchParams?.pago;

  return (
    <div>
      <PageHeader titulo="Mi Plan" subtitulo="Planes que escalan contigo" />
      <main className="px-4 py-4">
        <PagoEstadoBanner estado={pagoEstado} />
        <MiPlanCard planTipo={plan} />
        <Link
          href="/mas"
          className="mt-6 block text-center text-sm font-bold"
          style={{ color: T.blue }}
        >
          ← Volver a Más
        </Link>
      </main>
    </div>
  );
}
