import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createServerClient } from "@/lib/supabase/server";
import { T } from "@/lib/theme";

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
        style={{ background: T.white, border: `1px solid ${T.slateD}` }}
      >
        <h2 className="text-sm font-extrabold" style={{ color: T.text }}>
          Mi perfil administrador
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-bold" style={{ color: T.textMid }}>
              Correo
            </dt>
            <dd style={{ color: T.text }}>{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold" style={{ color: T.textMid }}>
              Razón social
            </dt>
            <dd style={{ color: T.text }}>{perfil?.razon_social ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold" style={{ color: T.textMid }}>
              Teléfono
            </dt>
            <dd style={{ color: T.text }}>{perfil?.telefono ?? "—"}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/recuperar"
            className="rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: T.blue }}
          >
            Cambiar contraseña
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl px-4 py-2 text-sm font-bold"
            style={{ background: T.slate, color: T.text }}
          >
            Volver a Móvil
          </Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: T.textLight }}>
          Conforme `11-PANEL-ADMIN-CONFIGURACION.md` — solo cuenta propia del administrador.
        </p>
      </div>
    </AdminShell>
  );
}
