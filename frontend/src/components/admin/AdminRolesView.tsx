"use client";

import { AdminBadge, AdminTabs } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { T } from "@/lib/design-system/tokens";
import {
  LIMITES_PLAN,
  PRECIOS_OFICIALES,
  ROLES_CLIENTE,
  ROLES_PLATAFORMA,
  MATRIZ_PERMISOS_APROBADA,
} from "@/lib/roles-planes-oficial";
import { useState } from "react";

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
            style={{ background: T.white, border: `1px solid ${T.slateD}` }}
          >
            <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
              Roles de plataforma
            </h2>
            <p className="mt-1 text-xs" style={{ color: T.textMid }}>
              Doc 12 §6.1 — equipo Darivo
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {ROLES_PLATAFORMA.map((rol) => (
                <li
                  key={rol}
                  className="rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{ background: T.slate, color: T.text }}
                >
                  Administrador Darivo
                  <span className="ml-2 font-mono text-xs" style={{ color: T.textLight }}>
                    ({rol})
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section
            className="rounded-2xl p-5"
            style={{ background: T.white, border: `1px solid ${T.slateD}` }}
          >
            <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
              Roles del cliente
            </h2>
            <p className="mt-1 text-xs" style={{ color: T.textMid }}>
              Doc 12 §6.2–§6.3 · Visión §8
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              <li className="rounded-xl px-4 py-3" style={{ background: T.slate }}>
                <p className="text-sm font-bold" style={{ color: T.text }}>
                  Gerente de Empresa
                </p>
                <p className="text-xs" style={{ color: T.textMid }}>
                  Administra empleados y permisos dentro de su empresa
                </p>
              </li>
              <li className="rounded-xl px-4 py-3" style={{ background: T.slate }}>
                <p className="text-sm font-bold" style={{ color: T.text }}>
                  Empleado / Técnico
                </p>
                <p className="text-xs" style={{ color: T.textMid }}>
                  Trabajo diario en Móvil según permisos asignados
                </p>
              </li>
            </ul>
            <p className="mt-3 font-mono text-xs" style={{ color: T.textLight }}>
              IDs: {ROLES_CLIENTE.join(" · ")}
            </p>
          </section>
        </div>
      )}

      {tab === "Planes" && (
        <div>
          <p className="mb-4 text-sm" style={{ color: T.textMid }}>
            Catálogo oficial — administración completa en{" "}
            <strong>Gestión de Suscripciones</strong> (Doc 04 §6).
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
                    style={{ background: T.white, border: `1px solid ${T.slateD}` }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black" style={{ color: T.text }}>
                        {p.nombre}
                      </h3>
                      <AdminBadge label={plan} />
                    </div>
                    <p className="mt-2 text-2xl font-black" style={{ color: T.blue }}>
                      S/ {p.mensual}
                      <span className="text-sm font-bold" style={{ color: T.textMid }}>
                        /mes
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: T.textLight }}>
                      Anual: S/ {p.anual}
                    </p>
                    <ul className="mt-4 text-xs" style={{ color: T.textMid }}>
                      {"presupuestosMes" in limites && (
                        <li>Cotizaciones/mes: {limites.presupuestosMes}</li>
                      )}
                      {"presupuestosTotal" in limites && (
                        <li>Cotizaciones totales: {String(limites.presupuestosTotal)}</li>
                      )}
                      <li>
                        Facturación:{" "}
                        {limites.facturasHabilitado ? "Habilitada" : "No disponible"}
                      </li>
                      <li>
                        IA cotizaciones/día:{" "}
                        {limites.iaCotizacionesDia === Infinity
                          ? "Ilimitada"
                          : limites.iaCotizacionesDia}
                      </li>
                      <li>
                        IA facturas:{" "}
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
        <div
          className="rounded-2xl p-6"
          style={{ background: T.white, border: `1px solid ${T.slateD}` }}
        >
          <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
            Matriz de permisos
          </h2>
          {MATRIZ_PERMISOS_APROBADA ? (
            <AdminTable headers={["Permiso", "Estado"]} rows={[]} vacio="Sin permisos configurados" />
          ) : (
            <p className="mt-3 text-sm" style={{ color: T.textMid }}>
              Matriz detallada fila a fila — pendiente aprobación del propietario (Doc 12 §8).
              Gestión desde Empresa → Roles y Permisos cuando esté aprobada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
