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
      "id, empresa_id, nombre, email, telefono, rol, estado, ultima_actividad, rol_personalizado_id, created_at"
    )
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as EmpleadoRow[]).map(mapRow);
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
