/**
 * DARIVO PRO — Design System Tokens
 * Fuente: 16-SISTEMA-DE-DISEÑO-FABLE5.md §3 · docs/02-darivo-pro-movil/fable-5-diseño.jsx
 */

export const T = {
  navy: "#0A1628",
  navyMid: "#0D1E35",
  navyLight: "#112240",
  blue: "#2563EB",
  blueL: "#3B82F6",
  bluePale: "#EFF6FF",
  blueDark: "#1D4ED8",
  white: "#FFFFFF",
  slate: "#F1F5F9",
  slateD: "#E2E8F0",
  slateDD: "#CBD5E1",
  text: "#1E293B",
  textMid: "#64748B",
  textLight: "#94A3B8",
  green: "#10B981",
  greenD: "#059669",
  greenPale: "#ECFDF5",
  amber: "#F59E0B",
  amberD: "#D97706",
  amberPale: "#FFFBEB",
  red: "#EF4444",
  redPale: "#FEF2F2",
  purple: "#7C3AED",
  purplePale: "#F5F3FF",
  teal: "#0D9488",
  tealPale: "#F0FDFA",
  brown: "#92400E",
} as const;

/** Colores fijos externos — Fable 5 §3.4 */
export const WHATSAPP = {
  icon: "#25D366",
  text: "#128C7E",
} as const;

/** Módulo Cierre — acento morado Empresa §3 */
export const CIERRE_ACCENT = "#6D28D9";

/** Mobile First — Fable 5 §2.1 */
export const MOBILE_MAX_WIDTH = 390;

export const RADII = {
  card: 14,
  cardLg: 16,
  button: 12,
  buttonLg: 16,
  pill: 20,
  header: 26,
  modal: 22,
  tabPill: 14,
} as const;

export const SHADOWS = {
  primaryBtn: "0 4px 16px rgba(37,99,235,0.45)",
  primaryBtnLg: "0 6px 24px rgba(37,99,235,0.40)",
  nav: "0 -4px 20px rgba(0,0,0,0.06)",
  toast: "0 4px 24px rgba(0,0,0,0.4)",
  cardElevated: "0 2px 16px rgba(10,22,40,0.08)",
} as const;

export const TYPO = {
  fontFamily: 'var(--font-inter), "Inter", system-ui, sans-serif',
  navLabel: { fontSize: 10, fontWeight: 800 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.45,
    textTransform: "uppercase" as const,
  },
  screenTitle: { fontSize: 20, fontWeight: 900 },
  body: { fontSize: 14, fontWeight: 600 },
} as const;

export const GRADIENTS = {
  header: `linear-gradient(160deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
  primary: `linear-gradient(135deg, ${T.blue}, ${T.blueL})`,
  success: `linear-gradient(135deg, ${T.green}, ${T.greenD})`,
  ia: `linear-gradient(135deg, ${T.purple}, #9333EA)`,
  cierre: `linear-gradient(135deg, ${T.navy}, ${CIERRE_ACCENT})`,
} as const;

/** Opacidad chip estado — Fable 5 §3.3 */
export function chipBg(color: string): string {
  return `${color}18`;
}

export const CAP_COLORS: Record<string, string> = {
  albanileria: T.amber,
  fontaneria: T.teal,
  electricidad: "#D97706",
  pintura: T.blue,
  carpinteria: T.brown,
  climatizacion: T.purple,
};

export const STATUS_COLORS: Record<string, string> = {
  Borrador: T.textMid,
  "Pendiente de firma": T.amber,
  Aprobado: T.green,
};

export const INV_STATUS_COLORS: Record<string, string> = {
  Pendiente: T.amber,
  Emitida: T.blue,
  Cobrada: T.green,
};
