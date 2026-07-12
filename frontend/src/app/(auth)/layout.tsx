import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/design-system/MobileShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { Toast } from "@/components/ui/Toast";
import { UpgradeModal } from "@/components/plan/UpgradeModal";
import { PwaShell } from "@/components/pwa/PwaShell";
import { createServerClient } from "@/lib/supabase/server";

// manifest/appleWebApp: solo aquí y en onboarding/layout.tsx (Móvil) — el
// resto de la app (Admin, Empresa, landing) no debe ser instalable como PWA.
export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Darivo Pro",
  },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("onboarding_done")
    .single();

  if (!perfil?.onboarding_done) redirect("/onboarding/1");

  return (
    <MobileShell>
      <div className="min-h-screen pb-20">
        <PwaShell />
        <Toast />
        <UpgradeModal />
        {children}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
