"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminTabs";
import { T } from "@/lib/design-system/tokens";
import {
  empleadosStorageKey,
  type EmpleadoEmpresa,
  type EstadoEmpleadoEmpresa,
} from "@/lib/empresa-empleados-types";
import { createClient } from "@/lib/supabase/client";

export function EmpresaEmpleadosView() {
  const [empleados, setEmpleados] = useState<EmpleadoEmpresa[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [buscar, setBuscar] = useState("");

  const cargar = useCallback(async (uid: string) => {
    try {
      const raw = localStorage.getItem(empleadosStorageKey(uid));
      setEmpleados(raw ? (JSON.parse(raw) as EmpleadoEmpresa[]) : []);
    } catch {
      setEmpleados([]);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        void cargar(data.user.id);
      }
    });
  }, [cargar]);

  const guardar = (list: EmpleadoEmpresa[]) => {
    if (!userId) return;
    localStorage.setItem(empleadosStorageKey(userId), JSON.stringify(list));
    setEmpleados(list);
  };

  const invitar = () => {
    if (!nombre.trim() || !email.trim()) return;
    const nuevo: EmpleadoEmpresa = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || undefined,
      rol: "Técnico",
      estado: "Invitación pendiente",
      createdAt: new Date().toISOString(),
    };
    guardar([nuevo, ...empleados]);
    setNombre("");
    setEmail("");
    setTelefono("");
    setMostrarForm(false);
  };

  const cambiarEstado = (id: string, estado: EstadoEmpleadoEmpresa) => {
    guardar(empleados.map((e) => (e.id === id ? { ...e, estado } : e)));
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
              onClick={invitar}
              className="flex-[2] rounded-xl py-2 text-sm font-bold text-white"
              style={{ background: T.blue }}
            >
              Enviar invitación
            </button>
          </div>
          <p className="mt-2 text-xs" style={{ color: T.textLight }}>
            Invitación acceso Móvil — tabla empleados BD pendiente (Doc 10 §9).
          </p>
        </div>
      )}

      {filtrados.length === 0 ? (
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
                          : e.estado === "Desactivado"
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
                          onClick={() => cambiarEstado(e.id, "Activo")}
                        >
                          Activar
                        </button>
                      )}
                      {e.estado !== "Desactivado" && (
                        <button
                          type="button"
                          style={{ color: T.red }}
                          onClick={() => cambiarEstado(e.id, "Desactivado")}
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
