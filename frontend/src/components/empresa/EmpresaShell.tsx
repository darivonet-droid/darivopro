"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EMPRESA_NAV } from "@/lib/empresa-modules";
import { EMPRESA_LAYOUT } from "@/lib/design-system/empresa-tokens";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";
import { MobileNavDrawer } from "@/components/common/MobileNavDrawer";

export { EMPRESA_NAV };

export function EmpresaShell({
  titulo,
  md,
  children,
}: {
  titulo: string;
  md?: string;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const itemsVisibles = EMPRESA_NAV.filter((item) => !item.ocultoEnSidebar);
  const esActivo = (href: string) => (href === "/empresa" ? pathname === "/empresa" : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: EMPRESA_LAYOUT.contentBg }}>
      <aside
        className="hidden shrink-0 flex-col border-r p-4 lg:flex"
        style={{
          width: EMPRESA_LAYOUT.sidebarWidth,
          background: EMPRESA_LAYOUT.sidebarBg,
          borderColor: ADMIN_COLORS.sidebarBorder,
        }}
      >
        <p className="mb-5 text-sm font-black" style={{ color: ADMIN_COLORS.sidebarText }}>
          DARIVO PRO EMPRESA
        </p>
        <nav className="flex flex-col gap-0.5">
          {itemsVisibles.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold"
              style={{
                background: esActivo(item.href) ? ADMIN_COLORS.sidebarActiveBg : "transparent",
                color: esActivo(item.href) ? ADMIN_COLORS.sidebarActiveText : ADMIN_COLORS.sidebarTextMuted,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Link href="/dashboard" className="text-xs font-bold" style={{ color: ADMIN_COLORS.textLight }}>
            ← Volver a Móvil
          </Link>
          <CerrarSesionButton className="text-left text-xs font-bold" style={{ color: ADMIN_COLORS.red }} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-3 border-b px-4 py-3 lg:px-6 lg:py-4"
          style={{ background: EMPRESA_LAYOUT.headerBg, borderColor: ADMIN_COLORS.sidebarBorder }}
        >
          <MobileNavDrawer
            brand="DARIVO PRO EMPRESA"
            items={itemsVisibles}
            isActive={esActivo}
            colors={{
              sidebarBg: EMPRESA_LAYOUT.sidebarBg,
              sidebarBorder: ADMIN_COLORS.sidebarBorder,
              text: ADMIN_COLORS.sidebarText,
              textMuted: ADMIN_COLORS.sidebarTextMuted,
              activeBg: ADMIN_COLORS.sidebarActiveBg,
              activeText: ADMIN_COLORS.sidebarActiveText,
            }}
            footer={
              <>
                <Link href="/dashboard" className="text-xs font-bold" style={{ color: ADMIN_COLORS.textLight }}>
                  ← Volver a Móvil
                </Link>
                <CerrarSesionButton className="text-left text-xs font-bold" style={{ color: ADMIN_COLORS.red }} />
              </>
            }
          />
          <h1 className="text-lg font-black lg:text-xl" style={{ color: ADMIN_COLORS.text }}>
            {titulo}
          </h1>
        </header>
        <main className="min-w-0 flex-1 overflow-x-auto p-4 lg:p-7" style={{ background: EMPRESA_LAYOUT.contentBg }}>
          {children ?? (
            <div
              className="rounded-2xl p-6"
              style={{ background: ADMIN_COLORS.white, border: `1px solid ${ADMIN_COLORS.slateD}` }}
            >
              <p className="text-sm" style={{ color: ADMIN_COLORS.textMid }}>
                Módulo escritorio — implementación base Tarea 05. Reutiliza lógica Móvil + capa presentación Empresa.
              </p>
              {md && (
                <p className="mt-2 font-mono text-xs" style={{ color: ADMIN_COLORS.textLight }}>
                  {md}
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
