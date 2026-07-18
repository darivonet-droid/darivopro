"use client";
// DARIVO PRO EMPRESA — "Mi plan", capa de presentación de escritorio.
// Tarea 5b (CLAUDE.md 17/07/2026): antes "Mi Plan" en Empresa enlazaba
// literalmente a /mas/plan (la ruta de Móvil, con MiPlanCard.tsx y tema
// Fable 5/azul, sin sidebar ni ADMIN_COLORS) — el Gerente salía por
// completo del panel de escritorio. Mismos datos/lógica que Móvil
// (PRECIOS_OFICIALES, CheckoutPlanButton real), solo cambia la
// presentación a ADMIN_COLORS, mismo patrón ya usado en
// NuevoCotizacionWizardEscritorio.tsx/NuevaFacturaFormEscritorio.tsx.
import Link from "next/link";
import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import { fmtPrecio } from "@/lib/planes";
import { CheckoutPlanButton } from "@/components/pagos/CheckoutPlanButton";
import { ADMIN_COLORS } from "@/lib/design-system/admin-tokens";

function fmtPrecioMensual(plan: "basico" | "pro" | "business"): string {
  return `S/${fmtPrecio(PRECIOS_OFICIALES[plan].mensual)}/mes`;
}

function fmtPrecioAnual(plan: "basico" | "pro" | "business"): string {
  return `S/${fmtPrecio(PRECIOS_OFICIALES[plan].anual)}/año`;
}

const PLAN_LABELS: Record<PlanTipoPersistido, { nombre: string; desc: string }> = {
  gratis: {
    nombre: "Prueba gratuita",
    desc: "5 cotizaciones al registrarte · sin suscripción activa",
  },
  basico: {
    nombre: `Plan ${PRECIOS_OFICIALES.basico.nombre}`,
    desc: `20 cotizaciones/mes · Facturación no incluida · ${fmtPrecioMensual("basico")}`,
  },
  pro: {
    nombre: `Plan ${PRECIOS_OFICIALES.pro.nombre}`,
    desc: `Cotizaciones y facturas ilimitadas · ${fmtPrecioMensual("pro")}`,
  },
  business: {
    nombre: `Plan ${PRECIOS_OFICIALES.business.nombre}`,
    desc: `Cotizaciones y facturas ilimitadas · acceso a Darivo Pro Empresa · hasta 5 Técnicos · ${fmtPrecioMensual("business")}`,
  },
};

const botonSolido: React.CSSProperties = { background: ADMIN_COLORS.purple, color: ADMIN_COLORS.white };
const botonOutline: React.CSSProperties = {
  background: "transparent",
  color: ADMIN_COLORS.purple,
  border: `2px solid ${ADMIN_COLORS.purple}`,
};

export function MiPlanCardEscritorio({ planTipo }: { planTipo: PlanTipoPersistido }) {
  const info = PLAN_LABELS[planTipo] ?? PLAN_LABELS.gratis;
  const esPago = planTipo === "basico" || planTipo === "pro" || planTipo === "business";

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${ADMIN_COLORS.purple}, #6D28D9)`,
          boxShadow: `0 6px 24px ${ADMIN_COLORS.purple}44`,
        }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-white/70">Plan actual</p>
        <p className="mt-1 text-2xl font-black text-white">{info.nombre}</p>
        <p className="mt-2 text-sm text-white/80">{info.desc}</p>
        {esPago && (
          <p className="mt-3 text-xs text-white/60">Pagos procesados por dLocal · soles (PEN)</p>
        )}
      </div>

      {planTipo === "gratis" && (
        <>
          <CheckoutPlanButton plan="basico" label={`Suscribirme a Básico — ${fmtPrecioMensual("basico")}`} style={botonSolido} />
          <CheckoutPlanButton plan="pro" label={`Suscribirme a Pro — ${fmtPrecioMensual("pro")}`} style={botonOutline} />
          <CheckoutPlanButton plan="business" label={`Suscribirme a Business — ${fmtPrecioMensual("business")}`} style={botonOutline} />
        </>
      )}

      {planTipo === "basico" && (
        <>
          <CheckoutPlanButton plan="pro" label={`Mejorar a Pro — ${fmtPrecioMensual("pro")}`} style={botonSolido} />
          <CheckoutPlanButton plan="business" label={`Mejorar a Business — ${fmtPrecioMensual("business")}`} style={botonOutline} />
          <CheckoutPlanButton plan="basico" ciclo="anual" label={`Pagar anual Básico — ${fmtPrecioAnual("basico")}`} style={botonOutline} />
        </>
      )}

      {planTipo === "pro" && (
        <>
          <CheckoutPlanButton plan="business" label={`Mejorar a Business — ${fmtPrecioMensual("business")}`} style={botonSolido} />
          <CheckoutPlanButton plan="pro" ciclo="anual" label={`Pagar anual Pro — ${fmtPrecioAnual("pro")}`} style={botonOutline} />
        </>
      )}

      {planTipo === "business" && (
        <>
          <CheckoutPlanButton plan="business" ciclo="anual" label={`Pagar anual Business — ${fmtPrecioAnual("business")}`} style={botonSolido} />
          <Link
            href="/empresa"
            className="block w-full rounded-2xl py-3.5 text-center text-sm font-bold"
            style={{ background: ADMIN_COLORS.purplePale, color: ADMIN_COLORS.purple }}
          >
            Ir a Darivo Pro Empresa →
          </Link>
        </>
      )}

      <Link href="/precios" className="text-center text-sm font-bold" style={{ color: ADMIN_COLORS.purple }}>
        Comparar planes →
      </Link>
    </div>
  );
}
