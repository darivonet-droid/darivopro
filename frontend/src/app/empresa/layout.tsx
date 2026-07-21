import { redirect } from "next/navigation";
import { requireProducto } from "@/lib/guards/require-producto";
import { createServerClient } from "@/lib/supabase/server";
import { AvisoCobroBanner } from "@/components/plan/AvisoCobroBanner";

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireProducto("empresa");

  const supabase = createServerClient();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("onboarding_done")
    .single();

  if (!perfil?.onboarding_done) redirect("/onboarding/1");

  const { data: empresa } = await supabase
    .from("empresas")
    .select("activo")
    .eq("gerente_user_id", user.id)
    .maybeSingle();

  if (empresa && !empresa.activo) redirect("/dashboard?acceso=empresa_suspendida");

  return (
    <>
      {/* Mora de cobro (21/07/2026): aviso de gracia / solo lectura — el
          bloqueo real de escritura vive en RLS (es_cuenta_solo_lectura). */}
      <AvisoCobroBanner />
      {children}
    </>
  );
}
