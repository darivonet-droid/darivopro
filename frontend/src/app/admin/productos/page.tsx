import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProductosView } from "@/components/admin/AdminProductosView";
import { fetchAdminProductos } from "@/lib/admin-queries";

export default async function AdminProductosPage() {
  const res = await fetchAdminProductos();

  return (
    <AdminShell titulo="Edición de Productos">
      <AdminProductosView
        productos={"data" in res ? res.data : []}
        error={"error" in res ? res.error : null}
      />
    </AdminShell>
  );
}
