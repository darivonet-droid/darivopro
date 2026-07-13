import { AdminShell } from "@/components/admin/AdminShell";
import { AdminEmpresasView } from "@/components/admin/AdminEmpresasView";
import { AdminServiceRoleNotice } from "@/components/admin/AdminUi";
import { fetchAdminEmpresas } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminEmpresasPage() {
  console.error("DIAG3 empresas page invoked", { hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL, hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY });
  const result = await fetchAdminEmpresas();
  console.error("DIAG3 fetchAdminEmpresas result", "error" in result ? { error: result.error } : { ok: true, count: result.data.length });

  if ("error" in result) {
    return (
      <AdminShell titulo="Empresas">
        <AdminServiceRoleNotice />
      </AdminShell>
    );
  }

  return (
    <AdminShell titulo="Empresas">
      <AdminEmpresasView empresas={result.data} />
    </AdminShell>
  );
}
