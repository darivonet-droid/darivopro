import { PartnerPanel } from "@/components/partner/PartnerPanel";
import { getPartnerByEmail, obtenerComisionesConfig } from "@/lib/ecosystem-store";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/design-system/tokens";

export default async function PartnerPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("razon_social, telefono")
    .single();

  const email = user?.email ?? "";
  const [partner, comisionesConfig] = await Promise.all([
    email ? getPartnerByEmail(email, supabase) : Promise.resolve(null),
    obtenerComisionesConfig(supabase),
  ]);

  const nombre =
    perfil?.razon_social ?? user?.user_metadata?.nombre_empresa ?? email.split("@")[0] ?? "Partner";

  return (
    <div className="min-h-screen p-6" style={{ background: T.slate }}>
      <PartnerPanel
        nombre={nombre}
        email={email}
        telefono={perfil?.telefono ?? undefined}
        partner={partner}
        comisionesConfig={comisionesConfig}
      />
    </div>
  );
}
