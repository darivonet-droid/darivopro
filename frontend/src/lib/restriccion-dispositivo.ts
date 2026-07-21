// DARIVO PRO — Aviso informativo por dispositivo (Etapa 7 — continuación,
// reversión 21/07/2026, ver CLAUDE.md "Reversión de bloqueo total por
// dispositivo → banner informativo"). El BLOQUEO TOTAL que existió aquí antes
// (redirect a `/dispositivo-no-disponible`, quitaba al usuario del panel)
// quedó eliminado por decisión de Mohamed: un usuario NUNCA debe quedar
// impedido de navegar por el tipo de dispositivo que use. Lo que queda es un
// aviso informativo, no bloqueante y descartable.
//
// Tabla exacta (aviso, no bloqueo):
//   Admin / Empresa — Gerente, en móvil       → aviso "usa Empresa desde un ordenador"
//   Técnico / Darivo Pro Móvil independiente, en ordenador → aviso "usa la app Móvil desde tu celular"
//   Partner                                   → SIN aviso, en ningún dispositivo
//
// Este archivo contiene solo las funciones "puras" (sin dependencias de
// servidor) — es importado tanto por middleware.ts/layouts (server) como por
// el banner cliente (`AvisoDispositivoBanner.tsx`). La resolución real del
// rol (`resolverRolDispositivo()`, que sí depende de Supabase/
// acceso-producto.ts) vive aparte en `restriccion-dispositivo-server.ts` para
// no arrastrar `next/headers` al bundle de cliente.

export type RolDispositivo = "admin" | "gerente" | "movil" | "partner";

const REGEX_USER_AGENT_MOVIL = /Android|iPhone|iPad|iPod/i;

/** Clasifica el dispositivo por un user-agent (header de request en servidor,
 * o `navigator.userAgent` en cliente) — mismo criterio ya usado en
 * PwaShell.tsx del lado cliente. */
export function esUserAgentMovil(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return REGEX_USER_AGENT_MOVIL.test(userAgent);
}

export interface AvisoDispositivo {
  mostrarAviso: boolean;
  mensaje: string | null;
}

const MENSAJE_USA_EMPRESA =
  "Para una mejor experiencia, usa Darivo Pro Empresa desde un ordenador.";
const MENSAJE_USA_MOVIL =
  "Para una mejor experiencia, usa la app Darivo Pro Móvil desde tu celular.";

/** Cruce rol×dispositivo — decide si corresponde un aviso informativo, nunca
 * un bloqueo. Partner queda explícitamente sin aviso, en cualquier
 * dispositivo (único rol así, por diseño). */
export function avisoDispositivo(rol: RolDispositivo, esMobile: boolean): AvisoDispositivo {
  switch (rol) {
    case "admin":
    case "gerente":
      return esMobile
        ? { mostrarAviso: true, mensaje: MENSAJE_USA_EMPRESA }
        : { mostrarAviso: false, mensaje: null };
    case "movil":
      return !esMobile
        ? { mostrarAviso: true, mensaje: MENSAJE_USA_MOVIL }
        : { mostrarAviso: false, mensaje: null };
    case "partner":
      return { mostrarAviso: false, mensaje: null };
  }
}
