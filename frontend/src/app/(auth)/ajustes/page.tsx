// DARIVO PRO — Configuración (Server Component)
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfigTabs } from "@/components/ajustes/ConfigTabs";
import { createServerClient } from "@/lib/supabase/server";

export default async function ConfiguracionPage() {
  const supabase = createServerClient();

  const [
    { data: { user } },
    { data: perfil },
    { data: tarifas },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("*").single(),
    supabase.from("precios_usuario").select("svc_id, precio").order("svc_id"),
  ]);

  return (
    <div>
      <PageHeader titulo="Configuración" subtitulo="Empresa, tarifas y categorías" />
      <main className="px-4 py-4">
        <ConfigTabs
          email={user?.email ?? ""}
          inicial={{
            razonSocial:      perfil?.razon_social      ?? "",
            ruc:              perfil?.ruc               ?? "",
            direccion:        perfil?.direccion         ?? "",
            telefono:         perfil?.telefono          ?? "",
            moneda:           perfil?.moneda            ?? "PEN",
            simbolo:          perfil?.simbolo           ?? "S/",
            ctaDetracciones:  perfil?.cta_detracciones ?? "",
          }}
          tarifas={tarifas ?? []}
        />
      </main>
    </div>
  );
}
