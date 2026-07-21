# Cambios 20/07/2026 — Filtros Hoy/Semanal/Mensual, teléfono, y modelo de datos Cliente↔Cotización↔Factura

Pedido por Mohamed el 20/07/2026, en dos prompts consecutivos sobre Darivo Pro Móvil (Fable 5). El primero pidió los filtros de fecha y la validación de teléfono; el segundo (mismo día) corrigió un exceso no pedido ("Importar desde cotización") y definió una regla de negocio fija sobre el modelo de datos. `tokens.ts` no se tocó — mismos componentes/estilos de Fable 5 ya existentes.

### Regla de negocio y modelo de datos (fija, documentar aquí siempre que se toque Cliente/Cotización/Factura)

- **Identidad de Cliente**: se identifica por nombre + teléfono + dirección. Esa combinación es su ID — no cambia aunque su cotización se actualice.
- **Cliente = contenedor real de su cotización**: un cliente tiene su cotización asociada; si los montos/ítems cambian, sigue siendo la misma cotización del mismo cliente.
- **Resumen de cotización**: pantalla de solo visualización/confirmación — no guarda nada por sí misma.
- **Factura**: solo se guarda como tal cuando fue emitida por la API de SUNAT (vía BizLinks). Esa integración sigue en 0% (pendiente de contrato por escrito) — no se simula ni se asume envío a SUNAT en ningún punto de este cambio.
- **Gap honesto entre la regla y el código real, no corregido (fuera de los 9 puntos numerados del pedido, no se tocó sin pedido explícito)**: `findOrCreateCliente` (`hooks/useCotizacion.ts` y `hooks/useFactura.ts`) sigue deduplicando clientes **solo por teléfono** (`eq("telefono", tel)`), no por la combinación nombre+teléfono+dirección que pide la regla. Tampoco existe ninguna restricción en BD ni en código que limite a un cliente a una sola fila de `cotizaciones` — el schema real (`cotizaciones.cliente_id` FK, sin `UNIQUE`) sigue permitiendo múltiples cotizaciones por cliente, y el resto de la app (Ficha de cliente, contador de cotizaciones, "Re-cotizar") depende de eso. Se documenta la regla tal como la pidió el propietario; cambiar la clave de deduplicación o forzar 1:1 en BD requeriría su propia migración/decisión explícita, no asumida aquí.

### 1-3. [x] Filtros Hoy/Semanal/Mensual (Clientes, Facturas, Nueva Factura) — hecho 20/07/2026, verificado visualmente por Mohamed

Nuevo componente compartido `frontend/src/components/design-system/FiltroFechaChips.tsx` (chips toggle — tocar el activo lo desactiva, sin filtro), mismo componente en las 3 pantallas:
- **Clientes** (`(auth)/clientes/page.tsx` + `ClientesView.tsx`): filtra por fecha de la última cotización del cliente (`cotizaciones(created_at)`, máximo por cliente).
- **Facturas** (`(auth)/facturas/page.tsx` + `FacturasView.tsx`): filtra por fecha de la última factura (`facturas(...created_at)`), combinado con los chips de estado ya existentes (Todas/Emitidas/Cobradas/Pendientes).
- **Nueva Factura** (`(auth)/facturas/nueva/page.tsx` + `NuevaFacturaForm.tsx`): filtra las opciones del selector "Cliente guardado", mismo criterio (última cotización).

Nuevas funciones compartidas en `lib/utils.ts`: `cumpleFiltroFecha()` (Hoy = mismo día; Semanal/Mensual = ventana rolling de 7/30 días — interpretación propia, no había definición exacta en el pedido) y `validarTelefono()`.

### 4. [x] Eliminado "Importar desde cotización" (no pedido en ningún prompt anterior) — hecho 20/07/2026

Quitado el bloque completo (label + `<select>`) de `NuevaFacturaForm.tsx` (Móvil) **y** `NuevaFacturaFormEscritorio.tsx` (Empresa, mismo bloque duplicado ahí desde la sesión de escritorio del 14/07/2026) — sin reemplazo, tal como pidió el propietario. `aprobados`/`desdeQuote`/`importarCotizacion()` **no se eliminaron**: siguen siendo el mecanismo real detrás de "Convertir a Factura" (botón en `CotizacionesList.tsx` y banner de `FacturasView.tsx`, que navegan a `/facturas/nueva?cotizacion=<id>`) — ese flujo por URL sigue intacto, solo se quitó el `<select>` manual que permitía elegir "cualquier cotización aprobada" desde dentro del formulario.

### 5-6. [x] Autocompletado de cliente (teléfono/dirección/importe) + factura en un clic — hecho 20/07/2026

Al elegir un cliente en "Cliente guardado", `seleccionarCliente()` (`NuevaFacturaForm.tsx`) ahora también importa los ítems/mano de obra de la **última cotización de ese cliente** (mismo mecanismo que `importarCotizacion()`, ahora acepta un objeto `Cotizacion` ya resuelto en vez de buscarlo solo en `aprobados`) — sin pasos intermedios ni un segundo selector. `(auth)/facturas/nueva/page.tsx` trae la cotización completa de cada cliente (`cotizaciones(...items:cotizacion_items(*))`, la de `created_at` más reciente) vía el tipo `ClienteConUltimaCotizacion.cotizacionAsociada`. Teléfono/dirección ya se autocompletaban desde el propio registro de `clientes` (sesión anterior); lo nuevo es el importe/ítems de su cotización. **No aplicado a Empresa** (`NuevaFacturaFormEscritorio.tsx`) — el encabezado del pedido especifica "Darivo Pro Móvil"; se documenta como gap conocido en vez de inventar el mismo cambio ahí sin pedido explícito.

### 7. [x] Confirmado sin tocar — comportamiento al guardar

Guardar una cotización sigue sin redirigir a la ficha de Cliente (permanece en Resumen); compartir por WhatsApp/Gmail desde ahí no se tocó. Nada que corregir — se verifica como ya-correcto.

### 8. [x] Validación de teléfono — hecho 20/07/2026 (sesión anterior el mismo día), confirmado sin regresión

Sin cambios adicionales sobre lo ya construido: `validarTelefono()` (`lib/utils.ts`) sigue aplicada en Clientes, Ficha de cliente y Nueva Factura.

### 9. [~] Google Maps Places Autocomplete — construido, pendiente de API key real

Nuevo `frontend/src/components/design-system/DireccionAutocomplete.tsx` — mismo estilo visual que `components/ui/Input.tsx` (no se tocó ese componente compartido). Carga el script de Google Maps JS (`libraries=places`) solo si existe `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; sin esa variable, el campo funciona como texto libre normal (sin sugerencias, sin errores de consola). Restringido a `country: "pe"`. Conectado en los 2 campos de dirección reales del proyecto: `NuevaFacturaForm.tsx` (Móvil) y `ClienteFichaView.tsx` (ficha de cliente, compartida Móvil/Empresa — "Nuevo cliente" no tiene campo Dirección, solo la ficha al editar).

**⚠️ Pendiente del propietario — API key nueva, no asumida como existente:** no había ninguna key de Google Maps en el proyecto (`.env.example` sin ella, sin integración previa en código). Agregada `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=` a `.env.example` con instrucciones (habilitar "Places API" en Google Cloud Console, restringir por HTTP referrer a `darivopro.com/*`). **Sin esta key puesta en Vercel (Production + Preview), el autocompletado no sugiere nada real** — el campo queda como texto libre, que es el comportamiento actual desplegado. No verificado con sugerencias reales (no hay key en este entorno) — pendiente que Mohamed la genere y la configure.

**Verificado (bloque completo 1-9)**: `tsc --noEmit`, `next lint` (mismos 3 warnings preexistentes de `useCotizacion.ts`/`useFactura.ts`) y `next build` limpios (81 rutas). Filtros 1-3 verificados visualmente por Mohamed en producción ("filtros bien"). Puntos 4-6 y 9 no verificados visualmente por el propietario todavía en esta sesión — recomendado confirmar tras el deploy: que "Importar desde cotización" ya no aparece, que elegir un cliente con cotización guardada trae sus ítems/importe de inmediato, y que el campo Dirección sigue funcionando bien como texto libre (hasta que se configure la key real de Maps).

