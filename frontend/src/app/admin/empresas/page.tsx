import { AdminShell } from "@/components/admin/AdminShell";
import { AdminEmpresasView } from "@/components/admin/AdminEmpresasView";
import { AdminServiceRoleNotice } from "@/components/admin/AdminUi";
import { fetchAdminUsuarios } from "@/lib/admin-queries";

export default async function AdminEmpresasPage() {
  const result = await fetchAdminUsuarios();

  if ("error" in result) {
    return (
      <AdminShell titulo="Empresas">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  return (
    <AdminShell titulo="Empresas">
      <AdminEmpresasView perfiles={result.data} />
    </AdminShell>
  );
}
