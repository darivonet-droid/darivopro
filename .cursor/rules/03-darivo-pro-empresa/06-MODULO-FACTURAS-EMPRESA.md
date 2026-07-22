# 06 – MÓDULO FACTURAS – DARIVO PRO EMPRESA

**Versión:** 1.4

**Cambio principal (v1.4 — 22/07/2026):** añadida la visualización del **motivo del rechazo** (§5.5, §6.4 — Móvil §2/§7/§12 lo exige explícitamente y no tenía ubicación documentada aquí) y la ubicación concreta de la acción **Reintentar** para facturas en Pendiente de envío (§5.5, §6.4). Corregida la tabla de fuentes (§0): la lógica de Móvil citada era v1.2, desactualizada frente a la v1.6 ya referenciada en la cabecera. Solo contenido funcional — módulo bloqueado, sin cambios de diseño.

**Estado:** ⚠️ Requiere nueva imagen oficial (ver §2 y §5.2, pendiente desde v1.1 + ahora también Cobrada + ahora también §5.4/§6.1). Lógica y texto sincronizados con `01-VISION-DEL-PRODUCTO.md` §18 y con Móvil `06-MODULO-FACTURAS.md` v1.6.

**Changelog v1.3 (15/07/2026):** la barra de herramientas (§5.4) pasa de un único botón «+ Nueva factura» a dos accesos directos «Factura» / «Boleta», que abren el editor ya configurado con el tipo elegido. Se elimina el «Paso 0 — ¿Tu cliente tiene RUC?» (§6.1) como pantalla propia dentro del editor — el tipo de comprobante ya no se pregunta ahí, se elige antes, en la lista. Cambio pedido por el propietario; no afecta Móvil (sigue preguntando en su propio flujo, sin tocar).

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §5, §6, §9, §18 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.4 · `22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md`

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **Módulo Facturas** en Darivo Pro Empresa.

> **Lógica de negocio:** exclusivamente `01-darivo-pro-movil/06-MODULO-FACTURAS.md`. Este MD documenta diseño, navegación y presentación escritorio.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/06-MODULO-FACTURAS.md` v1.6 | Estados, SUNAT, flujos, reglas, PDF, relaciones |
| Referencia diseño escritorio | `02-darivo-pro-admin/03-PANEL-ADMIN-USUARIOS.md` v1.1 | Tabla principal + toolbar + panel lateral |
| Referencia filtros | `02-darivo-pro-admin/04-PANEL-ADMIN-SUSCRIPCIONES.md` v1.3 | Chips de filtro horizontales (Sistema Diseño §5.3) |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | Sidebar, header, tablas, modales, §6.4 |
| Cotizaciones Empresa | `05-MODULO-COTIZACIONES-EMPRESA.md` v1.0 | Entrada «Convertir en Factura →» |
| Clientes Empresa | `03-MODULO-CLIENTES-EMPRESA.md` v1.0 | Facturar desde historial · sincronización estado |

> **Sin MD Admin equivalente** de Facturación cliente. Admin no documenta facturas de empresa cliente.

**Informe módulo anterior (Cotizaciones):** ✅ Producción completada — sin incidencias abiertas (§10 `05-MODULO-COTIZACIONES-EMPRESA.md`).

---

# 1. Objetivo

Módulo de **facturación interna** (comprobantes F001 / B001) en escritorio para el **Gerente**.

Equivalente funcional Móvil: `InvoicesScreen` + `InvoiceEditor` + `InvoiceModal` (Móvil §2–§6).

**Acceso:** sidebar posición **Facturas** (4) · equivalente Móvil bottom nav posición 4 (`01-VISION-DEL-PRODUCTO.md` §5).

No define Base de Datos, APIs, permisos granulares ni arquitectura técnica.

---

# 2. Imagen oficial

**Archivo:** `06 - MODULO FACTURAS - DARIVO PRO EMPRESA.png`

![Módulo Facturas — Darivo Pro Empresa](./06%20-%20MODULO%20FACTURAS%20-%20DARIVO%20PRO%20EMPRESA.png)

**Estado:** ✅ Imagen oficial generada (fase global §7 — 02/07/2026).

Cuando exista, prevalecerá siempre este MD ante cualquier diferencia con la imagen.

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | Posición **Facturas** (4) |
| Vistas | **Lista** (por defecto) · **Editor** (crear/editar) · **Modal PDF** |
| Equivalente Móvil | `InvoicesScreen` → editor / modal (Móvil §2–§6) |

### Accesos al módulo

| Origen | Acción |
|--------|--------|
| Sidebar | Ítem Facturas (4) |
| Clientes (03) | «Facturar» en cotización **Aprobada** (ficha cliente §6.5) |
| Cotizaciones (05) | «Convertir en Factura →» tras confirmación (cotización guardada y aprobada) |
| Lista Facturas | Banner «Cotizaciones aprobadas» → botón **Facturar** por fila |

---

# 4. Layout general

## 4.1 Vista lista

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — Facturación · subtítulo · badge RUC    │
│  240px      ├──────────────────────────────────────────────────┤
│             │  CHIPS FILTRO: Todas | Borrador | Emitidas | Rechaz.│
│  Facturas ● ├──────────────────────────────────────────────────┤
│             │  BANNER ámbar (si hay cotiz. aprobadas sin fact.) │
│             ├──────────────────────────────────────────────────┤
│             │  TOOLBAR — [🏢 Factura] [👤 Boleta]                  │
│             ├──────────────────────────────────────────────────┤
│             │  TABLA PRINCIPAL (§5)                            │
└─────────────┴──────────────────────────────────────────────────┘
```

* Fondo área contenido `slate`, padding 24–32px (Sistema Diseño §5.3).
* Sin panel lateral en lista; selección de fila abre editor o modal según acción.

## 4.2 Vista editor (crear / editar)

Vista a pantalla completa dentro del área de contenido (sidebar visible):

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: «Nueva factura» / «Editar factura» · [← Volver]        │
├──────────────────────────────┬──────────────────────────────────┤
│  COLUMNA IZQUIERDA ~60%      │  COLUMNA DERECHA ~40%            │
│  Tipo comprobante (§6.1)     │  Resumen totales                 │
│  Datos cliente / RUC-DNI     │  Detracción (si aplica)          │
│  Tabla líneas (§6.3)         │  Forma de pago                   │
│  Acciones guardar            │  Botones PDF / WhatsApp (§6.5)   │
└──────────────────────────────┴──────────────────────────────────┘
```

Equivalente Móvil `InvoiceEditor` — formulario ampliado a dos columnas (Sistema Diseño §5.3 formularios amplios).

## 4.3 Modal PDF

Modal centrado escritorio (Sistema Diseño §6 · Fable 5 §6.10 adaptado):

* Vista previa / resumen del comprobante.
* Botones: `[I.wa WhatsApp]` · `[I.pdf Descargar PDF]` · `[Cerrar]`.

---

# 5. Vista — Lista de facturas

Equivalente funcional `InvoicesScreen` (Móvil §2). Presentación: tabla + chips (Clientes Empresa §5 + Admin Usuarios §6).

## 5.1 Header

| Elemento | Descripción | Origen |
|----------|-------------|--------|
| Título | «Facturación» | Móvil §2 |
| Subtítulo | «[N] facturas · S/ [total]» | Móvil §2 |
| Badge RUC | RUC de la empresa del usuario (verde) | Móvil §2 |
| Notificaciones / usuario | Patrón header Empresa (Sistema Diseño §5.2) | Sistema Diseño |

## 5.2 Filtros (chips horizontales)

⚠️ **Corrección v1.1** — chips actualizados a los 5 estados oficiales de facturación electrónica (`01-VISION-DEL-PRODUCTO.md` §18; Móvil §1). La versión anterior usaba estados de cobro incompatibles con la Visión. **Requiere nueva imagen oficial** — la imagen actual (§2) queda desactualizada en este punto.

Scroll horizontal bajo el header (Móvil §2 · Sistema Diseño §5.3):

| Chip | Filtra por estado |
|------|--------------------|
| Todas | Sin filtro |
| Borrador | Estado Borrador |
| En proceso | Estado En proceso |
| Emitidas | Estado Emitida |
| Rechazadas | Estado Rechazada |
| Pendiente de envío | Estado Pendiente de envío |
| Cobradas | Estado Cobrada |

## 5.3 Banner cotizaciones aprobadas

Visible solo si existen cotizaciones **Aprobadas** sin facturar (Móvil §2):

* Fondo ámbar claro, borde ámbar.
* Texto: «⚡ Cotizaciones aprobadas — convertir en factura».
* Por cada cotización: nombre cliente · fecha · importe + botón verde **Facturar** (`I.convert`).

## 5.4 Barra de herramientas

⚠️ **Corrección v1.3** — sustituye el botón único «+ Nueva factura», que llevaba a una pantalla intermedia («Paso 0», §6.1) antes de poder editar. Ahora la elección de tipo se hace aquí mismo, con 2 accesos directos al editor:

| Botón | Acción |
|-------|--------|
| **🏢 Factura** | Abre el editor directo, ya configurado como Factura (RUC). Subtítulo: «Serie F001 · IGV desglosado · Detracción si aplica». |
| **👤 Boleta** | Abre el editor directo, ya configurado como Boleta (DNI). Subtítulo: «Serie B001 · IGV incluido · DNI si total > S/700». |

El editor ya no vuelve a preguntar el tipo al entrar — solo permite cambiarlo con el enlace «Cambiar» del encabezado (§4.2), que alterna Factura ↔ Boleta sin pantalla intermedia.

## 5.5 Tabla principal

Sustituye las cards móviles (Móvil §2):

| Columna | Contenido |
|---------|-----------|
| Número | F001-… / B001-… (monospace, `T.textMid`) |
| Cliente | Nombre (bold) |
| Doc. | RUC o DNI del cliente (si existe) |
| Fecha | Fecha emisión |
| Total | Importe (`T.blue`, bold) |
| Estado | Chips tocables: **Borrador · En proceso · Emitida · Rechazada · Pendiente de envío · Cobrada** (Móvil §2 · Fable 5 §6.5) |
| Acciones | `[I.pdf Ver factura]` (secundario) · si **Rechazada**: `[I.retry Reintentar]` visible en la fila (Móvil §2, §7, §12) |

**Fila en estado Rechazada:** debajo del número/cliente se muestra el **motivo del rechazo** truncado (Móvil §2, §7, §12) — texto devuelto por la API de facturación electrónica; ampliable dentro del editor (§6.4).

**Fila en estado Pendiente de envío:** acción **Reintentar** visible directamente en la fila de la tabla (columna Acciones), junto a `[I.pdf Ver factura]` (Móvil §2, §7, §12).

**Estado vacío:** icono 🧾 + «Sin facturas todavía» (Móvil §2).

**Orden:** más reciente primero.

---

# 6. Crear y editar factura

Flujo funcional idéntico a Móvil §3–§5. Solo cambia la presentación escritorio.

## 6.1 Tipo de comprobante — elegido antes de entrar (§5.4)

⚠️ **Corrección v1.3** — en escritorio, el tipo de comprobante ya **no** se pregunta como paso 0 dentro del editor (a diferencia de Móvil, que conserva su propia pantalla de pregunta, `06-MODULO-FACTURAS.md` §3, sin cambios). El Gerente lo elige directamente en la lista de Facturas (§5.4, botones «Factura»/«Boleta»), y el editor abre ya configurado:

| Botón en lista | Comprobante | Datos obligatorios |
|-----------|-------------|-------------------|
| **Boleta** | BOLETA B001-… | Nombre + DNI (8 dígitos) |
| **Factura** | FACTURA F001-… | Razón social + RUC (11 dígitos, empieza 10 o 20) |

* BOLETA: IGV incluido, no desglosado.
* FACTURA: desglose Subtotal + IGV 18% + Total.

**Regla:** RUC/DNI **solo al facturar**, nunca al crear Cliente ni Cotización (Móvil §3) — sin cambios.

Dentro del editor, el enlace «Cambiar» (§4.2 encabezado) permite alternar Factura ↔ Boleta sin volver a la lista ni mostrar ninguna pantalla intermedia.

## 6.2 Detracción SUNAT

Solo si **Factura** y total **> S/700** (Móvil §4):

| Opción | Código SUNAT | Tasa |
|--------|--------------|------|
| Reparación / Mantenimiento | 022 / 037 | 12% |
| Construcción / Remodelación | 030 | 4% |

Mostrar cálculo: Total con IGV · Detracción · **NETO A COBRAR** · leyenda SPOT para PDF (Móvil §4).

Si total ≤ S/700: **no** mostrar selector.

## 6.3 Líneas y forma de pago

| Origen | Comportamiento |
|--------|----------------|
| Desde cotización aprobada | Copia automática líneas, cliente y totales (Móvil §5) |
| Desde cero | Añadir líneas manualmente: descripción, cantidad, precio unitario (entrada libre por línea — distinto del wizard Cotizaciones, que usa controles por tipo en Resumen) |

**Forma de pago:** Efectivo / Yape / Transferencia / Crédito (Móvil §5).

**Estado inicial al crear:** Borrador (Móvil §5).

Tabla de líneas en columna izquierda del editor (§4.2): Descripción | Cant | P.Unit | Total.

## 6.4 Estados de factura (facturación electrónica)

⚠️ **Corrección v1.1** — sustituye el modelo anterior "Verificada / NO verificada", que no existía en la Visión ni en Móvil. Estados oficiales (`01-VISION-DEL-PRODUCTO.md` §18; Móvil §1, §12):

| Estado | Editar | Eliminar |
|--------|--------|----------|
| **Borrador** | ✅ | ✅ |
| **En proceso** | ❌ (esperando respuesta API) | ❌ |
| **Emitida** | ❌ | ❌ |
| **Rechazada** | ✅ (corregir y reenviar) | ✅ |
| **Pendiente de envío** | ✅ (reintentar envío) | ✅ |
| **Cobrada** | ❌ (hereda protección de Emitida) | ❌ |

(Móvil §1 · §12)

**Rechazada — motivo visible:** el editor muestra el **motivo del rechazo** devuelto por la API (texto completo, no truncado) junto a los campos a corregir, antes del botón «Reenviar» (Móvil §2, §7, §12).

**Pendiente de envío — Reintentar:** el editor muestra el botón **«Reintentar envío»** de forma visible (no solo en la lista §5.5) — reenvía la factura tal cual, sin pasar por corrección (a diferencia de Rechazada, que exige editar antes de reenviar) (Móvil §2, §7, §12).

**Cobrada** es un 6º estado adicional a los 5 oficiales de facturación electrónica (Visión §18), para gestión de cobro en el mismo campo — solo alcanzable desde Emitida (Móvil §1, corrección v1.6).

## 6.5 PDF y compartir

Diseño PDF según `17-DISEÑO-OFICIAL-PDF-DARIVO-PRO.md` y Móvil §6 (FACTURA/BOLETA, emisor, receptor, líneas, totales, pie Darivo Pro).

| Botón | Acción |
|-------|--------|
| `[I.wa WhatsApp]` | Secundario borde #25D366 |
| `[I.pdf Descargar PDF]` | Secundario borde `T.slateD` |
| `[Cerrar]` | Secundario ancho completo (modal §4.3) |

---

# 7. Funcionalidad — Estado de facturación electrónica

⚠️ **Corrección v1.1** — esta sección usaba estados de cobro (Pendiente → Emitida → Cobrada) que no existen en la Visión ni en Móvil. Sustituido por el flujo oficial (`01-VISION-DEL-PRODUCTO.md` §18; Móvil §7):

```
Borrador → En proceso → Emitida → Cobrada (marcado manual tras el pago)
                    ↘ Rechazada (corregir + reenviar)
                    ↘ Pendiente de envío (reintentar)
```

Al cambiar de estado:

* Actualización **inmediata** en base de datos.
* Reflejo en lista Facturas **y** ficha Cliente (sección facturas / historial) **sin desincronización** — siempre valor real BD, nunca cache aparte (Móvil §2).

**Ya existe** el estado **Rechazada** (corrección respecto a la versión anterior de este documento, que afirmaba erróneamente lo contrario).

---

# 8. Validez legal SUNAT

Documentos **internos** válidos para el negocio del usuario. **Sin validez tributaria oficial** ante SUNAT en la fase actual (Móvil §7).

Integración OSE/PSE autorizado: pendiente de documentación funcional futura. No bloquea uso actual según planes documentados en `04-PANEL-ADMIN-SUSCRIPCIONES.md`.

---

# 9. Reglas de negocio (referencia Móvil §8)

* Boleta automática sin RUC; Factura automática con RUC.
* RUC/DNI obligatorio **solo al facturar**.
* Detracción obligatoria si Factura y total > S/700.
* Numeración F001-00000001 / B001-00000001 (8 dígitos, no reutilizable).
* Una única factura por número; Clientes y Facturas comparten la misma entidad (Móvil §10).
* Factura puede crearse desde cotización aprobada o directamente desde cero (Móvil §1).
* Eliminar factura en estado **Borrador**, **Rechazada** o **Pendiente de envío** desde cualquier módulo → desaparece en ambos.
* Factura **Emitida** → no editar ni eliminar.

---

# 10. Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Clientes (03) | Facturar desde historial · consulta y sync estado pago |
| Cotizaciones (05) | Origen principal · banner y «Convertir en Factura →» |
| Inicio (02) | Sin acceso directo a lista (KPIs pueden referenciar totales — Móvil Inicio) |
| IA (08) | Sin acceso directo |
| Cierre (09) | Sin acceso directo |
| Empresa (07 §5.2) | Datos empresa / SUNAT configuración — no duplicar aquí |

Flujos oficiales: Móvil §11.

---

# 11. Permisos

Usuario principal en Darivo Pro Empresa: **Gerente** (`01-VISION-DEL-PRODUCTO.md` §6).

Detalle granular: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` — **matriz detallada pendiente aprobación propietario** (no bloquea diseño del módulo).

Limitaciones por plan: `04-PANEL-ADMIN-SUSCRIPCIONES.md` (referencia única — no duplicar límites).

---

# 12. Referencias oficiales

| Documento | Uso |
|-----------|-----|
| `01-darivo-pro-movil/06-MODULO-FACTURAS.md` | Lógica de negocio |
| `01-darivo-pro-movil/03-MODULO-CLIENTES.md` | Relación cliente ↔ factura |
| `01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` | Origen cotización aprobada |
| `01-darivo-pro-movil/17-DISEÑO-OFICIAL-PDF-DARIVO-PRO.md` | PDF comprobante |
| `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` §7 | Tablas `facturas`, `comprobante_series` (snapshot) |
| `01-VISION-DEL-PRODUCTO.md` §14 | Principios BD (sin inventar esquema) |
| `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.4 | Facturación electrónica (SUNAT o proveedor) — **pendiente decisión propietario** |
| `INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` §8 | Referencia APIs aprobadas y pendientes |

---

# 13. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `06-MODULO-FACTURAS.md` v1.6
* [x] Diseño ↔ Admin Usuarios (tabla) + Sistema Diseño §6.4
* [x] Módulo anterior (Cotizaciones) sin incidencias abiertas
* [x] Sin inventar tablas, APIs ni permisos no documentados
* [x] Diseño documental aprobado por el propietario (02/07/2026)
* [x] Imagen oficial ↔ MD (fase global §7 — 02/07/2026)

---

# 14. Estado

⚠️ **Actualizado v1.2 (05/07/2026)** — añadido el estado **Cobrada** como 6º estado (adicional a los 5 oficiales), alcanzable solo desde Emitida. **Pendiente: nueva imagen oficial** que refleje los 6 estados.

⚠️ **Corregido v1.1 (05/07/2026)** — se sustituyó el modelo de estados de cobro (Pendiente/Emitida/Cobrada) y la terminología "Verificada/NO verificada" por los 5 estados oficiales de facturación electrónica de `01-VISION-DEL-PRODUCTO.md` §18, ya usados en Móvil `06-MODULO-FACTURAS.md`.

**Fin del documento.**
