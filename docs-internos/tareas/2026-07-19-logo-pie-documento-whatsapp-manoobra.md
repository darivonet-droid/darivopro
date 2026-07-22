# Cambios en curso 19/07/2026

Pedido por Mohamed el 19/07/2026 — 3 tareas iniciales (1-3) más 1 pedido aparte el mismo día (4), ejecutadas en este orden.

### 1. [x] Logo de empresa en documentos (Cotización y Factura), compartido Móvil/Empresa — hecho 19/07/2026

**Investigación previa (obligatoria por la Regla de oro) confirmó la fuente única correcta**: hoy Móvil y Empresa YA leen el mismo dato de emisor (razon_social/ruc/direccion/telefono) desde `public.perfiles` del usuario logueado — la tabla `public.empresas` (separada, `gerente_user_id`) solo se usa en Admin para gating, nunca para poblar Cotización/Factura. Como un mismo Gerente usa la misma fila de `perfiles` sin importar si entra por Móvil o por Empresa, el campo de logo se agregó ahí (`perfiles.logo_url`), no en `empresas` — garantiza una sola fuente de verdad sin duplicar por plataforma, tal como se pidió.

**Construido:**
- **Migración** `supabase/migrations/20260719140000_perfiles_logo.sql` (SQL entregado, **sin ejecutar** — regla de BD): agrega `perfiles.logo_url text` + bucket Storage nuevo `logos` (público, a diferencia de `documentos`/`gastos-adjuntos` que son privados — necesario porque `@react-pdf/renderer` descarga la imagen server-side sin credenciales al generar el PDF) con políticas RLS por carpeta `{user_id}/...` (insert/update/select/delete). **Pendiente: Mohamed debe correr esta migración en el SQL Editor.**
- **`frontend/src/components/perfil/LogoEmpresaUploader.tsx`** (nuevo, cliente, compartido Móvil/Empresa): sube la imagen al bucket `logos` vía Supabase Storage desde el navegador, actualiza `perfiles.logo_url` con la URL pública resultante. Validaciones: solo imágenes, máx. 2MB. Botón "Quitar logo". Montado en las 2 únicas pantallas de perfil que existían (antes solo lectura): `frontend/src/app/(auth)/mas/perfil/page.tsx` (Móvil) y `frontend/src/app/empresa/mas/perfil/page.tsx` (Empresa) — no existía ningún otro lugar editable donde ponerlo (`AjustesForm.tsx`/`ConfigTabs.tsx` existen pero están huérfanos, sin ninguna ruta que los monte — no se tocaron, fuera de alcance).
- **Header de Factura** (`frontend/src/lib/pdf/FacturaPdfDocument.tsx`): ya mostraba razonSocial/dirección/teléfono desde `biz_data` (JSONB congelado en la factura al emitirse) — se agregó el `<Image>` del logo junto a esos datos. El logo específicamente se resuelve **en vivo** desde `perfiles` en `frontend/src/app/api/pdf/factura/[id]/route.ts` (no se congela como el resto de biz_data) para que subir/cambiar el logo se refleje también en facturas ya emitidas, no solo en las nuevas.
- **Header de Cotización** (`frontend/src/lib/pdf/CotizacionPdfDocument.tsx`): **no mostraba ningún dato de emisor antes** (header era solo un título estático) — se agregó bloque completo (logo + razonSocial + dirección + teléfono) leído en vivo desde `perfiles` en `frontend/src/app/api/pdf/cotizacion/[id]/route.ts`, mismo patrón que Factura.
- **`EmpresaData`** (`frontend/src/types/index.ts`) gana `logoUrl?: string | null`. `bizData` construido al emitir una Factura (`app/(auth)/facturas/nueva/page.tsx` y `app/empresa/facturas/nueva/page.tsx`) también incluye `logoUrl` desde el inicio.
- **Fallback sin romper layout**: si `logoUrl`/`razonSocial` son null, el bloque de emisor completo no se renderiza (Cotización) o solo se omite el `<Image>` (Factura, que ya mostraba "Mi empresa" por defecto) — diseño actual intacto.

**Riesgo de regresión detectado y corregido durante la implementación** (Regla de oro — no bastaba con "debería funcionar"): las 2 páginas de Perfil originalmente pedían `razon_social, telefono, logo_url` en un solo `select()`. Si la migración aún no corrió, PostgREST rechaza la consulta completa (columna inexistente) y esas pantallas dejarían de mostrar razón social/teléfono — una regresión real sobre algo que hoy funciona. Se separó en 2 consultas independientes (una para razon_social/telefono, otra tolerante a fallo solo para logo_url) para que ambas pantallas seguín funcionando igual que hoy aunque la migración no se haya corrido todavía. Los 2 endpoints de PDF (`api/pdf/factura`, `api/pdf/cotizacion`) ya eran tolerantes por diseño (Supabase JS no lanza excepción en error de query, solo `data: null`) — sin cambios necesarios ahí.

**Verificado**: `tsc --noEmit`, `next lint` (mismos 4 warnings preexistentes) y `next build` limpios (81 rutas). Servidor dev arrancado y probado sin errores en consola (`/precios` público carga bien; `/mas/perfil` redirige correctamente por no haber sesión). **No verificado en vivo con una sesión real ni con la migración corrida** (mismo bloqueo de credenciales de siempre + la migración es responsabilidad del propietario) — recomendado que Mohamed, tras correr la migración: suba un logo desde Perfil (Móvil o Empresa), confirme que aparece en el header de una Cotización y una Factura nuevas, y que una factura **ya emitida antes** de subir el logo también lo muestra al volver a abrir su PDF (por la resolución en vivo).

### 2. [x] Texto de pie de documento → "Generado con darivopro.com" — hecho 19/07/2026

Búsqueda exhaustiva del string exacto `"Generado con DARIVO PRO"` en `frontend/src` → 5 ocurrencias reales, las 5 reemplazadas: `lib/pdf/CotizacionPdfDocument.tsx:122` (header PDF), `lib/pdf/FacturaPdfDocument.tsx:263` (footer PDF), `lib/utils.ts:93` y `:115` (mensajes de WhatsApp de Cotización/Factura — compartidos Móvil+Empresa), `lib/factura-utils.ts:99` (mensaje corto de WhatsApp de Factura sin PDF). Las demás coincidencias de "DARIVO PRO" en el repo son el comentario de cabecera `// DARIVO PRO — ...` que casi todos los archivos del proyecto tienen, sin relación con el pie de documento — no se tocaron.

**Hallazgo colateral, no corregido (fuera del texto literal pedido)**: `CotizacionPdfDocument.tsx:184` dice `"Esta cotización tiene validez de 30 días desde su emisión · DARIVO PRO"` — mención de marca en el footer, pero no la frase exacta "Generado con DARIVO PRO" que se pidió cambiar. Se deja igual a la espera de confirmación explícita si también se quiere ahí "darivopro.com".

**Verificado**: `tsc`/`lint`/`build` limpios (ver Tarea 1).

### 3. [x] Eliminar envío automático a WhatsApp al guardar (bug) — hecho 19/07/2026

**Confirmado con evidencia (no solo afirmación) que el bug existía SOLO en Cotización, en ambas plataformas — Factura nunca lo tuvo**: revisado `hooks/useFactura.ts` completo y los 2 formularios de Factura — su envío a WhatsApp siempre estuvo detrás de un botón (`onClick`), nunca disparado automáticamente tras guardar.

**Eliminado**: en `components/cotizacion/NuevoCotizacionWizard.tsx` (Móvil) y `NuevoCotizacionWizardEscritorio.tsx` (Empresa), función `doSave()` — se quitó el bloque completo de auto-envío a WhatsApp que corría justo después de crear la cotización (armaba el mensaje y abría `wa.me/...` sin acción del usuario), junto con la apertura anticipada de la ventana emergente en Móvil (`abrirVentanaDiferida()`, truco para evitar el bloqueo de pop-up del navegador). `doSave()` ahora solo guarda y genera el PDF — compartir queda 100% a cargo del botón manual "📤 Compartir PDF" ya existente en la pantalla de éxito (`compartirPDF()` de `lib/share.ts`, sin tocar).

Limpieza de imports/variables que quedaron sin uso tras quitar ese bloque (`buildWAMsgCotizacion`, `abrirVentanaDiferida`/`navegarVentanaDiferida` en Móvil, `registrarEnvioWA` del hook `useCotizacion` en ambos wizards).

**Hallazgo colateral — confirmado y corregido el mismo día**: `registrarEnvioWA` (`hooks/useCotizacion.ts`) quedó sin ningún caller tras este cambio; Mohamed confirmó la limpieza y se eliminó la función completa (antes en líneas 322-337) junto con su entrada en el `return` del hook — verificado que tampoco quedaba ninguna lectura de la columna `wa_enviado_at` que escribía.

**Verificado**: `tsc`/`lint`/`build` limpios (ver Tarea 1). No verificado en vivo con guardado real de una Cotización (mismo bloqueo de credenciales) — el cambio es una eliminación quirúrgica de un bloque ya identificado con evidencia (archivo:línea), sin lógica nueva que pueda fallar de forma no obvia.

### 4. [x] Ocultar el % de mano de obra en el PDF (Cotización y Factura) — hecho 19/07/2026, pedido aparte el mismo día

Antes: el PDF mostraba "Mano de obra (40%)" — el % dejó de mostrarse, el monto en soles y el cálculo interno no cambiaron. Alcance explícito: **solo el PDF** — las vistas en pantalla dentro de la app que muestran el % por separado no se tocaron.

Búsqueda exhaustiva de "Mano de obra" en `frontend/src` → 6 ocurrencias, 3 modificadas y 3 dejadas igual a propósito:
- **Modificadas** (todas las que terminan impresas en un PDF):
  - `frontend/src/lib/pdf/CotizacionPdfDocument.tsx` — fila de totales del PDF de Cotización, único lugar donde el % se formatea específicamente para el PDF (`Mano de obra ({data.margin}%)` → `Mano de obra`).
  - `frontend/src/components/facturacion/NuevaFacturaForm.tsx` y `NuevaFacturaFormEscritorio.tsx` — al importar una Cotización aprobada a una Factura nueva, la mano de obra se agrega como línea de ítem (`items[].desc`) con el % incluido en el texto; ese mismo texto es lo que termina impreso en la tabla de ítems del PDF de Factura (Factura no tiene una fila de totales dedicada a mano de obra como Cotización — este es el único lugar donde aparece). Se quitó el % del texto (`Mano de obra (${p.margin}%)` → `"Mano de obra"`), monto sin cambios.
  - **Nota de alcance**: esta descripción de ítem es también el valor pre-llenado de un campo editable en el formulario de Nueva Factura (el usuario puede modificarlo antes de guardar) — a diferencia de Cotización, Factura no tiene un paso separado que formatee el % solo para el PDF, así que no hay forma de "ocultar solo en el PDF" sin tocar también ese pre-llenado. Se aplicó igual porque es el único mecanismo real por el que el % llega al PDF de Factura.
- **No tocadas (a propósito, son la "vista previa dentro de la app", no el PDF)**: `frontend/src/components/cotizacion/NuevoCotizacionWizard.tsx` y `NuevoCotizacionWizardEscritorio.tsx` (paso "Resumen" del wizard, en pantalla) y `frontend/src/lib/utils.ts` (texto del mensaje de WhatsApp) — las 3 siguen mostrando el % igual que antes.

**Verificado**: `tsc`/`lint`/`build` limpios (81 rutas). No verificado visualmente contra el preview de Vercel (cambio hecho en esta sesión, aún no llega a `main` — ver "Dos modos de despliegue" arriba).

---

