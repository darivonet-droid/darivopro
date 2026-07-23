# 09 – MÓDULO CIERRE – DARIVO PRO EMPRESA

**Versión:** 1.1

**Changelog:**
- v1.1 (23/07/2026) — Reorganización pedida por el propietario: el módulo "Informes" (antes entrada directa del sidebar, `07-MODULO-MAS-EMPRESA.md` §5.3) se retira de ahí y se integra como 3ª pestaña de Cierre (§7). Periodicidad Semanal/Mensual/Anual (antes Trimestral en código, desalineado con esta MD). §6 (Expediente Mensual) corregido para reflejar el comportamiento real: solo ZIP descargable (facturas SUNAT en PDF + gastos en CSV + resumen), sin "Ver expediente" ni exportación PDF/Carpeta organizada separadas — no documentadas como implementadas hasta que existan. Envío a gestoría: pendiente, fuera de alcance de esta versión.
- v1.0 (02/07/2026) — Versión original.

**Estado:** ✅ Producción completada — imagen oficial (fase global §7 — 02/07/2026). ⚠️ Pendiente verificación visual de los cambios de v1.1 (ver §15).

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §5, §15, §17 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.5 · `01-darivo-pro-movil/09-MODULO-CIERRE.md` v2.0

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **Módulo Cierre** en Darivo Pro Empresa.

> **Lógica de negocio:** exclusivamente `01-darivo-pro-movil/09-MODULO-CIERRE.md`. Este MD documenta diseño, navegación y presentación escritorio.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/09-MODULO-CIERRE.md` v2.0 | Pestañas, gastos, IA, expediente, exportación, categorías |
| Estrategia | `01-VISION-DEL-PRODUCTO.md` §15, §17 | Objetivo, expediente mensual, gestión documental |
| Referencia diseño escritorio | `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` v1.0 | Pestañas, cards resumen, layout área principal |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | Sidebar, header, tablas, §6.5 |
| Facturas Empresa | `06-MODULO-FACTURAS-EMPRESA.md` v1.0 | Facturas incluidas en expediente mensual |

> **Sin MD Admin equivalente** del Módulo Cierre. Admin no documenta cierre de empresa cliente.

**Informe módulo anterior (Facturas):** ✅ Diseño documental aprobado — imagen pendiente fase global (§14 `06-MODULO-FACTURAS-EMPRESA.md`).

**Referencia visual Móvil (no sustituye imagen Empresa):** `01-darivo-pro-movil/09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png` — acentos morados/violetas y estructura de pestañas.

---

# 1. Objetivo

Módulo compartido **Cierre** en escritorio: registro de **gastos**, **expediente mensual** del período, **exportación** para la gestoría e **informe** de actividad (`01-VISION-DEL-PRODUCTO.md` §15).

Equivalente funcional Móvil: pestañas **Gastos** y **Expediente Mensual** (Móvil §5–§12). La pestaña **Informe** (§7) es exclusiva de Empresa — reutiliza el mismo componente que Móvil usa en Más → Informes, sin cambiar la lógica de negocio.

**Acceso:** sidebar posición **Cierre** (5) · equivalente Móvil bottom nav posición 5.

ADN: rapidez, simplicidad, IA invisible, mínimos clics (Visión §15 · Móvil §1).

No define Base de Datos, APIs, permisos granulares ni arquitectura técnica.

---

# 2. Imagen oficial

**Archivo:** `09 - MODULO CIERRE - DARIVO PRO EMPRESA.png`

![Módulo Cierre — Darivo Pro Empresa](./09%20-%20MODULO%20CIERRE%20-%20DARIVO%20PRO%20EMPRESA.png)

**Estado:** ✅ Imagen oficial generada (fase global §7 — 02/07/2026).

Cuando exista, prevalecerá siempre este MD ante cualquier diferencia con la imagen.

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | Posición **Cierre** (5) |
| Pestañas superiores | **Gastos** · **Expediente Mensual** · **Informe** (23/07/2026) |
| Equivalente Móvil | Bottom nav posición 5 → solo Gastos y Expediente Mensual (Móvil §5) |

Las pestañas **Gastos** y **Expediente Mensual** son **funcionalmente idénticas** a Móvil; solo cambia la presentación escritorio. **Informe** (§7) es exclusiva de esta capa Empresa.

`/empresa/informes` (ruta directa anterior, 22/07/2026–23/07/2026) queda como redirección a `/empresa/cierre?tab=informe`, no se elimina.

---

# 4. Layout general (escritorio)

Área de contenido con **pestañas horizontales** bajo el header (patrón Admin Dashboard §5 · Sistema Diseño §5.2).

**Acentos visuales:** tonos **morados/violetas** en tarjetas destacadas, pestaña activa y acciones principales — coherente con Móvil §3 y referencia visual Móvil §2.

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — Cierre · notificaciones · usuario      │
│  240px      ├──────────────────────────────────────────────────┤
│             │  PESTAÑAS: [ Gastos ] [ Expediente Mensual ] [ Informe ] │
│  Cierre ●   ├────────────────────────┬─────────────────────────┤
│             │  COLUMNA PRINCIPAL ~58%│  PANEL LATERAL ~42%     │
│             │  (contenido pestaña)   │  (detalle / resumen)    │
└─────────────┴────────────────────────┴─────────────────────────┘
```

* En **Gastos**, el panel lateral muestra el flujo **Revisar gasto** (pasos Documento → Información → Revisar → Guardar) cuando hay registro activo; vacío en reposo.
* En **Expediente Mensual**, el panel lateral muestra resumen del período, estado «¡Expediente listo!» y la descarga del ZIP tras generar.
* En **Informe** (§7) no hay panel lateral con detalle/resumen — usa el layout de una sola columna del antiguo módulo Informes (tarjeta blanca centrada, máx. 720px).

---

# 5. Pestaña — Gastos

Equivalente funcional Móvil §6–§9.

## 5.1 Header de pestaña

| Elemento | Descripción | Origen |
|----------|-------------|--------|
| Título | «Gastos» | Móvil §5 |
| Subtítulo | *Registra y gestiona todos tus gastos* | Móvil §5 |

## 5.2 Columna principal — Registrar gasto

Tarjeta destacada fondo **oscuro/morado** (Móvil §6.1):

| Elemento | Contenido |
|----------|-----------|
| Título | **Registrar gasto** |
| Iconografía | Cámara + asistencia **IA** |
| Texto | *La IA analizará tu documento automáticamente* |

### Orígenes de registro (botones)

| Botón | Acción |
|-------|--------|
| **Tomar fotografía** | Captura cámara |
| **Seleccionar imagen** | Galería / archivo imagen |
| **Subir documento PDF** | Selector PDF |
| **Registro manual** | Formulario sin IA |

Flujo oficial (Móvil §6.2):

```
Origen → IA (si aplica) → Extracción → Validación usuario → Guardar → Documento asociado → Gastos recientes
```

## 5.3 Columna principal — Gastos recientes

Sección **Gastos recientes** con enlace **Ver todos** (Móvil §6.3).

Presentación escritorio: **tabla** (Sistema Diseño §5.3) en lugar de cards móviles:

| Columna | Contenido |
|---------|-----------|
| Categoría | Categoría del gasto |
| Proveedor | Nombre emisor |
| Fecha | Fecha del gasto |
| Importe | **S/** (soles — nunca €) |
| Estado | Ej. **Aprobado** |
| Acción | Seleccionar → abre panel lateral §5.4 |

Clic en fila → carga flujo revisar en panel lateral.

## 5.4 Panel lateral — Revisar gasto

Equivalente flujo por pasos Móvil §7:

| Paso | Etiqueta |
|------|----------|
| 1 | Documento |
| 2 | Información |
| 3 | Revisar |
| 4 | Guardar |

**Step indicator** horizontal en cabecera del panel.

Contenido:

* Vista previa del documento analizado.
* Mensaje: **Documento analizado** — *La IA ha extraído la información automáticamente*.
* Campos editables (Móvil §7):

| Campo | Descripción |
|-------|-------------|
| Proveedor | Emisor del gasto |
| Fecha | Fecha documento |
| Categoría | Oficial o personalizada (§8–§9) |
| Método de pago | Forma de pago |
| Total | Importe S/ |
| Descripción | Texto descriptivo |

Campos adicionales si existen en documento: impuestos, moneda, número de documento.

| Botón | Acción |
|-------|--------|
| **Continuar** | Primario morado — avance entre pasos |
| **Guardar** | Primario — paso final |

## 5.5 Categorías (referencia Móvil §8–§9)

**Oficiales (no eliminables):** Materiales · Herramientas · Combustible · Transporte · Alimentación · Servicios · Otros.

**Personalizadas:** crear · modificar · desactivar — solo empresa; no afectan otras empresas ni categorías oficiales.

---

# 6. Pestaña — Expediente Mensual

Equivalente funcional Móvil §10–§12.

## 6.1 Columna principal

### Tarjeta principal (morada)

| Elemento | Contenido |
|----------|-----------|
| Título | **Expediente mensual** |
| Iconografía | Carpeta + **IA** |
| Texto | *Genera automáticamente toda la documentación de tu actividad* |

### Selectores de período (Móvil §10.2)

| Selector | Función |
|----------|---------|
| **Mes** | Mes del período |
| **Año** | Año del período |

Presentación: dos `<select>` o date-pickers en fila (formulario amplio Admin).

| Botón | Acción |
|-------|--------|
| **Generar expediente** | Primario morado — prepara documentación del período |

### Bloque informativo

**¿Qué incluye tu expediente?** (Móvil §10.4 · Visión §15):

* Facturas del período
* Gastos del período
* Comprobantes asociados
* Resumen del período

## 6.2 Panel lateral — Expediente generado

Tras generación correcta:

| Elemento | Contenido |
|----------|-----------|
| Iconografía | Éxito (✓ verde) |
| Título | **¡Expediente listo!** |
| Subtítulo | Mes y año del período |

### Resumen del período (cards)

| Dato | Descripción |
|------|-------------|
| Cotizaciones | Nº cotizaciones del período (Supabase) |
| Facturas | Nº facturas del período (Supabase) |
| Gastos | Nº gastos del período (`useGastos`, local) |
| Total gastos | Importe acumulado S/ del período |

### Formato de entrega (real, 23/07/2026)

Un único **ZIP descargable** (`POST /api/expediente/zip`), con:

| Contenido del ZIP | Descripción |
|---|---|
| `facturas-sunat/*.pdf` | Un PDF por factura emitida en el período (mismo PDF que ya genera Facturas — reutiliza `facturas.pdf_url` si ya existe, lo genera si falta) |
| `gastos-registrados.csv` | Gastos del período tal como están en `useGastos` (proveedor, categoría, fecha, total, método de pago, estado) |
| `resumen.txt` | Conteos y totales del período |

### Acciones

| Botón | Acción |
|-------|--------|
| **Generar expediente** | Genera el ZIP, lo descarga automáticamente y lo deja disponible para volver a descargar sin regenerar |
| **Descargar ZIP** | Vuelve a descargar el mismo ZIP ya generado |
| **Enviar a gestoría** | Deshabilitado — *"próximamente"*. No implementado (pedido explícito del propietario: fuera de alcance hasta que se defina el flujo de envío) |
| **Generar otro expediente** | Reinicia flujo, descarta el ZIP en memoria, para otro período |

**Nota honesta:** no existe "Exportar en PDF" ni "Carpeta organizada" como formatos separados (la versión v1.0 de este MD los describía como objetivo de diseño, nunca se construyeron) — el ZIP ya incluye los PDF de cada factura. Tampoco existe una pantalla "Ver expediente" para consultar expedientes generados anteriormente — no hay persistencia en base de datos de expedientes generados, solo la descarga inmediata.

**Límite:** Darivo Pro **no sustituye** gestoría ni SUNAT (Móvil §12 · Visión §15).

---

# 7. Pestaña — Informe

Reintegrada aquí el 23/07/2026 (pedido explícito del propietario) — antes vivió como entrada directa del sidebar (`07-MODULO-MAS-EMPRESA.md` §5.3, 22/07/2026–23/07/2026), y antes de eso ya había sido una pestaña de Cierre (17/07/2026). Exclusiva de Empresa — Móvil accede al mismo componente desde Más → Informes (`01-darivo-pro-movil/07-MODULO-MAS.md` §6), no desde Cierre.

Informe sencillo de actividad de la empresa, de solo consulta — **no genera datos propios**, consolida Clientes, Cotizaciones y Facturación ya existentes.

## 7.1 Sub-pestañas de período

| Sub-pestaña | Contenido |
|---|---|
| **Semanal** | Total cotizado / facturado / cobrado / pendiente de cobro, comparado con la semana anterior |
| **Mensual** | Total facturado del mes (comparado con el mes anterior), gráfico de barras por semana, IGV acumulado (18%), top 3 clientes del mes |
| **Anual** | Resumen financiero (facturado/cobrado/pendiente/IGV), documentos emitidos (nº cotizaciones/facturas, tasa de aprobación), cliente principal y categoría más frecuente del año |

**"Trimestral" no existe** — la versión anterior de este componente (17/07/2026–23/07/2026) tenía Semanal/Mensual/Trimestral en el código, desalineado con esta MD y con `07-MODULO-MAS-EMPRESA.md` §5.3, que ya especificaban "Anual". Corregido el 23/07/2026.

## 7.2 Descarga en PDF

Las 3 sub-pestañas tienen botón **Descargar PDF** (antes solo Trimestral lo tenía) — genera el PDF en el navegador (`@react-pdf/renderer`, sin backend) con los mismos datos mostrados en pantalla.

---

# 8. Inteligencia Artificial

IA transparente — sin configuración manual (Móvil §14 · Visión §13):

* Análisis automático de fotos y PDF en registro de gastos.
* Asistencia en generación del expediente mensual.

Comportamiento detallado producto: `01-darivo-pro-movil/08-MODULO-IA.md` (ámbito IA integrada). Este MD no duplica reglas de IA.

---

# 9. Gestión documental

Utiliza gestión documental transversal (`01-VISION-DEL-PRODUCTO.md` §17):

* Documentos asociables al gasto.
* Integración en expediente mensual.

Límites de almacenamiento por plan: `04-PANEL-ADMIN-SUSCRIPCIONES.md` (referencia única).

---

# 10. Funcionalidad (referencia Móvil)

* Moneda **S/** en todo el módulo.
* IA invisible en flujo de registro.
* Expediente organizado por **mes** y **año**.
* Categorías oficiales + personalizadas por empresa.
* Expediente entregado en un único ZIP (facturas PDF + gastos CSV + resumen) — ver §6.2.
* Informe de solo consulta en 3 periodicidades (Semanal/Mensual/Anual) con descarga PDF — ver §7.

---

# 11. Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Facturas (06) | Incluidas en expediente mensual del período y en el Informe |
| Clientes (03) | Sin acceso directo (Informe consulta cotizaciones/facturas, no clientes) |
| Cotizaciones (05) | Sin acceso directo — datos consultados en modo lectura por el Informe |
| IA (08) | IA de producto integrada en gastos (Móvil §14) |
| Inicio (02) | Sin acceso directo |
| Navegación directa ex-Más (07) | Ya no incluye Informes (retirado el 23/07/2026) |

---

# 12. Permisos

Usuario principal: **Gerente** (`01-VISION-DEL-PRODUCTO.md` §6).

Detalle granular: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` — **matriz detallada pendiente aprobación propietario**.

Permisos plataforma Admin: `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` — no duplicar.

---

# 13. Referencias oficiales

| Documento | Uso |
|-----------|-----|
| `01-darivo-pro-movil/09-MODULO-CIERRE.md` v2.0 | Lógica y diseño funcional |
| `01-VISION-DEL-PRODUCTO.md` §15, §17 | Estrategia Cierre y documental |
| `01-darivo-pro-movil/08-MODULO-IA.md` | IA integrada en gastos |
| `06-MODULO-FACTURAS-EMPRESA.md` | Facturas en expediente e Informe |
| `04-PANEL-ADMIN-SUSCRIPCIONES.md` | Límites almacenamiento |
| `07-MODULO-MAS-EMPRESA.md` §5.3 (histórico) | Especificación original del Informe (Semana/Mes/Anual) antes de reintegrarse aquí |

**Necesidades API:** OpenAI API ✅ aprobada (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2) — análisis documentos gastos.

---

# 14. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `09-MODULO-CIERRE.md` v2.0
* [x] Diseño ↔ Sistema Diseño §6.5 + acentos morados Móvil
* [x] Módulo anterior (Facturas) aprobado — sin incidencias bloqueantes
* [x] Sin inventar tablas, APIs ni formatos no documentados — Expediente Mensual (§6.2) corregido para no afirmar formatos/pantallas que no existen
* [x] Pestañas Gastos / Expediente Mensual / Informe preservadas y funcionando
* [x] Imagen oficial ↔ MD (fase global §7 — 02/07/2026) — **pendiente**: la imagen oficial no incluye la 3ª pestaña Informe (nueva desde 23/07/2026)
* [ ] Verificación visual en vivo de v1.1 — pendiente (ver §15)

---

# 15. Estado

✅ **Producción completada** (v1.0, 02/07/2026) — v1.1 (23/07/2026, reintegración de Informe + ZIP real de Expediente Mensual) implementada en código, `build`/`lint`/`typecheck` en verde. **Pendiente verificación visual en vivo** (Vercel, cuenta `yatriye@gmail.com`) y actualización de la imagen oficial §2. Detalle: `docs-internos/tareas/2026-07-23-reorganizacion-modulo-cierre-informes.md`.

**Fin del documento.**
