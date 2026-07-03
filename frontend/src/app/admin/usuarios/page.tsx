import { AdminShell } from "@/components/admin/AdminShell";
import { AdminKpiCard, AdminServiceRoleNotice, AdminTable } from "@/components/admin/AdminUi";
import { fetchAdminUsuarios } from "@/lib/admin-queries";

export default async function AdminUsuariosPage() {
  const result = await fetchAdminUsuarios();

  if ("error" in result) {
    return (
      <AdminShell titulo="Usuarios">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  const rows = result.data;
  const activos = rows.filter((u) => u.onboarding_done).length;
  const pendientes = rows.length - activos;

  return (
    <AdminShell titulo="Usuarios">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminKpiCard label="Total usuarios" value={rows.length} />
        <AdminKpiCard label="Onboarding completado" value={activos} />
        <AdminKpiCard label="Onboarding pendiente" value={pendientes} />
        <AdminKpiCard label="Suspendidos" value="—" hint="Gestión pendiente BD" />
      </div>
      <AdminTable
        headers={["Correo", "Razón social", "Plan", "Onboarding", "Registro"]}
        vacio="Sin usuarios en perfiles"
        rows={rows.map((u) => [
          u.email || "—",
          u.razon_social || "—",
          u.plan_tipo ?? "gratis",
          u.onboarding_done ? "Completado" : "Pendiente",
          new Date(u.created_at).toLocaleDateString("es-PE"),
        ])}
      />
    </AdminShell>
  );
}
