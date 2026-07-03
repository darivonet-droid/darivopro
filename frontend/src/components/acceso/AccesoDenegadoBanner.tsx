"use client";

import { T } from "@/lib/theme";

const MENSAJES: Record<string, string> = {
  admin_denegado:
    "No tienes acceso a Darivo Pro Admin. Contacta al equipo Darivo si necesitas permisos de plataforma.",
  partner_denegado:
    "No tienes acceso al Panel Partner. Solo partners autorizados pueden entrar.",
  empresa_denegado: "No tienes acceso a Darivo Pro Empresa.",
  no_sesion: "Inicia sesión para continuar.",
};

export function AccesoDenegadoBanner({ codigo }: { codigo?: string }) {
  if (!codigo || !MENSAJES[codigo]) return null;
  return (
    <div
      className="mb-4 rounded-2xl px-4 py-3"
      style={{ background: T.amberPale, border: `1px solid ${T.amber}44` }}
    >
      <p className="text-sm font-semibold" style={{ color: T.amberD }}>
        {MENSAJES[codigo]}
      </p>
    </div>
  );
}
