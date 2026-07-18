// DARIVO PRO EMPRESA — Perfil del usuario (Tarea 5e, CLAUDE.md 17/07/2026)
// Mismos datos que Móvil (perfiles.razon_social/telefono, /mas/perfil/page.tsx) +
// "Preferencias generales" (Idioma/Moneda/Notificaciones, /mas/preferencias/page.tsx
// de Móvil — mismos 3 valores estáticos, misma nota de integración pendiente).
// Nota de interpretación: la tarea pedía "Referencias generales", término que no
// existe en ningún otro lugar del proyecto (confirmado por búsqueda exhaustiva) —
// se interpretó como "Preferencias generales" (sección real de Móvil, ver arriba),
// consistente con la propia instrucción de la tarea de "revisar primero cómo se ve
// esa sección en Móvil antes de construirla", que solo aplica a esta última.
import { EmpresaShell } from "@/components/empresa/EmpresaShell";
import { createServerClient } from "@/lib/supabase/server";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

export default async function EmpresaPerfilPage() {
  const supabase = createServerClient();
  const [{ data: { user } }, { data: perfil }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("perfiles").select("razon_social, telefono").single(),
  ]);

  return (
    <EmpresaShell titulo="Perfil del usuario">
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
