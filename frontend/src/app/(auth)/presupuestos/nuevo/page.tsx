// DARIVO PRO — Nuevo presupuesto
import { PageHeader } from "@/components/ui/PageHeader";
import { NuevoPresupuestoWizard } from "@/components/presupuesto/NuevoPresupuestoWizard";

export default function NuevoPresupuestoPage() {
  return (
    <div>
      <PageHeader titulo="Nuevo presupuesto" subtitulo="Listo en menos de 60 segundos" backHref="/presupuestos" />
      <NuevoPresupuestoWizard />
    </div>
  );
}
