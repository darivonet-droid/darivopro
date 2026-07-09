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

export async function crearEmpleadoEmpresa(
  supabase: SupabaseClient,
  empresaId: string,
  input: { nombre: string; email: string; telefono?: string }
): Promise<EmpleadoEmpresa> {
  const { data, error } = await supabase
    .from("empresa_empleados")
    .insert({
      empresa_id: empresaId,
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono || null,
      rol: "Técnico",
      estado: "Pendiente",
    })
    .select(
      "id, empresa_id, nombre, email, telefono, rol, estado, ultima_actividad, rol_personalizado_id, created_at"
    )
    .single();

  if (error) throw error;
  return mapRow(data as EmpleadoRow);
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
