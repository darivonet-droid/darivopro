import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServiceRoleNotice, AdminTable } from "@/components/admin/AdminUi";
import { fetchAdminCatalogo } from "@/lib/admin-queries";

export default async function AdminCatalogoPage() {
  const result = await fetchAdminCatalogo();

  if ("error" in result) {
    return (
      <AdminShell titulo="Catálogo Maestro">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  const { productos, categorias } = result.data;

  return (
    <AdminShell titulo="Catálogo Maestro">
      <p className="mb-4 text-sm" style={{ color: "#64748B" }}>
        Vista lectura — tablas `productos_master` y `categorias_servicios` (migración 015).
        CRUD completo Catálogo Maestro pendiente Doc 21 (DT-02-02).
      </p>
      <p className="mb-2 text-sm font-extrabold">Productos ecosistema</p>
      <AdminTable
        headers={["Slug", "Nombre", "Descripción"]}
        vacio="Sin productos"
        rows={productos.map((p) => [p.slug, p.nombre, p.descripcion ?? "—"])}
      />
      <p className="mb-2 mt-6 text-sm font-extrabold">Categorías de servicio</p>
      <AdminTable
        headers={["ID", "Nombre"]}
        vacio="Sin categorías"
        rows={categorias.map((c) => [c.cat_id, c.nombre])}
      />
    </AdminShell>
  );
}
