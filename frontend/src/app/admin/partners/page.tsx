import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPartnersView } from "@/components/admin/AdminPartnersView";
import { listPartners, obtenerComisionesConfig } from "@/lib/ecosystem-store";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPartnersPage() {
  const admin = createAdminClient();
  const [partners, comisionesConfig] = await Promise.all([
    listPartners(admin),
    obtenerComisionesConfig(admin),
  ]);

  return (
    <AdminShell titulo="Partners">
      <AdminPartnersView initialPartners={partners} comisionesConfig={comisionesConfig} />
    </AdminShell>
  );
}
