import { IACotizacionFlow } from "@/components/cotizacion/IACotizacionFlow";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

export default function EmpresaIAPage() {
  const mod = empresaModulo("ia");

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Cotización con Darivo — misma lógica Móvil
      </p>
      <div className="max-w-2xl">
        <IACotizacionFlow
          nuevaCotizacionHref="/empresa/cotizaciones/nuevo"
          soporteHref="/empresa/mas/soporte"
          nombreAsistente="Darivo"
          esEmpresa
        />
      </div>
    </EmpresaShell>
  );
}
