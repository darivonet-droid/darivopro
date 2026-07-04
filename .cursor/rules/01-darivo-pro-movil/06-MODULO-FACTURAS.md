# DARIVO PRO — MÓDULO FACTURAS
## Diseño + Funcionalidad
### Versión: 1.3 — 04/07/2026
### Fuente: diseño Fable 5 (InvoicesScreen/InvoiceEditor/InvoiceModal) + funcionalidad SUNAT ya construida
### Relacionado: ver 03-MODULO-CLIENTES.md, 05-MODULO-COTIZACIONES.md, `01-VISION-DEL-PRODUCTO.md` §18

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad de Facturas. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción, prevalece Fable 5.

---

## 1. QUÉ ES UNA FACTURA

Documento comercial que el usuario crea en Darivo Pro y que, una vez validado, se enviará a la **API oficial de facturación electrónica** aprobada por el propietario.

> **La API de facturación electrónica oficial todavía no ha sido seleccionada por el propietario. La implementación se realizará una vez se apruebe el proveedor oficial.**

### Estados oficiales de facturación electrónica

| Estado | Significado | Edición / eliminación |
|--------|-------------|------------------------|
| **Borrador** | Creada o en edición; aún no enviada a la API. | ✅ Puede editarse, eliminarse y corregirse. |
| **En proceso** | Enviada a la API; esperando respuesta. | ❌ No editable mientras se procesa. |
| **Emitida** | Aceptada por la API oficial. | ❌ No puede editarse ni eliminarse. Información protegida. |
| **Rechazada** | Rechazada por la API; incluye motivo del rechazo. | ✅ Puede corregirse y reenviarse. |
| **Pendiente de envío** | Error de comunicación con la API. | ✅ Puede corregirse y reintentarse el envío. |

Se llega a una factura SIEMPRE desde una Cotización Aprobada (vía botón "→ Factura" dentro de la ficha de Cliente — ver 05-MODULO-COTIZACIONES.md), o creando una nueva directamente desde cero.

**Acceso en Darivo Pro Móvil:** posición **Facturas** (4) de la navegación principal (`01-VISION-DEL-PRODUCTO.md` §5).

---

## 2. PANTALLA — LISTA DE FACTURAS (nav principal: "Facturas")

### Diseño (Fable 5 — InvoicesScreen)

```
HEADER (navy, gradiente, esquinas redondeadas 26px):
- Título "Facturación" (blanco, bold)
- Subtítulo: "[N] facturas · S/ [total]"
- Badge verde con el RUC de la empresa del usuario
- Chips de filtro (scroll horizontal): 
  Todas | Borrador | En proceso | Emitidas | Rechazadas | Pendiente de envío

BANNER (si hay cotizaciones Aprobadas sin facturar):
Fondo ámbar claro, borde ámbar:
"⚡ Cotizaciones aprobadas — convertir en factura"
Por cada una: nombre cliente, fecha, importe + 
botón verde "Facturar" (icono convert)

BOTÓN "Nueva factura" (azul, gradiente):
Icono recibo + "Nueva factura" + "Crear desde cero 
en 60 seg" + flecha

LISTA (vacía: ícono 🧾 + "Sin facturas todavía"):
Cada card (blanca, radius 14px — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.3):
- Número de factura (monospace, T.textMid) + Pill de estado 
  (color según estado oficial)
- Nombre del cliente (bold)
- RUC/DNI del cliente (si tiene) · fecha
- Importe total (T.blue, bold, derecha)
- Si estado Rechazada: mostrar motivo del rechazo (truncado)
- Si estado Pendiente de envío: acción visible "Reintentar"
- Botón [I.pdf  Ver factura]  (secundario)
```

### Funcionalidad — Estados oficiales

```
Los estados oficiales de facturación electrónica son:

Borrador → En proceso → Emitida
                    ↘ Rechazada (corregir + reenviar)
                    ↘ Pendiente de envío (reintentar)

Al cambiar de estado, el cambio debe reflejarse:
- En esta misma lista
- En la ficha del Cliente correspondiente (sección 
  Facturas asociadas) — SIN desincronización, siempre 
  leyendo el valor real y actual, nunca un valor cacheado aparte

Factura Emitida:
- Mostrar estado Emitida de forma clara
- No permitir edición ni eliminación

Factura Rechazada:
- Mostrar motivo del rechazo
- Permitir corregir la información
- Permitir reenviar a la API

Factura Pendiente de envío:
- Guardada por error de comunicación
- Permitir Reintentar el envío
```

---

## 3. CREAR FACTURA — PASO 0: TIPO DE COMPROBANTE

```
Antes de cualquier otro dato, se pregunta:
"¿Tu cliente tiene RUC?"

NO → BOLETA (serie B001-00000001)
     Pide: Nombre + DNI obligatorio (8 dígitos)
     IGV incluido en el precio, NO se desglosa

SÍ → FACTURA (serie F001-00000001)
     Pide: Razón social + RUC obligatorio 
     (11 dígitos, empieza en 10 o 20)
     IGV desglosado: Subtotal + IGV 18% + Total
```

**Regla:** el RUC/DNI NUNCA se pide antes de este momento — ni al crear el Cliente, ni al crear la Cotización. Solo aquí, al facturar.

---

## 4. CREAR FACTURA — DETRACCIÓN SUNAT (si Factura y total > S/700)

```
Selector OBLIGATORIO antes de poder emitir:

🔧 Reparación / Mantenimiento
   Código SUNAT: 022 / 037
   Detracción: 12%

🏗️ Construcción / Remodelación
   Código SUNAT: 030
   Detracción: 4%

CÁLCULO MOSTRADO:
Total con IGV:        S/ 1,000.00
Detracción (4%/12%):  - S/ 40.00 / - S/ 120.00
─────────────────────────────────
NETO A COBRAR:        S/ 960.00 / S/ 880.00

Leyenda automática incluida en el PDF:
"Operación sujeta al Sistema de Pago de Obligaciones 
Tributarias (SPOT) - Tipo: [Construcción/Mantenimiento]
Código: [030/022-037] - Tasa: [4%/12%]
Depositar en Banco de la Nación: [cuenta del usuario]"
```

Si el total es ≤ S/700, NO se muestra el selector de detracción.

---

## 5. CREAR FACTURA — LÍNEAS Y FORMA DE PAGO

```
Si viene de una Cotización: líneas, cliente y totales 
se copian automáticamente (importar desde cotización 
aprobada).

Si es nueva desde cero: añadir líneas manualmente 
(descripción, cantidad, precio unitario — misma regla 
de calculadora libre que en Cotizaciones).

Forma de pago: Efectivo / Yape / Transferencia / Crédito
Estado inicial al crear: Borrador
```

---

## 6. PDF DE FACTURA

```
DISEÑO (Fable 5 — InvoiceModal — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.10):
- Título "FACTURA" o "BOLETA" centrado
- Bloque Emisor (T.navyLight) — Bloque Receptor (T.slate)
- Tabla de líneas: Descripción | Cant | P.Unit | Total
- Totales: Base imponible + IGV + (Detracción si aplica) 
  + TOTAL/NETO A COBRAR en grande (T.blue)
- Pie: "Generado con Darivo Pro"

BOTONES EN InvoiceModal (según Fable 5):
  [I.wa    WhatsApp]        (secundario, borde #25D366)
  [I.pdf   Descargar PDF]   (secundario, borde T.slateD)
  [Cerrar]                  (secundario, ancho completo)
```

---

## 7. FACTURACIÓN ELECTRÓNICA — FLUJO OFICIAL

> **La API de facturación electrónica oficial todavía no ha sido seleccionada por el propietario. La implementación se realizará una vez se apruebe el proveedor oficial.**

Este apartado define **únicamente el flujo funcional**. No define proveedor, integraciones técnicas, endpoints ni arquitectura.

### Flujo paso a paso

```
1. Usuario crea la factura
   → Estado: Borrador

2. Darivo Pro valida toda la información
   (cliente, RUC/DNI, líneas, detracción si aplica, totales)

3. Usuario confirma el envío
   → Darivo Pro enviará la factura a la API oficial de 
     facturación electrónica que el propietario apruebe 
     en el futuro
   → Estado: En proceso

4. Darivo Pro recibe la respuesta de la API:

   ✅ EMITIDA
   - Factura aceptada
   - Mostrar estado Emitida
   - Información protegida (no editable)

   ❌ RECHAZADA
   - Mostrar motivo del rechazo
   - Permitir corregir
   - Permitir reenviar

   ⚠️ ERROR DE COMUNICACIÓN
   - Guardar como Pendiente de envío
   - Permitir Reintentar
```

### Validaciones previas al envío

Darivo Pro debe validar, como mínimo:

- Tipo de comprobante coherente con el documento del cliente (RUC/DNI).
- Líneas con descripción, cantidad y precio.
- Totales e IGV correctos.
- Detracción SUNAT cuando corresponda (Factura y total > S/700).
- Numeración de serie asignada.

Si la validación falla, la factura permanece en **Borrador** y se muestran los errores al usuario.

### Alcance actual

Hasta que el propietario apruebe la API oficial, Darivo Pro puede generar **PDF internos** para la gestión del negocio del usuario. La validez tributaria electrónica ante SUNAT dependerá de la integración futura con la API aprobada.

---

## 8. REGLAS DE NEGOCIO (resumen)

```
Estados Borrador, Rechazada o Pendiente de envío:
✅ Puede editarse, eliminarse y corregirse (según reglas anteriores)

Estado En proceso:
❌ No editable mientras se procesa el envío

Estado Emitida:
❌ No puede editarse ni eliminarse
✅ Su información queda protegida

Estado Rechazada:
✅ Mostrar motivo del rechazo
✅ Permitir corregir y reenviar

Estado Pendiente de envío:
✅ Permitir Reintentar el envío

✅ Boleta automática si cliente sin RUC; Factura 
   automática si cliente con RUC
✅ RUC/DNI obligatorio SOLO al momento de facturar, 
   nunca antes
✅ Detracción obligatoria si Factura y total > S/700 
   (4% construcción, 12% mantenimiento)
✅ Numeración: F001-00000001 / B001-00000001 (8 dígitos, 
   nunca se reutiliza)
✅ Estado SIEMPRE sincronizado en tiempo real entre 
   la lista de Facturas y la ficha de Cliente
```

---

## 9. Relación con Cotizaciones

- Toda factura se genera a partir de una cotización.
- La factura hereda automáticamente la información de la cotización.
- La factura mantiene la relación con el cliente asociado.

---

## 10. Relación con Clientes

- Existe una única factura en el sistema, identificada por su número de factura.
- Cada factura pertenece a un único cliente.
- No existen copias de facturas. Los módulos Clientes y Facturación trabajan sobre la misma factura.
- Todas las facturas pertenecen a un cliente.
- Desde la ficha del cliente se pueden consultar todas sus facturas.
- Desde una factura se puede acceder al cliente asociado.
- Cualquier modificación autorizada realizada en una factura se refleja automáticamente en ambos módulos.
- Si una factura en estado **Borrador**, **Rechazada** o **Pendiente de envío** se elimina desde cualquiera de los dos módulos, desaparecerá automáticamente del otro.
- Si una factura está **Emitida**, no podrá eliminarse desde ningún módulo.

---

## 11. Flujos oficiales

### Flujo 1 — Creación desde cliente

```
Cliente

↓

Nueva Cotización

↓

Categoría

↓

Partida

↓

Resumen

↓

Factura (Borrador)
```

### Flujo 2 (alternativo)

```
Cotización

↓

Resumen

↓

Crear cliente (si no existe)

↓

Guardar cotización

↓

Crear factura (Borrador)
```

### Flujo 3 — Facturación electrónica

```
Factura (Borrador)

↓

Darivo Pro valida información

↓

Envío a API oficial (futura)

↓

En proceso

↓

Emitida | Rechazada | Pendiente de envío
```

---

## 12. Gestión de facturas

**Borrador, Rechazada o Pendiente de envío:**

- Puede editarse.
- Puede eliminarse.
- Puede corregirse.
- **Rechazada:** mostrar motivo; permitir reenviar tras corregir.
- **Pendiente de envío:** permitir Reintentar.

**En proceso:**

- No editable mientras se espera respuesta de la API.

**Emitida:**

- No puede editarse.
- No puede eliminarse.
- Su información queda protegida.

---

## 13. Relación con otros documentos

Este documento depende de:

- `01-VISION-DEL-PRODUCTO.md` §18 (flujo oficial de facturación electrónica)
- `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`
- `03-MODULO-CLIENTES.md` (03 – MÓDULO CLIENTES – DARIVO PRO)
- `05-MODULO-COTIZACIONES.md` (05 – MÓDULO COTIZACIONES – DARIVO PRO)

---

*Este documento describe Facturas únicamente. Para arquitectura oficial y flujos integrados, ver sección 13 y documento 21. Para Cliente ver 03-MODULO-CLIENTES.md. Para Cotización ver 05-MODULO-COTIZACIONES.md.*
