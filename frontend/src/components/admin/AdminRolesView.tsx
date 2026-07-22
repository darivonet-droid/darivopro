"use client";

import { AdminBadge, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import {
  LIMITES_PLAN,
  PRECIOS_OFICIALES,
  ROLES_CLIENTE,
  ROLES_PLATAFORMA,
  MATRIZ_PERMISOS_APROBADA,
} from "@/lib/roles-planes-oficial";
import {
  MATRIZ_PERMISOS,
  ROLES_MATRIZ,
  celdasPendientes,
  modulosMatriz,
  type CeldaPermiso,
} from "@/lib/matriz-permisos";
import { useState } from "react";

/** Presentación de una celda de la matriz (leyenda al pie de la tabla). */
function CeldaMatrizUI({ celda }: { celda: CeldaPermiso }) {
  const estilos: Record<CeldaPermiso["valor"], { simbolo: string; bg: string; color: string }> = {
    si: { simbolo: "✔ Sí", bg: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD },
    no: { simbolo: "✖ No", bg: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red },
    condicional: { simbolo: "◐ Condicional", bg: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD },
    noaplica: { simbolo: "— No aplica", bg: ADMIN_COLORS.slate, color: ADMIN_COLORS.textLight },
    pendiente: { simbolo: "❓ Pendiente", bg: ADMIN_COLORS.purplePale, color: ADMIN_COLORS.purple },
  };
  const e = estilos[celda.valor];
  return (
    <div>
      <span
        className="inline-block whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold"
        style={{ background: e.bg, color: e.color }}
        title={celda.nota}
      >
        {e.simbolo}
      </span>
      {celda.nota && (
        <p className="mt-1 max-w-[200px] text-[11px] leading-snug" style={{ color: ADMIN_COLORS.textLight }}>
          {celda.nota}
        </p>
      )}
    </div>
  );
}

const TABS = ["Roles", "Planes", "Permisos"] as const;

export function AdminRolesView() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Roles");

  return (
    <div>
      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

      {tab === "Roles" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section
            className="rounded-2xl p-5"
            style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
          >
            <h2 className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
              Roles de plataforma
            </h2>
            <p className="mt-1 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
              Equipo Darivo
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {ROLES_PLATAFORMA.map((rol) => (
                <li
                  key={rol}
                  className="rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                >
                  Administrador Darivo
                  <span className="ml-2 font-mono text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                    ({rol})
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section
            className="rounded-2xl p-5"
            style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
          >
            <h2 className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
              Roles del cliente
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              <li className="rounded-xl px-4 py-3" style={{ background: ADMIN_COLORS.slate }}>
                <p className="text-sm font-bold" style={{ color: ADMIN_COLORS.text }}>
                  Gerente de Empresa
                </p>
                <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                  Administra empleados y permisos dentro de su empresa
                </p>
              </li>
              <li className="rounded-xl px-4 py-3" style={{ background: ADMIN_COLORS.slate }}>
                <p className="text-sm font-bold" style={{ color: ADMIN_COLORS.text }}>
                  Empleado / Técnico
                </p>
                <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                  Trabajo diario en Móvil según permisos asignados
                </p>
              </li>
            </ul>
            <p className="mt-3 font-mono text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              IDs: {ROLES_CLIENTE.join(" · ")}
            </p>
          </section>
        </div>
      )}

      {tab === "Planes" && (
        <div>
          <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
            Catálogo oficial — administración completa en{" "}
            <strong>Gestión de Suscripciones</strong>.
          </p>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {(Object.keys(PRECIOS_OFICIALES) as Array<keyof typeof PRECIOS_OFICIALES>).map(
              (plan) => {
                const p = PRECIOS_OFICIALES[plan];
                const limites = LIMITES_PLAN[plan];
                return (
                  <div
                    key={plan}
                    className="rounded-2xl p-5"
                    style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black" style={{ color: ADMIN_COLORS.text }}>
                        {p.nombre}
                      </h3>
                      <AdminBadge label={plan} />
                    </div>
                    <p className="mt-2 text-2xl font-black" style={{ color: ADMIN_COLORS.purple }}>
                      S/ {p.mensual}
                      <span className="text-sm font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                        /mes
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                      Anual: S/ {p.anual}
                    </p>
                    <ul className="mt-4 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                      {"cotizacionesMes" in limites && (
                        <li>Cotizaciones/mes: {limites.cotizacionesMes}</li>
                      )}
                      {"cotizacionesTotal" in limites && (
                        <li>Cotizaciones totales: {String(limites.cotizacionesTotal)}</li>
                      )}
                      <li>
                        Facturación:{" "}
                        {limites.facturasHabilitado ? "Habilitada" : "No disponible"}
                      </li>
                      <li>
                        Calculadora inteligente cotizaciones/día:{" "}
                        {limites.iaCotizacionesDia === Infinity
                          ? "Ilimitada"
                          : limites.iaCotizacionesDia}
                      </li>
                      <li>
                        Calculadora inteligente facturas:{" "}
                        {limites.iaFacturasHabilitado ? "Habilitada" : "No disponible"}
                      </li>
                      {"tecnicosIncluidos" in limites && (
                        <li>Técnicos incluidos: {limites.tecnicosIncluidos}</li>
                      )}
                    </ul>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {tab === "Permisos" && (
        <div>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <AdminKpiCard label="Acciones en la matriz" value={MATRIZ_PERMISOS.length} />
            <AdminKpiCard label="Roles" value={ROLES_MATRIZ.length} />
            <AdminKpiCard
              label="Celdas pendientes de decisión"
              value={celdasPendientes().length}
              hint="Requieren decisión del propietario"
            />
          </div>

          {!MATRIZ_PERMISOS_APROBADA && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD }}
            >
              Matriz operativa vigente — refleja las reglas de negocio ya cerradas y el control de
              acceso real. Las celdas marcadas ❓ y la aprobación formal de la matriz detallada por
              empleado siguen pendientes de decisión del propietario.
            </div>
          )}

          {modulosMatriz().map((modulo) => {
            const filas = MATRIZ_PERMISOS.filter((p) => p.modulo === modulo);
            return (
              <section key={modulo} className="mb-6">
                <h2 className="mb-2 text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
                  {modulo}
                </h2>
                <AdminTable
                  headers={["Acción / permiso", ...ROLES_MATRIZ.map((r) => r.label)]}
                  vacio="Sin permisos"
                  rows={filas.map((p) => [
                    <span key="a" className="font-semibold" style={{ color: ADMIN_COLORS.text }}>
                      {p.accion}
                    </span>,
                    ...ROLES_MATRIZ.map((r) => <CeldaMatrizUI key={r.id} celda={p.celdas[r.id]} />),
                  ])}
                />
              </section>
            );
          })}

          <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
            Leyenda: ✔ permitido · ✖ denegado · ◐ condicional (depende de un plan o de un permiso
            activable) · — no aplica al rol · ❓ sin regla cerrada, pendiente de decisión. Los roles
            personalizados por empresa son un sistema aparte y no forman parte de esta matriz.
          </p>
        </div>
      )}
    </div>
  );
}
