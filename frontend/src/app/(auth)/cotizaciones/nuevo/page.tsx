// DARIVO PRO — Nuevo cotizacion
// El wizard renderiza su propio DarkHeader (StepDots por fase) — no envolver
// en PageHeader aquí, o se duplica el header oscuro (05-MODULO-COTIZACIONES.md §2).
import { Suspense } from "react";
import { NuevoCotizacionWizard } from "@/components/cotizacion/NuevoCotizacionWizard";

export default function NuevoCotizacionPage() {
  return (
    <Suspense>
      <NuevoCotizacionWizard />
    </Suspense>
  );
}
