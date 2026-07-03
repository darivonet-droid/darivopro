import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPartnersView } from "@/components/admin/AdminPartnersView";
import { listPartners } from "@/lib/ecosystem-store";

export default async function AdminPartnersPage() {
  const partners = await listPartners();

  return (
    <AdminShell titulo="Partners">
      <AdminPartnersView initialPartners={partners} />
    </AdminShell>
  );
}
