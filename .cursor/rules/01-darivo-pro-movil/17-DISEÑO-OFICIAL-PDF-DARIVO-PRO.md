# DARIVO PRO — DISEÑO OFICIAL PDF
## Cotización y Facturación
### Versión: 1.3 — 01/07/2026
### Estado: Documento oficial aprobado
### Relacionado: ver 05-MODULO-COTIZACIONES.md · 06-MODULO-FACTURAS.md · 07-MODULO-MAS.md · 21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md

### Fuentes oficiales
- Informe de investigación del diseño PDF (mercado Perú) — FASE 1 aprobada
- `05-MODULO-COTIZACIONES.md`
- `06-MODULO-FACTURAS.md`
- `07-MODULO-MAS.md`
- `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`

⚠️ Este documento es la **ÚNICA fuente autorizada** para el diseño de los PDF de Cotización y Facturación en Darivo Pro. Ninguna IA puede modificarlo sin aprobación del propietario.

> **Implementación:** Este documento define únicamente el diseño oficial. No autoriza generar código, HTML, React, CSS ni archivos PDF. La implementación se realizará en una fase posterior.

---

## 1. OBJETIVO

Definir el diseño oficial de los PDF que Darivo Pro genera para:

- **Cotización** (documento de trabajo, sin validez fiscal — ver `05-MODULO-COTIZACIONES.md`)
- **Factura / Boleta** (comprobante interno en la fase actual — ver `06-MODULO-FACTURAS.md` §7)

Ambos documentos comparten la misma identidad visual y se diferencian únicamente por la información específica de cada tipo de documento.

---

## 2. ALCANCE DEL DOCUMENTO

Este documento define **únicamente** el diseño visual y la estructura oficial de los PDF de Cotización y Facturación en Darivo Pro.

**No define:**

| Ámbito excluido | Documento oficial correspondiente |
| --------------- | --------------------------------- |
| Reglas de negocio de cotizaciones | `05-MODULO-COTIZACIONES.md` |
| Reglas de negocio de facturación | `06-MODULO-FACTURAS.md` |
| Cálculos de importes, IGV y detracción | `06-MODULO-FACTURAS.md` |
| Lógica del Motor de Cotización | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md` |
| Reglas tributarias y comprobantes | `06-MODULO-FACTURAS.md` |
| Arquitectura del Catálogo Maestro y Tarifa Pro | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md` |
| Datos de empresa y ajustes del usuario (Módulo Más) | `07-MODULO-MAS.md` |
| Base de datos | Documentación de base de datos del proyecto |

Toda esa información pertenece a sus respectivos documentos oficiales. Este documento únicamente especifica **cómo se presenta** en PDF la información ya definida en ellos.

---

## 3. PRINCIPIOS DE DISEÑO (decisión oficial del propietario)

El diseño de los PDF de Darivo Pro deberá transmitir:

- **Profesionalidad**
- **Claridad**
- **Orden**
- **Facilidad de lectura**

Estos principios se aplican a Cotización y Facturación por igual.

---

## 4. IDENTIDAD VISUAL COMPARTIDA

Cotización y Factura utilizan la **misma identidad visual**:

| Elemento compartido | Especificación |
| ------------------- | -------------- |
| Formato de página | A4 vertical |
| Bloque Emisor | Mismo estilo visual — fondo `T.navyLight` (ver `06-MODULO-FACTURAS.md` §6) |
| Bloque Cliente / Receptor | Mismo estilo visual — fondo `T.slate` (ver `06-MODULO-FACTURAS.md` §6) |
| Tabla de líneas | Misma estructura de columnas: **Descripción · Cant · P.Unit · Total** (ver `06-MODULO-FACTURAS.md` §6) |
| Total destacado | Importe final en grande, color `T.blue` (ver `06-MODULO-FACTURAS.md` §6) |
| Pie de página | Texto fijo: **"Generado con Darivo Pro"** (ver `06-MODULO-FACTURAS.md` §6) |
| Moneda | Siempre **S/** (soles) — ver `05-MODULO-COTIZACIONES.md` §4 |

La diferenciación entre documentos se realiza únicamente mediante:

- El título del documento (**COTIZACIÓN** vs **FACTURA** / **BOLETA**)
- La numeración (**COT-** vs **F001-** / **B001-**)
- Los bloques de totales (Cotización: Ejecución material / Mano de obra; Factura: Base imponible / IGV / Detracción)
- La información del receptor según el tipo de comprobante

---

## 5. FORMATO Y PAGINACIÓN (decisión oficial del propietario)

### 5.1 Formato

- **Tamaño:** A4 vertical.
- **Uso del espacio:** Aprovechar correctamente toda la página. No dejar grandes espacios vacíos.
- **Paginación:** Si existen muchas partidas, el contenido continúa automáticamente en una segunda página (o páginas siguientes).
- **Prohibido:** Reducir el contenido, comprimir tipografía o eliminar partidas para forzar el documento en una sola página.

### 5.2 Prioridad de visualización (decisión oficial del propietario)

El PDF deberá estar optimizado, en este orden de prioridad, para:

1. **WhatsApp**
2. **Correo electrónico**
3. **Telegram**
4. **Impresión**

Debe ser perfectamente legible tanto en **móvil** como en **papel** (incluida impresión en blanco y negro).

### 5.3 Canales de generación y envío (documentación oficial)

| Canal | Origen en Darivo Pro |
| ----- | -------------------- |
| WhatsApp | Wizard cotización confirmación post-Cliente (`05-MODULO-COTIZACIONES.md` § Paso 3) · `PDFModal` / `InvoiceModal` (`06-MODULO-FACTURAS.md` §6) |
| Compartir (WhatsApp, Telegram, Email, etc.) | `PDFModal` — Web Share API (`05-MODULO-COTIZACIONES.md` § Paso 3 confirmación) |
| Descargar PDF | `InvoiceModal` (`06-MODULO-FACTURAS.md` §6) |
| Generación automática | Al guardar definitivo (Paso 3), PDF en segundo plano |

---

## 6. ORIGEN DE LA INFORMACIÓN

Cada campo del PDF proviene exclusivamente de los módulos oficiales. No se inventan datos.

| Bloque PDF | Fuente oficial |
| ---------- | -------------- |
| Datos de la empresa (Emisor) | `07-MODULO-MAS.md` §5 — Empresa |
| Datos del cliente | `05-MODULO-COTIZACIONES.md` § Paso 3 |
| Partidas y categorías | `05-MODULO-COTIZACIONES.md` § Paso 1–2 · `21` (Catálogo Maestro · orden Regla 9) |
| Desglose material / mano de obra | `05-MODULO-COTIZACIONES.md` § Paso 2 — Resumen |
| Notas | `05-MODULO-COTIZACIONES.md` § Paso 2 — campo de notas |
| Numeración COT- | `05-MODULO-COTIZACIONES.md` § Paso 3 confirmación · Regla 10 |
| Tipo, numeración y totales de factura | `06-MODULO-FACTURAS.md` §3, §4, §5, §6 |
| Cuenta Banco de la Nación (leyenda detracción) | `07-MODULO-MAS.md` §5 · `06-MODULO-FACTURAS.md` §4 |

---

## 7. PDF DE COTIZACIÓN

### 7.1 Naturaleza del documento

- Documento de **trabajo**, sin validez fiscal (`05-MODULO-COTIZACIONES.md` §4).
- El usuario siempre ve **"Cotización"** en pantalla, nunca "presupuesto" (`05-MODULO-COTIZACIONES.md` §1).
- Numeración correlativa: **COT-001, COT-002...** — al confirmar (Paso 3 · Regla 10).

### 7.2 Estructura oficial del PDF

El diseño sigue el modelo híbrido aprobado en la investigación FASE 1 (estructura por categorías del mercado peruano + alineación con el Resumen de Darivo Pro), utilizando únicamente campos documentados en las fuentes oficiales.

```
┌─────────────────────────────────────────────────────────────┐
│  BLOQUE EMISOR (T.navyLight)                                │
│  · Razón social / Nombre                                    │
│  · RUC                                                      │
│  · Dirección fiscal                                         │
│  · Teléfono                                                 │
├─────────────────────────────────────────────────────────────┤
│  CABECERA DOCUMENTO                                         │
│  · Título: COTIZACIÓN                                       │
│  · Número: COT-XXX                                          │
│  · Fecha de emisión (fecha de guardado de la cotización)    │
├─────────────────────────────────────────────────────────────┤
│  BLOQUE CLIENTE (T.slate)                                   │
│  · Nombre del cliente                                       │
│  · Teléfono / WhatsApp                                      │
│  · Ciudad / Dirección obra (si existe)                      │
├─────────────────────────────────────────────────────────────┤
│  CUERPO — PARTIDAS AGRUPADAS POR CATEGORÍA                  │
│                                                             │
│  ▌ [Nombre categoría]                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Descripción │ Cant │ P.Unit │ Total                  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ [partida 1] │      │  S/    │  S/                    │   │
│  │ [partida 2] │      │  S/    │  S/                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  Subtotal [categoría]:                              S/ xxx  │
│                                                             │
│  ▌ [Siguiente categoría] ...                                │
│                                                             │
│  (Si hay más partidas que caben en una página, continúan     │
│   en la página siguiente sin reducir contenido)             │
├─────────────────────────────────────────────────────────────┤
│  BLOQUE TOTALES                                             │
│  · Ejecución material                            S/ xxx     │
│  · Mano de obra                                  S/ xxx     │
│  · TOTAL (destacado, T.blue)                     S/ XXX     │
├─────────────────────────────────────────────────────────────┤
│  NOTAS                                                      │
│  · Texto del campo de notas del Resumen (si existe)         │
├─────────────────────────────────────────────────────────────┤
│  PIE                                                          │
│  · Generado con Darivo Pro                                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Detalle por sección

#### Encabezado — Emisor

Datos tomados de **Más → Empresa** (`07-MODULO-MAS.md` §5):

| Campo | Obligatorio en PDF |
| ----- | ------------------ |
| Razón social / Nombre | Sí |
| RUC | Sí (si existe en Empresa) |
| Dirección fiscal | Sí (si existe en Empresa) |
| Teléfono | Sí (si existe en Empresa) |

Estos datos aparecen en el encabezado de **todas** las cotizaciones y facturas del usuario (`07-MODULO-MAS.md` §5).

#### Cabecera del documento

| Campo | Fuente |
| ----- | ------ |
| Título "COTIZACIÓN" | Decisión de diseño alineada con `05-MODULO-COTIZACIONES.md` §1 |
| Número COT-XXX | Confirmación Paso 3 (`05-MODULO-COTIZACIONES.md` · Regla 10) |
| Fecha | Fecha de guardado definitivo (Paso 3) |

#### Bloque Cliente

Datos del **Paso 2 — Cliente** del wizard (`05-MODULO-COTIZACIONES.md`):

| Campo | Obligatorio en PDF |
| ----- | ------------------ |
| Nombre del cliente | Sí |
| Teléfono / WhatsApp | Sí |
| Ciudad / Dirección obra | No — solo si existe |

**Regla:** RUC/DNI del cliente **no** aparece en el PDF de cotización. Solo se exige al momento de facturar (`06-MODULO-FACTURAS.md` §3).

#### Cuerpo — Partidas por categoría

Alineado con:

- Resumen del wizard: **tabla agrupada por categoría con sus partidas y subtotales**, orden Catálogo Maestro (`05-MODULO-COTIZACIONES.md` § Paso 2 · Regla 9).
- Arquitectura del Catálogo Maestro: las partidas pertenecen a categorías del sector habilitado (`21` §7, §15).
- Cotización multi-categoría permitida (`05-MODULO-COTIZACIONES.md` §4).

**Columnas de la tabla** (misma estructura que factura — `06-MODULO-FACTURAS.md` §6):

| Columna | Contenido |
| ------- | --------- |
| Descripción | Nombre de la partida |
| Cant | Medición capturada en el Resumen dinámico según tipo de cálculo de la partida (`05` §4 Reglas 5–9) |
| P.Unit | Precio unitario resuelto por el Motor de Cotización (`21` §11: Mis Tarifas → Tarifa Pro) |
| Total | Importe calculado automáticamente (`21` §13) |

Cada categoría muestra un **subtotal** antes de pasar a la siguiente categoría.

Los tipos de cálculo oficiales (Unidad, m², ml, m³, Hora, Día, Precio fijo) permanecen **ocultos** al usuario en pantalla y en PDF (`21` §17). La cantidad mostrada en la columna **Cant** refleja el dato que el usuario completó.

#### Bloque Totales

Refleja el desglose del **Resumen** (`05-MODULO-COTIZACIONES.md` § Paso 2):

| Línea | Descripción |
| ----- | ----------- |
| Ejecución material | Subtotal de materiales |
| Mano de obra | Subtotal de mano de obra (incluye margen aplicado en el Resumen) |
| **TOTAL** | Importe final — destacado en grande, color `T.blue` |

Moneda: **S/** siempre (`05-MODULO-COTIZACIONES.md` §4).

#### Notas

- Contenido del **campo de notas** del Resumen (`05-MODULO-COTIZACIONES.md` § Paso 2).
- Si el campo está vacío, la sección Notas no se muestra.

#### Pie de página

- Texto fijo: **"Generado con Darivo Pro"** (`06-MODULO-FACTURAS.md` §6).

---

## 8. PDF DE FACTURA / BOLETA

### 8.1 Naturaleza del documento

- En la fase actual, las facturas son **documentos internos** válidos para el negocio del usuario, **sin validez tributaria oficial ante SUNAT** (`06-MODULO-FACTURAS.md` §7).
- La validez tributaria electrónica (XML, QR, OSE/PSE) queda **fuera del alcance** de este documento hasta nueva autorización del propietario.

### 8.2 Tipos de comprobante

Según `06-MODULO-FACTURAS.md` §3:

| Tipo | Condición | Serie | IGV en PDF |
| ---- | --------- | ----- | ---------- |
| **BOLETA** | Cliente sin RUC | B001-00000001 | Incluido en el precio — **no se desglosa** |
| **FACTURA** | Cliente con RUC | F001-00000001 | Desglosado: Subtotal + IGV 18% + Total |

**Regla:** RUC/DNI del cliente solo se solicita al facturar, nunca en cotización (`06-MODULO-FACTURAS.md` §3).

### 8.3 Estructura oficial del PDF

Basada en `06-MODULO-FACTURAS.md` §6:

```
┌─────────────────────────────────────────────────────────────┐
│  TÍTULO CENTRADO: FACTURA  o  BOLETA                        │
├─────────────────────────────────────────────────────────────┤
│  BLOQUE EMISOR (T.navyLight)  │  BLOQUE RECEPTOR (T.slate)  │
│  · Razón social / Nombre      │  · Nombre o Razón social    │
│  · RUC                        │  · RUC (factura) o DNI      │
│  · Dirección fiscal           │    (boleta)                 │
│  · Teléfono                   │  · Dirección (si existe)    │
├─────────────────────────────────────────────────────────────┤
│  CABECERA DOCUMENTO                                         │
│  · Número: F001-XXXXXXXX  o  B001-XXXXXXXX                  │
│  · Fecha de emisión                                         │
├─────────────────────────────────────────────────────────────┤
│  TABLA DE LÍNEAS                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Descripción │ Cant │ P.Unit │ Total                  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ [línea 1]   │      │  S/    │  S/                    │   │
│  │ [línea 2]   │      │  S/    │  S/                    │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  BLOQUE TOTALES                                             │
│                                                             │
│  FACTURA:                                                     │
│  · Base imponible                                  S/ xxx   │
│  · IGV (18%)                                       S/ xxx   │
│  · [Detracción si aplica]                         - S/ xxx   │
│  · TOTAL / NETO A COBRAR (T.blue, grande)          S/ XXX   │
│                                                             │
│  BOLETA:                                                      │
│  · TOTAL (T.blue, grande)                          S/ XXX   │
│  · (IGV incluido — sin desglose)                            │
├─────────────────────────────────────────────────────────────┤
│  LEYENDA DETRACCIÓN (solo si aplica — ver §8.4)              │
├─────────────────────────────────────────────────────────────┤
│  PIE                                                          │
│  · Generado con Darivo Pro                                    │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 Detracción SUNAT

Cuando aplica según `06-MODULO-FACTURAS.md` §4:

| Condición | Comportamiento en PDF |
| --------- | --------------------- |
| Factura con total **> S/700** | Mostrar bloque de detracción obligatorio |
| Factura con total **≤ S/700** | No mostrar detracción |
| Boleta | No aplica detracción |

**Tipos de detracción** (`06-MODULO-FACTURAS.md` §4):

| Tipo | Código SUNAT | Tasa |
| ---- | ------------ | ---- |
| Reparación / Mantenimiento | 022 / 037 | 12% |
| Construcción / Remodelación | 030 | 4% |

**Cálculo mostrado en PDF** (`06-MODULO-FACTURAS.md` §4):

```
Total con IGV:        S/ [monto]
Detracción ([tasa]):  - S/ [monto]
─────────────────────────────────
NETO A COBRAR:        S/ [monto]
```

**Leyenda automática incluida en el PDF** (`06-MODULO-FACTURAS.md` §4):

```
Operación sujeta al Sistema de Pago de Obligaciones 
Tributarias (SPOT) - Tipo: [Construcción/Mantenimiento]
Código: [030/022-037] - Tasa: [4%/12%]
Depositar en Banco de la Nación: [cuenta del usuario]
```

La cuenta del Banco de la Nación se obtiene de **Más → Empresa** (`07-MODULO-MAS.md` §5).

### 8.5 Origen de las líneas

| Origen | Comportamiento (`06-MODULO-FACTURAS.md` §5) |
| ------ | ------------------------------------------- |
| Desde cotización aprobada | Líneas, cliente y totales se copian automáticamente |
| Nueva desde cero | Líneas añadidas manualmente (descripción, cantidad, precio unitario) |

### 8.6 Pie de página

- Texto fijo: **"Generado con Darivo Pro"** (`06-MODULO-FACTURAS.md` §6).

---

## 9. REGLAS DE NEGOCIO DEL PDF

```
✅ Cotización y Factura comparten identidad visual
✅ Formato A4 vertical en todos los casos
✅ Moneda siempre S/ (soles)
✅ Partidas de cotización agrupadas por categoría (no lista plana)
✅ Tabla de líneas: Descripción · Cant · P.Unit · Total
✅ Total final siempre destacado (T.blue)
✅ Pie fijo: "Generado con Darivo Pro"
✅ Paginación automática — nunca comprimir ni omitir partidas
✅ Optimizado para WhatsApp, correo, Telegram e impresión
✅ RUC/DNI del cliente solo en PDF de factura/boleta, nunca en cotización
✅ Boleta: IGV incluido, sin desglose
✅ Factura: IGV 18% desglosado
✅ Detracción solo en factura > S/700 según reglas SUNAT documentadas
✅ Datos de empresa siempre desde Más → Empresa
✅ Notas de cotización desde el campo del Resumen
✅ Sin validez fiscal en cotización
✅ Sin validez tributaria SUNAT en factura (fase actual)
```

---

## 9.1 ESTADOS DE COTIZACIÓN EN PDF

Los estados internos de cotización (**Borrador**, **Pendiente**, **Aprobado**) se asignan en la confirmación del wizard (Paso 3 — `05-MODULO-COTIZACIONES.md`).

**Decisión oficial de diseño PDF:** el PDF de cotización **no muestra** chips ni etiquetas de estado. El estado es metadato interno del sistema; el PDF presenta únicamente la propuesta comercial (partidas, totales, notas y datos de cliente).

Los estados de **pago** de factura (Pendiente / Emitida / Cobrada) tampoco se incluyen en el PDF de factura en la fase actual — ver `06-MODULO-FACTURAS.md` §6.

---

## 10. ELEMENTOS NO INCLUIDOS

Los siguientes elementos **no están documentados** en las fuentes oficiales autorizadas (`05`, `06`, `07`, `21`) y **no forman parte** de este diseño. No se han asumido ni inventado:

| Elemento | Motivo |
| -------- | ------ |
| Logo de empresa | No documentado en `07-MODULO-MAS.md` §5 |
| Validez de la cotización (días) | No documentado en módulos oficiales |
| Condiciones de pago en PDF | No documentado en `05` ni `06` §6 |
| Forma de pago en PDF | Documentada en creación de factura (`06` §5) pero no en diseño PDF (`06` §6) |
| IGV desglosado en cotización | Cotización sin validez fiscal (`05` §4) |
| Código QR | Validez SUNAT no activa (`06` §7) |
| Datos bancarios en cotización | Solo cuenta Banco de la Nación para detracción en factura (`07` §5) |
| Agrupación por categoría en factura | `06` §6 define tabla de líneas sin agrupación por categoría |

Si el propietario autoriza alguno de estos elementos en el futuro, deberá actualizarse este documento mediante FASE 2 explícita.

---

## 11. RELACIÓN CON OTROS DOCUMENTOS

Este documento se apoya en los módulos oficiales de Darivo Pro. Cada documento relacionado tiene una responsabilidad concreta respecto al PDF:

### 05 – MÓDULO COTIZACIONES – DARIVO PRO

**Responsabilidad respecto al PDF:**

- Define el flujo de creación (Selección → Resumen → Cliente → Guardar) del que provienen los datos del PDF de cotización.
- Establece qué datos del cliente aparecen en cotización (nombre, teléfono, ciudad) y que RUC/DNI no se incluye.
- Define la numeración **COT-XXX**, la generación automática del PDF al guardar y los canales de envío (WhatsApp, Compartir).
- Especifica el desglose del Resumen: partidas agrupadas por categoría, subtotales, Ejecución material, Mano de obra, TOTAL y notas.

Este documento (17) **no redefine** ese flujo ni esas reglas; solo documenta cómo se reflejan visualmente en el PDF.

### 06 – MÓDULO FACTURAS – DARIVO PRO

**Responsabilidad respecto al PDF:**

- Define la estructura base del PDF de factura/boleta (bloques Emisor/Receptor, tabla de líneas, totales, pie).
- Establece los tipos de comprobante (Boleta vs Factura), reglas de IGV y detracción SUNAT.
- Especifica la numeración **F001-** / **B001-**, los tokens visuales (`T.navyLight`, `T.slate`, `T.blue`) y el texto del pie de página.
- Define los modales de generación y envío (`InvoiceModal`, descarga PDF).

Este documento (17) unifica esa estructura con la de cotización y documenta la identidad visual compartida sin alterar las reglas tributarias de `06`.

### 07 – MÓDULO MÁS – DARIVO PRO

**Responsabilidad respecto al PDF:**

- Provee los datos del **Emisor** que aparecen en todos los PDF: razón social, RUC, dirección fiscal y teléfono (pestaña Empresa).
- Provee la cuenta del **Banco de la Nación** utilizada en la leyenda de detracción de facturas.

Este documento (17) **no define** qué campos existen en el **Módulo Más**; solo indica qué datos de Empresa se muestran en el encabezado del PDF.

### 21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO

**Responsabilidad respecto al PDF:**

- Define la estructura de categorías y partidas que determina la agrupación del cuerpo del PDF de cotización.
- Establece la lógica del Motor de Cotización que resuelve precios unitarios (Mis Tarifas → Tarifa Pro).
- Define los tipos de cálculo oficiales, que permanecen ocultos en pantalla y en PDF.

Este documento (17) **no define** la arquitectura del catálogo ni el motor; solo documenta cómo se presentan categorías, partidas y columnas en el PDF.

---

## 12. ESTADO DEL DOCUMENTO

🟢 Documento oficial del diseño PDF de Darivo Pro.

La implementación técnica (generación de archivos PDF, plantillas de código) se realizará en una fase posterior, siguiendo exclusivamente este documento.

---

## Protección del documento oficial

Este documento MD forma parte de la documentación oficial de Darivo Pro.

**Regla de implementación:** Cualquier modificación del diseño oficial del PDF deberá realizarse **primero en este documento** antes de implementarse en el código. El código no puede anticipar ni sustituir cambios no documentados aquí.

**Solo el propietario del proyecto está autorizado a crear, modificar, reorganizar o eliminar este documento.**

Ninguna IA, herramienta o desarrollador podrá modificar este MD sin la autorización expresa del propietario.

Los documentos MD constituyen la única fuente oficial de documentación del proyecto.

Si una IA detecta un posible error, contradicción o información incompleta, deberá:

* Detener el trabajo.
* Informar al propietario.
* Esperar instrucciones.

Queda prohibido modificar este documento por iniciativa propia.

No asumir, completar o inventar información bajo ningún concepto.

**Fin del documento.**
