/**
 * Darivo Pro Empresa — tokens escritorio
 * Fuente: 16-SISTEMA-DE-DISEÑO-EMPRESA.md §3 · §5
 */
import { T, CIERRE_ACCENT, RADII } from "./tokens";

export const EMPRESA_LAYOUT = {
  sidebarWidth: 240,
  contentPadding: 28,
  minContentWidth: 1024,
  sidebarBg: T.navy,
  contentBg: T.slate,
  headerBg: T.white,
  masSplitMain: "58%",
  masSplitSide: "42%",
  cierreAccent: CIERRE_ACCENT,
  cardRadius: RADII.card,
} as const;
