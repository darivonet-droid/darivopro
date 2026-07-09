/** Metadatos módulos Empresa — server-safe (sin "use client") */
export const EMPRESA_NAV = [
  { href: "/empresa", label: "Inicio", md: "03-darivo-pro-empresa/02-MODULO-INICIO-EMPRESA.md" },
  { href: "/empresa/clientes", label: "Clientes", md: "03-darivo-pro-empresa/03-MODULO-CLIENTES-EMPRESA.md" },
  { href: "/empresa/cotizaciones", label: "Cotizaciones", md: "03-darivo-pro-empresa/05-MODULO-COTIZACIONES-EMPRESA.md" },
  { href: "/empresa/facturas", label: "Facturas", md: "03-darivo-pro-empresa/06-MODULO-FACTURAS-EMPRESA.md" },
  { href: "/empresa/cierre", label: "Cierre", md: "03-darivo-pro-empresa/09-MODULO-CIERRE-EMPRESA.md" },
  { href: "/empresa/ia", label: "Calculadora inteligente", md: "03-darivo-pro-empresa/08-MODULO-IA-EMPRESA.md" },
  { href: "/empresa/mas", label: "Más", md: "03-darivo-pro-empresa/07-MODULO-MAS-EMPRESA.md" },
  { href: "/empresa/empleados", label: "Empleados", md: "03-darivo-pro-empresa/10-MODULO-EMPLEADOS-EMPRESA.md" },
  { href: "/empresa/roles", label: "Roles y Permisos", md: "03-darivo-pro-empresa/11-ROLES-PLANES-PERMISOS-EMPRESA.md" },
] as const;

export type EmpresaModuloSlug =
  | "inicio"
  | "clientes"
  | "cotizaciones"
  | "facturas"
  | "cierre"
  | "ia"
  | "mas"
  | "empleados"
  | "roles";

const SLUG_INDEX: Record<EmpresaModuloSlug, number> = {
  inicio: 0,
  clientes: 1,
  cotizaciones: 2,
  facturas: 3,
  cierre: 4,
  ia: 5,
  mas: 6,
  empleados: 7,
  roles: 8,
};

export function empresaModulo(slug: EmpresaModuloSlug) {
  return EMPRESA_NAV[SLUG_INDEX[slug]];
}
