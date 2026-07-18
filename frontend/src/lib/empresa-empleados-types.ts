import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Módulo Empleados Empresa — 10-MODULO-EMPLEADOS-EMPRESA.md
 * Persistencia real: tabla `empresa_empleados` (supabase/migrations/20260705120000_baseline_v2.sql).
 * Estados válidos en BD (CHECK): 'Activo' | 'Inactivo' | 'Pendiente'.
 */
export type EstadoEmpleadoEmpresa = "Activo" | "Inactivo" | "Pendiente";

export interface EmpleadoEmpresa {
  id: string;
  empresa_id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: "Técnico";
  estado: EstadoEmpleadoEmpresa;
  ultima_actividad: string | null;
  rol_personalizado_id: string | null;
  /** Permisos por técnico individual — Tarea 2 (CLAUDE.md 17/07/2026). Cotización siempre está habilitada, no tiene toggle. */
  facturaHabilitada: boolean;
  informeHabilitado: boolean;
  createdAt: string;
}

interface EmpleadoRow {
  id: string;
  empresa_id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: "Técnico";
  estado: EstadoEmpleadoEmpresa;
  ultima_actividad: string | null;
  rol_personalizado_id: string | null;
  factura_habilitada: boolean;
  informe_habilitado: boolean;
  created_at: string;
}

function mapRow(row: EmpleadoRow): EmpleadoEmpresa {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    rol: row.rol,
    estado: row.estado,
    ultima_actividad: row.ultima_actividad,
    rol_personalizado_id: row.rol_personalizado_id,
    facturaHabilitada: row.factura_habilitada,
    informeHabilitado: row.informe_habilitado,
    createdAt: row.created_at,
  };
}

export async function listarEmpleadosEmpresa(
  supabase: SupabaseClient,
  empresaId: string
): Promise<EmpleadoEmpresa[]> {
  const { data, error } = await supabase
    .from("empresa_empleados")
    .select(
      "id, empresa_id, nombre, email, telefono, rol, estado, ultima_actividad, rol_personalizado_id, factura_habilitada, informe_habilitado, created_at"
    )
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as EmpleadoRow[]).map(mapRow);
}

/** Activa/desactiva Factura o Informe para un técnico individual — solo el Gerente decide (RLS). */
export async function actualizarPermisosEmpleado(
  supabase: SupabaseClient,
  empleadoId: string,
  permisos: { facturaHabilitada?: boolean; informeHabilitado?: boolean }
): Promise<void> {
  const patch: Record<string, boolean> = {};
  if (permisos.facturaHabilitada !== undefined) patch.factura_habilitada = permisos.facturaHabilitada;
  if (permisos.informeHabilitado !== undefined) patch.informe_habilitado = permisos.informeHabilitado;
  const { error } = await supabase.from("empresa_empleados").update(patch).eq("id", empleadoId);
  if (error) throw error;
}

export async function actualizarEstadoEmpleado(
  supabase: SupabaseClient,
  empleadoId: string,
  estado: EstadoEmpleadoEmpresa
): Promise<void> {
  const { error } = await supabase
    .from("empresa_empleados")
    .update({ estado })
    .eq("id", empleadoId);

  if (error) throw error;
}

/** Edita nombre/teléfono — no toca email (identidad ligada a auth.users) ni rol. */
export async function actualizarDatosEmpleado(
  supabase: SupabaseClient,
  empleadoId: string,
  datos: { nombre: string; telefono: string | null }
): Promise<void> {
  const { error } = await supabase
    .from("empresa_empleados")
    .update({ nombre: datos.nombre, telefono: datos.telefono })
    .eq("id", empleadoId);

  if (error) throw error;
}

/** Asigna/quita el rol personalizado de un empleado directo desde la fila. */
export async function asignarRolPersonalizadoEmpleado(
  supabase: SupabaseClient,
  empleadoId: string,
  rolPersonalizadoId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("empresa_empleados")
    .update({ rol_personalizado_id: rolPersonalizadoId })
    .eq("id", empleadoId);

  if (error) throw error;
}
