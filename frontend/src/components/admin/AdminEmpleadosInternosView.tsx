"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, AdminTabs, AdminNotice } from "@/components/admin/AdminTabs";
import { AdminKpiCard, AdminTable, AdminCard } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { descargarCsv } from "@/lib/csv-export";
import type { AdminEmpleadoInternoRow } from "@/lib/admin-queries";
import {
  nuevoEmpleadoAction,
  editarEmpleadoAction,
  cambiarActivoEmpleadoAction,
  eliminarEmpleadoAction,
  restablecerAccesoAction,
  reenviarInvitacionEmpleadoAction,
} from "@/app/admin/empleados/actions";

const TABS = ["Empleados", "Invitaciones", "Actividad", "Historial de cambios"] as const;

export function AdminEmpleadosInternosView({ empleados }: { empleados: AdminEmpleadoInternoRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [tab, setTab] = useState<(typeof TABS)[number]>("Empleados");
  const [buscar, setBuscar] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activos" | "inactivos">("todos");
  const [departamentoFiltro, setDepartamentoFiltro] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("");
  const [orden, setOrden] = useState<"nombre" | "alta" | "acceso">("alta");
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");

  const [panelId, setPanelId] = useState<string | null>(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [fNombre, setFNombre] = useState("");
  const [fCargo, setFCargo] = useState("");
  const [fDepartamento, setFDepartamento] = useState("");
  const [fEmail, setFEmail] = useState("");

  const departamentos = useMemo(
    () => Array.from(new Set(empleados.map((e) => e.departamento).filter(Boolean))) as string[],
    [empleados]
  );
  const cargos = useMemo(
    () => Array.from(new Set(empleados.map((e) => e.cargo).filter(Boolean))) as string[],
    [empleados]
  );

  const filtrados = useMemo(() => {
    let list = empleados;
    if (estadoFiltro === "activos") list = list.filter((e) => e.activo);
    if (estadoFiltro === "inactivos") list = list.filter((e) => !e.activo);
    if (departamentoFiltro) list = list.filter((e) => e.departamento === departamentoFiltro);
    if (cargoFiltro) list = list.filter((e) => e.cargo === cargoFiltro);
    const q = buscar.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          (e.email ?? "").toLowerCase().includes(q) ||
          (e.nombre ?? "").toLowerCase().includes(q) ||
          (e.cargo ?? "").toLowerCase().includes(q) ||
          (e.departamento ?? "").toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (orden === "nombre") sorted.sort((a, b) => (a.nombre ?? a.email).localeCompare(b.nombre ?? b.email));
    if (orden === "alta") sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (orden === "acceso")
      sorted.sort((a, b) => +new Date(b.lastSignInAt ?? 0) - +new Date(a.lastSignInAt ?? 0));
    return sorted;
  }, [empleados, estadoFiltro, departamentoFiltro, cargoFiltro, buscar, orden]);

  const activos = empleados.filter((e) => e.activo).length;
  const invitacionesPendientes = empleados.filter((e) => !e.lastSignInAt).length;
  const seleccionado = empleados.find((e) => e.id === panelId) ?? null;

  function limpiarAvisos() {
    setError(null);
    setAviso(null);
  }

  function crearEmpleado() {
    limpiarAvisos();
    if (!fEmail.trim()) {
      setError("Correo requerido");
      return;
    }
    startTransition(async () => {
      const r = await nuevoEmpleadoAction({
        nombre: fNombre,
        email: fEmail,
        cargo: fCargo,
        departamento: fDepartamento,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setAviso(`Invitación enviada a ${fEmail}`);
      setFNombre("");
      setFCargo("");
      setFDepartamento("");
      setFEmail("");
      setMostrarNuevo(false);
      router.refresh();
    });
  }

  function guardarEdicion(id: string, input: { nombre?: string; cargo?: string; departamento?: string }) {
    limpiarAvisos();
    startTransition(async () => {
      const r = await editarEmpleadoAction(id, input);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  }

  function toggleActivo(id: string, activo: boolean) {
    limpiarAvisos();
    startTransition(async () => {
      const r = await cambiarActivoEmpleadoAction(id, activo);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar la ficha de este empleado? Esta acción no se puede deshacer.")) return;
    limpiarAvisos();
    startTransition(async () => {
      const r = await eliminarEmpleadoAction(id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setPanelId(null);
      router.refresh();
    });
  }

  function restablecerAcceso(email: string) {
    limpiarAvisos();
    startTransition(async () => {
      const r = await restablecerAccesoAction(email);
      setAviso(r.ok ? `Correo de restablecimiento enviado a ${email}` : null);
      if (!r.ok) setError(r.error);
    });
  }

  function reenviarInvitacion(email: string) {
    limpiarAvisos();
    startTransition(async () => {
      const r = await reenviarInvitacionEmpleadoAction(email);
      setAviso(r.ok ? `Invitación reenviada a ${email}` : null);
      if (!r.ok) setError(r.error);
    });
  }

  const filaBoton = "rounded-lg px-2.5 py-1 text-xs font-bold";

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <AdminKpiCard label="Total empleados" value={empleados.length} />
          <AdminKpiCard label="Activos" value={activos} />
          <AdminKpiCard label="Inactivos" value={empleados.length - activos} />
          <AdminKpiCard
            label="Invitaciones pendientes"
            value={invitacionesPendientes}
            hint="Aproximado: nunca inició sesión"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}>
            {error}
          </div>
        )}
        {aviso && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD }}>
            {aviso}
          </div>
        )}

        <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

        {tab === "Empleados" && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                type="search"
                placeholder="Buscar empleado…"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="w-full max-w-xs rounded-xl border px-4 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD }}
              />
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value as typeof estadoFiltro)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
              <select
                value={departamentoFiltro}
                onChange={(e) => setDepartamentoFiltro(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={cargoFiltro}
                onChange={(e) => setCargoFiltro(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
              >
                <option value="">Todos los cargos</option>
                {cargos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as typeof orden)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
              >
                <option value="alta">Más recientes</option>
                <option value="nombre">Nombre (A–Z)</option>
                <option value="acceso">Último acceso</option>
              </select>
              <div className="ml-auto flex gap-1 rounded-xl p-1" style={{ background: ADMIN_COLORS.slate }}>
                <button
                  type="button"
                  onClick={() => setVista("tabla")}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  style={{ background: vista === "tabla" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}
                >
                  Tabla
                </button>
                <button
                  type="button"
                  onClick={() => setVista("tarjetas")}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  style={{ background: vista === "tarjetas" ? ADMIN_COLORS.white : "transparent", color: ADMIN_COLORS.text }}
                >
                  Tarjetas
                </button>
              </div>
            </div>

            {vista === "tabla" ? (
              <AdminTable
                headers={["Empleado", "Cargo", "Departamento", "Estado", "Alta", "Último acceso", "Acciones"]}
                vacio="Sin empleados internos registrados"
                filaActivaIndex={filtrados.findIndex((e) => e.id === panelId)}
                onRowClick={(i) => setPanelId(filtrados[i].id)}
                rows={filtrados.map((e) => [
                  <div key="n">
                    <p className="font-semibold" style={{ color: ADMIN_COLORS.text }}>
                      {e.nombre || e.email}
                    </p>
                    {e.nombre && (
                      <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                        {e.email}
                      </p>
                    )}
                  </div>,
                  e.cargo || "—",
                  e.departamento || "—",
                  e.activo ? <AdminBadge key="s" label="Activo" tone="success" /> : <AdminBadge key="s" label="Inactivo" tone="neutral" />,
                  new Date(e.created_at).toLocaleDateString("es-PE"),
                  e.lastSignInAt ? new Date(e.lastSignInAt).toLocaleDateString("es-PE") : "Nunca",
                  <div key="a" className="flex flex-wrap gap-1.5" onClick={(ev) => ev.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setPanelId(e.id)}
                      className={filaBoton}
                      style={{ background: ADMIN_COLORS.purplePale, color: ADMIN_COLORS.purple }}
                    >
                      Ver perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActivo(e.id, !e.activo)}
                      className={filaBoton}
                      style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                    >
                      {e.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>,
                ])}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtrados.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setPanelId(e.id)}
                    className="rounded-2xl p-4 text-left"
                    style={{
                      background: ADMIN_COLORS.white,
                      border: `1px solid ${panelId === e.id ? ADMIN_COLORS.purple : ADMIN_COLORS.slateD}`,
                    }}
                  >
                    <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>
                      {e.nombre || e.email}
                    </p>
                    <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                      {e.cargo || "—"} · {e.departamento || "—"}
                    </p>
                    <div className="mt-2">
                      {e.activo ? <AdminBadge label="Activo" tone="success" /> : <AdminBadge label="Inactivo" tone="neutral" />}
                    </div>
                  </button>
                ))}
                {filtrados.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                    Sin empleados internos registrados
                  </p>
                )}
              </div>
            )}

            <AdminNotice>
              Importar/Exportar en lote, &ldquo;Publicar cambios&rdquo; y &ldquo;Guía de uso&rdquo; no están
              construidos todavía. &ldquo;Exportar&rdquo; (CSV de la vista actual) sí está
              disponible en el panel lateral.
            </AdminNotice>
          </>
        )}

        {(tab === "Invitaciones" || tab === "Actividad" || tab === "Historial de cambios") && (
          <div className="rounded-2xl p-8 text-center text-sm" style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}>
            {tab} — no disponible todavía.
          </div>
        )}
      </div>

      <div className="space-y-4">
        {seleccionado ? (
          <AdminCard
            title="Ficha del empleado"
            action={
              <button type="button" onClick={() => setPanelId(null)} className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                ✕
              </button>
            }
          >
            <EditarEmpleadoForm empleado={seleccionado} onGuardar={(input) => guardarEdicion(seleccionado.id, input)} />
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => restablecerAcceso(seleccionado.email)}
                className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
              >
                Restablecer acceso
              </button>
              {!seleccionado.lastSignInAt && (
                <button
                  type="button"
                  onClick={() => reenviarInvitacion(seleccionado.email)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                >
                  Reenviar invitación
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleActivo(seleccionado.id, !seleccionado.activo)}
                className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
              >
                {seleccionado.activo ? "Desactivar empleado" : "Activar empleado"}
              </button>
              <button
                type="button"
                onClick={() => eliminar(seleccionado.id)}
                className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}
              >
                Eliminar empleado
              </button>
            </div>
          </AdminCard>
        ) : (
          <>
            <AdminCard title="Resumen de empleados">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Total empleados</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{empleados.length}</span>
                </li>
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Activos</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{activos}</span>
                </li>
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Inactivos</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{empleados.length - activos}</span>
                </li>
                <li className="flex justify-between">
                  <span style={{ color: ADMIN_COLORS.textMid }}>Invitaciones pendientes</span>
                  <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>{invitacionesPendientes}</span>
                </li>
              </ul>
            </AdminCard>

            <AdminCard title="Trabajo en equipo">
              <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                &ldquo;Conectados ahora&rdquo; no está construido — requiere seguimiento de
                presencia en tiempo real, infraestructura que no existe todavía.
              </p>
            </AdminCard>

            <AdminCard title="Acciones rápidas">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarNuevo((v) => !v)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-bold text-white"
                  style={{ background: ADMIN_COLORS.purple }}
                >
                  Nuevo empleado
                </button>
                <button
                  type="button"
                  onClick={() =>
                    descargarCsv(
                      "plantilla-empleados.csv",
                      [["nombre", "email", "cargo", "departamento"], ["", "", "", ""]]
                    )
                  }
                  className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                >
                  Descargar plantilla (CSV)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    descargarCsv(
                      "empleados.csv",
                      [
                        ["nombre", "email", "cargo", "departamento", "estado", "alta", "ultimo_acceso"],
                        ...filtrados.map((e) => [
                          e.nombre ?? "",
                          e.email,
                          e.cargo ?? "",
                          e.departamento ?? "",
                          e.activo ? "Activo" : "Inactivo",
                          e.created_at,
                          e.lastSignInAt ?? "",
                        ]),
                      ]
                    )
                  }
                  className="rounded-lg px-3 py-2 text-left text-sm font-bold"
                  style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
                >
                  Exportar vista actual (CSV)
                </button>
              </div>

              {mostrarNuevo && (
                <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: ADMIN_COLORS.slateD }}>
                  <input
                    placeholder="Nombre"
                    value={fNombre}
                    onChange={(e) => setFNombre(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: ADMIN_COLORS.slateD }}
                  />
                  <input
                    placeholder="Correo *"
                    value={fEmail}
                    onChange={(e) => setFEmail(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: ADMIN_COLORS.slateD }}
                  />
                  <input
                    placeholder="Cargo"
                    value={fCargo}
                    onChange={(e) => setFCargo(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: ADMIN_COLORS.slateD }}
                  />
                  <input
                    placeholder="Departamento"
                    value={fDepartamento}
                    onChange={(e) => setFDepartamento(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: ADMIN_COLORS.slateD }}
                  />
                  <button
                    type="button"
                    onClick={crearEmpleado}
                    className="w-full rounded-lg px-3 py-2 text-sm font-bold text-white"
                    style={{ background: ADMIN_COLORS.purple }}
                  >
                    Enviar invitación
                  </button>
                  <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                    Esto crea la ficha del empleado y le envía invitación de acceso. No otorga
                    acceso al Panel Admin por sí solo — eso requiere que el propietario añada su
                    correo a la allowlist de administradores.
                  </p>
                </div>
              )}
            </AdminCard>
          </>
        )}
      </div>
    </div>
  );
}

function EditarEmpleadoForm({
  empleado,
  onGuardar,
}: {
  empleado: AdminEmpleadoInternoRow;
  onGuardar: (input: { nombre?: string; cargo?: string; departamento?: string }) => void;
}) {
  const [nombre, setNombre] = useState(empleado.nombre ?? "");
  const [cargo, setCargo] = useState(empleado.cargo ?? "");
  const [departamento, setDepartamento] = useState(empleado.departamento ?? "");

  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        {empleado.email}
      </p>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: ADMIN_COLORS.slateD }}
      />
      <input
        value={cargo}
        onChange={(e) => setCargo(e.target.value)}
        placeholder="Cargo"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: ADMIN_COLORS.slateD }}
      />
      <input
        value={departamento}
        onChange={(e) => setDepartamento(e.target.value)}
        placeholder="Departamento"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: ADMIN_COLORS.slateD }}
      />
      <button
        type="button"
        onClick={() => onGuardar({ nombre, cargo, departamento })}
        className="w-full rounded-lg px-3 py-2 text-sm font-bold text-white"
        style={{ background: ADMIN_COLORS.purple }}
      >
        Guardar cambios
      </button>
    </div>
  );
}
