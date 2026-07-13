import { unstable_noStore as noStore } from "next/cache";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPartnersView } from "@/components/admin/AdminPartnersView";
import { listPartners, obtenerComisionesConfig } from "@/lib/ecosystem-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  noStore();
  console.error("DIAG2 env check:", {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyLen: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    vercelEnv: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
  });
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
