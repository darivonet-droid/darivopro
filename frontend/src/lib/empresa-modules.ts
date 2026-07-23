/**
 * Metadatos módulos Empresa — server-safe (sin "use client")
 *
 * "Cotizaciones" deliberadamente NO tiene entrada aquí — no es ítem del
 * sidebar (05-MODULO-COTIZACIONES-EMPRESA.md §1/§3), aunque desde
 * 22/07/2026 sí existe como lista global (§3.1), accesible vía CTA
 * "Nueva cotización"/pills en Inicio, "Ver todos →" y la ficha del Cliente
 * — nunca como ítem propio del sidebar.
 *
 * Módulo "Más" eliminado del sidebar (22/07/2026, pedido explícito del
 * propietario — 01-VISION-DEL-PRODUCTO.md §16 v2.19): sus 7
 * funcionalidades pasan a tener entrada directa, igual que Darivo Pro
 * Admin (00-PANEL-ADMIN-DASHBOARD.md §4, sin agrupador intermedio). "IA"
 * deja de estar oculta del sidebar por la misma razón (ya no depende de
 * "Categorías" dentro de Más para tener acceso).
 *
 * "Informes" deja de tener entrada directa (23/07/2026, pedido explícito
 * del propietario — reorganización del módulo Cierre): vuelve a integrarse
 * como 3ª pestaña dentro de "Cierre" (09-MODULO-CIERRE-EMPRESA.md §3),
 * junto a Gastos y Expediente Mensual. La ruta /empresa/informes redirige
 * a /empresa/cierre?tab=informe en vez de desaparecer, para no romper
 * enlaces guardados.
 */
// Doc fuente de cada módulo (para referencia de desarrollo, no vive en el
// objeto de navegación para que nunca pueda terminar renderizado en UI):
// Inicio→02-MODULO-INICIO-EMPRESA, Clientes→03-MODULO-CLIENTES-EMPRESA,
// Facturas→06-MODULO-FACTURAS-EMPRESA, Cierre→09-MODULO-CIERRE-EMPRESA
// (incluye Informes desde 23/07/2026), Darivo→08-MODULO-IA-EMPRESA,
// Empleados→10-MODULO-EMPLEADOS-EMPRESA, Roles y Permisos→
// 11-ROLES-PLANES-PERMISOS-EMPRESA, Catálogo·Mis Tarifas / Empresa /
// Documentos / Mi Plan / Soporte / Configuración →
// 07-MODULO-MAS-EMPRESA §5.1–§5.7 (todos bajo .cursor/rules/03-darivo-pro-empresa/).
export const EMPRESA_NAV = [
  { href: "/empresa", label: "Inicio", ocultoEnSidebar: false },
  { href: "/empresa/clientes", label: "Clientes", ocultoEnSidebar: false },
  { href: "/empresa/ia", label: "Darivo", ocultoEnSidebar: false },
  { href: "/empresa/facturas", label: "Facturas", ocultoEnSidebar: false },
  { href: "/empresa/cierre", label: "Cierre", ocultoEnSidebar: false },
  { href: "/empresa/catalogo", label: "Catálogo · Mis Tarifas", ocultoEnSidebar: false },
  { href: "/empresa/empleados", label: "Empleados", ocultoEnSidebar: false },
  { href: "/empresa/roles", label: "Roles y Permisos", ocultoEnSidebar: false },
  { href: "/empresa/empresa", label: "Empresa", ocultoEnSidebar: false },
  { href: "/empresa/documentos", label: "Documentos", ocultoEnSidebar: false },
  { href: "/empresa/plan", label: "Mi Plan", ocultoEnSidebar: false },
  { href: "/empresa/soporte", label: "Soporte", ocultoEnSidebar: false },
  { href: "/empresa/configuracion", label: "Configuración", ocultoEnSidebar: false },
] as const;

export type EmpresaModuloSlug =
  | "inicio"
  | "clientes"
  | "ia"
  | "facturas"
  | "cierre"
  | "catalogo"
  | "empleados"
  | "roles"
  | "empresa"
  | "documentos"
  | "plan"
  | "soporte"
  | "configuracion";

const SLUG_INDEX: Record<EmpresaModuloSlug, number> = {
  inicio: 0,
  clientes: 1,
  ia: 2,
  facturas: 3,
  cierre: 4,
  catalogo: 5,
  empleados: 6,
  roles: 7,
  empresa: 8,
  documentos: 9,
  plan: 10,
  soporte: 11,
  configuracion: 12,
};

export function empresaModulo(slug: EmpresaModuloSlug) {
  return EMPRESA_NAV[SLUG_INDEX[slug]];
}
