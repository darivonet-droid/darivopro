import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServiceRoleNotice } from "@/components/admin/AdminUi";
import { AdminSoporteView } from "@/components/admin/AdminSoporteView";
import { fetchAdminSoporte } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminSoportePage() {
  const result = await fetchAdminSoporte();

  if ("error" in result) {
    return (
      <AdminShell titulo="Soporte">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  return (
    <AdminShell titulo="Soporte">
      <AdminSoporteView tickets={result.data} />
    </AdminShell>
  );
}
