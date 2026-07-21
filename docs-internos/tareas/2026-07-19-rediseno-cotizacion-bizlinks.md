# Rediseño de Cotización (modelo Bizlinks) + flujo a Factura — 19/07/2026

Pedido por Mohamed el 19/07/2026, con un PDF de referencia real de Bizlinks (proveedor de facturación electrónica SUNAT) adjunto **solo como modelo visual de campos** — NUNCA se tocó el generador de Factura (`frontend/src/lib/pdf/FacturaPdfDocument.tsx`) ni su ruta (`frontend/src/app/api/pdf/factura/[id]/route.ts`).

**⚠️ Nota permanente, no borrar**: el diseño de la Factura real (comprobante SUNAT: caja R.U.C/ELECTRÓNICA/FACTURA, hash, QR, "Representación Impresa..." de Bizlinks, etc.) lo define y entrega la **API de Bizlinks** cuando se integre — no se puede modificar desde este lado bajo ninguna circunstancia. Todo lo de este bloque es exclusivamente sobre el PDF de **Cotización** (documento propio de Darivo Pro, sin restricción SUNAT), usando el PDF de Bizlinks solo como inspiración de estructura de columnas/totales.

### 1. [x] Tabla de ítems de Cotización con columnas estilo Bizlinks

`frontend/src/lib/pdf/CotizacionPdfDocument.tsx`: tabla `Partida/Cant./P. Unit./Subtotal` → `Ítem | Código | Descripción | Und. | Cantidad | V. Unitario | P. Unitario | Descuento | Valor Venta`, 9 columnas, secciones por categoría intactas (ej. "ALBAÑILERÍA"). Mapeo de datos:
- **Código** = `cotizacion_items.svc_id` (ya existía en BD desde el baseline, `NOT NULL` — solo faltaba pedirlo en el `select()` de `frontend/src/app/api/pdf/cotizacion/[id]/route.ts` y exponerlo en `CotizacionItemRow`; no hizo falta ninguna migración). Es el slug interno de la partida (ej. `alb-tarrajeo`), no un código corto estilo "OSEMANTO" del ejemplo Bizlinks — no existe ese formato en el catálogo hoy.
- **V. Unitario** = precio unitario actual (sin IGV, sin cambios). **P. Unitario** = V. Unitario × 1.18, calculado solo para mostrar (IGV incluido por unidad, igual que el modelo) — no altera el motor de cálculo real.
- **Descuento** = `0.00` fijo — no existe concepto de descuento por ítem en Cotización hoy; se muestra igual que Op. Inafecta/Exonerada/Exportación de la Tarea 2 (columnas del modelo sin dato real detrás todavía).
- **Valor Venta** = `subtotal` ya existente, sin cambios.

### 2. [x] Desglose de IGV + monto en letras en totales de Cotización

Bloque `Materiales y partidas / Mano de obra / TOTAL` → `Op. Gravada | I.G.V (18%) | Op. Inafecta | Op. Exonerada | Op. Exportación | Importe Total`, mismo archivo. **Op. Gravada = `total_final`** (ya era la base pre-IGV — materiales+partidas+mano de obra — confirmado con evidencia: es exactamente lo que ya usa `hooks/useFactura.ts` al convertir una Cotización aprobada en Factura real, "cotizacion.totalFinal is the pre-IGV base", así que el desglose nuevo es consistente con la factura que eventualmente se emita desde la misma cotización). IGV = Op. Gravada × 18%. Inafecta/Exonerada/Exportación = `0.00` fijo (no existen esos regímenes en Cotización). Importe Total = Op. Gravada + IGV.

**Línea "SON: ... SOLES"**: no existía ninguna función de número→letras en el proyecto (búsqueda exhaustiva confirmada antes de escribir código nuevo) — creada `frontend/src/lib/numero-a-letras.ts` (`montoALetras()`, sin dependencias externas), verificada con el propio monto de ejemplo del PDF de Bizlinks (`436.60` → `"CUATROCIENTOS TREINTA Y SEIS CON 60/100 SOLES"`, coincide carácter por carácter) más 10 casos límite (miles, cien mil, millón, veintiuno, cero, céntimos).

### 3. [x] Confirmado: ningún elemento exclusivo de Bizlinks/SUNAT existe en Cotización

Revisado el archivo completo tras el rediseño — Cotización nunca tuvo, y sigue sin tener, ninguno de los 6 elementos a excluir: caja "R.U.C N°/ELECTRÓNICA/FACTURA/F004-...", "Observaciones de SUNAT", "Información Adicional" con cuenta bancaria, "Autorizado a ser emisor electrónico...", "Representación Impresa... consulte en https://sfe.bizlinks.com.pe", Código Hash/QR. Nada que quitar — confirmado por lectura directa, no por suposición.

### 4. [x] Header/footer de Cotización

Header ya decía `Generado con darivopro.com · {fecha}` (corregido en un cambio anterior el mismo día) — confirmado, sin cambios. Footer: `"...validez de 30 días... · DARIVO PRO"` → `"...validez de 90 días desde su emisión · darivopro.com"` — de paso corrige el hallazgo colateral de "· DARIVO PRO" que había quedado pendiente de una tarea anterior del mismo día.

### 5. [x] Flujo "Convertir a Factura" con revisión obligatoria antes de emitir

**Investigación previa confirmó que ya existía la mayor parte** (evitó reconstruir desde cero): `?cotizacion=<id>` como query param ya estaba soportado en ambas rutas "Nueva factura" (Móvil y Empresa), y `NuevaFacturaForm.tsx`/`NuevaFacturaFormEscritorio.tsx` ya tenían `importarCotizacion()` pre-llenando cliente/ítems/cantidades/precios en un formulario 100% editable — la Cotización original nunca se toca (solo se lee, nunca se escribe sobre `cotizaciones`). Esto YA actúa como pantalla de revisión: nada se emite hasta que el usuario confirme el formulario.

**El único hueco real**: `frontend/src/components/cotizacion/CotizacionesList.tsx` (lista compartida Móvil/Empresa) tenía un modo `facturarMode="directo"` (por defecto, usado en la lista global de Cotizaciones de Móvil, `/cotizaciones`) que creaba la factura **al instante, sin ningún paso de revisión**, vía `convertirDesdeCotizacion()` (`hooks/useFactura.ts`). Esto violaba directamente el requisito de "solo al confirmar en la pantalla de revisión se dispara la emisión real".

**Corregido**: eliminado el modo `"directo"` por completo — ahora `CotizacionesList` solo tiene un comportamiento, siempre navega al formulario editable (`convertirAFactura()`, antes `hacerFactura()`). Botón renombrado de "→ Factura" a **"Convertir a Factura"**, y ahora solo visible para cotizaciones en estado **Aprobado** (antes aparecía para cualquier estado, incluida Borrador) — coincide con el alcance pedido ("en Cotizaciones aprobadas") y con que el propio combo de "Importar desde cotización" del formulario ya solo lista Aprobadas. `convertirDesdeCotizacion()` (85 líneas, único caller era el modo "directo" que se acaba de eliminar) se borró completa de `hooks/useFactura.ts` — no se pierde ninguna funcionalidad: numeración de comprobante, `from_quote_id` (trazabilidad) y vínculo de cliente ya los cubre el flujo normal de `crear()` que usa el formulario.

**Interpretación de "descuento" (aclarado, no construido como feature nueva)**: la tarea menciona "cambiar el descuento a su criterio" como ejemplo de edición libre en la revisión — hoy `LineaFactura` (tipo de ítem de Factura) no tiene ningún campo de descuento real (confirmado, `desc/cantidad/pu/subtotal` únicamente). No se construyó un sistema de descuento nuevo (fuera de alcance sin pedido explícito aparte) — el requisito de "poder editar cualquier campo antes de emitir" ya se cumple para todos los campos que sí existen (cliente, ítems, cantidades, precios).

**Verificado**: `tsc`/`lint` limpios (1 warning menos que antes de este bloque — `useFactura.ts` perdió una de sus 2 advertencias preexistentes de `react-hooks/exhaustive-deps` al eliminarse la función que la disparaba) y `next build` limpio. No verificado visualmente contra el preview de Vercel — cambios de esta sesión, aún en `develop`, no en `main`.

---

