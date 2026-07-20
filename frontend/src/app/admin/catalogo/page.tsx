import { AdminShell } from "@/components/admin/AdminShell";
import { AdminServiceRoleNotice } from "@/components/admin/AdminUi";
import { AdminCatalogoView } from "@/components/admin/AdminCatalogoView";
import { fetchAdminCatalogo } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminCatalogoPage() {
  const result = await fetchAdminCatalogo();

  if ("error" in result) {
    return (
      <AdminShell titulo="Catálogo Maestro">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  const { productos, sectores, categorias, partidas } = result.data;
  const productoId = productos[0]?.id;

  if (!productoId) {
    return (
      <AdminShell titulo="Catálogo Maestro">
        <p className="text-sm" style={{ color: "#64748B" }}>
          No hay ningún producto registrado en <span className="font-mono">productos_master</span> —
          el Catálogo Maestro necesita al menos uno para crear categorías.
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell titulo="Catálogo Maestro">
      <AdminCatalogoView
        productoId={productoId}
        sectores={sectores}
        categoriasIniciales={categorias}
        partidasIniciales={partidas}
      />
    </AdminShell>
  );
}
