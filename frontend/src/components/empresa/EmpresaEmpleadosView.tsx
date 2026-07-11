"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminTabs";
import { T } from "@/lib/design-system/tokens";
import {
  actualizarEstadoEmpleado,
  listarEmpleadosEmpresa,
  type EmpleadoEmpresa,
  type EstadoEmpleadoEmpresa,
} from "@/lib/empresa-empleados-types";
import { invitarEmpleadoAction } from "@/app/empresa/empleados/actions";
import { obtenerEmpresaIdGerente } from "@/lib/roles-personalizados";
import { createClient } from "@/lib/supabase/client";

export function EmpresaEmpleadosView() {
  const [empleados, setEmpleados] = useState<EmpleadoEmpresa[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [buscar, setBuscar] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(async (eid: string) => {
    try {
      const supabase = createClient();
      const lista = await listarEmpleadosEmpresa(supabase, eid);
      setEmpleados(lista);
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

  const invitar = async () => {
    if (!nombre.trim() || !email.trim() || !empresaId) return;
    setGuardando(true);
    setErrorForm(null);
    const result = await invitarEmpleadoAction(empresaId, {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || undefined,
    });
    if (result.ok) {
      setNombre("");
      setEmail("");
      setTelefono("");
      setMostrarForm(false);
      void cargar(empresaId);
    } else {
      setErrorForm(result.error);
    }
    setGuardando(false);
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
      <p className="mb-4 text-sm" style={{ color: T.textMid }}>
        Gestión de técnicos de su empresa — Doc 10-MODULO-EMPLEADOS-EMPRESA.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: T.blue }}
        >
          + Invitar empleado
        </button>
        <input
          type="search"
          placeholder="Buscar empleado…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: T.slateD }}
        />
        <Link
          href="/empresa/roles"
          className="rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ border: `1px solid ${T.slateD}`, color: T.blue }}
        >
          Editar permisos →
        </Link>
      </div>

      {!empresaId && !cargando && (
        <p className="mb-4 text-sm" style={{ color: T.textMid }}>
          No se encontró la entidad empresa vinculada a tu cuenta. Completa el onboarding o
          contacta soporte.
        </p>
      )}

      {mostrarForm && (
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ background: T.white, border: `1px solid ${T.slateD}` }}
        >
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />
          <input
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: T.slateD }}
          />
          {errorForm && (
            <p className="mb-2 text-xs font-semibold" style={{ color: T.red }}>
              {errorForm}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="flex-1 rounded-xl py-2 text-sm font-bold"
              style={{ border: `1px solid ${T.slateD}`, color: T.textMid }}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={guardando || !empresaId}
              onClick={() => void invitar()}
              className="flex-[2] rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: T.blue }}
            >
              {guardando ? "Guardando…" : "Enviar invitación"}
            </button>
          </div>
          <p className="mt-2 text-xs" style={{ color: T.textLight }}>
            Se envía un correo real de invitación para que el técnico cree su contraseña y
            acceda a Móvil. Queda con estado «Pendiente» hasta que acepte, y disponible como
            Técnico asignable en Roles y Permisos.
          </p>
        </div>
      )}

      {cargando ? (
        <div
          className="rounded-2xl py-12 text-center text-sm"
          style={{ background: T.slate, color: T.textMid }}
        >
          Cargando empleados…
        </div>
      ) : filtrados.length === 0 ? (
        <div
          className="rounded-2xl py-12 text-center text-sm"
          style={{ background: T.slate, color: T.textMid }}
        >
          No hay empleados registrados
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${T.slateD}` }}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead style={{ background: T.navyLight }}>
              <tr>
                {["Empleado", "Contacto", "Rol", "Estado", "Alta", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: T.white }}>
              {filtrados.map((e) => (
                <tr key={e.id} style={{ borderTop: `1px solid ${T.slateD}` }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: T.text }}>
                    {e.nombre}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: T.textMid }}>
                    {e.email}
                    {e.telefono && <span className="block">{e.telefono}</span>}
                  </td>
                  <td className="px-4 py-3">{e.rol}</td>
                  <td className="px-4 py-3">
                    <AdminBadge
                      label={e.estado}
                      tone={
                        e.estado === "Activo"
                          ? "success"
                          : e.estado === "Inactivo"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: T.textLight }}>
                    {new Date(e.createdAt).toLocaleDateString("es-PE")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      {e.estado !== "Activo" && (
                        <button
                          type="button"
                          style={{ color: T.greenD }}
                          onClick={() => void cambiarEstado(e.id, "Activo")}
                        >
                          Activar
                        </button>
                      )}
                      {e.estado !== "Inactivo" && (
                        <button
                          type="button"
                          style={{ color: T.red }}
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
    </div>
  );
}
