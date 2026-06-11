// DARIVO PRO — Ajustes (Server Component)
import { PageHeader } from "@/components/ui/PageHeader";
import { AjustesForm } from "@/components/ajustes/AjustesForm";
import { createServerClient } from "@/lib/supabase/server";

export default async function AjustesPage() {
  const supabase = createServerClient();
  const [{ data: { user } }, { data: perfil }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("*").single(),
  ]);

  return (
    <div>
      <PageHeader titulo="Ajustes" subtitulo="Tu empresa y tu cuenta" />
      <main className="px-4 py-4">
        <AjustesForm
          email={user?.email ?? ""}
          inicial={{
            razonSocial: perfil?.razon_social ?? "",
            ruc: perfil?.ruc ?? "",
            direccion: perfil?.direccion ?? "",
            telefono: perfil?.telefono ?? "",
            moneda: perfil?.moneda ?? "PEN",
            simbolo: perfil?.simbolo ?? "S/",
          }}
        />
      </main>
    </div>
  );
}
