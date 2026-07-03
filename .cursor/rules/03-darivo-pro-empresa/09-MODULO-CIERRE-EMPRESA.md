# 09 – MÓDULO CIERRE – DARIVO PRO EMPRESA

**Versión:** 1.0

**Estado:** ✅ Producción completada — imagen oficial (fase global §7 — 02/07/2026).

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

Módulo compartido **Cierre** en escritorio: registro de **gastos**, **expediente mensual** del período y **exportación** para la gestoría (`01-VISION-DEL-PRODUCTO.md` §15).

Equivalente funcional Móvil: pestañas **Gastos** y **Expediente Mensual** (Móvil §5–§12).

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
| Pestañas superiores | **Gastos** · **Expediente Mensual** (Móvil §5) |
| Equivalente Móvil | Bottom nav posición 5 → mismas dos pestañas |

Las pestañas son **funcionalmente idénticas** a Móvil; solo cambia la presentación escritorio.

---

# 4. Layout general (escritorio)

Área de contenido con **pestañas horizontales** bajo el header (patrón Admin Dashboard §5 · Sistema Diseño §5.2).

**Acentos visuales:** tonos **morados/violetas** en tarjetas destacadas, pestaña activa y acciones principales — coherente con Móvil §3 y referencia visual Móvil §2.

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — Cierre · notificaciones · usuario      │
│  240px      ├──────────────────────────────────────────────────┤
│             │  PESTAÑAS: [ Gastos ] [ Expediente Mensual ]    │
│  Cierre ●   ├────────────────────────┬─────────────────────────┤
│             │  COLUMNA PRINCIPAL ~58%│  PANEL LATERAL ~42%     │
│             │  (contenido pestaña)   │  (detalle / resumen)    │
└─────────────┴────────────────────────┴─────────────────────────┘
```

* En **Gastos**, el panel lateral muestra el flujo **Revisar gasto** (pasos Documento → Información → Revisar → Guardar) cuando hay registro activo; vacío en reposo.
* En **Expediente Mensual**, el panel lateral muestra resumen del período, estado «¡Expediente listo!» y formatos de exportación tras generar.

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

Tras generación correcta (Móvil §11):

| Elemento | Contenido |
|----------|-----------|
| Iconografía | Éxito (carpeta confirmada) |
| Título | **¡Expediente listo!** |
| Subtítulo | Mes y año del período |

### Resumen del período (tabla o cards)

| Dato | Descripción |
|------|-------------|
| Facturas | Nº facturas del período |
| Gastos | Nº gastos del período |
| Comprobantes | Nº total comprobantes |
| Total período | Importe acumulado S/ |

### Acciones

| Botón | Acción |
|-------|--------|
| **Ver expediente** | Consulta del expediente generado |
| **Generar otro expediente** | Reinicia flujo otro período |

### Formatos disponibles (Móvil §12 · Visión §15)

| Formato | Descripción |
|---------|-------------|
| **Exportar en PDF** | Documento PDF completo |
| **Descargar ZIP** | Archivo comprimido |
| **Carpeta organizada** | Carpeta estructurada |

**Regla:** mismos datos en los tres formatos; solo cambia presentación/entrega.

**Límite:** Darivo Pro **no sustituye** gestoría ni SUNAT (Móvil §12 · Visión §15).

---

# 7. Inteligencia Artificial

IA transparente — sin configuración manual (Móvil §14 · Visión §13):

* Análisis automático de fotos y PDF en registro de gastos.
* Asistencia en generación del expediente mensual.

Comportamiento detallado producto: `01-darivo-pro-movil/08-MODULO-IA.md` (ámbito IA integrada). Este MD no duplica reglas de IA.

---

# 8. Gestión documental

Utiliza gestión documental transversal (`01-VISION-DEL-PRODUCTO.md` §17):

* Documentos asociables al gasto.
* Integración en expediente mensual.

Límites de almacenamiento por plan: `04-PANEL-ADMIN-SUSCRIPCIONES.md` (referencia única).

---

# 9. Funcionalidad (referencia Móvil)

* Moneda **S/** en todo el módulo.
* IA invisible en flujo de registro.
* Expediente organizado por **mes** y **año**.
* Categorías oficiales + personalizadas por empresa.
* Exportación triple formato con contenido idéntico.

---

# 10. Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Facturas (06) | Incluidas en expediente mensual del período |
| Clientes (03) | Sin acceso directo |
| Cotizaciones (05) | Sin acceso directo |
| IA (08) | IA de producto integrada en gastos (Móvil §14) |
| Inicio (02) | Sin acceso directo |
| Más (07) | Sin acceso directo |

---

# 11. Permisos

Usuario principal: **Gerente** (`01-VISION-DEL-PRODUCTO.md` §6).

Detalle granular: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` — **matriz detallada pendiente aprobación propietario**.

Permisos plataforma Admin: `12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` — no duplicar.

---

# 12. Referencias oficiales

| Documento | Uso |
|-----------|-----|
| `01-darivo-pro-movil/09-MODULO-CIERRE.md` v2.0 | Lógica y diseño funcional |
| `01-VISION-DEL-PRODUCTO.md` §15, §17 | Estrategia Cierre y documental |
| `01-darivo-pro-movil/08-MODULO-IA.md` | IA integrada en gastos |
| `06-MODULO-FACTURAS-EMPRESA.md` | Facturas en expediente |
| `04-PANEL-ADMIN-SUSCRIPCIONES.md` | Límites almacenamiento |

**Necesidades API:** OpenAI API ✅ aprobada (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2) — análisis documentos gastos.

---

# 13. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `09-MODULO-CIERRE.md` v2.0
* [x] Diseño ↔ Sistema Diseño §6.5 + acentos morados Móvil
* [x] Módulo anterior (Facturas) aprobado — sin incidencias bloqueantes
* [x] Sin inventar tablas, APIs ni formatos no documentados
* [x] Pestañas Gastos / Expediente Mensual preservadas
* [x] Imagen oficial ↔ MD (fase global §7 — 02/07/2026)

---

# 14. Estado

✅ **Producción completada** — Reglas §15 (02/07/2026).

**Fin del documento.**
