/** Módulo Empleados Empresa — 10-MODULO-EMPLEADOS-EMPRESA.md */
export type EstadoEmpleadoEmpresa = "Activo" | "Invitación pendiente" | "Desactivado";

export interface EmpleadoEmpresa {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: "Técnico";
  estado: EstadoEmpleadoEmpresa;
  ultimaActividad?: string;
  createdAt: string;
}

export function empleadosStorageKey(userId: string) {
  return `darivo_empresa_empleados_${userId}`;
}
