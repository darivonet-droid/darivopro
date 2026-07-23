# Adaptación responsive — Mi Plan, /precios, Panel Empresa, Panel Admin

**Fecha:** 23/07/2026
**Pedido por:** propietario (Mohamed), prompt "Adaptación responsive completa y pruebas funcionales".
**Rama:** `develop` → `main` ("producción autónoma" autorizada para esta tarea).

## Decisión de producto revertida (confirmada explícitamente)

`01-VISION-DEL-PRODUCTO.md` (§6, §10, §funcionalidad, líneas 149/159/366/394 antes de este cambio) documentaba que **Darivo Pro Empresa y Admin son productos exclusivamente de escritorio**, con Móvil (Fable 5) como la única superficie mobile del ecosistema — incluso con un banner activo (`AvisoDispositivoBanner.tsx`) recomendando a Gerente/Admin usar un ordenador.

El prompt pedía que Empresa y Admin "funcionen correctamente también en móvil", lo cual contradecía esa decisión. Se detuvo el trabajo y se preguntó explícitamente al propietario antes de tocar código — confirmó que sí, quiere que Empresa y Admin sean usables también desde teléfono. `01-VISION-DEL-PRODUCTO.md`, `16-SISTEMA-DE-DISEÑO-EMPRESA.md`, `02-MODULO-INICIO-EMPRESA.md` y `restriccion-dispositivo.ts` (mensaje del banner) se actualizaron para reflejar esto — ver diffs de esos archivos en este mismo commit.

También se preguntó y confirmó "producción autónoma" para esta tarea, porque el login con Google (OAuth) solo completa en `darivopro.com` (producción) — un preview de Vercel redirige a producción en vez de volver al preview — así que las pruebas funcionales con login solo son posibles una vez desplegado.

## Qué se implementó

### Navegación móvil (base de todo lo demás)
- **Nuevo:** `frontend/src/components/common/MobileNavDrawer.tsx` — hamburguesa + cajón deslizante compartido, reutiliza la misma lista de navegación que ya usaba cada sidebar de escritorio (no duplica datos de menú).
- `EmpresaShell.tsx` y `AdminShell.tsx` — antes ocultaban el sidebar por debajo de 1024px/768px respectivamente **sin ningún reemplazo** (el panel quedaba inaccesible en móvil). Ahora ambos usan `MobileNavDrawer`, breakpoint unificado a `lg` (1024px) en los dos (antes Admin usaba `md`, inconsistente), padding de header/contenido responsive.

### Página `/precios`
- **Bug real encontrado:** la ruta usa `frontend/src/app/(public)/layout.tsx`, compartido con login/registro/legales, que envolvía todo en un contenedor de **390px fijos** (pensado para formularios angostos) — en escritorio, `/precios` se veía como una columna angosta en medio de la pantalla, no coherente con el resto del panel.
- Fix: `(public)/layout.tsx` ahora calcula el ancho máximo según la ruta (`usePathname`) — 1100px solo para `/precios`, 390px sin cambios para el resto (login/registro/recuperar/legales, que sí están bien angostos por diseño). `PreciosView.tsx`: las 3 tarjetas de plan pasan de "siempre apiladas" (`flex flex-col`) a `grid grid-cols-1 lg:grid-cols-3` — apiladas en móvil, lado a lado desde escritorio.

### Mi Plan
- `MiPlanCardEscritorio.tsx` (Empresa) y `MiPlanCard.tsx` (Móvil) — revisados, ya eran responsive-safe (columnas únicas, sin anchos fijos). Sin cambios.

### 16 pantallas de Empresa + 12 de Admin
Auditadas y corregidas en paralelo (7 agentes, un archivo no se tocó por otro). Patrones corregidos, donde aparecían:
- Columnas de ancho fijo/porcentual (`flex:"1 1 58%"`/`"1 1 42%"`, `flex:"1 1 60%"`/`"1 1 40%"`, paneles con `width` fijo en px) → `flex flex-col lg:flex-row`, apiladas en móvil.
- `gridTemplateColumns: repeat(N, 1fr)` con N≥3 → `grid grid-cols-2 sm:grid-cols-N` (o similar).
- Tablas HTML sin wrapper de scroll → `overflow-x-auto` + `min-width` en la tabla.
- Grids con breakpoint pero sin columna base (ej. `grid lg:grid-cols-3` sin `grid-cols-1`/`grid-cols-2` explícito) en varias vistas de Admin (Dashboard, Productos, Catálogo Maestro, Usuarios, Soporte) — se añadió la base explícita por consistencia con el resto del código, aunque el comportamiento por defecto de CSS Grid sin columnas explícitas ya cae en una sola columna apilada (no es un bug de overflow real, es una mejora de legibilidad — ver nota abajo).

**Archivos modificados** (lista completa, además de los shells/MobileNavDrawer):
`CierreViewEscritorio.tsx`, `NuevoCotizacionWizardEscritorio.tsx`, `EmpresaClientesPanel.tsx`, `EmpresaInicioView.tsx`, `FacturasTableEmpresa.tsx`, `NuevaFacturaFormEscritorio.tsx`, `AdminCatalogoView.tsx`, `AdminProductosView.tsx`, `AdminSoporteView.tsx`, `AdminUi.tsx`, `AdminUsuariosView.tsx`, `frontend/src/app/admin/page.tsx`.

**Pantallas revisadas sin necesitar cambios** (ya eran responsive-safe desde su construcción, la mayoría por reutilizar componentes mobile-first ya compartidos con Móvil): Inicio (contenido interno salvo la tabla), Catálogo·Mis Tarifas, Empleados, Roles y Permisos, Empresa (datos), Documentos, Mi Plan, Soporte, Configuración, Darivo/IA, Cotizaciones (lista), Informe (dentro de Cierre — comparte componente con Móvil), Suscripciones, Roles Admin, Empresas, Empleados Admin, APIs, Partners, Configuración Admin.

## Nota honesta — hallazgo colateral no perseguido

Un agente reportó (y corrigió en sus 4 archivos asignados) grids `grid lg:grid-cols-N` sin columna base explícita, bajo la premisa de que causaban overflow horizontal en móvil. Verificación posterior: sin `grid-template-columns` explícito, el comportamiento por defecto de CSS Grid es una sola columna apilada (no overflow) — el mismo patrón en otros 6 archivos (`AdminEmpleadosInternosView.tsx`, `AdminEmpresasView.tsx`, `AdminPartnersView.tsx`, `AdminRolesView.tsx`, `AdminSuscripcionesView.tsx`, `ApisRegistroView.tsx`) **no está roto** — ya se apila correctamente en móvil, solo se ve como 1 columna en vez de 2 para las tarjetas KPI pequeñas. No se tocó por no ser un bug real, solo una posible mejora cosmética de consistencia — queda anotado aquí por si se quiere homogeneizar en una tarea aparte.

## Verificación

- `npm run typecheck` — ✅ verde.
- `npm run lint` — ✅ verde (mismos 2 warnings preexistentes de siempre, no relacionados).
- `npm run build` — ✅ verde.
- Merge a `main` vía PR #8, deploy de producción confirmado `READY` (`dpl_4bVF3E4xhAQyEj1FQ9GyqBDTr1pU`).

### Pruebas funcionales en vivo (post-merge, darivopro.com)

**Empresa** (`empresa.darivopro.com`, sesión Google ya abierta en Chrome) — ✅ todo probado y funcionando:
- Sidebar: 13 entradas exactas, sin "Informes" suelto.
- Cierre: 3 pestañas (Gastos/Expediente Mensual/Informe) — Informe con Semanal/Mensual/**Anual** (sin Trimestral), botón Descargar PDF presente.
- Expediente Mensual: **generación real del ZIP probada end-to-end** — "Generar expediente" → resumen con datos reales (2 cotizaciones, 0 facturas, 0 gastos de la cuenta de prueba) → "Descargar ZIP" ejecutado sin errores de consola → "Enviar a gestoría" deshabilitado como se pidió.
- Mi Plan: muestra "Plan BUSINESS", S/130/mes, S/1,300/año — precios oficiales correctos.
- Facturas, Roles y Permisos: cargan sin errores visuales, filtros/tablas se ven bien.
- Menú móvil (`MobileNavDrawer`): verificado **funcionalmente** (clic real vía JS sobre el botón oculto por CSS en escritorio — el entorno de automatización no permitió redimensionar la ventana real de Chrome a un ancho de teléfono, ver nota abajo) — el cajón abre, `aria-expanded` cambia a `true`, y las 13 entradas del menú coinciden exactamente con el sidebar.
- `/precios` (sin login): ✅ verificado visualmente en escritorio — 3 planes lado a lado, ya no la columna de 390px angosta. Verificación en viewport móvil real no realizada (misma limitación de la ventana de Chrome).

**Admin** (`darivopro.com/admin`) — ⚠️ **no se pudo probar en vivo**: la cuenta de Google activa en la sesión de Chrome de este entorno no tiene acceso a Darivo Pro Admin ("No tienes acceso a Darivo Pro Admin. Contacta al equipo Darivo..."). No se intentó cambiar de cuenta. Verificación de Admin queda respaldada solo por `build`/`lint`/`typecheck` en verde y por ser el mismo patrón (`MobileNavDrawer`, mismos breakpoints) ya verificado en vivo en Empresa — pendiente de que el propietario confirme la cuenta correcta o pruebe él mismo.

**Limitación de entorno (no es un bug del código):** la ventana de Chrome real controlada por esta sesión no respondió a los intentos de redimensionar a un ancho de teléfono (`resize_window` reportó éxito pero `window.innerWidth` no cambió) — pantalla fija de 1280×720. La verificación mobile-viewport real (pixel-perfect) de las pantallas autenticadas queda pendiente de que el propietario la haga desde su propio teléfono o achicando la ventana del navegador manualmente.
