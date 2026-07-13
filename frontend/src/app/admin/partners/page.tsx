import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPartnersView } from "@/components/admin/AdminPartnersView";
import { listPartners, obtenerComisionesConfig } from "@/lib/ecosystem-store";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPartnersPage() {
  const admin = createAdminClient();
  let partners, comisionesConfig;
  try {
    partners = await listPartners(admin);
  } catch (e) {
    console.error("DIAG listPartners failed:", JSON.stringify(e), e);
    throw e;
  }
  try {
    comisionesConfig = await obtenerComisionesConfig(admin);
  } catch (e) {
    console.error("DIAG obtenerComisionesConfig failed:", JSON.stringify(e), e);
    throw e;
  }

  return (
    <AdminShell titulo="Partners">
      <AdminPartnersView initialPartners={partners} comisionesConfig={comisionesConfig} />
    </AdminShell>
  );
}
