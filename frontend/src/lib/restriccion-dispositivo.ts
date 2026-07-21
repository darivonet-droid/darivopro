// DARIVO PRO — Restricción de acceso por dispositivo (Etapa 7 — continuación,
// 21/07/2026). EN FASE DE PRUEBAS, sujeta a ajuste (ver
// 01-VISION-DEL-PRODUCTO.md, sección de roles/seguridad).
//
// Tabla exacta (BLOQUEO TOTAL, no solo aviso):
//   Admin                                          → Solo ordenador (desktop)
//   Empresa — Gerente                              → Solo ordenador (desktop)
//   Técnico (vinculado a empresa vía empresa_empleados) → Solo Móvil
//   Darivo Pro Móvil independiente (sin empresa)    → Solo Móvil
//   Partner                                        → Sin restricción (único rol así)
//
// Este archivo contiene solo las funciones "puras" (sin dependencias de
// servidor) — es importado tanto por middleware.ts (edge) como por la
// pantalla de bloqueo (`(public)/dispositivo-no-disponible/page.tsx`, client
// component). La resolución real del rol (`resolverRolDispositivo()`, que sí
// depende de Supabase/acceso-producto.ts) vive aparte en
// `restriccion-dispositivo-server.ts` para no arrastrar `next/headers` al
// bundle de cliente.

export type RolDispositivo = "admin" | "gerente" | "movil" | "partner";

const REGEX_USER_AGENT_MOVIL = /Android|iPhone|iPad|iPod/i;

/** Clasifica el dispositivo por el header `user-agent` de la request — sin
 * librería nueva, mismo criterio ya usado en PwaShell.tsx del lado cliente. */
export function esUserAgentMovil(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return REGEX_USER_AGENT_MOVIL.test(userAgent);
}

/** Cruce rol×dispositivo contra la tabla — Partner es el único rol exento. */
export function dispositivoPermitido(rol: RolDispositivo, esMobile: boolean): boolean {
  switch (rol) {
    case "admin":
    case "gerente":
      return !esMobile;
    case "movil":
      return esMobile;
    case "partner":
      return true;
  }
}

/** Mensaje de bloqueo, indicando el dispositivo correcto según el rol real. */
export function mensajeDispositivoCorrecto(rol: RolDispositivo): string {
  switch (rol) {
    case "admin":
      return "Este panel de Administración solo está disponible desde un ordenador.";
    case "gerente":
      return "El panel de Darivo Pro Empresa solo está disponible desde un ordenador.";
    case "movil":
      return "Esta sección solo está disponible desde tu teléfono (Darivo Pro Móvil).";
    case "partner":
      return "";
  }
}
