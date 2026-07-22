// DARIVO PRO EMPRESA — Informes (07-MODULO-MAS-EMPRESA.md §5.3). Entrada
// directa del sidebar (posición 10) desde 22/07/2026 — antes vivía como
// ítem del panel "Más opciones" (ruta Móvil sin capa de escritorio propia)
// y, por un tiempo, como 3ª pestaña dentro de Cierre (retirada de ahí en
// este mismo cambio: no debía ocultarse dentro de otra pantalla, igual que
// el resto de "Más" — Visión §16 excepción de navegación Empresa). Reutiliza
// el mismo componente que Cierre-Empresa ya usaba (InformesTab, esEmpresa).
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { InformesTab } from "@/components/informes/InformesTab";

export default function EmpresaInformesPage() {
  const mod = empresaModulo("informes");

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Semana · Mes · Trimestral — consolida Clientes, Cotizaciones y Facturación
      </p>
      <div
        className="max-w-2xl rounded-2xl p-5"
        style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
      >
        <InformesTab esEmpresa />
      </div>
    </EmpresaShell>
  );
}
