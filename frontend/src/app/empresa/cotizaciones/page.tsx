import { redirect } from "next/navigation";

/**
 * "Cotizaciones" no es una lista global (05-MODULO-COTIZACIONES-EMPRESA.md
 * §1/§3: "No es ítem del sidebar", "no existe lista global" — la consulta
 * es únicamente vía ficha de Cliente). Esta ruta existía antes como lista
 * global completa, contradiciendo el MD directamente — corregido 12/07/2026.
 * Se conserva como redirect (no 404) por si algún bookmark/enlace antiguo
 * apunta aquí.
 */
export default function EmpresaCotizacionesRedirect() {
  redirect("/empresa/clientes");
}
