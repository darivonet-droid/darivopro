import { MasTabs } from "@/components/mas/MasTabs";
import { MasOpcionesList } from "@/components/mas/MasOpcionesList";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

export default async function EmpresaMasPage() {
  const mod = empresaModulo("mas");
  const supabase = createServerClient();

  const [{ data: { user } }, { data: perfil }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("*").single(),
  ]);

  return (
    <EmpresaShell titulo={mod.label}>
      <p className="mb-4 text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Categorías · Mis Tarifas · Empresa — reutiliza flujo Móvil
      </p>
      {/* Layout 2 columnas (07-MODULO-MAS-EMPRESA.md §4): contenido + panel
          fijo "Más opciones" (~320px), en vez de apilado en una columna. */}
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
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
            ocultarOpciones
          />
        </div>
        <div className="w-[320px] shrink-0" style={{ position: "sticky", top: 20 }}>
          <MasOpcionesList esEmpresa />
        </div>
      </div>
    </EmpresaShell>
  );
}
