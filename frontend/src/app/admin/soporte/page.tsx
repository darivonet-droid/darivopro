import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSoporteView } from "@/components/admin/AdminSoporteView";

export default function AdminSoportePage() {
  return (
    <AdminShell titulo="Soporte">
      <AdminSoporteView />
    </AdminShell>
  );
}
