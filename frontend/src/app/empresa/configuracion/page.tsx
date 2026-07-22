// DARIVO PRO EMPRESA — Configuración (07-MODULO-MAS-EMPRESA.md §5.7).
// Entrada directa del sidebar (posición 14) desde 22/07/2026 — movido desde
// /empresa/mas/perfil y ampliado con "Preferencias de IA" (antes ítem
// separado del panel "Más opciones", sin capa de escritorio propia) tras
// retirar la pantalla "Más" (Visión §16 excepción de navegación Empresa).
// Agrupa Perfil + Preferencias de IA + Preferencias generales, igual que el
// "Configuración" de Darivo Pro Admin (11-PANEL-ADMIN-CONFIGURACION.md):
// cuenta personal simple — no administra empresa, empleados, roles ni plan
// (esas viven en sus propias pantallas: Empresa, Empleados, Roles y
// Permisos, Mi Plan).
import Link from "next/link";
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { empresaModulo } from "@/lib/empresa-modules";
import { createServerClient } from "@/lib/supabase/server";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { LogoEmpresaUploader } from "@/components/perfil/LogoEmpresaUploader";

export default async function EmpresaConfiguracionPage() {
  const mod = empresaModulo("configuracion");
  const supabase = createServerClient();
  // logo_url se consulta aparte y tolerante a fallo: si la migración aún no
  // corrió en producción, esto no debe romper el resto de la pantalla.
  const [{ data: { user } }, { data: perfil }, { data: perfilLogo }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("razon_social, telefono").single(),
    supabase.from("perfiles").select("logo_url").single(),
  ]);

  return (
    <EmpresaShell titulo={mod.label}>
      <div className="flex max-w-xl flex-col gap-5">
        <div style={{ borderRadius: 16, padding: 20, background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
          <p style={{ fontSize: 13, fontWeight: 900, color: ADMIN_COLORS.text }}>Datos de acceso y cuenta</p>
          <div className="flex flex-col" style={{ marginTop: 12 }}>
            <Row label="Correo" valor={user?.email ?? "—"} />
            <Row label="Empresa" valor={perfil?.razon_social || "—"} />
            {perfil?.telefono && <Row label="Teléfono" valor={perfil.telefono} ultimo />}
          </div>
        </div>

        <div style={{ borderRadius: 16, padding: 20, background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
          <p style={{ fontSize: 13, fontWeight: 900, color: ADMIN_COLORS.text }}>Logo de empresa</p>
          <p style={{ marginTop: 2, marginBottom: 12, fontSize: 11, color: ADMIN_COLORS.textMid }}>
            Se muestra en el header de tus Cotizaciones y Facturas
          </p>
          <LogoEmpresaUploader
            logoUrl={perfilLogo?.logo_url ?? null}
            colores={{ text: ADMIN_COLORS.text, textMid: ADMIN_COLORS.textMid, accent: ADMIN_COLORS.purple, slateD: ADMIN_COLORS.slateD }}
          />
        </div>

        <div style={{ borderRadius: 16, padding: 20, background: ADMIN_COLORS.purplePale, border: `1px solid ${ADMIN_COLORS.purple}33` }}>
          <p style={{ fontSize: 13, fontWeight: 900, color: ADMIN_COLORS.text }}>Preferencias de IA</p>
          <p style={{ marginTop: 4, fontSize: 12, color: ADMIN_COLORS.text }}>
            El asistente se accede desde el módulo <strong>Darivo</strong> de la navegación principal. Cotizaciones por voz y texto usan OpenAI.
          </p>
          <Link href="/empresa/ia" className="mt-2 inline-block text-sm font-bold" style={{ color: ADMIN_COLORS.purple }}>
            Ir a Darivo →
          </Link>
        </div>

        <div style={{ borderRadius: 16, padding: 20, background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}>
          <p style={{ fontSize: 13, fontWeight: 900, color: ADMIN_COLORS.text }}>Preferencias generales</p>
          <p style={{ marginTop: 2, fontSize: 11, color: ADMIN_COLORS.textMid }}>Idioma, notificaciones y moneda</p>
          <div className="flex flex-col" style={{ marginTop: 12 }}>
            <Row label="Idioma" valor="Español (Perú)" />
            <Row label="Moneda por defecto" valor="PEN (S/)" />
            <Row label="Notificaciones" valor="Activadas" ultimo />
          </div>
          <p style={{ marginTop: 10, fontSize: 11, color: ADMIN_COLORS.textLight, textAlign: "center" }}>
            Edición persistente — integración Admin pendiente
          </p>
        </div>
      </div>
    </EmpresaShell>
  );
}

function Row({ label, valor, ultimo }: { label: string; valor: string; ultimo?: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: ultimo ? "none" : `1px solid ${ADMIN_COLORS.slateD}` }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: ADMIN_COLORS.textMid }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: ADMIN_COLORS.text }}>{valor}</span>
    </div>
  );
}
