# Verificación real: ¿Empresa está migrada a ADMIN_COLORS? — 22/07/2026

Mohamed reportó que en la práctica el panel Empresa "todavía no tiene el diseño de Admin adaptado", contradiciendo la entrada de `CLAUDE.md` ("Empresa — 9/9 pantallas ... migradas a `ADMIN_COLORS`") y el cierre de `2026-07-13-auditoria-md-codigo-empresa.md` ("Migración de Empresa a `ADMIN_COLORS` completa"). Verificación solo lectura, código real (rama `develop`, commit `08cfc40` confirmado ancestro de `origin/main` vía `git merge-base --is-ancestor` — el fix sí está desplegado, no es un problema de branch sin mergear).

**Regla de oro aplicada**: no se confió en `CLAUDE.md` ni en el cierre de la tarea anterior — cada fila de la tabla se verificó contra el archivo fuente real, contando usos literales de `ADMIN_COLORS.*` vs. `T.blue`/`T.navy`/`T.bluePale` (tokens Fable 5) y revisando los `import` de cada pantalla para detectar componentes compartidos con Móvil que arrastran color sin migrar.

## Resultado: la entrada de `CLAUDE.md` era incorrecta

*(Diagnóstico inicial de esta sesión, antes del cierre — ver "Cierre 22/07/2026" más abajo: los 4 gaps de esta tabla ya están corregidos.)*

**No son 9/9.** Son **5/9 completamente migradas**, **1/9 prácticamente sin migrar** (IA) y **3/9 parciales** (el shell ya es `ADMIN_COLORS`, pero el contenido central sigue en azul Fable 5 porque reutiliza un componente compartido con Móvil que nunca se tocó). El cierre del 14/07/2026 documentó correctamente la excepción de `ClienteFichaView.tsx` en Clientes, pero **no detectó** los otros tres arrastres (IA, Más, Cierre/Expediente) — de ahí la discrepancia que notó Mohamed: son justo las pantallas donde el usuario ve más azul que morado.

| # | Pantalla | Estado real | Evidencia |
|---|---|---|---|
| 02 | Inicio | ✅ Migrada | `EmpresaInicioView.tsx` — 34 usos de `ADMIN_COLORS.*`, 0 de `T.blue`/`T.navy`, sin imports de componentes compartidos con Móvil. |
| 03 | Clientes | ⚠️ Parcial | Lista/panel: `EmpresaClientesPanel.tsx` — 22 usos de `ADMIN_COLORS.*`, migrada. Pero la ficha de detalle reutiliza `components/clientes/ClienteFichaView.tsx` (compartido con Móvil, **0 usos de `ADMIN_COLORS`**), con `T.bluePale`/`T.blue`/`T.navy` literales en líneas 146, 154-156, 208, 220, 237 (tarjetas de estadística, botones de contacto, avatar). Ya documentado como decisión intencional en el cierre del 14/07 ("por diseño"), pero no reflejado en la línea resumen de `CLAUDE.md`. |
| 05 | Cotizaciones | ✅ Migrada | `NuevoCotizacionWizardEscritorio.tsx` — 109 usos de `ADMIN_COLORS.*`, 0 de `T.blue`/`T.navy`. Solo reutiliza hooks de lógica de Móvil (`useCotizacion`, `useCatalogo`, etc.), ningún componente de UI compartido. |
| 06 | Facturas | ✅ Migrada | `FacturasTableEmpresa.tsx` (40 usos) + `NuevaFacturaFormEscritorio.tsx` (95 usos) de `ADMIN_COLORS.*`, 0 de `T.blue`/`T.navy`. `PaginacionLista` (compartido) usa `Button variant="ghost"`, no la variante `secondary` que sí lleva `T.navy` — sin impacto visual real. |
| 07 | Más | ⚠️ Parcial | `app/empresa/mas/page.tsx` (wrapper) migrado, pero renderiza dos componentes compartidos con Móvil sin migrar: `MasTabs.tsx` — botón "Guardar" del editor de tarifas con `background: linear-gradient(135deg,${T.blue},${T.blueL})` (línea 186); `MasOpcionesList.tsx` (panel fijo "Más opciones" a la derecha, visible siempre) — tarjetas "Perfil del usuario" y "Darivo Pro Empresa" con `color: T.blue, bg: T.bluePale` (líneas 21-22 y 79-80). |
| 08 | IA (Calculadora inteligente) | ❌ No migrada (contenido principal) | `app/empresa/ia/page.tsx` solo migra 1 línea de texto (`ADMIN_COLORS.textMid`, un subtítulo). El contenido real de la pantalla — las 3 tarjetas Escribir/Hablar/Soporte — es `components/cotizacion/IACotizacionFlow.tsx`, **0 usos de `ADMIN_COLORS`**, con `T.blue`/`T.bluePale` en líneas 283, 294, 309 (ring de foco, fondo de botón, fondo de tarjeta). Es la pantalla donde más se nota el azul de Fable 5, porque ocupa prácticamente toda la vista. |
| 09 | Cierre | ⚠️ Parcial | `CierreViewEscritorio.tsx` (pestaña Gastos) — 83 usos de `ADMIN_COLORS.*`, migrada. Pero la pestaña "Expediente" (línea 126) renderiza `components/informes/InformesTab.tsx` (compartido con Móvil, sin migrar), cuyo selector de sub-pestaña activa usa `background: T.blue, color: T.white` (línea 45). |
| 10 | Empleados | ✅ Migrada | `EmpresaEmpleadosView.tsx` — 47 usos de `ADMIN_COLORS.*`, 0 de `T.blue`/`T.navy`; importa `AdminBadge` de `components/admin/AdminTabs.tsx` (ya en `ADMIN_COLORS`), coherente. |
| 11 | Roles y Permisos | ✅ Migrada | `RolesPermisosView.tsx` — 74 usos de `ADMIN_COLORS.*`, 0 de `T.blue`/`T.navy`. |

Chrome base (`EmpresaShell.tsx` — 13 usos de `ADMIN_COLORS.*` en sidebar/header, y `lib/design-system/empresa-tokens.ts` — `EMPRESA_LAYOUT.sidebarBg/contentBg/headerBg` mapeados a `ADMIN_COLORS`) sí está migrado en las 9 pantallas sin excepción — el sidebar y el header siempre son morado/blanco. Lo que falla es el **contenido central** de 4 de las 9, no el shell.

No se tocó `CIERRE_ACCENT` ni `INV_STATUS_COLORS` (paletas funcionales de categoría/estado, correctamente fuera de alcance, tal como documentó el cierre del 14/07).

## Corrección aplicada

- `CLAUDE.md` (sección ESTADO REAL DEL PROYECTO): la línea de Empresa se corrigió dos veces en la misma sesión — primero para reflejar el hallazgo real (5/9 completas, 4/9 parciales), después para reflejar el cierre (9/9, con nota de que los 5 componentes compartidos usan el patrón `esEmpresa`).
- `docs-internos/tareas/2026-07-13-auditoria-md-codigo-empresa.md`: la nota de cierre "Migración de Empresa a `ADMIN_COLORS` completa (14/07/2026)" se corrigió para dejar constancia de que fue incompleta en su momento (detectó y resolvió el shell y 5 pantallas de contenido, pero no los 3 arrastres de componentes compartidos con Móvil en Más/IA/Cierre — Clientes-ficha sí estaba correctamente documentado como excepción intencional), y se anotó el cierre real del mismo 22/07/2026.

## Cierre 22/07/2026 (mismo día) — decisión de Mohamed y migración aplicada

Decisión de Mohamed: los 5 componentes compartidos migran a `ADMIN_COLORS` **solo cuando se renderizan dentro de Empresa**, gateado por una prop `esEmpresa?: boolean` (mismo patrón booleano ya usado en `MasOpcionesList.tsx`, que ya tenía `esEmpresa` para reescribir hrefs). Móvil no cambia — se verificó por código, no por suposición, que ningún punto de entrada de Móvil pasa `esEmpresa`.

| Componente | Líneas migradas | Punto de entrada Empresa (pasa `esEmpresa`) | Puntos de entrada Móvil (sin `esEmpresa`, verificado) |
|---|---|---|---|
| `ClienteFichaView.tsx` | 146, 154-156, 208, 220, 237 (+ hallazgo adicional: botón "Guardar" del form de edición, antes usaba el gradiente azul por defecto del `Button` compartido — corregido con `style` inline, sin tocar `Button.tsx`) | `EmpresaClientesPanel.tsx:245` | `app/(auth)/clientes/[id]/page.tsx:111` |
| `MasTabs.tsx` | 186 (botón "Guardar" de `TarifasEditTab`, un componente separado sin props — se le agregó `esEmpresa` para poder recibirlo) | `app/empresa/mas/page.tsx:29` | `app/(auth)/mas/page.tsx:23` |
| `MasOpcionesList.tsx` | 21-22 ("Perfil del usuario"), 79-80 ("Darivo Pro Empresa", solo se renderiza si además `esBusiness`, no ocurre hoy desde Empresa — gateado igual por consistencia futura) | `app/empresa/mas/page.tsx:46` (ya tenía `esEmpresa`) y `MasTabs.tsx:98` (interno, hereda `esEmpresa` del padre) | `components/mas/MasTabs.tsx:98` (rama Móvil, sin `esEmpresa`) |
| `IACotizacionFlow.tsx` | 283 (ring de foco), 294 (botón "Generar cotización"), 309 (círculo de escucha) | `app/empresa/ia/page.tsx:15` | `app/(auth)/ia/page.tsx:22` |
| `InformesTab.tsx` | 45 (selector de sub-pestaña activa) | `components/cierre/CierreViewEscritorio.tsx:126` | `components/ajustes/ConfigTabs.tsx:57`, `components/informes/InformesMasPageClient.tsx:15` |

Verificación técnica: `tsc --noEmit` limpio, `next lint` sin warnings nuevos (solo 3 warnings preexistentes de `react-hooks/exhaustive-deps` en `useCotizacion.ts`/`useFactura.ts`, no tocados), `next build` limpio (70+ rutas, incluida `/empresa/ia`, `/empresa/mas`, `/empresa/cierre`, `/empresa/clientes`). **Verificación visual interactiva no realizada en esta sesión** (regla del proyecto: verificar siempre en Vercel con sesión real, nunca con dev server local) — pendiente de que Mohamed la confirme tras el próximo deploy a `main`, igual que se hizo con Cotizaciones/Facturas/Cierre el 14/07/2026.

**Hallazgos adicionales fuera de alcance de esta tarea (no corregidos, solo reportados):**
- `components/informes/InformeSemanal.tsx`, `InformeMensual.tsx` e `InformeTrimestral.tsx` (renderizados dentro de `InformesTab.tsx`, que a su vez se usa en Cierre/Expediente) tienen bastante más azul/navy hardcodeado sin migrar (barras de gráfico, tarjetas de totales, textos) — no están entre los 5 componentes autorizados en este prompt, no se tocaron.
- `components/ui/Button.tsx` variant `"primary"` (por defecto) sigue usando el gradiente azul de Fable 5 (`GRADIENTS.primary`) — es un componente global compartido por decenas de pantallas de Móvil, fuera de alcance total. Donde `Button` con variant por defecto aparece dentro de uno de los 5 componentes migrados (`ClienteFichaView.tsx`), se corrigió con un `style` inline específico de esa instancia, sin tocar el componente compartido.
