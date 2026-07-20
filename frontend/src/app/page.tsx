import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingChatWidget } from "@/components/landing/LandingChatWidget";
import {
  IconList,
  IconSparkle,
  IconWhatsapp,
  IconMail,
  IconClock,
  IconCalculator,
  IconDocument,
  IconSend,
  IconShieldCloud,
  IconHelmet,
  IconWrench,
  IconRoller,
  IconBolt,
  IconArrow,
  IconBuilding,
  IconSmartphone,
  IconHandshake,
  IconCheck,
} from "@/components/landing/Icons";

// LANDING-PAGE-DARIVO-PRO.md v1.5 — página pública de marketing en darivopro.com.
// No requiere sesión, no comparte diseño con Admin/Empresa ni con Fable 5 (Móvil).
// Regla de producto: nunca se comunica como "IA" de cara al usuario — "Calculadora
// inteligente" en todo texto visible (ver §2 del MD).
// Testimonios y vídeo del hero: omitidos a propósito en esta versión — pendientes
// de contenido real (clientes verificados / grabación sobre la app real). La
// sección "Confianza" de más abajo usa solo hechos verificables del producto,
// nunca citas ni nombres de clientes (§4.1).
// Rediseño 17/07/2026: header con acceso a los 3 productos (LandingHeader.tsx),
// sección "Un Darivo Pro para cada parte de tu negocio", franja de confianza,
// y widget de chat flotante para visitantes sin cuenta (LandingChatWidget.tsx,
// independiente del sistema de tickets interno).

const LANDING_TITLE = "Darivo Pro — Una factura en un minuto";
const LANDING_DESCRIPTION =
  "Cotizaciones y facturas de obra para maestros de obra y constructoras en Perú, desde el celular.";

export const metadata: Metadata = {
  title: LANDING_TITLE,
  description: LANDING_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    url: "/",
  },
  twitter: {
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
  },
};

const NAVY = "#0A1628";
const BLUE = "#2563EB";
const LIGHT_BLUE = "#60A5FA";

const PASOS = [
  {
    icon: IconList,
    titulo: "Elige tu categoría",
    texto: "Selecciona tu trabajo: construcción, fontanería, pintura o electricidad.",
  },
  {
    icon: IconSparkle,
    titulo: "La calculadora arma tu cotización",
    texto: "Elige las partidas, la calculadora calcula precios, cantidades e impuestos al instante.",
  },
  {
    icon: IconWhatsapp,
    titulo: "PDF al WhatsApp",
    texto: "Genera tu factura o cotización y envíala directo al WhatsApp de tu cliente.",
  },
];

// Fotos de stock (Pexels, licencia libre) — fuentes y autores en
// frontend/docs-internos/landing/CREDITOS-IMAGENES.md (fuera de /public, no público)
const CATEGORIAS = [
  { icon: IconHelmet, nombre: "Construcción", texto: "Albañilería, estructuras, acabados y mucho más.", foto: "/landing/categoria-construccion.jpg" },
  { icon: IconWrench, nombre: "Fontanería", texto: "Instalaciones de agua, desagüe, gas y sanitarios.", foto: "/landing/categoria-fontaneria.jpg" },
  { icon: IconRoller, nombre: "Pintura", texto: "Pintura interior, exterior, empastes y acabados.", foto: "/landing/categoria-pintura.jpg" },
  { icon: IconBolt, nombre: "Electricidad", texto: "Instalaciones, circuitos, tableros y más.", foto: "/landing/categoria-electricidad.jpg" },
];

const FEATURES = [
  { icon: IconClock, titulo: "Ahorra tiempo", texto: "Factura en menos de 1 minuto." },
  { icon: IconCalculator, titulo: "Precios actualizados", texto: "Costos reales de materiales y mano de obra." },
  { icon: IconDocument, titulo: "PDF profesional", texto: "Con tu logo y listo para enviar." },
  { icon: IconSend, titulo: "Envío directo", texto: "Al WhatsApp de tu cliente con un clic." },
  { icon: IconShieldCloud, titulo: "Seguro y en la nube", texto: "Tus datos y documentos siempre protegidos." },
];

// Un Darivo Pro por tipo de usuario — dobla como acceso directo a los 3
// productos (ver LandingHeader) y como "casos de uso" de la landing.
// Subdominios reales (frontend/src/lib/subdominios.ts, verificado 19/07/2026
// vía API de Vercel): empresa.darivopro.com y partners.darivopro.com (con
// "s") SÍ están conectados. "app.darivopro.com" NO está conectado todavía —
// Móvil se sirve hoy desde darivopro.com. Antes esta tarjeta enlazaba a
// "app.darivopro.com" y "partner.darivopro.com" (sin "s"), dos hostnames que
// no resuelven DNS — cualquier visitante que le diera clic caía en un error
// de navegador. Corregido.
const PRODUCTOS_USO = [
  {
    icon: IconSmartphone,
    nombre: "Darivo Pro Móvil",
    para: "Para el maestro de obra independiente",
    texto: "Cotiza y factura tú mismo desde el celular, obra por obra, sin depender de nadie más.",
    href: "https://darivopro.com",
  },
  {
    icon: IconBuilding,
    nombre: "Darivo Pro Empresa",
    para: "Para constructoras con equipo",
    texto: "Gestiona clientes, cotizaciones y facturas de todo tu equipo desde un solo panel de escritorio.",
    href: "https://empresa.darivopro.com",
  },
  {
    icon: IconHandshake,
    nombre: "Darivo Pro Partner",
    para: "Para quien quiere ganar refiriendo",
    texto: "Comparte tu enlace, gana comisión por cada cliente que se registre e invierta en Darivo Pro.",
    href: "https://partners.darivopro.com",
  },
];

// Confianza — solo hechos reales del producto (nunca testimonios/nombres
// inventados: LANDING-PAGE-DARIVO-PRO.md §4.1 los prohíbe hasta tener 3
// clientes reales verificables).
const CONFIANZA = [
  "Hecho a la medida del maestro de obra y la constructora peruana",
  "Tus cotizaciones y facturas, guardadas de forma segura en la nube",
  "Sin contratos forzosos — cancela cuando quieras",
  "Soporte real por correo, no un bot que da vueltas",
];


const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Darivo Pro",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, Android, iOS",
  description: LANDING_DESCRIPTION,
  url: "https://darivopro.com",
};

export default function LandingPage({
  searchParams,
}: {
  searchParams: { code?: string; next?: string };
}) {
  // Red de seguridad (20/07/2026): si el gateway de OAuth de Supabase alguna
  // vez entrega el `code` aquí en la raíz en vez de en /auth/callback (Site
  // URL de Supabase desalineada con el redirectTo real, o un Redirect URL
  // que no matchea exacto en su allowlist — configuración del Dashboard de
  // Supabase, no de este código) — nunca dejarlo expuesto sin procesar en la
  // landing pública. Se reenvía al callback real, que sí lo intercambia por
  // una sesión real.
  if (searchParams.code) {
    const next = searchParams.next ? `&next=${encodeURIComponent(searchParams.next)}` : "";
    redirect(`/auth/callback?code=${encodeURIComponent(searchParams.code)}${next}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <LandingHeader />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="px-6 py-14" style={{ background: NAVY }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          {/* Texto */}
          <div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              <span className="block text-white">Una factura</span>
              <span className="block" style={{ color: LIGHT_BLUE }}>
                en un minuto
              </span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Cotiza y factura desde tu celular, PDF directo al WhatsApp de tu cliente.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {[
                { icon: IconList, texto: "400+ partidas" },
                { icon: IconSparkle, texto: "Calculadora inteligente" },
                { icon: IconWhatsapp, texto: "PDF al WhatsApp" },
              ].map(({ icon: Icon, texto }) => (
                <div key={texto} className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span style={{ color: LIGHT_BLUE }}>
                    <Icon />
                  </span>
                  {texto}
                </div>
              ))}
            </div>

            <Link
              href="/registro"
              className="mt-8 inline-block rounded-2xl px-8 py-4 text-base font-bold text-white transition-transform active:scale-[0.97]"
              style={{ background: BLUE }}
            >
              Empieza gratis
            </Link>
            <p className="mt-3 text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              Sin tarjeta • Sin compromiso • Empieza en 1 minuto
            </p>
          </div>

          {/* Mockup */}
          <div className="relative mx-auto w-full max-w-sm">
            {/* Foto: Pexels 33477104 (Mahsum Oğrak) — trabajador sonriente con celular en
                obra. Desviación del brief: sin casco (ver CREDITOS-IMAGENES.md). */}
            <Image
              src="/landing/hero-maestro.jpg"
              alt="Trabajador de construcción sonriendo con su celular en obra"
              width={448}
              height={288}
              sizes="224px"
              className="absolute -right-4 bottom-0 hidden h-72 w-56 rounded-3xl object-cover shadow-xl sm:block"
            />

            {/* Marco del teléfono — mockup ilustrativo, no captura real de la app */}
            <div
              className="relative z-10 mx-auto w-64 rounded-[2.2rem] p-3 shadow-2xl"
              style={{ background: "#111C33", border: "6px solid #1E2A44" }}
            >
              <div className="rounded-[1.6rem] bg-white p-3">
                <p className="text-[11px] font-bold" style={{ color: NAVY }}>
                  Nueva cotización
                </p>
                <p className="text-[10px] text-slate-400">Listo en menos de 60 segundos</p>

                <span
                  className="mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold text-white"
                  style={{ background: BLUE }}
                >
                  Muro de ladrillo
                </span>

                <div className="mt-3 flex flex-col gap-2">
                  {[
                    { nombre: "Muro de ladrillo", precio: "S/ 85 / m²" },
                    { nombre: "Tarrajeo de paredes", precio: "S/ 35 / m²" },
                    { nombre: "Piso cerámico instalado", precio: "S/ 55 / m²" },
                  ].map((item) => (
                    <div
                      key={item.nombre}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-2"
                    >
                      <div>
                        <p className="text-[10px] font-bold text-slate-700">{item.nombre}</p>
                        <p className="text-[9px] text-slate-400">{item.precio}</p>
                      </div>
                      <span className="text-xs font-bold" style={{ color: BLUE }}>
                        +
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-3 rounded-xl py-2 text-center text-[11px] font-bold text-white"
                  style={{ background: BLUE }}
                >
                  Calcular cotización →
                </div>
              </div>
            </div>

            {/* Badge "0:47" */}
            <div
              className="absolute -left-2 top-6 z-20 flex h-20 w-20 flex-col items-center justify-center rounded-full text-center shadow-xl"
              style={{ background: "white" }}
            >
              <span className="text-lg font-black" style={{ color: BLUE }}>
                0:47
              </span>
              <span className="text-[8px] font-bold leading-tight text-slate-500">
                Factura
                <br />
                lista en
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Así de fácil ───────────────────────────────────────── */}
      <section id="como-funciona" className="px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-black sm:text-3xl" style={{ color: NAVY }}>
            Así de fácil
          </h2>

          <div className="mt-10 grid grid-cols-1 items-start gap-10 sm:grid-cols-3">
            {PASOS.map((paso, i) => (
              <div key={paso.titulo} className="relative flex flex-col items-center">
                <div className="flex flex-col items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: BLUE }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "#EFF4FF", color: BLUE }}
                  >
                    <paso.icon />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold" style={{ color: NAVY }}>
                  {paso.titulo}
                </h3>
                <p className="mt-1.5 max-w-[220px] text-sm text-slate-500">{paso.texto}</p>

                {i < PASOS.length - 1 && (
                  <span
                    className="absolute right-[-38px] top-9 hidden text-slate-300 sm:block"
                    aria-hidden
                  >
                    <IconArrow />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Un Darivo Pro para cada parte de tu negocio ─────────── */}
      <section className="px-6 py-16" style={{ background: "#F8FAFF" }}>
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-black sm:text-3xl" style={{ color: NAVY }}>
            Un Darivo Pro para <span style={{ color: BLUE }}>cada parte de tu negocio</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">Elige el que se ajusta a cómo trabajas</p>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {PRODUCTOS_USO.map((p) => (
              <a
                key={p.nombre}
                href={p.href}
                className="flex flex-col rounded-3xl bg-white p-6 text-left transition-transform hover:-translate-y-1"
                style={{ boxShadow: "0 4px 24px rgba(10,22,40,0.06)" }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: "#EFF4FF", color: BLUE }}
                >
                  <p.icon />
                </span>
                <h3 className="mt-4 text-base font-black" style={{ color: NAVY }}>
                  {p.nombre}
                </h3>
                <p className="mt-1 text-xs font-bold" style={{ color: BLUE }}>
                  {p.para}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.texto}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: BLUE }}>
                  Conocer más →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hecho para tu chamba ───────────────────────────────── */}
      <section className="px-6 py-16" style={{ background: "#F8FAFF" }}>
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-black sm:text-3xl" style={{ color: NAVY }}>
            Hecho para <span style={{ color: BLUE }}>tu chamba</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sin importar tu especialidad, cotiza y factura más rápido
          </p>

          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {CATEGORIAS.map((cat) => (
              <div key={cat.nombre} className="text-left">
                <div className="relative">
                  <Image
                    src={cat.foto}
                    alt={`${cat.nombre} — ${cat.texto}`}
                    width={400}
                    height={400}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                  <span
                    className="absolute -bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg"
                    style={{ background: BLUE }}
                  >
                    <cat.icon />
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold" style={{ color: NAVY }}>
                  {cat.nombre}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{cat.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Todo lo que necesitas en tu celular ───────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-black sm:text-3xl" style={{ color: NAVY }}>
            Todo lo que necesitas <span style={{ color: BLUE }}>en tu celular</span>
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((f) => (
              <div key={f.titulo} className="flex flex-col items-center text-center">
                <span style={{ color: BLUE }}>
                  <f.icon />
                </span>
                <h3 className="mt-3 text-sm font-bold" style={{ color: NAVY }}>
                  {f.titulo}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Confianza — solo hechos reales, sin testimonios inventados
          (LANDING-PAGE-DARIVO-PRO.md §4.1: prohibidos hasta 3 clientes
          reales verificables) ───────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-4 rounded-3xl border border-slate-100 p-8 sm:grid-cols-2"
          style={{ background: "#FAFBFF" }}
        >
          {CONFIANZA.map((texto) => (
            <div key={texto} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: BLUE }}
              >
                <IconCheck />
              </span>
              <p className="text-sm font-semibold leading-relaxed" style={{ color: NAVY }}>
                {texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Banner CTA final ───────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div
          className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 rounded-3xl px-8 py-8 text-center sm:flex-row sm:text-left"
          style={{ background: NAVY }}
        >
          <div>
            <h2 className="text-xl font-black text-white sm:text-2xl">Empieza gratis hoy mismo</h2>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              Sin tarjeta, sin compromiso. Crea tu primera factura en 1 minuto.
            </p>
          </div>
          <Link
            href="/registro"
            className="shrink-0 rounded-2xl px-7 py-3.5 text-sm font-bold transition-transform active:scale-[0.97]"
            style={{ background: "white", color: BLUE }}
          >
            Empieza gratis →
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-6 py-10 text-white" style={{ background: NAVY }}>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <span className="text-base font-black tracking-tight">
              DARIVO <span style={{ color: LIGHT_BLUE }}>PRO</span>
            </span>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              La herramienta más rápida para cotizar y facturar desde tu celular.
            </p>
          </div>

          <div>
            {/* Sin número de WhatsApp real todavía — reemplazar por wa.me/<numero real>
                cuando exista. Correo oficial confirmado por el propietario: info@darivopro.com */}
            <a href="mailto:info@darivopro.com" className="flex items-center gap-2 text-sm font-semibold">
              <IconMail />
              info@darivopro.com
            </a>
            <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Lun - Vie: 8:00 am - 6:00 pm
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm font-semibold sm:items-end">
            <Link href="/soporte">Soporte</Link>
            <Link href="/terminos">Términos y condiciones</Link>
            <Link href="/privacidad">Política de privacidad</Link>
            <Link href="/cookies">Política de cookies</Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          © {new Date().getFullYear()} Darivo Pro. Todos los derechos reservados.
        </p>
      </footer>

      <LandingChatWidget />
    </div>
  );
}
