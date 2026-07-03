/**
 * Darivo Pro Admin — tokens de layout escritorio
 * Fuente: 00-PANEL-ADMIN-DASHBOARD.md · 16-SISTEMA-DE-DISEÑO-EMPRESA.md §5 (referencia Admin)
 */
import { T, RADII } from "./tokens";

export const ADMIN_LAYOUT = {
  sidebarWidth: 256,
  contentPadding: 24,
  minContentWidth: 1024,
  sidebarBg: T.navy,
  contentBg: T.slate,
  headerBg: T.white,
  headerBorder: T.slateD,
  cardRadius: RADII.card,
} as const;
