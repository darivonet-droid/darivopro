"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminTabs";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import {
  actualizarDatosEmpleado,
  actualizarEstadoEmpleado,
  actualizarPermisosEmpleado,
  asignarRolPersonalizadoEmpleado,
  listarEmpleadosEmpresa,
  type EmpleadoEmpresa,
  type EstadoEmpleadoEmpresa,
} from "@/lib/empresa-empleados-types";
import { invitarEmpleadoAction } from "@/app/empresa/empleados/actions";
import {
  listarRolesPersonalizados,
  obtenerEmpresaIdGerente,
  type RolPersonalizado,
} from "@/lib/roles-personalizados";
import { createClient } from "@/lib/supabase/client";

// Texto visible per 10-MODULO-EMPLEADOS-EMPRESA.md §"Estado" — distinto del
// valor real en BD (CHECK: 'Activo'|'Inactivo'|'Pendiente', sin tocar).
const ESTADO_LABEL: Record<EstadoEmpleadoEmpresa, string> = {
  Activo: "Activo",
  Pendiente: "Invitación pendiente",
  Inactivo: "Desactivado",
};

function formatoUltimaActividad(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EmpresaEmpleadosView() {
  const [empleados, setEmpleados] = useState<EmpleadoEmpresa[]>([]);
  const [roles, setRoles] = useState<RolPersonalizado[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  // Etapa 7 (21/07/2026, decisión 3): un Técnico nuevo nace con Cotización +
  // Cliente + Factura activas — Factura ya no es opt-in en el default del
  // formulario (antes false). Informe sigue opcional, el Gerente lo activa
  // aparte si quiere.
  const [facturaHabilitada, setFacturaHabilitada] = useState(true);
  const [informeHabilitado, setInformeHabilitado] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const cargar = useCallback(async (eid: string) => {
    try {
      const supabase = createClient();
      const [lista, listaRoles] = await Promise.all([
        listarEmpleadosEmpresa(supabase, eid),
        listarRolesPersonalizados(supabase, eid),
      ]);
      setEmpleados(lista);
      setRoles(listaRoles);
    } catch {
      setEmpleados([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    void obtenerEmpresaIdGerente(supabase).then((eid) => {
      setEmpresaId(eid);
      if (eid) {
        void cargar(eid);
      } else {
        setCargando(false);
      }
    });
  }, [cargar]);

  const abrirEdicion = (e: EmpleadoEmpresa) => {
    setEditandoId(e.id);
    setEditNombre(e.nombre);
    setEditTelefono(e.telefono ?? "");
  };

  const guardarEdicion = async () => {
    if (!editandoId || !editNombre.trim() || !empresaId) return;
    setGuardandoEdicion(true);
    const supabase = createClient();
    await actualizarDatosEmpleado(supabase, editandoId, {
      nombre: editNombre.trim(),
      telefono: editTelefono.trim() || null,
    });
    setGuardandoEdicion(false);
    setEditandoId(null);
    void cargar(empresaId);
  };

  const cambiarRolPersonalizado = async (empleadoId: string, rolId: string) => {
    if (!empresaId) return;
    const supabase = createClient();
    await asignarRolPersonalizadoEmpleado(supabase, empleadoId, rolId || null);
    void cargar(empresaId);
  };

  const invitar = async () => {
    if (!nombre.trim() || !email.trim() || !empresaId) return;
    setGuardando(true);
    setErrorForm(null);
    const result = await invitarEmpleadoAction(empresaId, {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || undefined,
      facturaHabilitada,
      informeHabilitado,
    });
    if (result.ok) {
      setNombre("");
      setEmail("");
      setTelefono("");
      setFacturaHabilitada(true);
      setInformeHabilitado(false);
      setMostrarForm(false);
      void cargar(empresaId);
    } else {
      setErrorForm(result.error);
    }
    setGuardando(false);
  };

  const cambiarPermiso = async (
    empleadoId: string,
    permiso: "facturaHabilitada" | "informeHabilitado",
    valor: boolean
  ) => {
    if (!empresaId) return;
    const supabase = createClient();
    await actualizarPermisosEmpleado(supabase, empleadoId, { [permiso]: valor });
    void cargar(empresaId);
  };

  const cambiarEstado = async (id: string, estado: EstadoEmpleadoEmpresa) => {
    if (!empresaId) return;
    const supabase = createClient();
    await actualizarEstadoEmpleado(supabase, id, estado);
    void cargar(empresaId);
  };

  const filtrados = empleados.filter((e) => {
    const q = buscar.trim().toLowerCase();
    if (!q) return true;
    return e.nombre.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Gestión de técnicos de su empresa.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: ADMIN_COLORS.purple }}
        >
          + Invitar empleado
        </button>
        <input
          type="search"
          placeholder="Buscar empleado…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: ADMIN_COLORS.slateD }}
        />
        <Link
          href="/empresa/roles"
          className="rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.purple }}
        >
          Editar permisos →
        </Link>
      </div>

      {!empresaId && !cargando && (
        <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
          No se encontró la entidad empresa vinculada a tu cuenta. Completa el onboarding o
          contacta soporte.
        </p>
      )}

      {mostrarForm && (
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
        >
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: ADMIN_COLORS.slateD }}
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: ADMIN_COLORS.slateD }}
          />
          <input
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: ADMIN_COLORS.slateD }}
          />

          <div className="mb-3 rounded-xl p-3" style={{ background: ADMIN_COLORS.slate }}>
            <p className="mb-2 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
              Permisos de este Técnico
            </p>
            <p className="mb-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
              Cotización y Cliente siempre están habilitadas. Factura nace activada — puedes
              desactivarla si este Técnico no debe emitir facturas. Informe es opcional:
            </p>
            <label className="mb-1.5 flex items-center gap-2 text-sm" style={{ color: ADMIN_COLORS.text }}>
              <input
                type="checkbox"
                checked={facturaHabilitada}
                onChange={(e) => setFacturaHabilitada(e.target.checked)}
              />
              Puede crear Facturas
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: ADMIN_COLORS.text }}>
              <input
                type="checkbox"
                checked={informeHabilitado}
                onChange={(e) => setInformeHabilitado(e.target.checked)}
              />
              Puede ver Informe de su propio trabajo
            </label>
          </div>
          {errorForm && (
            <p className="mb-2 text-xs font-semibold" style={{ color: ADMIN_COLORS.red }}>
              {errorForm}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="flex-1 rounded-xl py-2 text-sm font-bold"
              style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={guardando || !empresaId}
              onClick={() => void invitar()}
              className="flex-[2] rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: ADMIN_COLORS.purple }}
            >
              {guardando ? "Guardando…" : "Enviar invitación"}
            </button>
          </div>
          <p className="mt-2 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
            Se envía un correo real de invitación (contraseña) más otro con el rol y los permisos
            asignados. Queda con estado «Invitación pendiente» hasta que acepte, entra directo con
            esos permisos ya activos, sin configurar nada él mismo. Nunca ve «Mis planes».
          </p>
        </div>
      )}

      {cargando ? (
        <div
          className="rounded-2xl py-12 text-center text-sm"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
        >
          Cargando empleados…
        </div>
      ) : filtrados.length === 0 ? (
        <div
          className="rounded-2xl py-12 text-center text-sm"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
        >
          No hay empleados registrados
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${ADMIN_COLORS.slateD}` }}>
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead style={{ background: ADMIN_COLORS.tableHeaderBg }}>
              <tr>
                {["Empleado", "Contacto", "Rol", "Factura", "Informe", "Rol personalizado", "Estado", "Última actividad", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-bold uppercase"
                    style={{ color: ADMIN_COLORS.tableHeaderText }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: ADMIN_COLORS.white }}>
              {filtrados.map((e) => (
                <tr key={e.id} style={{ borderTop: `1px solid ${ADMIN_COLORS.slateD}` }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: ADMIN_COLORS.text }}>
                    {e.nombre}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                    {e.email}
                    {e.telefono && <span className="block">{e.telefono}</span>}
                  </td>
                  <td className="px-4 py-3">{e.rol}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1.5 text-xs" style={{ color: ADMIN_COLORS.text }}>
                      <input
                        type="checkbox"
                        checked={e.facturaHabilitada}
                        onChange={(ev) => void cambiarPermiso(e.id, "facturaHabilitada", ev.target.checked)}
                      />
                      Habilitada
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1.5 text-xs" style={{ color: ADMIN_COLORS.text }}>
                      <input
                        type="checkbox"
                        checked={e.informeHabilitado}
                        onChange={(ev) => void cambiarPermiso(e.id, "informeHabilitado", ev.target.checked)}
                      />
                      Habilitado
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={e.rol_personalizado_id ?? ""}
                      onChange={(ev) => void cambiarRolPersonalizado(e.id, ev.target.value)}
                      className="rounded-lg border px-2 py-1.5 text-xs"
                      style={{ borderColor: ADMIN_COLORS.slateD, color: ADMIN_COLORS.text }}
                    >
                      <option value="">Sin rol personalizado</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge
                      label={ESTADO_LABEL[e.estado]}
                      tone={
                        e.estado === "Activo"
                          ? "success"
                          : e.estado === "Inactivo"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                    {formatoUltimaActividad(e.ultima_actividad)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <button
                        type="button"
                        style={{ color: ADMIN_COLORS.purple }}
                        onClick={() => abrirEdicion(e)}
                      >
                        Editar
                      </button>
                      {e.estado !== "Activo" && (
                        <button
                          type="button"
                          style={{ color: ADMIN_COLORS.greenD }}
                          onClick={() => void cambiarEstado(e.id, "Activo")}
                        >
                          Activar
                        </button>
                      )}
                      {e.estado !== "Inactivo" && (
                        <button
                          type="button"
                          style={{ color: ADMIN_COLORS.red }}
                          onClick={() => void cambiarEstado(e.id, "Inactivo")}
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editandoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,22,40,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5"
            style={{ background: ADMIN_COLORS.white }}
          >
            <h2 className="mb-3 text-sm font-bold" style={{ color: ADMIN_COLORS.text }}>
              Editar empleado
            </h2>
            <input
              placeholder="Nombre"
              value={editNombre}
              onChange={(ev) => setEditNombre(ev.target.value)}
              className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: ADMIN_COLORS.slateD }}
            />
            <input
              placeholder="Teléfono (opcional)"
              value={editTelefono}
              onChange={(ev) => setEditTelefono(ev.target.value)}
              className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: ADMIN_COLORS.slateD }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditandoId(null)}
                className="flex-1 rounded-xl py-2 text-sm font-bold"
                style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardandoEdicion || !editNombre.trim()}
                onClick={() => void guardarEdicion()}
                className="flex-[2] rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: ADMIN_COLORS.purple }}
              >
                {guardandoEdicion ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
