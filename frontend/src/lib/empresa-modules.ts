/**
 * Metadatos módulos Empresa — server-safe (sin "use client")
 *
 * "Cotizaciones" deliberadamente NO tiene entrada aquí — no es ítem del
 * sidebar (05-MODULO-COTIZACIONES-EMPRESA.md §1/§3: "No es ítem del sidebar",
 * "Consulta de cotizaciones guardadas: únicamente en ficha de Cliente...
 * no existe lista global"). El acceso es vía CTA "Nueva cotización" en
 * Inicio y vía la ficha del Cliente, nunca un módulo propio. Corregido
 * 12/07/2026 — antes existía como sidebar item + lista global, contradiciendo
 * el MD directamente.
 */
export const EMPRESA_NAV = [
  { href: "/empresa", label: "Inicio", md: "03-darivo-pro-empresa/02-MODULO-INICIO-EMPRESA.md", ocultoEnSidebar: false },
  { href: "/empresa/clientes", label: "Clientes", md: "03-darivo-pro-empresa/03-MODULO-CLIENTES-EMPRESA.md", ocultoEnSidebar: false },
  { href: "/empresa/facturas", label: "Facturas", md: "03-darivo-pro-empresa/06-MODULO-FACTURAS-EMPRESA.md", ocultoEnSidebar: false },
  { href: "/empresa/cierre", label: "Cierre", md: "03-darivo-pro-empresa/09-MODULO-CIERRE-EMPRESA.md", ocultoEnSidebar: false },
  // Tarea 5a (CLAUDE.md 17/07/2026): ya no es ítem propio del sidebar — se
  // accede desde dentro de "Categorías" (módulo "mas"). La ruta /empresa/ia
  // sigue existiendo (MasTabs.tsx enlaza ahí), solo se quitó del sidebar.
  { href: "/empresa/ia", label: "Darivo", md: "03-darivo-pro-empresa/08-MODULO-IA-EMPRESA.md", ocultoEnSidebar: true },
  { href: "/empresa/mas", label: "Más", md: "03-darivo-pro-empresa/07-MODULO-MAS-EMPRESA.md", ocultoEnSidebar: false },
  { href: "/empresa/empleados", label: "Empleados", md: "03-darivo-pro-empresa/10-MODULO-EMPLEADOS-EMPRESA.md", ocultoEnSidebar: false },
  { href: "/empresa/roles", label: "Roles y Permisos", md: "03-darivo-pro-empresa/11-ROLES-PLANES-PERMISOS-EMPRESA.md", ocultoEnSidebar: false },
] as const;

export type EmpresaModuloSlug =
  | "inicio"
  | "clientes"
  | "facturas"
  | "cierre"
  | "ia"
  | "mas"
  | "empleados"
  | "roles";

const SLUG_INDEX: Record<EmpresaModuloSlug, number> = {
  inicio: 0,
  clientes: 1,
  facturas: 2,
  cierre: 3,
  ia: 4,
  mas: 5,
  empleados: 6,
  roles: 7,
};

export function empresaModulo(slug: EmpresaModuloSlug) {
  return EMPRESA_NAV[SLUG_INDEX[slug]];
}
