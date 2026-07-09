import Link from "next/link";
import type { Metadata } from "next";
import { PRECIOS_OFICIALES } from "@/lib/roles-planes-oficial";
import { fmtPrecio } from "@/lib/planes";

// LANDING-PAGE-DARIVO-PRO.md v1.2 — página pública de marketing en darivopro.com.
// No requiere sesión, no comparte diseño con Admin/Empresa ni con Fable 5 (Móvil).

export const metadata: Metadata = {
  title: "Darivo Pro — Una factura en un minuto",
  description: "Cotizaciones y facturas de obra para maestros de obra y constructoras en Perú, desde el celular.",
};

const NAVY = "#0A1628";
const BLUE = "#2563EB";

const PLANES_LANDING = [
  { id: "basico", ...PRECIOS_OFICIALES.basico, destacado: false },
  { id: "pro", ...PRECIOS_OFICIALES.pro, destacado: true },
  { id: "business", ...PRECIOS_OFICIALES.business, destacado: false },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      {/* Texto en vez de logo-darivo-pro.png: ese archivo está corrupto (es un HTML
          de WhatsApp Web guardado con extensión .png) — ver nota en el resumen de la tarea. */}
      <header className="flex items-center justify-center px-6 py-5">
        <span className="text-xl font-black tracking-tight" style={{ color: NAVY }}>
          DARIVO <span style={{ color: BLUE }}>PRO</span>
        </span>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-6 text-center">
        <div className="w-full" style={{ maxWidth: 640 }}>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl" style={{ color: NAVY }}>
            Una factura en un minuto
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
            Cotiza y factura tus obras desde el celular, sin perder tiempo en papeleo.
          </p>

          <a
            href="/registro"
            className="mt-7 inline-block rounded-2xl px-8 py-4 text-base font-bold text-white transition-transform active:scale-[0.97]"
            style={{ background: BLUE }}
          >
            Empieza gratis
          </a>

          {/* Vídeo del producto — pendiente de grabar (47s-1min, app real en uso). */}
          <div
            className="mx-auto mt-10 flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400"
            style={{ maxWidth: 480 }}
          >
            Video del producto — próximamente
          </div>
        </div>

        {/* ── Planes ───────────────────────────────────────────── */}
        <section className="mt-16 w-full" style={{ maxWidth: 960 }}>
          <h2 className="text-2xl font-black" style={{ color: NAVY }}>
            Elige tu plan
          </h2>
          <p className="mt-1 text-sm text-slate-500">Precios provisionales, sujetos a confirmación final.</p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {PLANES_LANDING.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col rounded-2xl p-6 text-left"
                style={
                  plan.destacado
                    ? { background: BLUE, boxShadow: "0 8px 32px rgba(37,99,235,0.35)" }
                    : { background: "#F8FAFF", border: "1.5px solid #E2E8F0" }
                }
              >
                <span
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: plan.destacado ? "rgba(255,255,255,0.85)" : "#64748B" }}
                >
                  {plan.nombre}
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black" style={{ color: plan.destacado ? "white" : NAVY }}>
                    S/{fmtPrecio(plan.mensual)}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: plan.destacado ? "rgba(255,255,255,0.75)" : "#94A3B8" }}
                  >
                    /mes
                  </span>
                </div>
                <a
                  href="/registro"
                  className="mt-5 block rounded-xl py-3 text-center text-sm font-bold transition-transform active:scale-[0.97]"
                  style={
                    plan.destacado
                      ? { background: "white", color: BLUE }
                      : { background: BLUE, color: "white" }
                  }
                >
                  Regístrate
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-6 py-8 text-center">
        <nav className="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} Darivo Pro</p>
      </footer>
    </div>
  );
}
