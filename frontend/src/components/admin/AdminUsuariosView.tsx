"use client";

import { useMemo, useState, useTransition } from "react";
import { AdminBadge } from "@/components/admin/AdminTabs";
import { AdminErrorBanner, AdminKpiCard, AdminTable } from "@/components/admin/AdminUi";
import { T } from "@/lib/design-system/tokens";
import type { AdminPerfilRow } from "@/lib/admin-queries";
import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import {
  bloquearUsuarioAction,
  cambiarPlanUsuarioAction,
  desbloquearUsuarioAction,
  reenviarInvitacionAction,
  restablecerAccesoAction,
} from "@/app/admin/usuarios/actions";

const PLANES_SELECCIONABLES: PlanTipoPersistido[] = ["gratis", "basico", "pro", "business"];

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

interface AdminUsuariosViewProps {
  usuarios: AdminPerfilRow[];
}

export function AdminUsuariosView({ usuarios: usuariosIniciales }: AdminUsuariosViewProps) {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [buscar, setBuscar] = useState("");
  const [filtroPlan, setFiltroPlan] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activo" | "bloqueado">("todos");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (q && !(u.email ?? "").toLowerCase().includes(q) && !(u.razon_social ?? "").toLowerCase().includes(q)) {
        return false;
      }
      if (filtroPlan !== "todos" && (u.plan_tipo ?? "gratis") !== filtroPlan) return false;
      const bloqueado = estaBloqueado(u.bannedUntil);
      if (filtroEstado === "activo" && bloqueado) return false;
      if (filtroEstado === "bloqueado" && !bloqueado) return false;
      return true;
    });
  }, [usuarios, buscar, filtroPlan, filtroEstado]);

  const activos = usuarios.filter((u) => !estaBloqueado(u.bannedUntil)).length;
  const bloqueados = usuarios.length - activos;
  const onboardingPendiente = usuarios.filter((u) => !u.onboarding_done).length;

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
        <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: T.greenPale, color: T.greenD }}>
          ✓ {mensaje}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminKpiCard label="Total usuarios" value={usuarios.length} />
        <AdminKpiCard label="Activos" value={activos} />
        <AdminKpiCard label="Bloqueados" value={bloqueados} />
        <AdminKpiCard label="Onboarding pendiente" value={onboardingPendiente} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar por correo o razón social…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="min-w-[220px] flex-1 rounded-xl border px-4 py-2.5 text-sm"
          style={{ borderColor: T.slateD }}
        />
        <select
          value={filtroPlan}
          onChange={(e) => setFiltroPlan(e.target.value)}
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: T.slateD }}
        >
          <option value="todos">Todos los planes</option>
          {PLANES_SELECCIONABLES.map((p) => (
            <option key={p} value={p}>{labelPlan(p)}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: T.slateD }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
      </div>

      <AdminTable
        headers={["Usuario", "Plan", "Estado", "Onboarding", "Registro", "Acciones"]}
        vacio="Sin usuarios registrados"
        rows={filtrados.map((u) => {
          const bloqueado = estaBloqueado(u.bannedUntil);
          return [
            <div key="u">
              <p className="font-semibold" style={{ color: T.text }}>{u.email || "—"}</p>
              {u.razon_social && <p className="text-xs" style={{ color: T.textMid }}>{u.razon_social}</p>}
            </div>,
            <select
              key="plan"
              value={u.plan_tipo ?? "gratis"}
              disabled={isPending}
              onChange={(ev) => cambiarPlan(u, ev.target.value as PlanTipoPersistido)}
              className="rounded-lg border px-2 py-1 text-xs font-bold"
              style={{ borderColor: T.slateD }}
            >
              {PLANES_SELECCIONABLES.map((p) => (
                <option key={p} value={p}>{labelPlan(p)}</option>
              ))}
            </select>,
            bloqueado
              ? <AdminBadge key="e" label="Bloqueado" tone="danger" />
              : <AdminBadge key="e" label="Activo" tone="success" />,
            u.onboarding_done ? "Completado" : "Pendiente",
            new Date(u.created_at).toLocaleDateString("es-PE"),
            <div key="acciones" className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => (bloqueado ? desbloquear(u) : bloquear(u))}
                className="text-xs font-bold"
                style={{ color: bloqueado ? T.greenD : T.red }}
              >
                {bloqueado ? "Desbloquear" : "Bloquear"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => reenviarInvitacion(u)}
                className="text-xs font-bold"
                style={{ color: T.blue }}
              >
                Reenviar invitación
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => restablecerAcceso(u)}
                className="text-xs font-bold"
                style={{ color: T.amberD }}
              >
                Restablecer acceso
              </button>
            </div>,
          ];
        })}
      />
      <p className="mt-3 text-xs" style={{ color: T.textLight }}>
        Fuente: <span className="font-mono">auth.users</span> (Supabase Auth) +{" "}
        <span className="font-mono">perfiles</span> — bloqueo vía{" "}
        <span className="font-mono">banned_until</span>, plan vía{" "}
        <span className="font-mono">perfiles.plan_tipo</span> (03-PANEL-ADMIN-USUARIOS.md §5).
        Importar/exportar Excel-CSV e invitación masiva no están construidos todavía.
      </p>
    </div>
  );
}
