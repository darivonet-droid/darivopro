// DARIVO PRO EMPRESA — Empresa, datos de la empresa (07-MODULO-MAS-EMPRESA.md
// §5.2). Entrada directa del sidebar (posición 9) desde 22/07/2026 — antes
// vivía como pestaña "Empresa" dentro de la pantalla "Más", ya retirada
// (Visión §16 excepción de navegación Empresa). Reutiliza el mismo
// componente que Móvil (AjustesForm) — misma lógica, solo cambia el
// contenedor de navegación.
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import { AjustesForm } from "@/components/ajustes/AjustesForm";

export default async function EmpresaDatosPage() {
  const mod = empresaModulo("empresa");
  const supabase = createServerClient();

  const [{ data: { user } }, { data: perfil }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("*").single(),
  ]);

  return (
    <EmpresaShell titulo={mod.label}>
      <div className="max-w-xl">
        <AjustesForm
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
      </div>
    </EmpresaShell>
  );
}
