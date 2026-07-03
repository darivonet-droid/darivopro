import { AdminShell } from "@/components/admin/AdminShell";
import { ApisRegistroView } from "@/components/admin/ApisRegistroView";

export default function AdminApisPage() {
  return (
    <AdminShell titulo="Configuración de APIs">
      <ApisRegistroView />
    </AdminShell>
  );
}
