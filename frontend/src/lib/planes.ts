export type CicloPrecio = "mensual" | "anual";

export interface FeaturePlan {
  texto: string;
  incluido: boolean;
}

export interface Plan {
  id: "basico" | "pro" | "empresa";
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

export const PLANES: Plan[] = [
  {
    id: "basico",
    nombre: "BÁSICO",
    precioMensual: 39,
    precioAnual: 390,
    features: [
      { texto: "20 presupuestos/mes", incluido: true },
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
    nombre: "PRO",
    precioMensual: 79,
    precioAnual: 790,
    destacado: true,
    badge: "MÁS USADO",
    features: [
      { texto: "Presupuestos ilimitados", incluido: true },
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
    id: "empresa",
    nombre: "EMPRESA",
    precioMensual: 129,
    precioAnual: 1290,
    features: [
      { texto: "Todo lo de Pro", incluido: true },
      { texto: "Facturación SUNAT", incluido: true },
      { texto: "Múltiples usuarios", incluido: true },
      { texto: "Soporte prioritario", incluido: true },
    ],
    cta: "Contactar",
    ctaHref: "mailto:hola@darivo.pro?subject=Plan%20Empresa%20DARIVO%20PRO",
    ctaOutline: true,
  },
];

export function fmtPrecio(n: number): string {
  return n.toLocaleString("es-PE");
}
