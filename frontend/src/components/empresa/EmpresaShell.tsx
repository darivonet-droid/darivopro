"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EMPRESA_NAV } from "@/lib/empresa-modules";
import { EMPRESA_LAYOUT } from "@/lib/design-system/empresa-tokens";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";
import { CerrarSesionButton } from "@/components/CerrarSesionButton";

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

  return (
    <div className="flex min-h-screen" style={{ background: EMPRESA_LAYOUT.contentBg }}>
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
          {EMPRESA_NAV.filter((item) => !item.ocultoEnSidebar).map((item) => {
            const activo =
              item.href === "/empresa"
                ? pathname === "/empresa"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold"
                style={{
                  background: activo ? ADMIN_COLORS.sidebarActiveBg : "transparent",
                  color: activo ? ADMIN_COLORS.sidebarActiveText : ADMIN_COLORS.sidebarTextMuted,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Link href="/dashboard" className="text-xs font-bold" style={{ color: ADMIN_COLORS.textLight }}>
            ← Volver a Móvil
          </Link>
          <CerrarSesionButton className="text-left text-xs font-bold" style={{ color: ADMIN_COLORS.red }} />
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header
          className="border-b px-6 py-4"
          style={{ background: EMPRESA_LAYOUT.headerBg, borderColor: ADMIN_COLORS.sidebarBorder }}
        >
          <h1 className="text-xl font-black" style={{ color: ADMIN_COLORS.text }}>
            {titulo}
          </h1>
        </header>
        <main className="flex-1" style={{ padding: EMPRESA_LAYOUT.contentPadding }}>
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
