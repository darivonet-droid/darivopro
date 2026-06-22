// DARIVO PRO — Nuevo presupuesto
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NuevoPresupuestoWizard } from "@/components/presupuesto/NuevoPresupuestoWizard";

export default function NuevoPresupuestoPage() {
  return (
    <div style={{ background: "#F8FAFF" }}>
      <PageHeader titulo="Nueva cotización" subtitulo="Listo en menos de 60 segundos" backHref="/presupuestos" />
      <Suspense>
        <NuevoPresupuestoWizard />
      </Suspense>
    </div>
  );
}
