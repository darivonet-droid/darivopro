// DARIVO PRO — Layout de onboarding (sin BottomNav)
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";

// manifest/appleWebApp: onboarding es parte del flujo de Móvil (previo al
// dashboard) — mismo criterio que (auth)/layout.tsx, ver ese archivo.
export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Darivo Pro",
  },
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sin sesión → login
  if (!user) redirect("/login");

  // Ya completó onboarding → dashboard
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("onboarding_done")
    .single();

  if (perfil?.onboarding_done) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">

      {/* Header navy */}
      <header style={{ background: T.navy }}>
        <div className="flex h-[56px] items-center justify-center gap-2.5 px-5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: T.blue }}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight" style={{ color: T.white }}>
            DARIVO <span style={{ color: T.blueL }}>PRO</span>
          </span>
        </div>
      </header>

      {/* Contenido */}
      <main
        className="flex flex-1 flex-col items-center px-5 py-6 pb-10"
        style={{ background: "#F8FAFF" }}
      >
        <div className="w-full" style={{ maxWidth: 390 }}>
          {children}
        </div>
      </main>

    </div>
  );
}
