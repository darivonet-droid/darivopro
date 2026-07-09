"use client";

import { T } from "@/lib/design-system/tokens";

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
    ref: "§5.4",
  },
] as const;

export function ApisRegistroView() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm" style={{ color: T.textMid }}>
        Registro oficial de APIs — solo lectura. Fuente:{" "}
        <span className="font-mono text-xs">08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md</span>
      </p>
      <div className="grid gap-3">
        {APIS_OFICIALES.map((api) => (
          <div
            key={api.nombre}
            className="rounded-2xl p-5"
            style={{ background: T.white, border: `1px solid ${T.slateD}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold" style={{ color: T.text }}>
                {api.nombre}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: T.greenPale, color: T.greenD }}
              >
                {api.estado}
              </span>
            </div>
            <p className="mt-2 text-sm" style={{ color: T.textMid }}>
              {api.uso}
            </p>
            <p className="mt-1 text-xs" style={{ color: T.textLight }}>
              Módulos: {api.modulos}
            </p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase" style={{ color: T.textMid }}>
          Pendientes §5.4
        </p>
        {PENDIENTES.map((p) => (
          <div
            key={p.nombre}
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: T.amberPale, color: T.amberD }}
          >
            {p.nombre} — {p.estado}
          </div>
        ))}
      </div>
    </div>
  );
}
