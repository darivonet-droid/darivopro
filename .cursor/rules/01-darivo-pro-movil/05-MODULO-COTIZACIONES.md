# DARIVO PRO — MÓDULO COTIZACIONES
## Diseño + Funcionalidad
### Versión: 1.4 — 01/07/2026
### Fuente: diseño Fable 5 (QuoteScreen/FloatBar/PDFModal) + funcionalidad real ya construida y acordada
### Relacionado: ver 21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO (arquitectura oficial)

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad de Cotizaciones. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción, prevalece Fable 5.

⚠️ **Nota importante:** el mockup original de Fable 5 mostraba el orden Categorías→Cantidades→Resumen(cliente al final). Esto fue REVISADO y el orden REAL aprobado y construido es el descrito abajo (Partidas→Cliente→Resumen). Este documento describe el orden correcto vigente.

---

## 1. QUÉ ES UNA COTIZACIÓN

Nombre interno en código: `presupuestos`. El usuario SIEMPRE ve "Cotización" en pantalla, nunca "presupuesto".

Es un documento de TRABAJO: se puede editar, eliminar, duplicar libremente. No tiene validez fiscal — es la propuesta antes de facturar.

**Navegación:** Cotizaciones **no** forman parte de la navegación principal de Darivo Pro Móvil (`01-VISION-DEL-PRODUCTO.md` §5). El acceso al wizard de creación puede realizarse desde el módulo **IA** (ver `08-MODULO-IA.md`). Las cotizaciones guardadas se consultan dentro de la ficha de cada Cliente (§3).

---

## 2. FLUJO DE CREACIÓN — 3 PASOS (wizard)

```
PASO 1 — PARTIDAS
PASO 2 — CLIENTE
PASO 3 — RESUMEN
```

### Paso 1 — Categorías y Partidas

#### Flujo oficial de navegación del Catálogo Maestro (ver Doc 21 §15)

Todas las categorías reutilizan el mismo diseño oficial de Fable 5. Al pulsar una categoría se abre una pantalla con el mismo diseño; únicamente cambia el contenido mostrado.

```
CATEGORÍAS MOSTRADAS:
Solo se muestran las categorías habilitadas según los 
sectores seleccionados por la empresa durante el registro 
(ver Doc 21 §7 — filtro permanente del Catálogo Maestro).

FLUJO ESTÁNDAR (todas las categorías excepto Construcción):

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

#### Motor Inteligente de Precios (ver Doc 21 §11 y §14)

Al añadir una partida, Darivo Pro resuelve automáticamente el precio siguiendo esta prioridad:

```
1. Mis Tarifas (precio personalizado de la empresa)
   ↓ si no existe
2. Tarifa Pro (precio oficial del Catálogo Maestro)

El usuario nunca decide qué precio utilizar.
Todo ocurre automáticamente.
```

#### Tipos de cálculo oficiales (ver Doc 21 §12 y §13)

Cada partida tiene internamente su tipo de cálculo. El usuario nunca lo selecciona — solo ve el campo que necesita completar:

```
- Unidad          → Cantidad × Precio
- Metro cuadrado  → m² × Precio
- Metro lineal    → Metros × Precio
- Metro cúbico    → m³ × Precio
- Hora            → Horas × Precio
- Día (Jornal)    → Jornales × Precio
- Precio fijo     → Importe fijo (sin cantidad)
```

Darivo Pro calcula automáticamente el importe. La lógica permanece oculta al usuario.

#### Diseño de pantalla — Categorías (Fable 5)

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
- Resumen flotante (FloatBar) aparece al fondo cuando 
  hay ≥1 partida: contador + lista resumida + total 
  parcial + botón "Continuar →"

FUNCIONALIDAD:
- Selección MÚLTIPLE: se pueden marcar partidas de 
  VARIAS categorías distintas en la misma cotización
- Tocar una partida la activa/desactiva (toggle)
- El campo de CANTIDAD debe comportarse como una 
  calculadora libre: el usuario puede escribir 
  CUALQUIER número (enteros o decimales, con coma o 
  punto), sin step fijo, sin bloqueos, sin redondeos 
  forzados mientras escribe
- Presets de cantidad (5, 10, 15…) son atajos opcionales, 
  nunca obligatorios
- Partidas de tipo "precio fijo" no piden cantidad, 
  se incluyen directamente con su importe fijo
```

### Paso 2 — Cliente

```
DISEÑO:
Card blanca con 3 campos:
- Nombre del cliente (icono persona)
- Teléfono / WhatsApp (icono teléfono)
- Ciudad / Dirección obra (icono etiqueta, opcional)

FUNCIONALIDAD:
- Solo Nombre + Teléfono son obligatorios para avanzar 
  (igual que en el módulo Clientes)
- Si el teléfono normalizado coincide con un cliente 
  existente → se asocia automáticamente a ese cliente
- Si no existe → se crea automáticamente un nuevo Cliente
- Esto ocurre de forma invisible para el usuario, 
  sin pasos extra
```

### Paso 3 — Resumen

```
DISEÑO:
- Hero azul (gradiente 148deg) con el TOTAL en grande 
  (54px) y desglose: Ejecución material / Mano de obra
- Tabla agrupada por categoría con sus partidas y subtotales
- Slider de margen de mano de obra (0-120%) + botones 
  preset (0/25/40/60/80/100%)
- Campo de notas (aparecen en el PDF)
- Selector de estado: Borrador / Pendiente / Aprobado
  (colores fijos)
- Botones de acción (según Fable 5):
  [I.save  Guardar]                      (primario verde)
  [I.wa    WhatsApp]                     (secundario, borde verde WhatsApp)
  [I.pdf   Generar y enviar PDF]         (secundario)
  Si ya guardado: [I.receipt  Convertir en Factura →]   (primario verde)
  [Nuevo presupuesto]                    (dashed, resetea wizard)

FUNCIONALIDAD:
- Al "Guardar": se asigna automáticamente el número 
  COT-001, COT-002... (correlativo por usuario, nunca 
  se reutiliza aunque se borre una cotización)
- Al guardar, se genera el PDF en segundo plano
- Botón "Compartir" (Web Share API nativa — abre menú
  del sistema: WhatsApp, Telegram, Email, etc.):
  En el paso resultado Fable 5 muestra botón WhatsApp específico;
  el botón Compartir (`I.share`) aparece en PDFModal (ver 16 §5.2)
```

---

## 3. DÓNDE SE VEN LAS COTIZACIONES — UNIFICADO CON CLIENTE

⚠️ **Decisión de arquitectura (24/06/2026):** NO existe una pantalla separada `/presupuestos` con lista global. Las cotizaciones se ven ÚNICAMENTE dentro de la ficha de cada Cliente (módulo **Clientes** de la nav principal). Esto elimina la duplicación visual que existía antes entre `/presupuestos` y `/clientes/[id]`.

```
CREACIÓN DE COTIZACIÓN:
El wizard de 3 pasos (Partidas → Cliente → Resumen) se 
accede desde el módulo IA de la navegación principal 
(ver 08-MODULO-IA.md).

AL GUARDAR:
La cotización queda automáticamente dentro de la ficha 
del Cliente correspondiente (ver 03-MODULO-CLIENTES.md, 
sección 4 — "Historial").

NO EXISTE ruta /presupuestos como lista independiente.
Para ver TODAS las cotizaciones de TODOS los clientes, 
el usuario entra a "Clientes" y revisa cliente por 
cliente (o usa el buscador de la lista de Clientes).
```

```
DISEÑO de cada cotización dentro de la ficha de Cliente 
(ya documentado en 03-MODULO-CLIENTES.md):
Cada card (blanca, radius 14px — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.3):
- Resumen de partidas (T.textMid) + fecha · nº partidas
- Importe total (T.blue, bold, derecha)
- Chips de estado tocables: Borrador/Pendiente/Aprobado
  (colores fijos)
- Botón en Fable 5: [I.pdf  PDF]  (secundario)

Fila de acciones (mismo patrón que ficha Cliente — ver 03 §4):
[I.edit Editar] [I.convert Re-cotizar] [I.share Compartir]
[I.receipt Facturar] (solo Aprobado) [I.trash Eliminar]

FUNCIONALIDAD:
- "Editar": abre el wizard con TODOS los datos 
  precargados; al guardar ACTUALIZA la cotización 
  existente (mismo COT-, no duplica)
- "Re-cotizar": abre el wizard precargado pero crea 
  una cotización NUEVA (útil para clientes recurrentes)
- "Eliminar": borrado real e inmediato (cotización = 
  documento de trabajo, sin restricción legal)
- "→ Factura": pregunta Empresa (RUC obligatorio) o 
  Particular (DNI obligatorio), genera la factura real
- Calculadora de cantidad: misma regla que en Paso 1 
  (libre, sin bloqueos)
```

---

## 4. REGLAS DE NEGOCIO (resumen)

```
✅ Cotización = editable, eliminable, duplicable libremente
✅ Sin validez fiscal — es el documento previo a facturar
✅ Numeración: COT-001, COT-002... (correlativo, nunca 
   se reutiliza)
✅ Multi-categoría: SÍ permitido en una misma cotización
✅ Cantidad: libre, sin step fijo, acepta coma y punto
✅ Moneda: SIEMPRE S/ (soles), nunca €
✅ Al guardar/editar: auto-vincula o crea Cliente 
   automáticamente (ver 03-MODULO-CLIENTES.md)
```

---

*Este documento describe Cotizaciones únicamente. Para arquitectura oficial del Catálogo Maestro, Tarifa Pro y Motor de Cotización ver `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`. Para Cliente ver 03-MODULO-CLIENTES.md. Para Factura ver 06-MODULO-FACTURAS.md.*
