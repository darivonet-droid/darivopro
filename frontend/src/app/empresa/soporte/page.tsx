// DARIVO PRO EMPRESA — Soporte (07-MODULO-MAS-EMPRESA.md §5.6). Entrada
// directa del sidebar (posición 13) desde 22/07/2026 — movido desde
// /empresa/mas/soporte tras retirar la pantalla "Más" (Visión §16 excepción
// de navegación Empresa). Tickets estructurados creados directamente por el
// Gerente; el agente conversacional Darivo (Agente IA 2) vive en el módulo
// IA (sidebar 3, /empresa/ia).
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { DarivoChat } from "@/components/darivo/DarivoChat";
import { SoporteTicketsView } from "@/components/soporte/SoporteTicketsView";
import { T } from "@/lib/theme";

export default function EmpresaSoportePage() {
  const mod = empresaModulo("soporte");

  return (
    <EmpresaShell titulo={mod.label}>
      <DarivoChat maxHeight={480} />
      <h2 className="mb-2 mt-6 text-sm font-extrabold" style={{ color: T.text }}>
        Mis casos
      </h2>
      <SoporteTicketsView volverHref="/empresa" volverLabel="← Volver a Inicio" embedded />
    </EmpresaShell>
  );
}
