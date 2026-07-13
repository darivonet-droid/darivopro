import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServiceRoleNotice, AdminTable } from "@/components/admin/AdminUi";
import { fetchAdminSuscripciones } from "@/lib/admin-queries";
import { fmtPEN } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSuscripcionesPage() {
  const result = await fetchAdminSuscripciones();

  if ("error" in result) {
    return (
      <AdminShell titulo="Gestión de Suscripciones">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  const { planesOficiales, usuariosPorPlan } = result.data;
  const planes = Object.entries(planesOficiales) as [
    keyof typeof planesOficiales,
    (typeof planesOficiales)["basico"],
  ][];

  return (
    <AdminShell titulo="Gestión de Suscripciones">
      <p className="mb-4 text-sm" style={{ color: "#64748B" }}>
        Catálogo oficial v1 — fuente única `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6
      </p>
      <AdminTable
        headers={["Plan", "Precio mensual", "Precio anual", "Usuarios activos"]}
        rows={planes.map(([id, plan]) => [
          plan.nombre,
          fmtPEN(plan.mensual),
          id === "business" ? fmtPEN(plan.anual) : <em key="anual">Pendiente</em>,
          String(
            id === "basico"
              ? usuariosPorPlan.basico
              : id === "pro"
                ? usuariosPorPlan.pro
                : usuariosPorPlan.business
          ),
        ])}
      />
      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase" style={{ color: "#64748B" }}>
          Otros plan_tipo en perfiles
        </p>
        <p className="text-sm">
          Gratis: {usuariosPorPlan.gratis} · Business: {usuariosPorPlan.business}
        </p>
        <p className="mt-2 text-xs" style={{ color: "#94A3B8" }}>
          Cobros dLocal activos en Móvil — historial Admin pendiente tablas BD (DT-05-05).
        </p>
      </div>
    </AdminShell>
  );
}
