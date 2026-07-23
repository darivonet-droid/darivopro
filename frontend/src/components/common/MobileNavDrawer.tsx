"use client";
// DARIVO PRO — Menú móvil compartido (hamburguesa + drawer) para los shells
// de escritorio (Empresa/Admin). Reutiliza la misma lista de navegación que
// ya usa el sidebar de escritorio — no duplica datos de menú, solo cambia
// cómo se presentan por debajo de `lg` (1024px).
import Link from "next/link";
import { useState } from "react";

export interface MobileNavItem {
  href: string;
  label: string;
  icon?: string;
}

interface MobileNavDrawerProps {
  brand: string;
  items: readonly MobileNavItem[];
  isActive: (href: string) => boolean;
  colors: {
    sidebarBg: string;
    sidebarBorder: string;
    text: string;
    textMuted: string;
    activeBg: string;
    activeText: string;
  };
  footer?: React.ReactNode;
}

export function MobileNavDrawer({ brand, items, isActive, colors, footer }: MobileNavDrawerProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        aria-expanded={abierto}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg lg:hidden"
        style={{ color: colors.text, border: `1px solid ${colors.sidebarBorder}` }}
      >
        ☰
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />
          <div
            className="relative flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto p-4"
            style={{ background: colors.sidebarBg }}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-black" style={{ color: colors.text }}>
                {brand}
              </p>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar menú"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
                style={{ color: colors.textMuted }}
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setAbierto(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold"
                  style={{
                    background: isActive(item.href) ? colors.activeBg : "transparent",
                    color: isActive(item.href) ? colors.activeText : colors.textMuted,
                  }}
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
            </nav>
            {footer && <div className="mt-auto flex flex-col gap-2 pt-6">{footer}</div>}
          </div>
        </div>
      )}
    </>
  );
}
