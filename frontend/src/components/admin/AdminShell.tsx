"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_LAYOUT, ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";
import { MobileNavDrawer } from "@/components/common/MobileNavDrawer";

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
  const esActivo = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: ADMIN_LAYOUT.contentBg }}>
      <aside
        className="hidden shrink-0 flex-col border-r p-4 lg:flex"
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
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: esActivo(item.href) ? ADMIN_COLORS.sidebarActiveBg : "transparent",
                color: esActivo(item.href) ? ADMIN_COLORS.sidebarActiveText : ADMIN_COLORS.sidebarTextMuted,
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
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
          className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 lg:px-6 lg:py-4"
          style={{ background: ADMIN_LAYOUT.headerBg, borderColor: ADMIN_LAYOUT.headerBorder }}
        >
          <div className="flex items-center gap-3">
            <MobileNavDrawer
              brand="DARIVO PRO ADMIN"
              items={ADMIN_NAV}
              isActive={esActivo}
              colors={{
                sidebarBg: ADMIN_LAYOUT.sidebarBg,
                sidebarBorder: ADMIN_COLORS.sidebarBorder,
                text: ADMIN_COLORS.sidebarText,
                textMuted: ADMIN_COLORS.sidebarTextMuted,
                activeBg: ADMIN_COLORS.sidebarActiveBg,
                activeText: ADMIN_COLORS.sidebarActiveText,
              }}
              footer={
                <>
                  <Link href="/dashboard" className="text-xs font-bold" style={{ color: ADMIN_COLORS.sidebarTextMuted }}>
                    ← Volver a Móvil
                  </Link>
                  <CerrarSesionButton className="text-left text-xs font-bold" style={{ color: ADMIN_COLORS.red }} />
                </>
              }
            />
            <div>
              <h1 className="text-lg font-black lg:text-xl" style={{ color: ADMIN_COLORS.text }}>
                {titulo}
              </h1>
              <p className="hidden text-xs sm:block" style={{ color: ADMIN_COLORS.textMid }}>
                Panel Administrador
              </p>
            </div>
          </div>
          {headerExtra}
        </header>
        <main className="min-w-0 flex-1 overflow-x-auto p-4 lg:p-6" style={{ background: ADMIN_LAYOUT.contentBg }}>
          {children}
        </main>
      </div>
    </div>
  );
}
