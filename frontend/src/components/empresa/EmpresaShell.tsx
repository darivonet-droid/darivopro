"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EMPRESA_NAV } from "@/lib/empresa-modules";
import { EMPRESA_LAYOUT } from "@/lib/design-system/empresa-tokens";
import { T } from "@/lib/design-system/tokens";

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
          borderColor: T.slateD,
        }}
      >
        <p className="mb-5 text-sm font-black" style={{ color: T.navy }}>
          DARIVO PRO EMPRESA
        </p>
        <nav className="flex flex-col gap-0.5">
          {EMPRESA_NAV.map((item) => {
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
                  background: activo ? T.bluePale : "transparent",
                  color: activo ? T.blue : T.textMid,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/dashboard" className="mt-auto pt-6 text-xs font-bold" style={{ color: T.textLight }}>
          ← Volver a Móvil
        </Link>
      </aside>
      <div className="flex flex-1 flex-col">
        <header
          className="border-b px-6 py-4"
          style={{ background: EMPRESA_LAYOUT.headerBg, borderColor: T.slateD }}
        >
          <h1 className="text-xl font-black" style={{ color: T.text }}>
            {titulo}
          </h1>
        </header>
        <main className="flex-1" style={{ padding: EMPRESA_LAYOUT.contentPadding }}>
          {children ?? (
            <div
              className="rounded-2xl p-6"
              style={{ background: T.white, border: `1px solid ${T.slateD}` }}
            >
              <p className="text-sm" style={{ color: T.textMid }}>
                Módulo escritorio — implementación base Tarea 05. Reutiliza lógica Móvil + capa presentación Empresa.
              </p>
              {md && (
                <p className="mt-2 font-mono text-xs" style={{ color: T.textLight }}>
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
