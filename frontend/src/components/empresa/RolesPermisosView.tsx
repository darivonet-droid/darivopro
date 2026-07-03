"use client";

import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import { T } from "@/lib/design-system/tokens";

/** Ámbitos documentados — matriz fila a fila pendiente propietario (Doc 11 §5.2) */
const MODULOS_PERMISO = [
  "Inicio",
  "Clientes",
  "Cotizaciones",
  "Facturas",
  "Cierre",
  "IA",
  "Más — Mis Tarifas",
] as const;

function labelPlan(plan: PlanTipoPersistido): string {
  if (plan === "basico") return `Plan ${PRECIOS_OFICIALES.basico.nombre}`;
  if (plan === "pro") return `Plan ${PRECIOS_OFICIALES.pro.nombre}`;
  if (plan === "empresa") return "Darivo Pro Empresa (producto)";
  return "Prueba gratuita — sin suscripción activa";
}

interface RolesPermisosViewProps {
  planTipo: PlanTipoPersistido;
}

export function RolesPermisosView({ planTipo }: RolesPermisosViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4"
        style={{ background: T.bluePale, border: `1px solid ${T.blue}33` }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: T.textMid }}>
            Plan contratado (consulta)
          </p>
          <p className="text-lg font-black" style={{ color: T.text }}>
            {labelPlan(planTipo)}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: T.white, color: T.blue }}
        >
          Fuente: Admin Suscripciones · 04 §6
        </span>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <p className="text-sm font-extrabold" style={{ color: T.text }}>
          Matriz de permisos por empleado
        </p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: T.textMid }}>
          El Gerente activa o desactiva permisos de cada Técnico. Los permisos nunca superan
          el plan contratado (Visión §8 · Admin §16).
        </p>
        <p
          className="mt-3 rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ background: T.amberPale, color: T.amberD }}
        >
          Matriz detallada fila a fila — pendiente aprobación del propietario (Doc 11 §5.2 · Admin §8).
          No se inventan permisos en código hasta dicha aprobación.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.slateD}` }}>
                <th className="py-3 pr-4 font-extrabold" style={{ color: T.text }}>
                  Funcionalidad
                </th>
                <th className="py-3 font-extrabold" style={{ color: T.textMid }}>
                  Técnicos (columnas al activar empleados)
                </th>
              </tr>
            </thead>
            <tbody>
              {MODULOS_PERMISO.map((mod) => (
                <tr key={mod} style={{ borderBottom: `1px solid ${T.slateD}` }}>
                  <td className="py-3 pr-4 font-semibold" style={{ color: T.text }}>
                    {mod}
                  </td>
                  <td className="py-3">
                    <span
                      className="inline-block rounded-lg px-3 py-1 text-xs font-bold"
                      style={{ background: T.slate, color: T.textLight }}
                    >
                      Toggle — pendiente matriz
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs" style={{ color: T.textLight }}>
        Entrada alternativa: Módulo Empleados → «Editar permisos» (Doc 10 · pendiente implementación).
      </p>
    </div>
  );
}
