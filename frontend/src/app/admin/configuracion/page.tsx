import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createServerClient } from "@/lib/supabase/server";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

export default async function AdminConfiguracionPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("razon_social, telefono")
    .single();

  return (
    <AdminShell titulo="Configuración">
      <div
        className="rounded-2xl p-6"
        style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: ADMIN_COLORS.text }}>
          Mi perfil administrador
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
              Correo
            </dt>
            <dd style={{ color: ADMIN_COLORS.text }}>{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
              Razón social
            </dt>
            <dd style={{ color: ADMIN_COLORS.text }}>{perfil?.razon_social ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
              Teléfono
            </dt>
            <dd style={{ color: ADMIN_COLORS.text }}>{perfil?.telefono ?? "—"}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/recuperar"
            className="rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: ADMIN_COLORS.purple }}
          >
            Cambiar contraseña
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl px-4 py-2 text-sm font-bold"
            style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
          >
            Volver a Móvil
          </Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: ADMIN_COLORS.textLight }}>
          Conforme `11-PANEL-ADMIN-CONFIGURACION.md` — solo cuenta propia del administrador.
        </p>
      </div>
    </AdminShell>
  );
}
