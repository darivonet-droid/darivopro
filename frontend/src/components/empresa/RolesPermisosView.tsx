"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminTabs";
import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import {
  MODULOS_PERMISO_ROL,
  nombreRolReservado,
  permisosVacios,
  obtenerEmpresaIdGerente,
  listarRolesPersonalizados,
  listarTecnicosEmpresa,
  type PermisosRolMap,
  type RolPersonalizado,
  type EmpleadoConRol,
} from "@/lib/roles-personalizados";
import { UPGRADE_MENSAJES, verificarLimiteRolesPersonalizados } from "@/lib/plan-limits";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

function labelPlan(plan: PlanTipoPersistido): string {
  if (plan === "basico") return `Plan ${PRECIOS_OFICIALES.basico.nombre}`;
  if (plan === "pro") return `Plan ${PRECIOS_OFICIALES.pro.nombre}`;
  if (plan === "business") return `Plan ${PRECIOS_OFICIALES.business.nombre}`;
  return "Prueba gratuita — sin suscripción activa";
}

function PlanLimiteAlert({ razon }: { razon: keyof typeof UPGRADE_MENSAJES }) {
  const msg = UPGRADE_MENSAJES[razon];
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: ADMIN_COLORS.amberPale, border: `1px solid ${ADMIN_COLORS.amber}44` }}
    >
      <p className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.amberD }}>
        {msg.titulo}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: ADMIN_COLORS.textMid }}>
        {msg.subtitulo}
      </p>
    </div>
  );
}

interface RolesPermisosViewProps {
  planTipo: PlanTipoPersistido;
}

export function RolesPermisosView({ planTipo }: RolesPermisosViewProps) {
  const esBusiness = planTipo === "business";

  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [roles, setRoles] = useState<RolPersonalizado[]>([]);
  const [tecnicos, setTecnicos] = useState<EmpleadoConRol[]>([]);
  const [cargando, setCargando] = useState(esBusiness);
  const [limiteInfo, setLimiteInfo] = useState<{ limite: number | null; activos: number } | null>(
    null
  );
  const [alertaLimite, setAlertaLimite] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [permisos, setPermisos] = useState<PermisosRolMap>(permisosVacios());
  const [asignacionRolId, setAsignacionRolId] = useState<string | null>(null);
  const [tecnicosSeleccionados, setTecnicosSeleccionados] = useState<string[]>([]);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const recargar = useCallback(async () => {
    if (!esBusiness) return;
    setCargando(true);
    const supabase = createClient();
    const eid = await obtenerEmpresaIdGerente(supabase);
    setEmpresaId(eid);
    if (!eid) {
      setCargando(false);
      return;
    }
    try {
      const [listaRoles, listaTecnicos, limite] = await Promise.all([
        listarRolesPersonalizados(supabase, eid),
        listarTecnicosEmpresa(supabase, eid),
        verificarLimiteRolesPersonalizados(supabase, eid),
      ]);
      setRoles(listaRoles);
      setTecnicos(listaTecnicos);
      setLimiteInfo({ limite: limite.limite, activos: limite.activos });
      setAlertaLimite(!limite.ok);
    } finally {
      setCargando(false);
    }
  }, [esBusiness]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const resetForm = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setPermisos(permisosVacios());
    setErrorForm(null);
  };

  const abrirCrear = async () => {
    if (!empresaId) return;
    const supabase = createClient();
    const limite = await verificarLimiteRolesPersonalizados(supabase, empresaId);
    setLimiteInfo({ limite: limite.limite, activos: limite.activos });
    if (!limite.ok) {
      setAlertaLimite(true);
      return;
    }
    resetForm();
    setMostrarForm(true);
  };

  const abrirEditar = (rol: RolPersonalizado) => {
    setEditandoId(rol.id);
    setNombre(rol.nombre);
    setDescripcion(rol.descripcion ?? "");
    setPermisos({ ...permisosVacios(), ...rol.permisos });
    setMostrarForm(true);
    setErrorForm(null);
  };

  const togglePermiso = (mod: (typeof MODULOS_PERMISO_ROL)[number]) => {
    setPermisos((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  const guardarRol = async () => {
    if (!empresaId) return;
    const nombreTrim = nombre.trim();
    if (!nombreTrim) {
      setErrorForm("El nombre del rol es obligatorio.");
      return;
    }
    if (nombreRolReservado(nombreTrim)) {
      setErrorForm('No puedes usar "Gerente" ni "Técnico" — son nombres reservados.');
      return;
    }

    setGuardando(true);
    setErrorForm(null);
    const supabase = createClient();

    if (!editandoId) {
      const limite = await verificarLimiteRolesPersonalizados(supabase, empresaId);
      if (!limite.ok) {
        setAlertaLimite(true);
        setGuardando(false);
        return;
      }
    }

    const payload = {
      empresa_id: empresaId,
      nombre: nombreTrim,
      descripcion: descripcion.trim() || null,
      permisos,
      activo: true,
    };

    const { error } = editandoId
      ? await supabase.from("roles_personalizados").update(payload).eq("id", editandoId)
      : await supabase.from("roles_personalizados").insert(payload);

    setGuardando(false);
    if (error) {
      setErrorForm(
        error.code === "23505"
          ? "Ya existe un rol con ese nombre en tu empresa."
          : error.message
      );
      return;
    }
    resetForm();
    void recargar();
  };

  const eliminarRol = async (rolId: string) => {
    if (!confirm("¿Eliminar este rol personalizado? Los técnicos asignados volverán al rol Técnico base.")) {
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("roles_personalizados").delete().eq("id", rolId);
    if (error) return;
    if (asignacionRolId === rolId) setAsignacionRolId(null);
    void recargar();
  };

  const abrirAsignacion = (rolId: string) => {
    setAsignacionRolId(rolId);
    setTecnicosSeleccionados(
      tecnicos.filter((t) => t.rol_personalizado_id === rolId).map((t) => t.id)
    );
  };

  const guardarAsignacion = async () => {
    if (!asignacionRolId || !empresaId) return;
    setGuardando(true);
    const supabase = createClient();

    const prevAsignados = tecnicos
      .filter((t) => t.rol_personalizado_id === asignacionRolId)
      .map((t) => t.id);

    const quitar = prevAsignados.filter((id) => !tecnicosSeleccionados.includes(id));
    const asignar = tecnicosSeleccionados.filter((id) => !prevAsignados.includes(id));

    await Promise.all([
      ...quitar.map((id) =>
        supabase.from("empresa_empleados").update({ rol_personalizado_id: null }).eq("id", id)
      ),
      ...asignar.map((id) =>
        supabase
          .from("empresa_empleados")
          .update({ rol_personalizado_id: asignacionRolId })
          .eq("id", id)
      ),
    ]);

    setGuardando(false);
    setAsignacionRolId(null);
    void recargar();
  };

  const toggleTecnico = (id: string) => {
    setTecnicosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const puedeCrear =
    esBusiness &&
    empresaId &&
    limiteInfo &&
    (limiteInfo.limite === null || limiteInfo.activos < limiteInfo.limite);

  return (
    <div className="flex flex-col gap-4">
      {/* Chip de estado real de la pantalla (Fase 2, B2 — 23/07/2026). Antes
          decía "🔒 Solo lectura", lo que contradecía tanto el banner de abajo
          ("administrar los permisos") como la capacidad real: con plan Business
          el Gerente crea, edita, elimina y asigna roles personalizados que SÍ
          se aplican (enforcement en rol-empleado.ts, Fase 2 A). Sin Business el
          bloque de roles no se muestra y esto es solo consulta. */}
      <div>
        {esBusiness ? (
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: ADMIN_COLORS.purplePale, color: ADMIN_COLORS.purple }}
          >
            ✏️ Administras los roles y permisos de tus Técnicos
          </span>
        ) : (
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
          >
            Consulta — los roles personalizados requieren plan Business
          </span>
        )}
      </div>
      <div
        className="flex items-start gap-3 rounded-2xl p-4"
        style={{ background: ADMIN_COLORS.purplePale, border: `1px solid ${ADMIN_COLORS.purple}33` }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
          style={{ background: ADMIN_COLORS.purple }}
        >
          i
        </span>
        <div>
          <p className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
            Este módulo es exclusivo para el rol de Gerente.
          </p>
          <p className="mt-0.5 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
            Solo los gerentes pueden ver y administrar los permisos de los empleados.
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4"
        style={{ background: ADMIN_COLORS.purplePale, border: `1px solid ${ADMIN_COLORS.purple}33` }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: ADMIN_COLORS.textMid }}>
            Plan contratado (consulta)
          </p>
          <p className="text-lg font-black" style={{ color: ADMIN_COLORS.text }}>
            {labelPlan(planTipo)}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: ADMIN_COLORS.white, color: ADMIN_COLORS.purple }}
        >
          Fuente: Admin Suscripciones
        </span>
      </div>

      {esBusiness && (
        <div
          className="rounded-2xl p-5"
          style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
                Roles personalizados
              </p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: ADMIN_COLORS.textMid }}>
                Solo plan Business. Crea plantillas de permisos reutilizables y asígnalas a uno o
                varios Técnicos.
              </p>
              {limiteInfo && (
                <p className="mt-2 text-xs font-semibold" style={{ color: ADMIN_COLORS.textLight }}>
                  Roles activos: {limiteInfo.activos}
                  {limiteInfo.limite !== null ? ` / ${limiteInfo.limite}` : " (sin límite configurado)"}
                </p>
              )}
            </div>
            {puedeCrear && (
              <button
                type="button"
                onClick={() => void abrirCrear()}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                style={{ background: ADMIN_COLORS.purple }}
              >
                + Crear rol personalizado
              </button>
            )}
          </div>

          {alertaLimite && <div className="mt-4"><PlanLimiteAlert razon="roles_personalizados_limite" /></div>}

          {!empresaId && !cargando && (
            <p className="mt-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
              No se encontró la entidad empresa vinculada a tu cuenta. Completa el onboarding o
              contacta soporte.
            </p>
          )}

          {mostrarForm && (
            <div
              className="mt-4 rounded-xl p-4"
              style={{ background: ADMIN_COLORS.slate, border: `1px solid ${ADMIN_COLORS.slateD}` }}
            >
              <p className="mb-3 text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
                {editandoId ? "Editar rol personalizado" : "Nuevo rol personalizado"}
              </p>
              <input
                placeholder="Nombre del rol *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, background: ADMIN_COLORS.white }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: ADMIN_COLORS.slateD, background: ADMIN_COLORS.white }}
              />
              <p className="mb-2 text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                Permisos (toggles sobre funcionalidades existentes)
              </p>
              <div className="mb-3 flex flex-col gap-2">
                {MODULOS_PERMISO_ROL.map((mod) => (
                  <label
                    key={mod}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                    style={{ color: ADMIN_COLORS.text }}
                  >
                    <input
                      type="checkbox"
                      checked={!!permisos[mod]}
                      onChange={() => togglePermiso(mod)}
                    />
                    {mod}
                  </label>
                ))}
              </div>
              {errorForm && (
                <p className="mb-2 text-xs font-semibold" style={{ color: ADMIN_COLORS.red }}>
                  {errorForm}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl py-2 text-sm font-bold"
                  style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => void guardarRol()}
                  className="flex-[2] rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: ADMIN_COLORS.purple }}
                >
                  {guardando ? "Guardando…" : editandoId ? "Guardar cambios" : "Crear rol"}
                </button>
              </div>
            </div>
          )}

          {asignacionRolId && (
            <div
              className="mt-4 rounded-xl p-4"
              style={{ background: ADMIN_COLORS.purplePale, border: `1px solid ${ADMIN_COLORS.purple}33` }}
            >
              <p className="mb-2 text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
                Asignar técnicos a «{roles.find((r) => r.id === asignacionRolId)?.nombre}»
              </p>
              {tecnicos.length === 0 ? (
                <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                  No hay técnicos en la base de datos.{" "}
                  <Link href="/empresa/empleados" className="font-bold underline" style={{ color: ADMIN_COLORS.purple }}>
                    Ir a Empleados
                  </Link>
                </p>
              ) : (
                <div className="mb-3 flex flex-col gap-2">
                  {tecnicos.map((t) => (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                      style={{ color: ADMIN_COLORS.text }}
                    >
                      <input
                        type="checkbox"
                        checked={tecnicosSeleccionados.includes(t.id)}
                        onChange={() => toggleTecnico(t.id)}
                      />
                      {t.nombre} · {t.email}
                      {t.estado !== "Activo" && (
                        <span className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                          ({t.estado})
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAsignacionRolId(null)}
                  className="flex-1 rounded-xl py-2 text-sm font-bold"
                  style={{ border: `1px solid ${ADMIN_COLORS.slateD}`, color: ADMIN_COLORS.textMid }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={guardando || tecnicos.length === 0}
                  onClick={() => void guardarAsignacion()}
                  className="flex-[2] rounded-xl py-2 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: ADMIN_COLORS.purple }}
                >
                  {guardando ? "Guardando…" : "Guardar asignación"}
                </button>
              </div>
            </div>
          )}

          {cargando ? (
            <p className="mt-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
              Cargando roles…
            </p>
          ) : roles.length === 0 && empresaId ? (
            <p
              className="mt-4 rounded-xl px-3 py-3 text-xs font-semibold"
              style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textMid }}
            >
              Aún no hay roles personalizados. Crea el primero para especializar permisos de tus
              Técnicos.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${ADMIN_COLORS.slateD}` }}>
                    {["Rol", "Permisos activos", "Técnicos", "Estado", "Acciones"].map((h) => (
                      <th key={h} className="py-2 pr-3 text-xs font-extrabold" style={{ color: ADMIN_COLORS.textMid }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roles.map((rol) => {
                    const activos = MODULOS_PERMISO_ROL.filter((m) => rol.permisos[m]).length;
                    const asignados = tecnicos.filter((t) => t.rol_personalizado_id === rol.id).length;
                    return (
                      <tr key={rol.id} style={{ borderBottom: `1px solid ${ADMIN_COLORS.slateD}` }}>
                        <td className="py-3 pr-3">
                          <p className="font-semibold" style={{ color: ADMIN_COLORS.text }}>
                            {rol.nombre}
                          </p>
                          {rol.descripcion && (
                            <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                              {rol.descripcion}
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                          {activos} / {MODULOS_PERMISO_ROL.length}
                        </td>
                        <td className="py-3 pr-3 text-xs font-semibold" style={{ color: ADMIN_COLORS.purple }}>
                          {asignados}
                        </td>
                        <td className="py-3 pr-3">
                          <AdminBadge
                            label={rol.activo ? "Activo" : "Inactivo"}
                            tone={rol.activo ? "success" : "neutral"}
                          />
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2 text-xs font-bold">
                            <button type="button" style={{ color: ADMIN_COLORS.purple }} onClick={() => abrirEditar(rol)}>
                              Editar
                            </button>
                            <button type="button" style={{ color: ADMIN_COLORS.greenD }} onClick={() => abrirAsignacion(rol.id)}>
                              Asignar
                            </button>
                            <button type="button" style={{ color: ADMIN_COLORS.red }} onClick={() => void eliminarRol(rol.id)}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div
        className="rounded-2xl p-5"
        style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
      >
        <p className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
          Matriz de permisos por empleado
        </p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: ADMIN_COLORS.textMid }}>
          El Gerente activa o desactiva permisos de cada Técnico. Los permisos nunca superan
          el plan contratado.
        </p>
        <p
          className="mt-3 rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ background: ADMIN_COLORS.amberPale, color: ADMIN_COLORS.amberD }}
        >
          Matriz detallada fila a fila — pendiente de aprobación del propietario. No se inventan
          permisos en código hasta dicha aprobación.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${ADMIN_COLORS.slateD}` }}>
                <th className="py-3 pr-4 font-extrabold" style={{ color: ADMIN_COLORS.text }}>
                  Funcionalidad
                </th>
                <th className="py-3 font-extrabold" style={{ color: ADMIN_COLORS.textMid }}>
                  Técnicos (columnas al activar empleados)
                </th>
              </tr>
            </thead>
            <tbody>
              {MODULOS_PERMISO_ROL.map((mod) => (
                <tr key={mod} style={{ borderBottom: `1px solid ${ADMIN_COLORS.slateD}` }}>
                  <td className="py-3 pr-4 font-semibold" style={{ color: ADMIN_COLORS.text }}>
                    {mod}
                  </td>
                  <td className="py-3">
                    <span
                      className="inline-block rounded-lg px-3 py-1 text-xs font-bold"
                      style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.textLight }}
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

      <p className="text-xs" style={{ color: ADMIN_COLORS.textLight }}>
        Entrada alternativa: Módulo Empleados → «Editar permisos» (pendiente de implementación).
      </p>
    </div>
  );
}
