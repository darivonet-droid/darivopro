# ✅ Resuelto — Barra flotante del wizard (Móvil) tapada por la barra de gestos de Android (17/07/2026)

Bug reportado: en el paso Selección/Partidas del wizard de cotización, la `FloatBar` ("N partida(s) seleccionada(s)" + botón Continuar) quedaba parcialmente tapada por la barra de navegación por gestos de Android (no respetaba el safe area inferior).

**Causa raíz real — no era solo `FloatBar.tsx`:** el `viewport` global del proyecto (`frontend/src/app/layout.tsx`) nunca declaraba `viewportFit: "cover"`. Sin eso, `env(safe-area-inset-*)` resuelve siempre a `0px` en **toda la app** — incluido `BottomNav.tsx`, que ya usaba `pb-[env(safe-area-inset-bottom)]` sin ningún efecto real hasta ahora.

**Corrección:**
- `layout.tsx`: `viewport.viewportFit = "cover"` añadido.
- `FloatBar.tsx`: `bottom` pasa de `20` fijo a `calc(20px + env(safe-area-inset-bottom, 0px))` — en pantallas sin barra de gestos, `env()` resuelve a `0px` y el resultado es idéntico a antes (sin regresión).
- No se tocó ninguna otra parte del wizard.

**Verificado:** `tsc --noEmit`, `next lint` (mismos warnings preexistentes) y `next build` limpios. Confirmado en el navegador que el `<meta name="viewport">` renderizado ya incluye `viewport-fit=cover`. **No verificado visualmente en un Android real con barra de gestos** — ni las herramientas de este entorno simulan el inset real, ni hay sesión autenticada disponible para llegar a esa pantalla. Recomendado que el propietario confirme en su teléfono que el botón "Continuar" queda completamente libre de la barra de gestos.

