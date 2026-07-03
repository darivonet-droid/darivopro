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
      { texto: "10 facturas/mes", incluido: true },
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
];

/** Darivo Pro Empresa es producto del ecosistema, NO plan de suscripción (04 §6) */
export const CONTACTO_PRODUCTO_EMPRESA = {
  titulo: "Darivo Pro Empresa",
  descripcion:
    "Entorno de escritorio para gestionar empleados, roles y permisos. Reutiliza la misma lógica de Móvil.",
  cta: "Contactar",
  ctaHref: "mailto:hola@darivo.pro?subject=Darivo%20Pro%20Empresa",
} as const;

export function fmtPrecio(n: number): string {
  return n.toLocaleString("es-PE");
}
