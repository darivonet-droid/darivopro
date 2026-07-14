// DARIVO PRO EMPRESA — Nueva cotización, capa de presentación de escritorio
// (05-MODULO-COTIZACIONES-EMPRESA.md §4). No es ítem del sidebar (§1/§3) — se
// accede vía CTA en Inicio o "+ Nueva cotización" en ficha de Cliente.
import { Suspense } from "react";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { NuevoCotizacionWizardEscritorio } from "@/components/cotizacion/NuevoCotizacionWizardEscritorio";

export default function EmpresaNuevaCotizacionPage() {
  return (
    <EmpresaShell titulo="Nueva cotización">
      <Suspense>
        <NuevoCotizacionWizardEscritorio />
      </Suspense>
    </EmpresaShell>
  );
}
