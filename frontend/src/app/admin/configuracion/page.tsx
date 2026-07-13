import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminUi";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";
import { createServerClient } from "@/lib/supabase/server";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

const METODO_LABEL: Record<string, string> = {
  google: "Google",
  email: "Correo y contraseña",
};

function iniciales(nombre: string) {
  return (
    nombre
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "A"
  );
}

/** 11-PANEL-ADMIN-CONFIGURACION.md §5/§6/§7 — solo cuenta propia del administrador. */
export default async function AdminConfiguracionPage() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("razon_social").single();

  const correo = user?.email ?? "—";
  const nombre = perfil?.razon_social ?? correo;
  const metodoAcceso = user?.identities?.[0]?.provider ?? "email";
  const fechaRegistro = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const botonPrimario = "rounded-xl px-4 py-2 text-sm font-bold text-white";
  const botonSecundario = "rounded-xl px-4 py-2 text-sm font-bold";

  return (
    <AdminShell titulo="Configuración">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AdminCard title="Mi perfil">
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
                style={{ background: ADMIN_COLORS.purple }}
              >
                {iniciales(nombre)}
              </span>
              <div>
                <p className="font-bold" style={{ color: ADMIN_COLORS.text }}>
                  {nombre}
                </p>
                <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                  {correo}
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Acceso">
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
              Método de acceso actual:{" "}
              <span className="font-bold" style={{ color: ADMIN_COLORS.text }}>
                {METODO_LABEL[metodoAcceso] ?? metodoAcceso}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/recuperar" className={botonPrimario} style={{ background: ADMIN_COLORS.purple }}>
                Cambiar contraseña
              </Link>
              <Link
                href="/recuperar"
                className={botonSecundario}
                style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
              >
                Recuperar contraseña
              </Link>
            </div>
          </AdminCard>

          <AdminCard title="Sesión">
            <CerrarSesionButton
              className={botonSecundario}
              style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}
            />
            <Link
              href="/dashboard"
              className="ml-3 text-sm font-bold"
              style={{ color: ADMIN_COLORS.textMid }}
            >
              ← Volver a Móvil
            </Link>
          </AdminCard>
        </div>

        <AdminCard title="Información de la cuenta">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                Nombre
              </dt>
              <dd style={{ color: ADMIN_COLORS.text }}>{nombre}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                Correo electrónico
              </dt>
              <dd style={{ color: ADMIN_COLORS.text }}>{correo}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold" style={{ color: ADMIN_COLORS.textMid }}>
                Fecha de registro
              </dt>
              <dd style={{ color: ADMIN_COLORS.text }}>{fechaRegistro}</dd>
            </div>
          </dl>

          <p className="mb-2 mt-5 text-xs font-bold uppercase" style={{ color: ADMIN_COLORS.textMid }}>
            Acciones rápidas
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/recuperar"
              className="rounded-lg px-3 py-2 text-sm font-bold"
              style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
            >
              Cambiar contraseña
            </Link>
            <Link
              href="/recuperar"
              className="rounded-lg px-3 py-2 text-sm font-bold"
              style={{ background: ADMIN_COLORS.slate, color: ADMIN_COLORS.text }}
            >
              Recuperar contraseña
            </Link>
            <CerrarSesionButton
              className="rounded-lg px-3 py-2 text-left text-sm font-bold"
              style={{ background: ADMIN_COLORS.redPale, color: ADMIN_COLORS.red }}
            />
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
