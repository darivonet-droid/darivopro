import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/design-system/MobileShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { Toast } from "@/components/ui/Toast";
import { UpgradeModal } from "@/components/plan/UpgradeModal";
import { PwaShell } from "@/components/pwa/PwaShell";
import { AvisoCobroBanner } from "@/components/plan/AvisoCobroBanner";
import { AvisoDispositivoBanner } from "@/components/dispositivo/AvisoDispositivoBanner";
import { createServerClient } from "@/lib/supabase/server";
import { obtenerContextoAcceso } from "@/lib/rol-empleado";
import { resolverRolDispositivo } from "@/lib/restriccion-dispositivo-server";

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

  // Rol Gerente/Técnico (Tarea 2, CLAUDE.md 17/07/2026) — un Técnico sin
  // Factura habilitada no ve esa pestaña en la barra inferior.
  const contexto = await obtenerContextoAcceso();
  const ocultarFacturas = contexto.rol === "tecnico" && !contexto.facturaHabilitada;
  const rolDispositivo = await resolverRolDispositivo(supabase, user);

  return (
    <MobileShell>
      <div className="min-h-screen pb-20">
        <PwaShell />
        <Toast />
        <UpgradeModal />
        {/* Mora de cobro (21/07/2026): aviso de gracia / solo lectura — el
            bloqueo real de escritura vive en RLS (es_cuenta_solo_lectura). */}
        <AvisoCobroBanner />
        {/* Aviso informativo por dispositivo (reversión 21/07/2026) — nunca
            bloquea, solo informa. Técnico/Móvil-independiente en ordenador. */}
        <AvisoDispositivoBanner rol={rolDispositivo} />
        {children}
        <BottomNav ocultarFacturas={ocultarFacturas} />
      </div>
    </MobileShell>
  );
}
