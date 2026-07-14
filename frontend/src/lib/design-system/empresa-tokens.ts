/**
 * Darivo Pro Empresa — tokens escritorio
 * Fuente: 16-SISTEMA-DE-DISEÑO-EMPRESA.md §3 · §5
 *
 * Empresa reutiliza el sistema de diseño oficial de Admin (ADMIN_COLORS, sidebar
 * blanco + acento morado) — migrado 14/07/2026 para cerrar el hallazgo raíz de
 * color detectado en la auditoría MD↔código del 13/07/2026 (Empresa arrastraba
 * el navy/azul de Fable 5, igual que Admin antes de su propio fix). No se toca
 * CIERRE_ACCENT (paleta funcional de categorías de gasto, no de marca).
 */
import { CIERRE_ACCENT, RADII } from "./tokens";
import { ADMIN_COLORS } from "./admin-tokens";

export const EMPRESA_LAYOUT = {
  sidebarWidth: 240,
  contentPadding: 28,
  minContentWidth: 1024,
  sidebarBg: ADMIN_COLORS.sidebarBg,
  contentBg: ADMIN_COLORS.contentBg,
  headerBg: ADMIN_COLORS.headerBg,
  masSplitMain: "58%",
  masSplitSide: "42%",
  cierreAccent: CIERRE_ACCENT,
  cardRadius: RADII.card,
} as const;
