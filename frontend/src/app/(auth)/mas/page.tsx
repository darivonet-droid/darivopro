import { PageHeader } from "@/components/ui/PageHeader";
import { MasTabs } from "@/components/mas/MasTabs";
import { createServerClient } from "@/lib/supabase/server";

export default async function MasPage() {
  const supabase = createServerClient();

  const [{ data: { user } }, { data: perfil }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("*").single(),
  ]);

  return (
    <div>
      <PageHeader
        titulo="Más"
        subtitulo="Categorías · Mis Tarifas · Empresa"
      />
      <main className="px-4 py-4">
        <MasTabs
          email={user?.email ?? ""}
          esBusiness={perfil?.plan_tipo === "business"}
          inicial={{
            razonSocial: perfil?.razon_social ?? "",
            ruc: perfil?.ruc ?? "",
            direccion: perfil?.direccion ?? "",
            telefono: perfil?.telefono ?? "",
            moneda: perfil?.moneda ?? "PEN",
            simbolo: perfil?.simbolo ?? "S/",
            ctaDetracciones: perfil?.cta_detracciones ?? "",
          }}
        />
      </main>
    </div>
  );
}
