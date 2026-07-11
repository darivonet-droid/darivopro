import { PRECIOS_OFICIALES, type PlanSuscripcionOficial } from "@/lib/roles-planes-oficial";

export type CicloPrecio = "mensual" | "anual";

export interface FeaturePlan {
  texto: string;
  incluido: boolean;
}

export interface Plan {
  id: PlanSuscripcionOficial;
  nombre: string;
  precioMensual: number;
  precioAnual: number;
  destacado?: boolean;
  badge?: string;
  features: FeaturePlan[];
  cta: string;
  ctaHref: string;
  ctaOutline?: boolean;
}

/** Catálogo oficial de suscripción — 04-PANEL-ADMIN-SUSCRIPCIONES.md §6 */
export const PLANES: Plan[] = [
  {
    id: "basico",
    nombre: PRECIOS_OFICIALES.basico.nombre,
    precioMensual: PRECIOS_OFICIALES.basico.mensual,
    precioAnual: PRECIOS_OFICIALES.basico.anual,
    features: [
      { texto: "20 cotizaciones/mes", incluido: true },
      { texto: "Facturación no incluida", incluido: false },
      { texto: "PDF con tu nombre", incluido: true },
      { texto: "IGV automático", incluido: true },
      { texto: "IA por voz", incluido: false },
      { texto: "Logo personalizado", incluido: false },
      { texto: "Informes trimestrales", incluido: false },
    ],
    cta: "Empezar",
    ctaHref: "/registro",
    ctaOutline: true,
  },
  {
    id: "pro",
    nombre: PRECIOS_OFICIALES.pro.nombre,
    precioMensual: PRECIOS_OFICIALES.pro.mensual,
    precioAnual: PRECIOS_OFICIALES.pro.anual,
    destacado: true,
    badge: "MÁS USADO",
    features: [
      { texto: "Cotizaciones ilimitadas", incluido: true },
      { texto: "Facturas ilimitadas", incluido: true },
      { texto: "IA texto + voz 🎤", incluido: true },
      { texto: "Logo personalizado", incluido: true },
      { texto: "Informes trimestrales", incluido: true },
      { texto: "Compartir WhatsApp", incluido: true },
    ],
    cta: "Empezar",
    ctaHref: "/registro",
  },
  {
    id: "business",
    nombre: PRECIOS_OFICIALES.business.nombre,
    precioMensual: PRECIOS_OFICIALES.business.mensual,
    precioAnual: PRECIOS_OFICIALES.business.anual,
    badge: "PARA EQUIPOS",
    features: [
      { texto: "Todo lo de Pro", incluido: true },
      { texto: "Acceso a Darivo Pro Empresa (escritorio)", incluido: true },
      { texto: "1 Gerente + hasta 5 Técnicos", incluido: true },
      { texto: "Roles personalizados", incluido: true },
      { texto: "Técnicos adicionales", incluido: false },
    ],
    cta: "Empezar",
    ctaHref: "/registro",
    ctaOutline: true,
  },
];

export function fmtPrecio(n: number): string {
  return n.toLocaleString("es-PE");
}
