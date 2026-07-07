// DARIVO PRO — Nuevo cotizacion
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NuevoCotizacionWizard } from "@/components/cotizacion/NuevoCotizacionWizard";

export default function NuevoCotizacionPage() {
  return (
    <div style={{ background: "#F8FAFF" }}>
      <PageHeader titulo="Nueva cotización" subtitulo="Listo en menos de 60 segundos" backHref="/cotizaciones" />
      <Suspense>
        <NuevoCotizacionWizard />
      </Suspense>
    </div>
  );
}
