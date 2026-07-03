import { IAPresupuestoFlow } from "@/components/presupuesto/IAPresupuestoFlow";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { T } from "@/lib/design-system/tokens";

export default function EmpresaIAPage() {
  const mod = empresaModulo("ia");

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: T.textMid }}>
        Cotización con OpenAI — misma lógica Móvil (`08-MODULO-IA-EMPRESA.md`)
      </p>
      <div className="max-w-lg">
        <IAPresupuestoFlow />
      </div>
    </EmpresaShell>
  );
}
