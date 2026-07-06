# 16-SISTEMA-DE-DISEÑO-FABLE5.md

# DARIVO PRO — SISTEMA DE DISEÑO OFICIAL (FABLE 5)

Versión: 1.8

Última actualización: 04/07/2026

Fuente técnica autorizada: `docs/02-darivo-pro-movil/fable-5-diseño.jsx`

Documentos relacionados: `01-VISION-DEL-PRODUCTO.md`, `09-MODULO-CIERRE.md`, `DARIVO-PRO-ARQUITECTURA-MAESTRA.md`

---

⚠️ **Este documento es la ÚNICA fuente autorizada del sistema de diseño de Darivo Pro Móvil.** Ningún desarrollador, Cursor ni IA puede modificar colores, tipografía, iconografía, componentes, navegación o animaciones de Darivo Pro Móvil sin autorización expresa del propietario del producto.

---

# ÍNDICE

1. [Objetivo del sistema de diseño](#1-objetivo-del-sistema-de-diseño)
2. [Principios de diseño](#2-principios-de-diseño)
3. [Paleta oficial](#3-paleta-oficial)
4. [Tipografía](#4-tipografía)
5. [Iconografía](#5-iconografía)
6. [Componentes oficiales](#6-componentes-oficiales)
7. [Navegación](#7-navegación)
8. [Animaciones](#8-animaciones)
9. [Reglas obligatorias](#9-reglas-obligatorias)
10. [Extensión del sistema](#10-extensión-del-sistema)
11. [Contradicciones detectadas](#11-contradicciones-detectadas)
12. [Recomendaciones para mantener un único sistema](#12-recomendaciones-para-mantener-un-único-sistema)

---

# 1. OBJETIVO DEL SISTEMA DE DISEÑO

Fable 5 es el **sistema de diseño oficial de Darivo Pro Móvil**.

Su implementación de referencia vive en el archivo `docs/02-darivo-pro-movil/fable-5-diseño.jsx`. Ese archivo define de forma concreta:

* La paleta de colores (objeto `T`)
* La iconografía (objeto `I`)
* Los componentes reutilizables (átomos y pantallas)
* La navegación inferior y los flujos entre pantallas
* Las animaciones globales (objeto `GS`)

Darivo Pro Móvil es la herramienta de trabajo diario del ecosistema Darivo Pro para profesionales del sector construcción y servicios técnicos en Perú. El sistema de diseño existe para que la aplicación móvil mantenga una experiencia visual coherente, simple y rápida.

## 1.1 Alcance del Sistema de Diseño

Según `01-VISION-DEL-PRODUCTO.md` §10:

* El **Sistema de Diseño Fable 5** es el diseño oficial de **Darivo Pro Móvil**.
* **No** es el sistema de diseño oficial del ecosistema completo.
* **No** se aplica a **Darivo Pro Admin**.
* **No** se aplica a **Darivo Pro Empresa**.

## 1.2 Otros productos del ecosistema

### Darivo Pro Admin

Darivo Pro Admin dispone de su **propio diseño oficial** para entorno de escritorio.

Este documento (Fable 5) **no define** dicho diseño.

### Darivo Pro Empresa

Darivo Pro Empresa dispone de su **diseño oficial** para entorno de escritorio, documentado en `03-darivo-pro-empresa/16-SISTEMA-DE-DISEÑO-EMPRESA.md`.

Este documento (Fable 5) **no define** dicho diseño.

## 1.3 Lógica de negocio compartida

Según `01-VISION-DEL-PRODUCTO.md`, las diferencias entre productos del ecosistema afectan **únicamente al diseño visual**.

No modifican:

* La lógica de negocio.
* Los procesos.
* Los flujos funcionales.
* La Facturación.
* El Motor de Cotización.
* La IA.
* El Catálogo Maestro.
* La Tarifa Pro.
* Mis Tarifas.
* El diseño oficial del PDF.

## 1.4 Consistencia en Darivo Pro Móvil

Todos los módulos de **Darivo Pro Móvil** deben reutilizar la misma paleta `T`, la misma tipografía Inter, los mismos radios de borde, los mismos patrones de card y los mismos iconos `I` definidos en Fable 5.

---

# 2. PRINCIPIOS DE DISEÑO

## 2.1 Mobile First

El contenedor raíz de la aplicación en Fable 5 está limitado a **390px de ancho máximo** (`maxWidth: 390`), centrado en pantalla. Toda la interfaz está pensada para uso en móvil.

## 2.2 Simplicidad

Documentado en `01-VISION-DEL-PRODUCTO.md` y `DARIVO-PRO-ARQUITECTURA-MAESTRA.md`:

> Siempre elegir la solución más sencilla posible.

En Fable 5 se refleja en pantallas con pocas acciones por vista, cards limpias y formularios inline sin bordes innecesarios.

## 2.3 Rapidez

Documentado en `01-VISION-DEL-PRODUCTO.md`:

> Reducir clics, formularios y pasos innecesarios.

La promesa de valor del producto es: *una cotización en un minuto* y *una factura en un minuto*.

## 2.4 Wizard de 4 pasos

En el wizard de cotización (`QuoteScreen`), el componente `StepDots` usa **`total={4}`** para indicar el progreso del flujo. **Todos los usuarios** utilizan exactamente los mismos StepDots; la única diferencia entre Construcción y el resto de categorías es la navegación inicial del Paso 1 hasta Partidas.

| Paso visual | Fases internas en Fable 5 | Wizard oficial (`05-MODULO-COTIZACIONES.md` v1.6) |
|-------------|---------------------------|--------------------------------------------------|
| 0 | Selección de categorías y partidas (`cats` / `services`) | **Paso 1 — Selección** (sin controles numéricos) |
| 1 | Introducción de mediciones (`input`) | **Paso 2 — Cantidades** (controles por tipo · Reglas 4–8) |
| 2 | Resultado (`result`) | **Paso 3 — Resumen** (solo presentación · sin cálculos nuevos) |
| 3 | Confirmación cliente | **Paso 4 — Cliente** + confirmación (Guardar · PDF) |

> No implica calculadora genérica ni inputs numéricos en la fase de selección. Ver Reglas 1–10 en `05-MODULO-COTIZACIONES.md` §4.

## 2.5 Consistencia visual

Todos los módulos de **Darivo Pro Móvil** deben mantener el diseño Fable 5 documentado en este MD.

Deben reutilizar la misma paleta `T`, la misma tipografía Inter, los mismos radios de borde, los mismos patrones de card y los mismos iconos `I`.

Esta regla aplica **únicamente a Darivo Pro Móvil**. Darivo Pro Admin y Darivo Pro Empresa disponen de diseños oficiales propios según `01-VISION-DEL-PRODUCTO.md` §10.

## 2.6 Claridad y facilidad de uso

Documentado en `01-VISION-DEL-PRODUCTO.md`:

> Las pantallas deben ser fáciles de entender incluso para usuarios con poca experiencia tecnológica.

El diferenciador **Diseño Simple** indica que el producto está pensado para usuarios no técnicos.

## 2.7 Accesibilidad

Fable 5 implementa únicamente lo siguiente a nivel global (`GS`):

* `-webkit-tap-highlight-color: transparent` en `html`, `body` y `button`
* `overscroll-behavior: none`
* Feedback táctil en botones: `button:active { transform: scale(0.96) }`
* `inputMode="decimal"` en campos numéricos del wizard de cotización

**No hay información suficiente en la documentación oficial** sobre estándares de accesibilidad adicionales (WCAG, contraste mínimo formal, etiquetas ARIA, tamaños mínimos de área táctil documentados, etc.).

---

# 3. PALETA OFICIAL

La paleta oficial es el objeto **`T`** definido en `docs/02-darivo-pro-movil/fable-5-diseño.jsx`. **No se pueden modificar ni añadir colores** sin autorización.

## 3.1 Colores base (objeto `T`)

| Token | Hex | Uso documentado en Fable 5 |
|-------|-----|----------------------------|
| `navy` | `#0A1628` | Fondo global `html/body`, headers oscuros |
| `navyMid` | `#0D1E35` | — |
| `navyLight` | `#112240` | Headers internos, bloques oscuros secundarios, FloatBar |
| `blue` | `#2563EB` | Acción primaria, enlaces, totales, acento de rango |
| `blueL` | `#3B82F6` | Gradiente primario (junto con `blue`) |
| `bluePale` | `#EFF6FF` | Fondos de totales, selección activa |
| `blueDark` | `#1D4ED8` | — |
| `white` | `#FFFFFF` | Cards, fondos de contenido, texto sobre oscuro |
| `slate` | `#F1F5F9` | Fondo de pantallas de contenido |
| `slateD` | `#E2E8F0` | Bordes de cards, divisores, scrollbar |
| `slateDD` | `#CBD5E1` | — |
| `text` | `#1E293B` | Texto principal |
| `textMid` | `#64748B` | Texto secundario, etiquetas |
| `textLight` | `#94A3B8` | Texto terciario, placeholders en headers |
| `green` | `#10B981` | Éxito, aprobado, acciones positivas |
| `greenD` | `#059669` | Gradiente verde (junto con `green`) |
| `greenPale` | `#ECFDF5` | Fondo de confirmación |
| `amber` | `#F59E0B` | Pendiente, alertas suaves |
| `amberD` | `#D97706` | — |
| `amberPale` | `#FFFBEB` | Banner de cotizaciones aprobadas |
| `red` | `#EF4444` | PDF, eliminar, acciones destructivas |
| `redPale` | `#FEF2F2` | Fondo de botón eliminar |
| `purple` | `#7C3AED` | Pill "Propia" (partidas del usuario) |
| `purplePale` | `#F5F3FF` | — |
| `teal` | `#0D9488` | Color de categoría Fontanería |
| `tealPale` | `#F0FDFA` | — |
| `brown` | `#92400E` | Color de categoría Carpintería |

## 3.2 Colores de categoría (catálogo)

En `BASE_CATALOG`, cada categoría tiene un color asignado además de su emoji:

| Categoría | Color |
|-----------|-------|
| Albañilería | `T.amber` (`#F59E0B`) |
| Fontanería | `T.teal` (`#0D9488`) |
| Electricidad | `#D97706` |
| Pintura | `T.blue` (`#2563EB`) |
| Carpintería | `T.brown` (`#92400E`) |
| Climatización | `T.purple` (`#7C3AED`) |

## 3.3 Colores de estado

Estos colores están alineados con la paleta `T` y son **fijos**:

| Estado | Color | Hex |
|--------|-------|-----|
| Borrador | Gris | `#64748B` (`textMid`) |
| Pendiente | Naranja | `#F59E0B` (`amber`) |
| Aprobado | Verde | `#10B981` (`green`) |
| Emitida | Azul | `#2563EB` (`blue`) |
| Cobrada / Pagada | Verde | `#10B981` (`green`) |

Fondo de chips de estado activo: color al **10%** de opacidad (patrón `color + "12"` o `color + "18"` en Fable 5).

## 3.4 Colores externos fijos (no están en `T`)

Usados en Fable 5 para WhatsApp y no deben sustituirse por otros verdes:

| Uso | Hex |
|-----|-----|
| WhatsApp (icono/borde) | `#25D366` |
| WhatsApp (texto secundario) | `#128C7E` |

---

# 4. TIPOGRAFÍA

## 4.1 Familia tipográfica oficial

**Inter** — cargada desde Google Fonts:

```
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
```

Fallback: `system-ui, sans-serif`

Aplicada en: `html`, `body`, `input`, `textarea`, `button`.

**No se pueden añadir otras fuentes** sin autorización.

## 4.2 Pesos disponibles

400, 500, 600, 700, 800, 900

## 4.3 Escala tipográfica observada en Fable 5

| Rol | Tamaño | Peso | Ejemplo de uso |
|-----|--------|------|----------------|
| Hero monetario | 54px | 900 | Total de cotización en resumen |
| Hero secundario | 50px | 900 | Input de cantidad en wizard |
| Título de pantalla (header) | 20–24px | 900 | "Clientes", "Facturación" |
| Subtítulo de pantalla | 18px | 900 | Título en wizard |
| Importe destacado | 16–22px | 900 | Totales en cards |
| Título de card | 14–17px | 700–800 | Nombre de cliente, partida |
| Cuerpo | 13–14px | 600–700 | Texto principal en cards |
| Etiqueta uppercase | 10–12px | 700 | Labels de sección, `letterSpacing: 0.4–0.5` |
| Microtexto | 9–11px | 400–700 | Metadatos, fechas, pies de PDF |
| Nav bar | 10px | 500–800 | Etiquetas de pestañas inferiores |

## 4.4 Estilo de etiquetas de sección

Patrón recurrente en Fable 5:

* `textTransform: "uppercase"`
* `letterSpacing: 0.4–0.5`
* `fontWeight: 700`
* Color: `T.textMid`

---

# 5. ICONOGRAFÍA

La iconografía oficial es el objeto **`I`** en `docs/02-darivo-pro-movil/fable-5-diseño.jsx`. Todos los iconos son SVG con trazo (`stroke`), renderizados mediante el componente `SVG`.

**No se pueden añadir iconos nuevos** sin autorización. Si una acción nueva lo requiere, debe proponerse primero al propietario y documentarse en este MD (§5.2).

## 5.1 Inventario completo del objeto `I`

| Clave | Descripción |
|-------|-------------|
| `home` | Casa (inicio) |
| `users` | Grupo de personas (clientes) |
| `plus` | Signo más |
| `gear` | Engranaje (configuración) |
| `zap` | Rayo |
| `check` | Palomita de confirmación |
| `back` | Flecha izquierda (volver) |
| `chevron` | Flecha derecha |
| `edit` | Lápiz sobre cuadrado |
| `trash` | Papelera |
| `pdf` | Documento PDF |
| `wa` | Logo WhatsApp |
| `brief` | Maletín (cotizaciones) |
| `star` | Estrella |
| `layers` | Capas |
| `camera` | Cámara |
| `share` | Compartir (flecha hacia arriba desde bandeja) |
| `phone` | Teléfono |
| `mail` | Sobre de correo |
| `user` | Persona |
| `tag` | Etiqueta |
| `x` | Cerrar |
| `save` | Guardar |
| `sparkle` | Destello |
| `receipt` | Recibo / factura |
| `convert` | Flechas de conversión |
| `building` | Edificio |

Tamaño por defecto del componente `SVG`: **22px** (configurable con prop `size`).

## 5.2 Tabla maestra de acciones

**Versión sincronizada el 26/06/2026.**

### Acciones implementadas en Fable 5

| Acción | Icono | Color | Texto del botón | Pantalla |
|--------|-------|-------|-----------------|----------|
| Guardar | `I.save` | Gradiente verde | "Guardar" / "Guardado" | Wizard cotización |
| WhatsApp | `I.wa` | `#128C7E` (texto) · `#25D366` (borde) | "WhatsApp" | Ficha Cliente · Wizard · Modales |
| Llamar | `I.phone` | `#10B981` | "Llamar" | Ficha Cliente |
| Email | `I.mail` | `#2563EB` | "Email" | Ficha Cliente |
| Ver PDF | `I.pdf` | `#EF4444` | "PDF" / "Ver factura" / "Generar y enviar PDF" / "Descargar PDF" | Listas · Wizard · Modales |
| Compartir | `I.share` | `#64748B` | "Compartir" | PDFModal |
| Facturar | `I.convert` | Gradiente verde | "Facturar" | Banner facturas |
| Convertir en Factura | `I.receipt` | Gradiente verde | "Convertir en Factura →" | Wizard resultado |
| Nueva factura | `I.receipt` | Gradiente azul | "Nueva factura" | Lista facturas |
| Confirmar/Emitir | `I.receipt` | Gradiente verde | "Confirmar y emitir factura" | InvoiceEditor |
| Volver | `I.back` | `#94A3B8` | "Volver" / "Clientes" | Todas las fichas |
| Añadir inline | `I.plus` | `T.textLight` | "Nueva cotización" | Listas |
| Editar tarifa | `I.edit` | `#64748B` | — (solo icono) | Más |
| Eliminar partida | `I.trash` | `#EF4444` | — (solo icono) | Más |
| Cerrar modal | `I.x` | `T.textLight` | "Cerrar" | Modales |
| Cancelar | — | `T.textMid` | "Cancelar" | Modales · InvoiceEditor |
| Nueva cotización (HomeScreen) | `I.zap` | Gradiente azul | "Nueva cotización" | HomeScreen (Fable 5) |
| Editar cotización | `I.edit` | Borde `T.slateD` | "Editar" | Ficha Cliente · Lista cotizaciones |
| Re-cotizar | `I.convert` | Borde azul suave | "Re-cotizar" | Ficha Cliente · Lista cotizaciones |
| Eliminar cotización | `I.trash` | Borde rojo suave | "Eliminar" | Ficha Cliente · Lista cotizaciones |
| Facturar (desde cotización) | `I.receipt` | Borde verde suave | "Facturar" | Ficha Cliente · Lista cotizaciones (solo Aprobado) |
| Compartir cotización | `I.share` | Borde `T.slateD` | "Compartir" | Ficha Cliente · Lista cotizaciones |
| Acceso IA (nav principal, posición 3) | `I.sparkle` | Gradiente morado | — (botón central) | BottomNav · IAMenuScreen |
| Escribir con IA | `I.edit` | `T.purple` · fondo card `T.purplePale` | "Escribir con IA" | IAMenuScreen (Agente IA 1) |
| Hablar con IA | `I.phone` | `T.purple` · fondo card `T.purplePale` | "Hablar con IA" | IAMenuScreen (Agente IA 1) |
| Soporte con IA | `I.phone` | `T.teal` · fondo card `T.tealPale` | "Soporte con IA" | IAMenuScreen (Agente IA 2) · Más → Soporte |

### Acciones aprobadas — Pendiente de diseño en Fable 5

| Acción | Icono propuesto | Pantalla prevista | MD origen |
|--------|-----------------|-------------------|-----------|
| Compartir referido | `I.share` | Más → Mi Plan → Referidos | 07 |

## 5.3 Jerarquía visual de botones

**Primario** (relleno azul o verde sólido / gradiente):
Acción principal de la pantalla (ej. "Guardar", "Facturar").

**Secundario** (borde, sin relleno):
Acciones de apoyo (ej. "Compartir", "Re-cotizar").

**Destructivo** (rojo, siempre el último en la fila):
"Eliminar" — nunca debe ser el primer botón visible.

---

# 6. COMPONENTES OFICIALES

Todos los componentes listados existen en `docs/02-darivo-pro-movil/fable-5-diseño.jsx`. **No se pueden modificar** sin autorización.

## 6.1 Headers (`DarkHeader`)

Componente: `DarkHeader`

* Fondo: `linear-gradient(160deg, navy 0%, navyLight 100%)`
* Padding superior por defecto: `50px` (prop `pt`)
* Padding horizontal: `18px`; padding inferior: `22px`
* Esquinas inferiores redondeadas: **26px** (`borderBottomLeftRadius`, `borderBottomRightRadius`)

Incluye variantes con título blanco bold 20px, subtítulos en `textLight` 13px, y bloques de estadísticas en grid de 3 columnas.

## 6.2 Botón volver (`BackBtn`)

* Icono: `I.back`, color `textLight`, tamaño 18px
* Texto: prop `label` (default "Volver"), 13px, peso 600
* Sin fondo ni borde

## 6.3 Cards

Patrón estándar de card en Fable 5:

* Fondo: `T.white`
* Borde: `1px solid T.slateD`
* Border radius: **14px** (también 13px, 16px según contexto)
* Padding: `13px 15px` a `14px 16px`
* Sombra: solo en cards elevadas especiales (hero, FloatBar)

Cards de estadísticas: grid de 3 columnas, texto centrado, valor en color semántico.

## 6.4 Botones

### Botón primario

* Fondo: `linear-gradient(135deg, blue, blueL)`
* Color texto: blanco
* Peso: 800
* Border radius: 12–16px
* Sombra: `0 4px 16px–28px` con color azul al 35–55% de opacidad

### Botón secundario

* Fondo: blanco o transparente
* Borde: `1.5px solid slateD` o borde de color semántico
* Peso: 600–700

### Botón destructivo

* Color: `T.red`
* Fondo: `T.redPale` o borde rojo
* Siempre al final de la fila de acciones

### Botón dashed (añadir)

* Borde: `2px dashed slateD`
* Sin fondo
* Icono `I.plus` centrado
* Texto gris medio

### Botón de filtro (chips horizontales)

* Border radius: 20–22px
* Activo: fondo `blue`, texto blanco
* Inactivo: fondo `rgba(255,255,255,0.12)` en header oscuro, o `slateD` en contenido claro

## 6.5 Badges / Pills (`Pill`)

Componente: `Pill`

* `borderRadius: 20`
* Padding: `3px 11px` (normal) o `2px 8px` (sm)
* `fontSize`: 11px (normal) o 10px (sm)
* `fontWeight: 700`
* Fondo: color + `"18"` (18% opacidad)
* Color de texto: el color semántico del estado

## 6.6 Toast

Componente: `Toast`

* Posición: fijo, superior centrado (`top: 22px`)
* Fondo: `navyLight`
* Texto: blanco, 13px, peso 700
* Border radius: 22px
* Sombra: `0 4px 24px rgba(0,0,0,0.4)`
* Borde: `1px solid rgba(255,255,255,0.1)`
* Animación de entrada: clase `pi` (popIn)
* Auto-cierre: 2400ms

## 6.7 Bottom Navigation (`BottomNav`)

* Posición: fija inferior, `maxWidth: 390`
* Fondo: blanco
* Borde superior: `1px solid slateD`
* Sombra: `0 -4px 20px rgba(0,0,0,0.06)`
* Padding: `8px 0 20px`

**Navegación oficial vigente** (`01-VISION-DEL-PRODUCTO.md` §5):

| Posición | Etiqueta | Módulo |
|----------|----------|--------|
| 1 | Inicio | Inicio |
| 2 | Clientes | Clientes |
| 3 | IA | IA (botón central destacado) |
| 4 | Facturas | Facturas |
| 5 | Cierre | Cierre |
| 6 | Más | Más |

* 6 posiciones en la barra inferior
* El módulo **IA** (posición 3) se presenta como botón central destacado, conforme al diseño oficial aprobado
* Icono + etiqueta por posición en el resto de módulos

Pestaña activa:

* Indicador superior: barra de acento (morado en Módulo Cierre; azul en el resto de módulos Fable 5), 28×3px, `borderRadius: 2`
* Icono y texto en color activo, peso 800

Pestaña inactiva:

* Icono y texto en `textLight`, peso 500

> El prototipo `fable-5-diseño.jsx` está sincronizado con la navegación oficial de `01-VISION-DEL-PRODUCTO.md` v2.5 §5.

## 6.8 Botón central IA

La navegación oficial incluye el módulo **IA** en posición 3 como **botón central destacado** en la barra inferior (icono de estrella, fondo morado/violeta, elevación visual).

Este botón central **no sustituye** la lógica del módulo IA documentada en `08-MODULO-IA.md`.

El FAB heredado del prototipo Fable 5 (`I.plus`, §6.8 anterior) queda **obsoleto**. Sustituido por el botón central de **IA** en posición 3 (implementado en `BottomNav`).

## 6.8.2 IAMenuScreen — cards oficiales del módulo IA

Pantalla de referencia: **`IAMenuScreen`** (nav posición 3 · `08-MODULO-IA.md` §6).

### Header

* Componente: `DarkHeader` (§6.1)
* Título: **«IA»** — blanco, bold 20px
* Subtítulo: guía breve (ej. *Elige cómo quieres que te ayude*) — `textLight` 13px

### Layout de cards

* Contenedor: padding horizontal **18px**, gap vertical **12px** bajo el header
* Patrón card: §6.3 (fondo `T.white` o fondo tintado según agente, radius **14px**, borde `1px solid T.slateD`)
* Cards apiladas **verticalmente** (scroll si el viewport es bajo)

### Card 1 — Agente IA 1 · Escribir con IA

| Propiedad | Valor |
|-----------|-------|
| Agente | **Agente IA 1 — Cotizaciones y Facturas** |
| Icono | `I.edit` · color `T.purple` · tamaño 22px |
| Emoji guía (opcional en card) | ✏️ |
| Fondo de card | `T.purplePale` (`#F5F3FF`) |
| Título | **Escribir con IA** — `T.text`, peso 700, 15px |
| Subtítulo | *Describe tu trabajo en texto* — `T.textMid`, 13px |
| Acción al tocar | Abre flujo **Escribir con IA** → cotización (Agente IA 1) |

### Card 2 — Agente IA 1 · Hablar con IA

| Propiedad | Valor |
|-----------|-------|
| Agente | **Agente IA 1 — Cotizaciones y Facturas** |
| Icono | `I.phone` · color `T.purple` |
| Emoji guía (opcional) | 🎤 |
| Fondo de card | `T.purplePale` |
| Título | **Hablar con IA** |
| Subtítulo | *Dicta tu trabajo con el micrófono* |
| Acción al tocar | Abre flujo **Hablar con IA** → cotización (Agente IA 1) |

### Card 3 — Agente IA 2 · Soporte con IA

| Propiedad | Valor |
|-----------|-------|
| Agente | **Agente IA 2 — Soporte y Tickets** |
| Icono | `I.phone` · color `T.teal` (`#0D9488`) |
| Emoji guía (opcional) | 🎧 |
| Fondo de card | `T.tealPale` (`#F0FDFA`) |
| Título | **Soporte con IA** |
| Subtítulo | *Dudas, errores y tickets de soporte* |
| Acción al tocar | Abre conversación **Soporte con IA** (Agente IA 2) |
| Acceso equivalente | **Más → Soporte** (`07-MODULO-MAS.md` §6) — misma lógica funcional |

### Reglas visuales

* Cards 1 y 2 comparten identidad **morada** (Agente IA 1).
* Card 3 usa identidad **teal** (Agente IA 2) para diferenciar soporte de cotizaciones/facturas.
* No mezclar gradiente morado del botón central nav (§6.8) con el fondo teal de la card 3.
* Cualquier botón o card nueva en este menú requiere entrada en §5.2 y aprobación del propietario (§9.5).

> **Estado prototipo:** `fable-5-diseño.jsx` implementa cards 1 y 2. La card 3 **Soporte con IA** queda documentada aquí como diseño oficial aprobado — pendiente de implementación en el prototipo.

## 6.8.1 FAB heredado — obsoleto

La navegación anterior incluía un FAB central (`I.plus`, 58×58px, gradiente azul, `marginTop: -18`) en `BottomNav`. **Ya no forma parte de la navegación oficial.** Sustituido por el botón central del módulo **IA** en posición 3 (§7.1). El prototipo Fable 5 (`fable-5-diseño.jsx`) implementa el botón central de IA; el FAB `I.plus` fue eliminado.

## 6.9 Formularios

Patrones observados en Fable 5:

### Input inline (dentro de card)

* Sin borde propio (`border: none`)
* Fondo transparente
* Tamaño: 14px, peso 600
* Icono a la izquierda en `textLight`

### Input de búsqueda (en header oscuro)

* Fondo: `rgba(255,255,255,0.1)`
* Sin borde
* Border radius: 14px
* Texto blanco

### Input numérico destacado (wizard — Paso 2 Cantidades)

* Aplica a cada control de partida según tipo de cálculo (Regla 5)
* Tamaño: 50px, peso 900
* Centrado
* Fondo: `slate`
* Borde: 2px, color de categoría cuando tiene valor

### Textarea

* Border: `1.5px solid slateD`
* Border radius: 12px
* `minHeight: 72px`
* Fondo blanco

### Selector pill (Más)

* Contenedor: fondo `slateD`, radius 14px, padding 4px
* Pestaña activa: fondo blanco, sombra `0 1px 5px rgba(0,0,0,0.1)`, peso 800

### Toggle (`Toggle`)

* Tamaño: 46×26px
* Border radius: 13px
* Activo: fondo `blue`, halo `blue` al 22%
* Inactivo: fondo `slateD`
* Círculo interior: 20×20px, blanco, transición con `cubic-bezier(0.34,1.56,0.64,1)`

### Range slider

* `accent-color: #2563EB` (global en `GS`)

## 6.10 Modales

Patrón bottom-sheet usado en `PDFModal`, `InvoiceModal`, y modales del **Módulo Más**:

* Overlay: `rgba(0,0,0,0.65–0.72)`, clase `fi` (fadeIn)
* Contenedor: fondo blanco, `borderRadius: 22px 22px 0 0`
* Ancho máximo: **390px**
* Altura máxima: 90–92vh, scroll interno
* Header del modal: fondo `navyLight`, sticky top
* Botón cerrar: `I.x` en círculo translúcido

## 6.11 StepDots

Componente: `StepDots`

* Total de puntos: configurable (en cotización: **4**)
* Punto activo: ancho 20px, altura 6px, blanco
* Punto completado: 6×6px, verde
* Punto pendiente: 6×6px, blanco al 20% de opacidad
* Transición: `all 0.3s`

## 6.12 FloatBar

Componente: `FloatBar`

* Posición: fija inferior, centrada
* Ancho: `calc(100% - 28px)`, max 362px
* Fondo: `navyLight`, radius 18px
* Contador de partidas en cuadrado azul 38×38
* Botón "Continuar →" con gradiente azul
* Animación de entrada: clase `pi`
* Visible en fase de **selección** del wizard cuando hay ≥1 partida: contador + «Continuar → Cantidades» (**sin total calculado**)
* En **Paso 2 Cantidades**: total parcial visible + acción «Continuar → Resumen» (Regla 8 — `05-MODULO-COTIZACIONES.md`)
* En **Paso 3 Resumen**: acción «Continuar → Cliente»

## 6.13 Componente SVG (`SVG`)

Renderizador base de iconos:

* ViewBox: `0 0 24 24`
* Stroke por defecto: 2
* `strokeLinecap: round`, `strokeLinejoin: round`

## 6.14 Pantallas oficiales existentes

Estas pantallas están implementadas en Fable 5 y definen el lenguaje visual del producto:

| Pantalla | Función |
|----------|---------|
| `HomeScreen` | Inicio — nav posición 1 — ver `02-MODULO-INICIO.md` |
| `ClientsScreen` | Lista de clientes — nav posición 2 |
| `ClientDetail` | Ficha de cliente |
| `QuotesScreen` | Lista de cotizaciones |
| `QuoteScreen` | Wizard de cotización |
| `SettingsScreen` | Módulo Más (3 pestañas) — nav posición 6 (§7.1) |
| `InvoicesScreen` | Lista de facturas — nav posición 4 |
| `InvoiceEditor` | Crear / convertir factura |
| `PDFModal` | Vista previa PDF cotización |
| `InvoiceModal` | Vista previa PDF factura |
| `CierreScreen` | Módulo Cierre — Gastos + Expediente Mensual — nav posición 5; ref. imagen `09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png` |
| `IAMenuScreen` | Módulo IA — menú Escribir / Hablar / Soporte con IA — nav posición 3 (botón central) |

---

# 7. NAVEGACIÓN

## 7.1 Barra inferior oficial

Navegación principal aprobada (`01-VISION-DEL-PRODUCTO.md` §5):

| Posición | Etiqueta | Módulo |
|----------|----------|--------|
| 1 | Inicio | Inicio |
| 2 | Clientes | Clientes |
| 3 | IA | IA (botón central destacado) |
| 4 | Facturas | Facturas |
| 5 | Cierre | Cierre |
| 6 | Más | Más |

El **Módulo Más** (posición 6) agrupa funcionalidades oficialmente aprobadas: Empresa, SUNAT, Catálogo Maestro, Integraciones, APIs del cliente, Inicio de sesión / Perfil y demás opciones secundarias (`07-MODULO-MAS.md`).

El **Módulo Cierre** (posición 5) dispone de diseño oficial aprobado — ver §7.5 y `09-MODULO-CIERRE.md`.

Implementación de referencia en `BottomNav` — ver §6.7.

## 7.2 Pantallas y flujos

Flujos principales (referencia):

```
home             — Inicio (nav 1)
clients          — Módulo Clientes (nav 2)
ia               — Módulo IA (nav 3)
invoices         — Módulo Facturas (nav 4)
cierre           — Módulo Cierre (nav 5)
more             — Módulo Más (nav 6)
```

Flujos secundarios (sin BottomNav en pantallas de edición):

* wizard de cotización (`quote`)
* editor de factura (`invoiceEditor`)

Modales superpuestos (no cambian `screen`):

* `PDFModal` — al ver PDF de cotización
* `InvoiceModal` — al ver PDF de factura

> El prototipo Fable 5 (`fable-5-diseño.jsx`) implementa la navegación oficial de seis módulos. El wizard de cotización (`quote`) y el editor de factura (`invoiceEditor`) permanecen como flujos secundarios sin BottomNav.

## 7.3 Reglas de visibilidad de la BottomNav

La barra inferior **se oculta** en:

* `quote` (wizard de cotización)
* `invoiceEditor` (editor de factura)

En el resto de pantallas principales permanece visible.

## 7.4 Navegación secundaria

* `BackBtn`: vuelve a la pantalla anterior con etiqueta personalizable
* Enlaces de texto en azul: "Ver todos →", "+ Añadir más"
* Chips de filtro con scroll horizontal en listas

**No hay información suficiente en la documentación oficial** sobre rutas URL (`/cotizaciones`, `/clientes`, etc.) ni sobre decisiones de arquitectura de navegación entre lista global de cotizaciones y ficha de cliente.

## 7.5 Módulo Cierre — referencia visual oficial

El diseño visual oficial del **Módulo Cierre** está aprobado y documentado en:

* **Imagen oficial:** `09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png`
* **Documento funcional y de diseño:** `09-MODULO-CIERRE.md`

Esta imagen forma parte de las **referencias visuales oficiales del Sistema de Diseño Fable 5** para Darivo Pro Móvil.

Las futuras implementaciones del Módulo Cierre deberán utilizar esta imagen como referencia oficial del diseño del módulo.

El diseño aprobado incluye:

* Pestañas **Gastos** y **Expediente Mensual**
* Flujo de registro de gastos con asistencia IA
* Selectores de **mes** y **año**
* Generación de **expediente mensual**
* Formatos de exportación: PDF, ZIP y carpeta organizada
* Acentos morados/violetas en acciones y pestañas activas del módulo

---

# 8. ANIMACIONES

Definidas en el bloque global `GS` de `docs/02-darivo-pro-movil/fable-5-diseño.jsx`. **Solo existen estas tres animaciones.**

## 8.1 `@keyframes slideUp`

```
from: opacity 0, translateY(18px)
to:   opacity 1, translateY(0)
```

Clase CSS: **`.su`**
Duración: `0.22s`
Easing: `cubic-bezier(.2,.8,.4,1)`
Uso: entrada de secciones y modales bottom-sheet

## 8.2 `@keyframes fadeIn`

```
from: opacity 0
to:   opacity 1
```

Clase CSS: **`.fi`**
Duración: `0.18s`
Easing: `ease`
Uso: overlays de modales

## 8.3 `@keyframes popIn`

```
from: opacity 0, scale(0.88)
to:   opacity 1, scale(1)
```

Clase CSS: **`.pi`**
Duración: `0.2s`
Easing: `cubic-bezier(0.34,1.56,0.64,1)`
Uso: Toast, FloatBar, elementos que aparecen con énfasis

## 8.4 Micro-interacción de botón

```
button:active { transform: scale(0.96); transition: transform 0.08s; }
```

## 8.5 Transiciones en componentes

* Toggle: `background 0.2s`, círculo `left 0.18s`
* StepDots: `all 0.3s`
* Bordes de acordeón: `border-color 0.2s`
* Pestañas de configuración: `all 0.2s`

**No hay información suficiente en la documentación oficial** sobre animaciones adicionales para módulos futuros.

---

# 9. REGLAS OBLIGATORIAS

## 9.1 Jerarquía documental

1. **`16-SISTEMA-DE-DISEÑO-FABLE5.md`** (este documento) — fuente máxima del diseño de **Darivo Pro Móvil**
2. **`docs/02-darivo-pro-movil/fable-5-diseño.jsx`** — implementación de referencia

Ningún otro MD puede contradecir este documento en lo relativo al diseño de Darivo Pro Móvil.

## 9.2 Prohibiciones explícitas

Sin autorización expresa del propietario del producto, está prohibido:

* ❌ Cambiar colores de la paleta `T`
* ❌ Cambiar la tipografía Inter
* ❌ Añadir iconos fuera del objeto `I`
* ❌ Modificar componentes oficiales (headers, cards, botones, modales, etc.)
* ❌ Cambiar la estructura de la Bottom Navigation sin alineación con `01-VISION-DEL-PRODUCTO.md` §5
* ❌ Inventar animaciones nuevas
* ❌ Rediseñar pantallas existentes

## 9.3 Obligaciones

* ✅ Todo módulo nuevo debe reutilizar componentes existentes siempre que sea posible
* ✅ Toda acción con botón debe seguir la tabla maestra de acciones de este MD (§5.2)
* ✅ Todo estado visual debe usar los colores de estado fijos
* ✅ Toda pantalla nueva debe respetar `maxWidth: 390`, paleta `T` y tipografía Inter
* ✅ Cualquier botón nuevo debe documentarse en este MD (§5.2) con aprobación del propietario antes de implementarse

## 9.4 Regla de oro del producto

Según `01-VISION-DEL-PRODUCTO.md`:

> Toda decisión de producto debe responder a: ¿Ayuda al usuario a crear una cotización o factura más rápido y con menos esfuerzo?

## 9.5 Regla de oro de iconos y botones

> Si una nueva funcionalidad necesita un botón que NO está en la tabla maestra (§5.2), primero se documenta en este MD y se aprueba con el propietario — nunca se inventa directamente en el código.

## 9.6 Reglas de gobernanza del diseño (obligatorias desde 26/06/2026)

**Fable 5 es el diseño oficial de Darivo Pro Móvil. Nadie puede modificarlo sin aprobación explícita del propietario del producto.**

* ❌ **Ninguna IA** puede modificar colores, iconos, componentes, navegación ni animaciones, aunque el prompt no lo mencione explícitamente.
* ❌ **Ningún prompt** puede introducir cambios visuales aunque parezcan menores o mejoras obvias.
* ❌ **Ningún desarrollador** puede introducir variaciones visuales no documentadas ni aprobadas.
* ❌ **Ningún MD** puede contradecir este documento ni a `docs/02-darivo-pro-movil/fable-5-diseño.jsx`.
* ✅ Toda contradicción detectada entre código, MDs o Fable 5 debe **reportarse al propietario** antes de resolverse.
* ✅ Si Fable 5 y un MD específico se contradicen, **prevalece Fable 5** hasta que el propietario decida.
* ✅ Si una funcionalidad aprobada no existe todavía en Fable 5, se marca como **"Pendiente de diseño en Fable 5"** — nunca se elimina del MD.
* ✅ Todo cambio aprobado sigue el flujo: Propuesta → Aprobación propietario → Actualización MD 16 → Actualización Fable 5 → Implementación en código.

**Si cualquier IA, prompt o desarrollador modifica el diseño sin seguir este flujo, el cambio debe revertirse.**

---

# 10. EXTENSIÓN DEL SISTEMA

## 10.1 Módulos con pantalla en Fable 5

El prototipo `docs/02-darivo-pro-movil/fable-5-diseño.jsx` incluye pantallas de referencia visual. **La navegación oficial vigente** es la definida en §7.1 (`01-VISION-DEL-PRODUCTO.md` §5) y está implementada en el prototipo.

Pantallas existentes en el prototipo (sincronizadas con nav oficial §7.1):

* Inicio (`HomeScreen` — nav posición 1; ver `02-MODULO-INICIO.md`)
* Clientes (lista + ficha — nav posición 2)
* IA (`IAMenuScreen` — nav posición 3, botón central destacado · §6.8.2)
* Cotizaciones (lista + wizard — flujo secundario sin tab en nav)
* Facturas (lista + editor + modal — nav posición 4)
* Cierre (`CierreScreen` — nav posición 5; imagen oficial `09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png`)
* Más (`SettingsScreen` — nav posición 6; ver `07-MODULO-MAS.md`)

## 10.2 Módulos de Darivo Pro Móvil — estado en prototipo Fable 5

| Módulo | Nav | Estado en prototipo |
|--------|-----|---------------------|
| Inicio | 1 | `HomeScreen` implementado — ver `02-MODULO-INICIO.md` |
| Clientes | 2 | Implementado |
| IA | 3 | `IAMenuScreen` — cards Escribir / Hablar / Soporte con IA (§6.8.2) |
| Facturas | 4 | Implementado |
| Cierre | 5 | `CierreScreen` implementado conforme a imagen oficial |
| Más | 6 | `SettingsScreen` — 3 pestañas + secciones adicionales (ver `07-MODULO-MAS.md` §6) |

El diseño visual de referencia del **Módulo Cierre** es la imagen oficial `09 – MÓDULO CIERRE – DARIVO PRO MÓVIL.png` (§7.5).

### Reglas para extender módulos sin romper Fable 5

Cuando se diseñe e implemente cualquiera de estos módulos **en Darivo Pro Móvil**:

1. **Reutilizar obligatoriamente:** `DarkHeader`, cards blancas (radius 14px), `Pill`, botones primarios/secundarios, `Toast`, `BackBtn`, paleta `T`, Inter, iconos `I`
2. **Mantener:** `maxWidth: 390`, fondo de contenido `slate`, animaciones `.su` / `.fi` / `.pi`
3. **Solo añadir componentes nuevos** cuando los existentes no cubran la necesidad
4. **Nunca cambiar** el lenguaje visual: mismos colores, mismos radios, misma jerarquía tipográfica
5. **Proponer primero** cualquier icono o botón nuevo al propietario y documentarlo en este MD (§5.2)
6. **Documentar después** cualquier componente nuevo aprobado en una actualización de este MD

## 10.3 Darivo Pro Admin

Según `01-VISION-DEL-PRODUCTO.md` §10:

Darivo Pro Admin dispone de su **propio diseño oficial** para entorno de escritorio.

Este documento (Fable 5) **no define** dicho diseño.

Fable 5 **no se aplica** a Darivo Pro Admin.

## 10.4 Darivo Pro Empresa

Según `01-VISION-DEL-PRODUCTO.md` §10:

Darivo Pro Empresa dispone de su **diseño oficial** para entorno de escritorio, documentado en `03-darivo-pro-empresa/16-SISTEMA-DE-DISEÑO-EMPRESA.md`.

Este documento (Fable 5) **no define** dicho diseño.

Fable 5 **no se aplica** a Darivo Pro Empresa.

---

# 11. CONTRADICCIONES DETECTADAS

Análisis basado únicamente en las cuatro fuentes permitidas.

## 11.1 Entre la tabla maestra de acciones (§5.2) y `docs/02-darivo-pro-movil/fable-5-diseño.jsx`

**Actualizado el 26/06/2026.** Las contradicciones documentales de acciones y botones quedaron resueltas en este MD (§5.2). Las contradicciones de funcionalidad aprobada vs diseño Fable 5 se marcaron como **"Pendiente de diseño en Fable 5"**.

| Tema | Estado | Resolución |
|------|--------|------------|
| Compartir vs WhatsApp en wizard resultado | ✅ Resuelto | Este MD documenta WhatsApp como botón real; Compartir solo en PDFModal |
| Unificación "Compartir / PDF" bajo `I.share` | ✅ Resuelto | Este MD los documenta como acciones separadas: `I.pdf` y `I.share` |
| Botones Editar/Re-cotizar/Eliminar en ficha Cliente | ✅ Implementado | Fila de acciones en `ClientDetail` — §5.2 |
| Botones Editar/Re-cotizar/Eliminar/Compartir en lista Cotizaciones | ✅ Implementado | Mismo patrón en `ClientDetail` y `QuotesScreen` — §5.2 |
| Botón Compartir en lista Facturas | ✅ Resuelto | Este MD y MD 06 documentan "Ver factura" con `I.pdf` como acción real de Fable 5 |
| Acceso IA (posición 3 nav principal) | ✅ Implementado | `IAMenuScreen` cards 1–2 en prototipo; card 3 Soporte con IA documentada §6.8.2 |
| Soporte con IA (IAMenuScreen card 3) | ⏳ Pendiente prototipo | Diseño oficial §6.8.2 · lógica `08-MODULO-IA.md` §11 |
| Botones no documentados (Guardar, Email, Cancelar, Cerrar, etc.) | ✅ Resuelto | Este MD los documenta en §5.2 |

## 11.2 Entre `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` y la jerarquía documental

Según `01-VISION-DEL-PRODUCTO.md` §12, la **Visión del Producto** es el documento maestro estratégico y `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` desarrolla únicamente arquitectura técnica.

El archivo `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` contiene contenido histórico desactualizado en su §1 y está **pendiente de sincronización completa** con la Visión del Producto. Ante cualquier contradicción, prevalece `01-VISION-DEL-PRODUCTO.md`.

## 11.3 Dentro de Fable 5 (inconsistencias internas del prototipo)

| Tema | Observación |
|------|-------------|
| Moneda en catálogo | ✅ Resuelto | `fmt` y catálogo usan **S/** (PEN) conforme a `05` §4 y `07` §5 |
| Icono del header de cotización | `QuoteScreen` usa `I.zap` en el header del wizard; el botón central de nav es **IA** (`I.sparkle`, morado — §6.8) |
| Botón en lista de clientes | El botón inferior dice "Nueva cotización" y abre el wizard de cotización, no un formulario de "Nuevo cliente" |

Estas inconsistencias internas del prototipo deben resolverse con decisión del propietario del producto antes de implementación final. Este MD documenta el estado actual del archivo fuente sin corregirlo.

---

# 12. RECOMENDACIONES PARA MANTENER UN ÚNICO SISTEMA

## 12.1 Una sola fuente de verdad visual — Darivo Pro Móvil

* **`16-SISTEMA-DE-DISEÑO-FABLE5.md`** debe ser el primer documento que lea cualquier persona o IA antes de tocar la interfaz de **Darivo Pro Móvil**.
* **`docs/02-darivo-pro-movil/fable-5-diseño.jsx`** es la referencia visual ejecutable de Darivo Pro Móvil: ante duda, abrir ese archivo.

Los diseños oficiales de **Darivo Pro Admin** y **Darivo Pro Empresa** se documentarán en sus respectivos documentos cuando el propietario lo autorice (`01-VISION-DEL-PRODUCTO.md` §10).

## 12.2 `DARIVO-PRO-ARQUITECTURA-MAESTRA.md`

La Arquitectura Maestra está pendiente de sincronización completa con `01-VISION-DEL-PRODUCTO.md` (v2.5). Los principios estratégicos del ecosistema, incluido el sistema de diseño por producto (§10), residen en la Visión del Producto. Este MD `16` documenta exclusivamente el diseño de **Darivo Pro Móvil**. Para la **estructura de navegación**, prevalece `01-VISION-DEL-PRODUCTO.md` §5; el prototipo Fable 5 está sincronizado con esa definición.

## 12.3 Resolver contradicciones antes de implementar

Las diferencias menores entre la tabla maestra de acciones (§5.2) y el prototipo Fable 5 (p. ej. Compartir referido en Más) deben cerrarse con una decisión explícita del propietario. Hasta entonces, **este MD `16` prevalece sobre implementaciones parciales**.

## 12.4 Flujo de aprobación para cambios

```
1. Propuesta escrita (qué cambia y por qué)
2. Aprobación del propietario del producto
3. Actualización de 16-SISTEMA-DE-DISEÑO-FABLE5.md
4. Actualización de `docs/02-darivo-pro-movil/fable-5-diseño.jsx` (si afecta el prototipo)
5. Solo entonces: implementación en código de producción
```

## 12.5 Extensión de módulos futuros — Darivo Pro Móvil

Para Más (completar), Informes/Mi Plan/Referidos y flujos secundarios **en Darivo Pro Móvil**:

* Diseñar primero en `docs/02-darivo-pro-movil/fable-5-diseño.jsx` usando componentes existentes
* Documentar componentes nuevos en este MD `16`
* No implementar en producción hasta que el diseño esté aprobado

## 12.6 Prohibición de rediseño silencioso — Darivo Pro Móvil

Cualquier prompt o tarea de funcionalidad nueva **en Darivo Pro Móvil** debe incluir explícitamente:

> "Mantener diseño Fable 5 exacto. No rediseñar."

Si no lo incluye, el desarrollador o la IA debe detenerse y consultar al propietario.

---

*Fin del documento 16-SISTEMA-DE-DISEÑO-FABLE5.md*
