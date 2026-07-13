"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_LAYOUT, ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";

/** Navegación oficial — 00-PANEL-ADMIN-DASHBOARD.md §4 */
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/productos", label: "Productos", icon: "📦" },
  { href: "/admin/catalogo", label: "Catálogo Maestro", icon: "📚" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👤" },
  { href: "/admin/suscripciones", label: "Gestión de Suscripciones", icon: "💳" },
  { href: "/admin/roles", label: "Roles y Permisos", icon: "🔐" },
  { href: "/admin/empresas", label: "Empresas", icon: "🏢" },
  { href: "/admin/empleados", label: "Empleados", icon: "👥" },
  { href: "/admin/apis", label: "Configuración de APIs", icon: "🔌" },
  { href: "/admin/partners", label: "Partners", icon: "🤝" },
  { href: "/admin/soporte", label: "Soporte", icon: "🎧" },
  { href: "/admin/configuracion", label: "Configuración", icon: "⚙️" },
] as const;

export function AdminShell({
  titulo,
  headerExtra,
  children,
}: {
  titulo: string;
  /** Slot opcional a la derecha del título en el header — hoy solo lo usa Dashboard (00-PANEL-ADMIN-DASHBOARD.md §5 "Barra superior"). */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen" style={{ background: ADMIN_LAYOUT.contentBg }}>
      <aside
        className="hidden shrink-0 flex-col border-r p-4 md:flex"
        style={{
          width: ADMIN_LAYOUT.sidebarWidth,
          background: ADMIN_LAYOUT.sidebarBg,
          borderColor: ADMIN_COLORS.sidebarBorder,
        }}
      >
        <p
          className="mb-6 text-sm font-black tracking-wide"
          style={{ color: ADMIN_COLORS.sidebarText }}
        >
          DARIVO PRO ADMIN
        </p>
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV.map((item) => {
            const activo =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: activo ? ADMIN_COLORS.sidebarActiveBg : "transparent",
                  color: activo ? ADMIN_COLORS.sidebarActiveText : ADMIN_COLORS.sidebarTextMuted,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Link
            href="/dashboard"
            className="text-xs font-bold"
            style={{ color: ADMIN_COLORS.sidebarTextMuted }}
          >
            ← Volver a Móvil
          </Link>
          <CerrarSesionButton
            className="text-left text-xs font-bold"
            style={{ color: ADMIN_COLORS.red }}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
          style={{ background: ADMIN_LAYOUT.headerBg, borderColor: ADMIN_LAYOUT.headerBorder }}
        >
          <div>
            <h1 className="text-xl font-black" style={{ color: ADMIN_COLORS.text }}>
              {titulo}
            </h1>
            <p className="text-xs" style={{ color: ADMIN_COLORS.textMid }}>
              Panel Administrador
            </p>
          </div>
          {headerExtra}
        </header>
        <main className="flex-1" style={{ padding: ADMIN_LAYOUT.contentPadding }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function PlaceholderModulo({ md }: { md: string }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
    >
      <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
        Módulo en construcción conforme documentación oficial.
      </p>
      <p className="mt-2 text-xs font-mono" style={{ color: ADMIN_COLORS.textLight }}>
        MD: {md}
      </p>
    </div>
  );
}

export { PlaceholderModulo };
