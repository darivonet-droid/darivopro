import { redirect } from "next/navigation";
import { obtenerContextoAcceso } from "@/lib/rol-empleado";
import { InformesMasPageClient } from "@/components/informes/InformesMasPageClient";

/** Informes desde Más — 07-MODULO-MAS.md §6 (Semana / Mes / Anual).
 * Rol Técnico (Tarea 2, CLAUDE.md 17/07/2026): solo visible si su Gerente
 * se lo habilitó explícitamente (empresa_empleados.informe_habilitado). */
export default async function InformesMasPage() {
  const contexto = await obtenerContextoAcceso();
  if (contexto.rol === "tecnico" && !contexto.informeHabilitado) redirect("/mas");

  return <InformesMasPageClient />;
}
