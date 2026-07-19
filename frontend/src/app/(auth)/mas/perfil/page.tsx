import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";
import { LogoEmpresaUploader } from "@/components/perfil/LogoEmpresaUploader";

export default async function PerfilPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("razon_social, telefono")
    .single();
  // Consulta aparte y tolerante a fallo: si la migración de logo_url aún no
  // corrió en producción, esto no debe romper el resto de la pantalla.
  const { data: perfilLogo } = await supabase
    .from("perfiles")
    .select("logo_url")
    .single();

  return (
    <div>
      <PageHeader titulo="Perfil" subtitulo="Datos de acceso y cuenta personal" />
      <main className="px-4 py-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
        >
          <p className="text-xs font-bold uppercase" style={{ color: T.textMid }}>
            Correo
          </p>
          <p className="mt-1 text-sm font-bold" style={{ color: T.text }}>
            {user?.email}
          </p>
          <p className="mt-4 text-xs font-bold uppercase" style={{ color: T.textMid }}>
            Empresa
          </p>
          <p className="mt-1 text-sm font-bold" style={{ color: T.text }}>
            {perfil?.razon_social || "—"}
          </p>
          {perfil?.telefono && (
            <>
              <p className="mt-4 text-xs font-bold uppercase" style={{ color: T.textMid }}>
                Teléfono
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: T.text }}>
                {perfil.telefono}
              </p>
            </>
          )}
        </div>

        <div
          className="mt-4 rounded-2xl p-5"
          style={{ background: T.white, border: `1.5px solid ${T.slateD}` }}
        >
          <p className="mb-3 text-xs font-bold uppercase" style={{ color: T.textMid }}>
            Logo de empresa
          </p>
          <LogoEmpresaUploader
            logoUrl={perfilLogo?.logo_url ?? null}
            colores={{ text: T.text, textMid: T.textMid, accent: T.blue, slateD: T.slateD }}
          />
        </div>

        <Link href="/mas" className="mt-6 block text-center text-sm font-bold" style={{ color: T.blue }}>
          ← Volver a Más
        </Link>
      </main>
    </div>
  );
}
