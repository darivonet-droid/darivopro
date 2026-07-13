import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServiceRoleNotice } from "@/components/admin/AdminUi";
import { AdminSuscripcionesView } from "@/components/admin/AdminSuscripcionesView";
import { fetchAdminSuscripciones } from "@/lib/admin-queries";

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

  return (
    <AdminShell titulo="Gestión de Suscripciones">
      <AdminSuscripcionesView planesOficiales={planesOficiales} usuariosPorPlan={usuariosPorPlan} />
    </AdminShell>
  );
}
