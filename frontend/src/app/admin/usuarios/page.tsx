import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServiceRoleNotice } from "@/components/admin/AdminUi";
import { AdminUsuariosView } from "@/components/admin/AdminUsuariosView";
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

  return (
    <AdminShell titulo="Usuarios">
      <AdminUsuariosView usuarios={result.data} />
    </AdminShell>
  );
}
