"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminTabs";
import { AdminErrorBanner, AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { descargarCsv } from "@/lib/csv-export";
import { ImportarCsvBoton } from "@/components/admin/ImportarCsvBoton";
import type { AdminPerfilRow } from "@/lib/admin-queries";
import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import {
  bloquearUsuarioAction,
  cambiarPlanUsuarioAction,
  desbloquearUsuarioAction,
  invitarUsuarioAction,
  reenviarInvitacionAction,
  restablecerAccesoAction,
} from "@/app/admin/usuarios/actions";

const PLANES_SELECCIONABLES: PlanTipoPersistido[] = ["gratis", "basico", "pro", "business"];
const FILTROS_VACIOS = { plan: "todos", estado: "todos" as "todos" | "activo" | "bloqueado", metodo: "todos" };

function labelPlan(plan: string | null): string {
  if (plan === "basico") return PRECIOS_OFICIALES.basico.nombre;
  if (plan === "pro") return PRECIOS_OFICIALES.pro.nombre;
  if (plan === "business") return PRECIOS_OFICIALES.business.nombre;
  return "GRATIS";
}

function estaBloqueado(bannedUntil?: string | null): boolean {
  if (!bannedUntil) return false;
  return new Date(bannedUntil).getTime() > Date.now();
}

function AccionBoton({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: "danger" | "success" | "purple" | "amber";
  disabled?: boolean;
  onClick: () => void;
}) {
  const bg = {
    danger: ADMIN_COLORS.redPale,
    success: ADMIN_COLORS.greenPale,
    purple: ADMIN_COLORS.purplePale,
    amber: ADMIN_COLORS.amberPale,
  }[tone];
  const color = {
    danger: ADMIN_COLORS.red,
    success: ADMIN_COLORS.greenD,
    purple: ADMIN_COLORS.purple,
    amber: ADMIN_COLORS.amberD,
  }[tone];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:opacity-50"
      style={{ background: bg, color }}
    >
      {label}
    </button>
  );
}

interface AdminUsuariosViewProps {
  usuarios: AdminPerfilRow[];
}

/**
 * "Enviar invitación masiva" (03-PANEL-ADMIN-USUARIOS.md §5 Acciones rápidas):
 * lista de correos pegada a mano (uno por línea, o separados por coma/;) —
 * cada correo invita vía la misma Server Action que el import CSV. Secuencial
 * a propósito (cada correo dispara un email real de Supabase Auth).
 */
function InvitacionMasiva({ onTerminado }: { onTerminado: (ok: number, errores: string[]) => void }) {
  const [texto, setTexto] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [resumen, setResumen] = useState<string | null>(null);

  async function enviar() {
    const correos = Array.from(
      new Set(
        texto
          .split(/[\s,;]+/)
          .map((c) => c.trim())
          .filter((c) => c.includes("@"))
      )
    );
    if (correos.length === 0) {
      setResumen("Pega al menos un correo válido.");
      return;
    }
    setProcesando(true);
    setResumen(null);
    let ok = 0;
    const errores: string[] = [];
    for (const correo of correos) {
      setResumen(`Enviando… (${ok + errores.length + 1} de ${correos.length})`);
      const r = await invitarUsuarioAction(correo);
      if (r.ok) ok++;
      else errores.push(`${correo}: ${r.error}`);
    }
    setProcesando(false);
    setResumen(`${ok} de ${correos.length} invitaciones enviadas${errores.length ? ` — ${errores.length} con error` : ""}`);
    if (ok > 0 || errores.length > 0) onTerminado(ok, errores);
    if (ok > 0) setTexto("");
  }

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
        Enviar invitación masiva
      </p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={"Un correo por línea (o separados por coma)"}
        rows={4}
        className="w-full rounded-xl border px-3 py-2 text-sm"
        style={{ borderColor: ADMIN_COLORS.slateD }}
      />
      <button
        type="button"
        disabled={procesando}
        onClick={enviar}
        className="mt-2 w-full rounded-lg px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
        style={{ background: ADMIN_COLORS.purple }}
      >
        {procesando ? "Enviando…" : "Enviar invitaciones"}
      </button>
      {resumen && (
        <p className="mt-2 text-xs font-semibold" style={{ color: ADMIN_COLORS.textMid }}>
          {resumen}
        </p>
      )}
    </div>
  );
}

export function AdminUsuariosView({ usuarios: usuariosIniciales }: AdminUsuariosViewProps) {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [mostrarLote, setMostrarLote] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const metodos = useMemo(
    () => Array.from(new Set(usuarios.map((u) => u.metodoAcceso).filter(Boolean))) as string[],
    [usuarios]
  );

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (q && !(u.email ?? "").toLowerCase().includes(q) && !(u.razon_social ?? "").toLowerCase().includes(q)) {
        return false;
      }
      if (filtros.plan !== "todos" && (u.plan_tipo ?? "gratis") !== filtros.plan) return false;
      const bloqueado = estaBloqueado(u.bannedUntil);
      if (filtros.estado === "activo" && bloqueado) return false;
      if (filtros.estado === "bloqueado" && !bloqueado) return false;
      if (filtros.metodo !== "todos" && (u.metodoAcceso ?? "") !== filtros.metodo) return false;
      return true;
    });
  }, [usuarios, buscar, filtros]);

  const hayFiltrosActivos =
    buscar !== "" || filtros.plan !== "todos" || filtros.estado !== "todos" || filtros.metodo !== "todos";

  const limpiarFiltros = () => {
    setBuscar("");
    setFiltros(FILTROS_VACIOS);
  };

  const activos = usuarios.filter((u) => !estaBloqueado(u.bannedUntil)).length;
  const bloqueados = usuarios.length - activos;
  const onboardingPendiente = usuarios.filter((u) => !u.onboarding_done).length;

  const seleccionado = selectedId ? usuarios.find((u) => u.id === selectedId) ?? null : null;
  const filaActivaIndex = selectedId ? filtrados.findIndex((u) => u.id === selectedId) : undefined;

  const conAccion = (fn: () => Promise<{ ok: boolean; error?: string }>, exito: string) => {
    setError(null);
    setMensaje(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "No se pudo completar la acción");
      } else {
        setMensaje(exito);
      }
    });
  };

  const bloquear = (u: AdminPerfilRow) =>
    conAccion(async () => {
      const r = await bloquearUsuarioAction(u.id);
      if (r.ok) setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, bannedUntil: "2200-01-01T00:00:00Z" } : x)));
      return r;
    }, `${u.email} bloqueado`);

  const desbloquear = (u: AdminPerfilRow) =>
    conAccion(async () => {
      const r = await desbloquearUsuarioAction(u.id);
      if (r.ok) setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, bannedUntil: null } : x)));
      return r;
    }, `${u.email} desbloqueado`);

  const cambiarPlan = (u: AdminPerfilRow, plan: PlanTipoPersistido) =>
    conAccion(async () => {
      const r = await cambiarPlanUsuarioAction(u.id, plan);
      if (r.ok) setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, plan_tipo: plan } : x)));
      return r;
    }, `Plan de ${u.email} actualizado`);

  const reenviarInvitacion = (u: AdminPerfilRow) =>
    conAccion(() => reenviarInvitacionAction(u.email ?? ""), `Invitación reenviada a ${u.email}`);

  const restablecerAcceso = (u: AdminPerfilRow) =>
    conAccion(() => restablecerAccesoAction(u.email ?? ""), `Correo de restablecimiento enviado a ${u.email}`);

  return (
    <div>
      {error && <AdminErrorBanner mensaje={error} />}
      {mensaje && !error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: ADMIN_COLORS.greenPale, color: ADMIN_COLORS.greenD }}>
          ✓ {mensaje}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminKpiCard label="Total usuarios" value={usuarios.length} />
        <AdminKpiCard label="Activos" value={activos} />
        <AdminKpiCard label="Bloqueados" value={bloqueados} />
        <AdminKpiCard label="Onboarding pendiente" value={onboardingPendiente} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Buscar por correo o razón social…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="min-w-[220px] flex-1 rounded-xl border px-4 py-2.5 text-sm"
          style={{ borderColor: ADMIN_COLORS.slateD }}
        />
        <select
          value={filtros.plan}
          onChange={(e) => setFiltros((f) => ({ ...f, plan: e.target.value }))}
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: ADMIN_COLORS.slateD }}
        >
          <option value="todos">Todos los planes</option>
          {PLANES_SELECCIONABLES.map((p) => (
            <option key={p} value={p}>{labelPlan(p)}</option>
          ))}
        </select>
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value as typeof f.estado }))}
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: ADMIN_COLORS.slateD }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
        <select
          value={filtros.metodo}
          onChange={(e) => setFiltros((f) => ({ ...f, metodo: e.target.value }))}
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: ADMIN_COLORS.slateD }}
        >
          <option value="todos">Todos los métodos</option>
          {metodos.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-xs font-bold"
            style={{ color: ADMIN_COLORS.purple }}
          >
            Limpiar filtros
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            descargarCsv("usuarios.csv", [
              ["email", "razon_social", "telefono", "plan", "estado", "metodo_acceso", "onboarding", "registro", "ultimo_acceso"],
              ...filtrados.map((u) => [
                u.email ?? "",
                u.razon_social ?? "",
                u.telefono ?? "",
                labelPlan(u.plan_tipo),
                estaBloqueado(u.bannedUntil) ? "Bloqueado" : "Activo",
                u.metodoAcceso ?? "email",
                u.onboarding_done ? "Completado" : "Pendiente",
                u.created_at,
                u.lastSignInAt ?? "",
              ]),
            ])
          }
          className="rounded-xl px-3 py-2.5 text-sm font-bold"
          style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
        >
          Exportar
        </button>
        <button
          type="button"
          onClick={() => setMostrarLote((v) => !v)}
          className="rounded-xl px-3 py-2.5 text-sm font-bold"
          style={{ background: mostrarLote ? ADMIN_COLORS.purplePale : ADMIN_COLORS.slate, color: mostrarLote ? ADMIN_COLORS.purple : ADMIN_COLORS.text }}
        >
          Importar / Invitación masiva
        </button>
      </div>

      {mostrarLote && (
        <div
          className="mb-4 grid gap-4 rounded-2xl p-4 md:grid-cols-2"
          style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
        >
          <div>
            <p className="mb-2 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
              Importar usuarios (CSV)
            </p>
            <ImportarCsvBoton
              label="Elegir archivo CSV…"
              columnas={["email"]}
              notaExtra="Cada fila invita al usuario por correo real (queda en plan Gratis, como un registro normal). Falla si el correo ya tiene cuenta confirmada."
              procesarFila={async (f) => {
                if (!f.email) return { ok: false, error: "Columna email vacía" };
                return invitarUsuarioAction(f.email);
              }}
              onTerminado={(r) => {
                if (r.ok > 0) {
                  setMensaje(`${r.ok} invitación(es) enviada(s)`);
                  router.refresh();
                }
              }}
            />
            <button
              type="button"
              onClick={() => descargarCsv("plantilla-usuarios.csv", [["email"], [""]])}
              className="mt-2 text-xs font-bold"
              style={{ color: ADMIN_COLORS.purple }}
            >
              Descargar plantilla (CSV)
            </button>
          </div>
          <InvitacionMasiva
            onTerminado={(ok, errores) => {
              if (ok > 0) {
                setMensaje(`${ok} invitación(es) enviada(s)`);
                router.refresh();
              }
              if (errores.length > 0) setError(errores[0]);
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <AdminTable
            headers={["Usuario", "Contacto", "Plan", "Estado", "Último acceso", "Registro", "Acciones"]}
            vacio="Sin usuarios registrados"
            onRowClick={(i) => setSelectedId(filtrados[i].id)}
            filaActivaIndex={filaActivaIndex}
            rows={filtrados.map((u) => {
              const bloqueado = estaBloqueado(u.bannedUntil);
              return [
                <div key="u">
                  <p className="font-semibold" style={{ color: ADMIN_COLORS.text }}>{u.email || "—"}</p>
                  {u.razon_social && <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>{u.razon_social}</p>}
                </div>,
                <span key="c" className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
                  {u.telefono || "—"} · {u.metodoAcceso ?? "email"}
                </span>,
                <select
                  key="plan"
                  value={u.plan_tipo ?? "gratis"}
                  disabled={isPending}
                  onClick={(ev) => ev.stopPropagation()}
                  onChange={(ev) => cambiarPlan(u, ev.target.value as PlanTipoPersistido)}
                  className="rounded-lg border px-2 py-1 text-xs font-bold"
                  style={{ borderColor: ADMIN_COLORS.slateD }}
                >
                  {PLANES_SELECCIONABLES.map((p) => (
                    <option key={p} value={p}>{labelPlan(p)}</option>
                  ))}
                </select>,
                bloqueado
                  ? <AdminBadge key="e" label="Bloqueado" tone="danger" />
                  : <AdminBadge key="e" label="Activo" tone="success" />,
                u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString("es-PE") : "Nunca",
                new Date(u.created_at).toLocaleDateString("es-PE"),
                <div key="acciones" className="flex flex-wrap gap-1.5" onClick={(ev) => ev.stopPropagation()}>
                  <AccionBoton
                    label={bloqueado ? "Desbloquear" : "Bloquear"}
                    tone={bloqueado ? "success" : "danger"}
                    disabled={isPending}
                    onClick={() => (bloqueado ? desbloquear(u) : bloquear(u))}
                  />
                </div>,
              ];
            })}
          />
          <p className="mt-3 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
            Fuente: <span className="font-mono">auth.users</span> (Supabase Auth) +{" "}
            <span className="font-mono">perfiles</span> — bloqueo vía{" "}
            <span className="font-mono">banned_until</span>, plan vía{" "}
            <span className="font-mono">perfiles.plan_tipo</span>. Exportar (CSV), Importar (CSV) e
            invitación masiva están en la barra de herramientas.
          </p>
        </div>

        {seleccionado && (
          <div
            className="w-[360px] shrink-0 rounded-2xl p-4"
            style={{ background: ADMIN_COLORS.slate, border: `1px solid ${ADMIN_COLORS.slateD}`, maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mb-3 text-sm font-bold"
              style={{ color: ADMIN_COLORS.purple }}
            >
              ← Usuarios
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-black text-white"
                style={{ background: ADMIN_COLORS.purple }}
              >
                {(seleccionado.email || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black" style={{ color: ADMIN_COLORS.text }}>
                  {seleccionado.email || "—"}
                </p>
                {estaBloqueado(seleccionado.bannedUntil) ? (
                  <AdminBadge label="Bloqueado" tone="danger" />
                ) : (
                  <AdminBadge label="Activo" tone="success" />
                )}
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-2 text-xs" style={{ color: ADMIN_COLORS.textMid }}>
              <p><strong style={{ color: ADMIN_COLORS.text }}>Razón social:</strong> {seleccionado.razon_social || "—"}</p>
              <p><strong style={{ color: ADMIN_COLORS.text }}>RUC:</strong> {seleccionado.ruc || "—"}</p>
              <p><strong style={{ color: ADMIN_COLORS.text }}>Teléfono:</strong> {seleccionado.telefono || "—"}</p>
              <p><strong style={{ color: ADMIN_COLORS.text }}>Plan:</strong> {labelPlan(seleccionado.plan_tipo)}</p>
              <p><strong style={{ color: ADMIN_COLORS.text }}>Método de acceso:</strong> {seleccionado.metodoAcceso ?? "email"}</p>
              <p><strong style={{ color: ADMIN_COLORS.text }}>Onboarding:</strong> {seleccionado.onboarding_done ? "Completado" : "Pendiente"}</p>
              <p><strong style={{ color: ADMIN_COLORS.text }}>Registro:</strong> {new Date(seleccionado.created_at).toLocaleDateString("es-PE")}</p>
              <p><strong style={{ color: ADMIN_COLORS.text }}>Último acceso:</strong> {seleccionado.lastSignInAt ? new Date(seleccionado.lastSignInAt).toLocaleDateString("es-PE") : "Nunca"}</p>
            </div>

            <p className="mb-2 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
              Acciones de administración
            </p>
            <div className="flex flex-col gap-2">
              <AccionBoton
                label={estaBloqueado(seleccionado.bannedUntil) ? "Desbloquear usuario" : "Bloquear usuario"}
                tone={estaBloqueado(seleccionado.bannedUntil) ? "success" : "danger"}
                disabled={isPending}
                onClick={() => (estaBloqueado(seleccionado.bannedUntil) ? desbloquear(seleccionado) : bloquear(seleccionado))}
              />
              <AccionBoton
                label="Reenviar invitación"
                tone="purple"
                disabled={isPending}
                onClick={() => reenviarInvitacion(seleccionado)}
              />
              <AccionBoton
                label="Restablecer acceso"
                tone="amber"
                disabled={isPending}
                onClick={() => restablecerAcceso(seleccionado)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
