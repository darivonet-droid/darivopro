"use client";
import { usePathname } from "next/navigation";
import { T } from "@/lib/theme";

// /precios necesita más ancho en escritorio para mostrar los 3 planes lado a
// lado (23/07/2026, adaptación responsive) — el resto de rutas de este grupo
// (login, registro, recuperar, legales) son formularios/textos que se ven
// bien centrados y angostos también en escritorio, así que mantienen los
// 390px originales.
const ANCHO_ANGOSTO = 390;
const ANCHO_PRECIOS = 1100;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const maxWidth = pathname === "/precios" ? ANCHO_PRECIOS : ANCHO_ANGOSTO;

  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Header navy ─────────────────────────────────────── */}
      <header style={{ background: T.navy }}>
        <div className="flex h-[64px] items-center justify-center gap-2.5 px-6">
          {/* Ícono */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: T.blue }}
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          {/* Nombre */}
          <span className="text-xl font-black tracking-tight" style={{ color: T.white }}>
            DARIVO{" "}
            <span style={{ color: T.blueL }}>PRO</span>
          </span>
        </div>
      </header>

      {/* ── Body claro ──────────────────────────────────────── */}
      <main
        className="flex flex-1 flex-col items-center px-5 py-8 pb-14"
        style={{ background: "#F8FAFF" }}
      >
        <div className="w-full" style={{ maxWidth: 390 }}>
          {children}
        </div>
      </main>

      <footer className="px-5 py-3 text-center">
        <nav className="mb-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold">
          <a href="/contacto" style={{ color: T.textMid }}>Contacto</a>
          <a href="/soporte" style={{ color: T.textMid }}>Soporte</a>
          <a href="/terminos" style={{ color: T.textMid }}>Términos</a>
          <a href="/privacidad" style={{ color: T.textMid }}>Privacidad</a>
          <a href="/cookies" style={{ color: T.textMid }}>Cookies</a>
        </nav>
        <p className="text-[10px]" style={{ color: T.textLight }}>
          Build: 22 Jun 2026, 11:30 — Darivo Pro
        </p>
      </footer>

    </div>
  );
}
