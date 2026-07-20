"use client";

import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

/** Registro oficial 08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md §5.1–§5.3 */
const APIS_OFICIALES = [
  {
    nombre: "Supabase",
    estado: "Activa",
    uso: "Auth · PostgreSQL · Storage · RLS",
    modulos: "Ecosistema completo",
  },
  {
    nombre: "OpenAI API",
    estado: "Activa",
    uso: "Calculadora inteligente — cotizaciones y análisis gastos",
    modulos: "Móvil Calculadora inteligente · Cierre · Empresa Calculadora inteligente",
  },
  {
    nombre: "dLocal API",
    estado: "Activa",
    uso: "Suscripciones · cobros · pagos",
    modulos: "Mi Plan · Admin Suscripciones",
  },
] as const;

const PENDIENTES = [
  {
    nombre: "Facturación electrónica (SUNAT o proveedor)",
    estado: "Pendiente propietario",
  },
] as const;

export function ApisRegistroView() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Registro oficial de APIs — solo lectura.
      </p>
      <div className="grid gap-3">
        {APIS_OFICIALES.map((api) => (
          <div
            key={api.nombre}
            className="rounded-2xl p-5"
            style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold" style={{ color: ADMIN_COLORS.text }}>
                {api.nombre}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD }}
              >
                {api.estado}
              </span>
            </div>
            <p className="mt-2 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
              {api.uso}
            </p>
            <p className="mt-1 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              Módulos: {api.modulos}
            </p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
          Pendientes
        </p>
        {PENDIENTES.map((p) => (
          <div
            key={p.nombre}
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD }}
          >
            {p.nombre} — {p.estado}
          </div>
        ))}
      </div>
    </div>
  );
}
