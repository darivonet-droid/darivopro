"use client";
// DARIVO PRO — Banner informativo por dispositivo (reversión 21/07/2026, ver
// CLAUDE.md "Reversión de bloqueo total por dispositivo → banner
// informativo"). Reemplaza el bloqueo total anterior (redirect a
// `/dispositivo-no-disponible`, eliminado): el usuario NUNCA queda impedido
// de navegar por tipo de dispositivo — esto es solo un aviso, descartable,
// que no oculta ni bloquea nada del panel debajo.
//
// El rol (`RolDispositivo`) se resuelve en el servidor (mismo criterio ya
// usado por middleware.ts antes de esta reversión — ver
// restriccion-dispositivo-server.ts `resolverRolDispositivo()`) y se pasa
// como prop, siguiendo el mismo patrón servidor→cliente que el resto del
// proyecto (ver AvisoCobroBanner.tsx para el caso 100% servidor; aquí hace
// falta un Client Component porque el dispositivo solo se puede detectar de
// forma fiable en el navegador — `navigator.userAgent` — y porque el banner
// necesita estado de "cerrado" con interacción del usuario).
import { useEffect, useState } from "react";
import { avisoDispositivo, esUserAgentMovil, type RolDispositivo } from "@/lib/restriccion-dispositivo";

const SESSION_KEY = "darivo_aviso_dispositivo_cerrado";

export function AvisoDispositivoBanner({ rol }: { rol: RolDispositivo }) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cerrado, setCerrado] = useState(true); // arranca oculto hasta resolver en cliente, evita parpadeo/SSR mismatch

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const esMobile = esUserAgentMovil(navigator.userAgent);
    const aviso = avisoDispositivo(rol, esMobile);
    if (!aviso.mostrarAviso || !aviso.mensaje) return;

    setMensaje(aviso.mensaje);
    const yaCerrado = sessionStorage.getItem(SESSION_KEY) === "1";
    setCerrado(yaCerrado);
  }, [rol]);

  if (!mensaje || cerrado) return null;

  const cerrar = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setCerrado(true);
  };

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: "#EFF6FF",
        color: "#1E40AF",
        border: "1px solid #BFDBFE",
        borderRadius: 12,
        padding: "10px 14px",
        margin: "10px 14px 0",
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <span>{mensaje}</span>
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar aviso"
        style={{
          flexShrink: 0,
          background: "transparent",
          border: "none",
          color: "#1E40AF",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: 1,
          cursor: "pointer",
          padding: 4,
        }}
      >
        ✕
      </button>
    </div>
  );
}
