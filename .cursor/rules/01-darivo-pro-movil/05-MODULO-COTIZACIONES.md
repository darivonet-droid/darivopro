# DARIVO PRO — MÓDULO COTIZACIONES
## Diseño + Funcionalidad
### Versión: 1.5 — 05/07/2026
### Fuente: diseño Fable 5 (QuoteScreen/FloatBar/PDFModal) + flujo manual oficial aprobado por el propietario
### Relacionado: ver 21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO (arquitectura oficial)

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad de Cotizaciones. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción visual, prevalece Fable 5. En caso de contradicción de **flujo funcional**, prevalece este documento.

---

## 1. QUÉ ES UNA COTIZACIÓN

Nombre interno en código: `presupuestos`. El usuario SIEMPRE ve "Cotización" en pantalla, nunca "presupuesto".

Es un documento de TRABAJO: se puede editar, eliminar, duplicar libremente. No tiene validez fiscal — es la propuesta antes de facturar.

**Navegación:** Cotizaciones **no** forman parte de la navegación principal de Darivo Pro Móvil (`01-VISION-DEL-PRODUCTO.md` §5). Las cotizaciones guardadas se consultan dentro de la ficha de cada Cliente (§3).

### Accesos al wizard (Regla 1)

Existen **dos entradas independientes**. El diseño de la pantalla principal (`02-MODULO-INICIO.md`) **no cambia**:

| Entrada | Origen | Flujo |
|---------|--------|-------|
| **Nueva cotización** | Inicio → «Nuevo presupuesto» · pills capítulos obra | Flujo **manual** (§2) |
| **IA** | Nav central → módulo IA (`08-MODULO-IA.md`) | Flujo **IA** → converge al mismo wizard desde el Resumen (§2 Paso 2) |

---

## 2. FLUJO DE CREACIÓN MANUAL — 3 PASOS (wizard)

```
PASO 1 — SELECCIÓN (Categorías / Partidas)
PASO 2 — RESUMEN
PASO 3 — CLIENTE → CONFIRMACIÓN
```

Tras el Paso 3 (Cliente), el usuario confirma la cotización:

```
Guardar → Generar PDF → Asociar al cliente → Compartir → Conversión posterior a factura
```

---

### Paso 1 — Selección (Categorías y Partidas)

#### Flujo oficial de navegación del Catálogo Maestro (Regla 2 · ver Doc 21 §15)

Todas las categorías reutilizan el mismo diseño oficial de Fable 5. Al pulsar una categoría se abre una pantalla con el mismo diseño; únicamente cambia el contenido mostrado.

```
CATEGORÍAS MOSTRADAS:
Solo se muestran las categorías habilitadas según los
sectores seleccionados por la empresa durante el registro
(ver Doc 21 §7 — filtro permanente del Catálogo Maestro).

FLUJO ESTÁNDAR (resto de categorías — sin subcategorías):

Categoría (Fontanería / Electricidad / Pintura / ...)

↓

Pantalla de partidas de esa categoría
(mismo diseño Fable 5 — solo cambia el contenido)

↓

El usuario selecciona partidas

FLUJO EXCEPCIÓN — solo Construcción:

Construcción

↓

Pantalla de subcategorías de navegación
(Albañilería / Cimentaciones / Estructuras / Encofrados /
Techos / Pisos / Acabados / ...)

↓

Partidas de la subcategoría seleccionada

Nota: estas subcategorías son únicamente de navegación.
No crean un nuevo nivel en la base de datos ni modifican
la arquitectura del Catálogo Maestro.
```

#### Selección de partidas (Regla 3)

En esta pantalla:

* **Solo** se seleccionan partidas (toggle multi-selección).
* **No** existen cantidades.
* **No** existen cálculos.
* **No** existe calculadora.
* **No** existen controles numéricos.

Su única finalidad es construir la lista de partidas que alimentará el Resumen dinámico (Regla 5).

#### Diseño de pantalla — Selección (Fable 5)

```
DISEÑO:
- Header navy: texto visible usuario: "Nueva cotización"
- StepDots: 3 puntos, paso actual resaltado en blanco,
  completados en verde
- Lista de categorías habilitadas (card por categoría —
  borde de color según categoría, emoji grande 26px,
  nombre, contador de partidas)
- Al pulsar una categoría: se abre pantalla de partidas
  (mismo diseño Fable 5, solo cambia el contenido)

FUNCIONALIDAD:
- Selección MÚLTIPLE: se pueden marcar partidas de
  VARIAS categorías distintas en la misma cotización
- Tocar una partida la activa/desactiva (toggle)
- FloatBar (cuando hay ≥1 partida seleccionada):
  contador de partidas + botón "Continuar → Resumen"
  (sin total calculado, sin controles numéricos)
- El usuario puede volver atrás desde el Resumen a esta
  pantalla (Regla 6): las selecciones y mediciones del
  Resumen se conservan según las reglas oficiales
```

---

### Paso 2 — Resumen

El **Resumen** es el centro del flujo manual (Reglas 4–9).

Toda la lógica de cálculo se realiza **exclusivamente** aquí.

#### Motor Inteligente de Precios (ver Doc 21 §11 y §14)

Al calcular cada partida en el Resumen, Darivo Pro resuelve automáticamente el precio:

```
1. Mis Tarifas (precio personalizado de la empresa)
   ↓ si no existe
2. Tarifa Pro (precio oficial del Catálogo Maestro)

El usuario nunca decide qué precio utilizar.
```

#### Controles por tipo de cálculo (Reglas 4–5)

Cada partida muestra **únicamente** el control correspondiente a su tipo de cálculo definido en el Catálogo Maestro. El usuario **nunca** selecciona el tipo de cálculo. Darivo Pro lo determina automáticamente.

```
- Precio fijo     → solo importe
- Unidad          → Cantidad
- Metro cuadrado  → m²
- Metro lineal    → Metros
- Metro cúbico    → m³
- Hora            → Horas
- Jornal          → Jornales
```

No debe existir una **calculadora genérica** para todas las partidas. No deben mostrarse controles pertenecientes a otros tipos de cálculo. Cada partida incorpora únicamente el control que necesita.

La entrada numérica de cada control acepta enteros o decimales, con coma o punto, sin step fijo (misma libertad de escritura que antes aplicaba por partida).

Darivo Pro calcula automáticamente el importe de cada partida. La lógica permanece oculta al usuario.

#### Resumen dinámico (Reglas 5–7)

* El Resumen se construye **dinámicamente** a partir de las partidas seleccionadas.
* Solo aparecen las partidas que forman parte de la cotización.
* Cada partida conserva automáticamente el tipo de cálculo del Catálogo Maestro.
* Cada modificación recalcula automáticamente: importe de la partida, subtotales y total general.
* El Resumen representa en todo momento el **estado actual** de la cotización (Regla 7).
* No puede existir información desactualizada ni cálculos pendientes.

#### Orden de partidas (Regla 9)

* Las partidas mantienen un **orden estable**.
* Se **agrupan por categoría**.
* Respetan el orden definido en el Catálogo Maestro (`orden` en catálogo).
* El usuario **no** puede reordenarlas manualmente.

#### Validación de completitud (Regla 8)

El botón **«Continuar → Cliente»** solo está disponible cuando el Resumen está **completo**:

* Todas las partidas que requieren medición deben tenerla cumplimentada.
* Las partidas de **Precio fijo** no requieren acción del usuario.

#### Navegación atrás (Regla 6)

Si el usuario vuelve desde el Resumen a la pantalla de selección:

* Las mediciones ya introducidas se **mantienen** para todas las partidas que continúen seleccionadas.
* Si elimina una partida de la selección, desaparece automáticamente del Resumen.
* Si posteriormente vuelve a seleccionarla, se trata como una **nueva incorporación** (sin mediciones previas).

#### Diseño de pantalla — Resumen (Fable 5)

```
DISEÑO:
- Hero azul (gradiente 148deg) con el TOTAL en grande
  (54px) y desglose: Ejecución material / Mano de obra
- Tabla agrupada por categoría con sus partidas y subtotales
  (orden Regla 9)
- Por cada partida: control según tipo (Regla 5) + importe
- Slider de margen de mano de obra (0-120%) + botones
  preset (0/25/40/60/80/100%)
- Campo de notas (aparecen en el PDF)
- Botón "Continuar → Cliente" (habilitado solo si Regla 8)

FUNCIONALIDAD:
- Recálculo automático en cascada al modificar cualquier control
- Persistencia automática del estado del wizard en sesión (Regla 10)
- Sin numeración COT- ni guardado en BD hasta la confirmación (§2 Paso 3)
```

---

### Paso 3 — Cliente y confirmación

#### Cliente

Una vez finalizado el Resumen (Regla 8):

```
DISEÑO:
Card blanca con 3 campos:
- Nombre del cliente (icono persona)
- Teléfono / WhatsApp (icono teléfono)
- Ciudad / Dirección obra (icono etiqueta, opcional)

FUNCIONALIDAD:
- Solo Nombre + Teléfono son obligatorios para confirmar
  (igual que en el módulo Clientes)
- Si el teléfono normalizado coincide con un cliente
  existente → se asocia automáticamente
- Si no existe → se crea automáticamente un nuevo Cliente
```

#### Confirmación (tras Cliente)

```
Selector de estado: Borrador / Pendiente / Aprobado (colores fijos)

Botones de acción (según Fable 5):
[I.save  Guardar]                      (primario verde)
[I.wa    WhatsApp]                     (secundario)
[I.pdf   Generar y enviar PDF]         (secundario)
Si ya guardado: [I.receipt  Convertir en Factura →]   (primario verde)
[Nuevo presupuesto]                    (dashed, resetea wizard)

FUNCIONALIDAD — Guardar (Regla 10):
- El guardado definitivo ocurre aquí, no antes
- Se asigna automáticamente el número COT-001, COT-002...
  (correlativo por usuario, nunca se reutiliza)
- La cotización queda asociada al cliente
- Se genera el PDF en segundo plano
- Compartir (Web Share API / PDFModal — ver 16 §5.2)
- Conversión posterior a factura (cotización Aprobada)
```

---

## 3. DÓNDE SE VEN LAS COTIZACIONES — UNIFICADO CON CLIENTE

⚠️ **Decisión de arquitectura (24/06/2026):** NO existe una pantalla separada `/presupuestos` con lista global. Las cotizaciones se ven ÚNICAMENTE dentro de la ficha de cada Cliente (módulo **Clientes** de la nav principal).

```
CREACIÓN DE COTIZACIÓN:
Wizard de 3 pasos (Selección → Resumen → Cliente) accesible desde:
· Inicio → «Nuevo presupuesto» (flujo manual — Regla 1)
· Nav IA → flujos Escribir / Hablar (flujo IA — 08-MODULO-IA.md)

AL GUARDAR:
La cotización queda automáticamente dentro de la ficha
del Cliente correspondiente (ver 03-MODULO-CLIENTES.md §4).

NO EXISTE ruta /presupuestos como lista independiente.
```

```
DISEÑO de cada cotización dentro de la ficha de Cliente
(ya documentado en 03-MODULO-CLIENTES.md):
Cada card (blanca, radius 14px — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.3):
- Resumen de partidas (T.textMid) + fecha · nº partidas
- Importe total (T.blue, bold, derecha)
- Chips de estado tocables: Borrador/Pendiente/Aprobado
- Botón: [I.pdf  PDF]  (secundario)

Fila de acciones:
[I.edit Editar] [I.convert Re-cotizar] [I.share Compartir]
[I.receipt Facturar] (solo Aprobado) [I.trash Eliminar]

FUNCIONALIDAD:
- "Editar": abre el wizard con TODOS los datos precargados
  (Regla 10 — sesión); mediciones en Resumen (Reglas 5–7)
- "Re-cotizar": wizard precargado pero crea cotización NUEVA
- "Eliminar": borrado real e inmediato
- "→ Factura": solo si Aprobado (ver 06-MODULO-FACTURAS.md)
```

---

## 4. REGLAS OFICIALES DEL MÓDULO

### Regla 1 — Accesos duales

Existen dos accesos independientes: **Nueva cotización** (flujo manual) e **IA** (flujo IA). El diseño de la pantalla principal no cambia.

### Regla 2 — Navegación catálogo

Construcción utiliza subcategorías de navegación. El resto de categorías entra directamente a partidas. Las subcategorías no modifican la arquitectura del Catálogo Maestro.

### Regla 3 — Selección sin cálculo

La selección de partidas nunca realiza cálculos. No existen cantidades, calculadora ni controles numéricos en el Paso 1.

### Regla 4 — Resumen único punto de cálculo

El Resumen es el único punto de cálculo del flujo manual.

### Regla 5 — Resumen dinámico

El Resumen se construye dinámicamente a partir de las partidas seleccionadas. Solo aparecen las partidas que forman parte de la cotización. Cada partida conserva automáticamente el tipo de cálculo definido en el Catálogo Maestro. El usuario nunca selecciona el tipo de cálculo. Darivo Pro determina automáticamente el comportamiento de cada partida. Cada partida muestra únicamente el control correspondiente a su tipo. No debe existir una calculadora genérica. No deben mostrarse controles pertenecientes a otros tipos. Cada modificación recalcula automáticamente el importe de la partida, los subtotales y el total general.

### Regla 6 — Conservación de mediciones

Las mediciones introducidas en el Resumen deben conservarse mientras la partida permanezca seleccionada. Si el usuario vuelve desde el Resumen a la pantalla de selección: las mediciones se mantienen para partidas aún seleccionadas; eliminar una partida de la selección la elimina del Resumen; volver a seleccionarla la incorpora como partida nueva.

### Regla 7 — Resumen sincronizado

El Resumen representa en todo momento el estado actual de la cotización. Debe mantenerse sincronizado automáticamente con las partidas seleccionadas. Cualquier modificación se refleja inmediatamente en la partida, los subtotales y el total general. No puede existir información desactualizada ni cálculos pendientes.

### Regla 8 — Completitud del Resumen

El usuario solo puede continuar al paso Cliente cuando el Resumen esté completo. Todas las partidas que requieran medición deben tenerla cumplimentada. Las partidas de Precio fijo no requieren acción.

### Regla 9 — Orden estable

Las partidas mantienen un orden estable, se agrupan por categoría, respetan el orden del Catálogo Maestro y el usuario no puede reordenarlas manualmente.

### Regla 10 — Persistencia en sesión

Toda la información del wizard se conserva automáticamente durante la sesión. No existe guardado definitivo (numeración COT-, persistencia en BD) hasta confirmar la cotización en el Paso 3.

### Reglas generales (invariantes)

```
✅ Cotización = editable, eliminable, duplicable libremente
✅ Sin validez fiscal — documento previo a facturar
✅ Numeración: COT-001, COT-002... (correlativo, nunca reutilizado)
✅ Multi-categoría: SÍ permitido en una misma cotización
✅ Moneda: SIEMPRE S/ (soles), nunca €
✅ Al confirmar: auto-vincula o crea Cliente (03-MODULO-CLIENTES.md)
```

---

*Este documento describe Cotizaciones únicamente. Para arquitectura oficial del Catálogo Maestro, Tarifa Pro y Motor de Cotización ver `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`. Para Cliente ver 03-MODULO-CLIENTES.md. Para Factura ver 06-MODULO-FACTURAS.md.*
