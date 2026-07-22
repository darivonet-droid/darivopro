import { AdminShell } from "@/components/admin/AdminShell";
import { AdminRolesView } from "@/components/admin/AdminRolesView";

export const dynamic = "force-dynamic";

export default function AdminRolesPage() {
  return (
    <AdminShell titulo="Roles y Permisos">
      <AdminRolesView />
    </AdminShell>
  );
}
