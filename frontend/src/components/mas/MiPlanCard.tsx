"use client";
import Link from "next/link";
import { PRECIOS_OFICIALES, type PlanTipoPersistido } from "@/lib/roles-planes-oficial";
import { CheckoutPlanButton } from "@/components/pagos/CheckoutPlanButton";
import { T } from "@/lib/theme";

const PLAN_LABELS: Record<PlanTipoPersistido, { nombre: string; desc: string }> = {
  gratis: {
    nombre: "Prueba gratuita",
    desc: "5 cotizaciones al registrarte · sin suscripción activa",
  },
  basico: {
    nombre: `Plan ${PRECIOS_OFICIALES.basico.nombre}`,
    desc: "20 cotizaciones/mes · 10 facturas/mes · S/39/mes",
  },
  pro: {
    nombre: `Plan ${PRECIOS_OFICIALES.pro.nombre}`,
    desc: "Cotizaciones y facturas ilimitadas · S/79/mes",
  },
  empresa: {
    nombre: "Darivo Pro Empresa",
    desc: "Producto escritorio — no es plan de suscripción",
  },
};

interface MiPlanCardProps {
  planTipo: PlanTipoPersistido;
}

export function MiPlanCard({ planTipo }: MiPlanCardProps) {
  const info = PLAN_LABELS[planTipo] ?? PLAN_LABELS.gratis;
  const esPago = planTipo === "basico" || planTipo === "pro";

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${T.purple}, #9333EA)`,
          boxShadow: `0 6px 24px ${T.purple}44`,
        }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-white/70">
          Plan actual
        </p>
        <p className="mt-1 text-2xl font-black text-white">{info.nombre}</p>
        <p className="mt-2 text-sm text-white/80">{info.desc}</p>
        {esPago && (
          <p className="mt-3 text-xs text-white/60">
            Pagos procesados por dLocal · soles (PEN)
          </p>
        )}
      </div>

      {planTipo === "gratis" && (
        <>
          <CheckoutPlanButton plan="basico" label="Suscribirme a Básico — S/39/mes" />
          <CheckoutPlanButton
            plan="pro"
            label="Suscribirme a Pro — S/79/mes"
            outline
          />
        </>
      )}

      {planTipo === "basico" && (
        <>
          <CheckoutPlanButton plan="pro" label="Mejorar a Pro — S/79/mes" />
          <CheckoutPlanButton
            plan="basico"
            ciclo="anual"
            label="Pagar anual Básico — S/390/año"
            outline
          />
        </>
      )}

      {planTipo === "pro" && (
        <CheckoutPlanButton
          plan="pro"
          ciclo="anual"
          label="Pagar anual Pro — S/790/año"
        />
      )}

      <Link
        href="/precios"
        className="text-center text-sm font-bold"
        style={{ color: T.blue }}
      >
        Comparar planes →
      </Link>
    </div>
  );
}
