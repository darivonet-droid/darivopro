import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Catálogo toggleable de un rol personalizado — cerrado a Factura + Informe
 * (decisión del propietario 23/07/2026, Fase 2). Es exactamente el catálogo
 * aprobado de la matriz §5.2 (Doc 11): Cotización y Cliente son módulos base
 * sin flag (siempre disponibles) y Mis Tarifas nunca es administrable por un
 * Técnico (regla cerrada), por eso ninguno figura aquí. Las claves "Factura"
 * e "Informe" son las que lee el enforcement en `rol-empleado.ts`
 * (`obtenerContextoAcceso`) — no renombrar sin actualizar ese punto.
 */
export const MODULOS_PERMISO_ROL = ["Factura", "Informe"] as const;

export type ModuloPermisoRol = (typeof MODULOS_PERMISO_ROL)[number];
export type PermisosRolMap = Partial<Record<ModuloPermisoRol, boolean>>;

export interface RolPersonalizado {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion: string | null;
  permisos: PermisosRolMap;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmpleadoConRol {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  rol_personalizado_id: string | null;
}

const NOMBRES_RESERVADOS = new Set(["gerente", "técnico", "tecnico"]);

export function nombreRolReservado(nombre: string): boolean {
  return NOMBRES_RESERVADOS.has(nombre.trim().toLowerCase());
}

export function permisosVacios(): PermisosRolMap {
  return Object.fromEntries(MODULOS_PERMISO_ROL.map((m) => [m, false])) as PermisosRolMap;
}

export async function obtenerEmpresaIdGerente(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("empresa_id")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.empresa_id) return perfil.empresa_id;

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id")
    .eq("gerente_user_id", user.id)
    .maybeSingle();

  return empresa?.id ?? null;
}

export async function listarRolesPersonalizados(
  supabase: SupabaseClient,
  empresaId: string
): Promise<RolPersonalizado[]> {
  const { data, error } = await supabase
    .from("roles_personalizados")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nombre");

  if (error) throw error;
  return (data ?? []) as RolPersonalizado[];
}

export async function listarTecnicosEmpresa(
  supabase: SupabaseClient,
  empresaId: string
): Promise<EmpleadoConRol[]> {
  const { data, error } = await supabase
    .from("empresa_empleados")
    .select("id, nombre, email, rol, estado, rol_personalizado_id")
    .eq("empresa_id", empresaId)
    .eq("rol", "Técnico")
    .order("nombre");

  if (error) throw error;
  return (data ?? []) as EmpleadoConRol[];
}
