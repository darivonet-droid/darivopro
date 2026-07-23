// DARIVO PRO EMPRESA — Informes ya no es entrada directa del sidebar
// (23/07/2026, reorganización del módulo Cierre, pedido explícito del
// propietario): vuelve a integrarse como pestaña de /empresa/cierre. Esta
// ruta se conserva solo como redirección, para no romper enlaces guardados.
import { redirect } from "next/navigation";

export default function EmpresaInformesPage() {
  redirect("/empresa/cierre?tab=informe");
}
