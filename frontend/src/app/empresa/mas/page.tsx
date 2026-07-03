import Link from "next/link";
import { MasTabs } from "@/components/mas/MasTabs";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/design-system/tokens";

export default async function EmpresaMasPage() {
  const mod = empresaModulo("mas");
  const supabase = createServerClient();

  const [{ data: { user } }, { data: perfil }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("*").single(),
  ]);

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: T.textMid }}>
        Categorías · Mis Tarifas · Empresa — reutiliza flujo Móvil
      </p>
      <MasTabs
        email={user?.email ?? ""}
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
      <Link
        href="/empresa/mas/soporte"
        className="mt-4 inline-block text-sm font-bold"
        style={{ color: T.blue }}
      >
        Soporte — crear y consultar tickets →
      </Link>
      <Link
        href="/mas"
        className="mt-2 inline-block text-sm font-bold"
        style={{ color: T.textLight }}
      >
        Abrir Más completo en Móvil →
      </Link>
    </EmpresaShell>
  );
}
