import { unstable_noStore as noStore } from "next/cache";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPartnersView } from "@/components/admin/AdminPartnersView";
import { listPartners, obtenerComisionesConfig } from "@/lib/ecosystem-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  noStore();
  const admin = createAdminClient();
  let partners, comisionesConfig;
  try {
    partners = await listPartners(admin);
  } catch (e) {
    const err = e as { message?: string; code?: string; details?: string; hint?: string; status?: number };
    console.error("DIAG listPartners failed:", {
      message: err?.message,
      code: err?.code,
      details: err?.details,
      hint: err?.hint,
      status: err?.status,
      keys: Object.keys(e as object),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyLen: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
      keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 12),
    });
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
