"use client";
// DARIVO PRO — Header de la landing pública. Client component (dropdown de
// Productos + menú móvil necesitan estado) — el resto de la página sigue
// siendo Server Component para metadata/SEO.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconBuilding,
  IconSmartphone,
  IconHandshake,
  IconChevronDown,
  IconMenu,
  IconClose,
} from "@/components/landing/Icons";

const NAVY = "#0A1628";
const BLUE = "#2563EB";

// Subdominios reales del ecosistema (frontend/src/middleware.ts SUBDOMINIOS) —
// el enrutado por subdominio está preparado pero AÚN NO conectado en DNS
// (SUBDOMAIN_ROUTING_ENABLED), así que estos enlaces no resuelven todavía en
// producción hasta que el propietario conecte el dominio. Se dejan como URL
// real de destino final, no como placeholder.
const PRODUCTOS = [
  { nombre: "Darivo Pro Empresa", texto: "Para constructoras con equipo", href: "https://empresa.darivopro.com", icon: IconBuilding },
  { nombre: "Darivo Pro Móvil", texto: "Para el maestro de obra, desde el celular", href: "https://app.darivopro.com", icon: IconSmartphone },
  { nombre: "Darivo Pro Partner", texto: "Gana comisión por referir clientes", href: "https://partner.darivopro.com", icon: IconHandshake },
];

export function LandingHeader() {
  const [productosAbierto, setProductosAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductosAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="text-lg font-black tracking-tight" style={{ color: NAVY }}>
          DARIVO <span style={{ color: BLUE }}>PRO</span>
        </span>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
          <Link href="/precios">Precios</Link>
          <a href="#como-funciona">¿Cómo funciona?</a>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProductosAbierto((v) => !v)}
              className="flex items-center gap-1"
              aria-expanded={productosAbierto}
            >
              Productos
              <span className={`transition-transform ${productosAbierto ? "rotate-180" : ""}`}>
                <IconChevronDown />
              </span>
            </button>
            {productosAbierto && (
              <div
                className="absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"
                style={{ boxShadow: "0 12px 32px rgba(10,22,40,0.12)" }}
              >
                {PRODUCTOS.map((p) => (
                  <a
                    key={p.nombre}
                    href={p.href}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50"
                  >
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "#EFF4FF", color: BLUE }}
                    >
                      <p.icon />
                    </span>
                    <span>
                      <span className="block text-sm font-bold" style={{ color: NAVY }}>
                        {p.nombre}
                      </span>
                      <span className="block text-xs text-slate-500">{p.texto}</span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1 whitespace-nowrap sm:gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 sm:inline-block sm:px-4 sm:py-2 sm:text-sm"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="hidden rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 sm:inline-block sm:px-4 sm:py-2 sm:text-sm"
          >
            Registrarse
          </Link>
          <Link
            href="/registro"
            className="rounded-xl px-2 py-1.5 text-xs font-bold text-white sm:px-4 sm:py-2 sm:text-sm"
            style={{ background: BLUE }}
          >
            Empieza gratis
          </Link>
          <button
            type="button"
            onClick={() => setMenuMovilAbierto((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 lg:hidden"
            aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuMovilAbierto}
          >
            {menuMovilAbierto ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Menú móvil — Precios/Cómo funciona/Productos/Iniciar sesión/Registrarse,
          ocultos en el header compacto de celular (solo cabe "Empieza gratis"). */}
      {menuMovilAbierto && (
        <div className="border-t border-slate-100 bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            <Link href="/precios" className="rounded-lg px-2 py-2.5" onClick={() => setMenuMovilAbierto(false)}>
              Precios
            </Link>
            <a href="#como-funciona" className="rounded-lg px-2 py-2.5" onClick={() => setMenuMovilAbierto(false)}>
              ¿Cómo funciona?
            </a>

            <p className="mt-2 px-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
              Productos
            </p>
            {PRODUCTOS.map((p) => (
              <a key={p.nombre} href={p.href} className="flex items-center gap-2.5 rounded-lg px-2 py-2.5">
                <span style={{ color: BLUE }}>
                  <p.icon />
                </span>
                {p.nombre}
              </a>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-center"
                onClick={() => setMenuMovilAbierto(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-xl px-3 py-2.5 text-center text-white"
                style={{ background: BLUE }}
                onClick={() => setMenuMovilAbierto(false)}
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
