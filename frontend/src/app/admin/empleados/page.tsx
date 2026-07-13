import { AdminShell } from "@/components/admin/AdminShell";
import { AdminEmpleadosInternosView } from "@/components/admin/AdminEmpleadosInternosView";
import { AdminServiceRoleNotice } from "@/components/admin/AdminUi";
import { fetchAdminEmpleadosInternos } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminEmpleadosPage() {
  const result = await fetchAdminEmpleadosInternos();

  if ("error" in result) {
    return (
      <AdminShell titulo="Empleados">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  return (
    <AdminShell titulo="Empleados">
      <AdminEmpleadosInternosView empleados={result.data} />
    </AdminShell>
  );
}
