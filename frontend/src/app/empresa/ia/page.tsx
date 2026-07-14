import { IACotizacionFlow } from "@/components/cotizacion/IACotizacionFlow";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { T } from "@/lib/design-system/tokens";

export default function EmpresaIAPage() {
  const mod = empresaModulo("ia");

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: T.textMid }}>
        Cotización con Calculadora inteligente — misma lógica Móvil (`08-MODULO-IA-EMPRESA.md`)
      </p>
      <div className="max-w-2xl">
        <IACotizacionFlow
          nuevaCotizacionHref="/empresa/cotizaciones/nuevo"
          soporteHref="/empresa/mas/soporte"
        />
      </div>
    </EmpresaShell>
  );
}
