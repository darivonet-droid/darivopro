/**
 * Darivo Pro Admin — tokens de diseño propios (color + layout)
 * Fuente: imágenes oficiales de diseño aprobado en .cursor/rules/02-darivo-pro-admin/*.jpg|*.png
 * (00, 02, 03, 04, 06, 07, 08, 10, 11 — sidebar claro + acento morado/violeta #7C3AED)
 *
 * Independiente de tokens.ts (paleta exclusiva de Fable 5 / Móvil) — Admin tiene su propio
 * diseño visual, no debe reutilizar el navy/azul de Fable 5 como color de marca.
 */
import { RADII } from "./tokens";

export const ADMIN_COLORS = {
  purple: "#7C3AED",
  purpleDark: "#6D28D9",
  purplePale: "#F5F3FF",

  white: "#FFFFFF",
  sidebarBg: "#FFFFFF",
  sidebarBorder: "#E5E7EB",
  sidebarText: "#1E293B",
  sidebarTextMuted: "#64748B",
  sidebarActiveBg: "#F5F3FF",
  sidebarActiveText: "#7C3AED",

  headerBg: "#FFFFFF",
  headerBorder: "#E2E8F0",
  contentBg: "#F8FAFC",

  tableHeaderBg: "#F9FAFB",
  tableHeaderText: "#64748B",

  text: "#1E293B",
  textMid: "#64748B",
  textLight: "#94A3B8",
  slate: "#F1F5F9",
  slateD: "#E2E8F0",

  red: "#EF4444",
  redPale: "#FEF2F2",
  amber: "#F59E0B",
  amberD: "#D97706",
  amberPale: "#FFFBEB",
  green: "#10B981",
  greenD: "#059669",
  greenPale: "#ECFDF5",
} as const;

export const ADMIN_LAYOUT = {
  sidebarWidth: 256,
  contentPadding: 24,
  minContentWidth: 1024,
  sidebarBg: ADMIN_COLORS.sidebarBg,
  contentBg: ADMIN_COLORS.contentBg,
  headerBg: ADMIN_COLORS.headerBg,
  headerBorder: ADMIN_COLORS.headerBorder,
  cardRadius: RADII.card,
} as const;
