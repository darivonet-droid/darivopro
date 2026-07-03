# 02 – MÓDULO INICIO – DARIVO PRO EMPRESA

**Versión:** 2.2

**Estado:** ✅ Producción completada (Reglas §15 — 02/07/2026)

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §5, §6, §9 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §5–§6.1

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **Módulo Inicio** en Darivo Pro Empresa.

---

# 0. Fuentes consultadas (Reglas §7.2)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/02-MODULO-INICIO.md` v1.0 | Funcionalidad, KPIs, atajos, relaciones, reglas |
| Referencia diseño escritorio | `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` v1.0 | Layout: sidebar + header + tarjetas resumen + área principal + actividad reciente |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.3 | Sidebar, header, cards, tablas, tokens, §6.1 Patrón Inicio |

> **Lógica de negocio:** exclusivamente Móvil. **Presentación:** Admin Dashboard + Sistema Diseño Empresa. Sin funcionalidades del Dashboard Admin (usuarios plataforma, suscripciones, tickets, etc.).

---

# 1. Objetivo

Pantalla de **bienvenida y resumen operativo** del **Gerente** en Darivo Pro Empresa (`empresa.darivo.net`).

Ofrece KPIs de actividad de cotizaciones e **atajos** a las acciones más frecuentes, sin duplicar Clientes, Facturas, Cierre ni Más.

**Inicio no almacena datos propios** — es resumen y navegación rápida (Móvil §5).

Equivalente funcional Móvil: `HomeScreen` (Móvil §2).

---

# 2. Imagen oficial

**Archivo:** `02 - MODULO INICIO - DARIVO PRO EMPRESA.png`

![Módulo Inicio — Darivo Pro Empresa](./02%20-%20MODULO%20INICIO%20-%20DARIVO%20PRO%20EMPRESA.png)

La imagen es referencia visual derivada de este MD. Prevalece siempre este MD ante cualquier diferencia.

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | Posición **Inicio** (1) — ítem activo por defecto |
| Entrada | Pantalla por defecto al acceder a `empresa.darivo.net` |
| Equivalente Móvil | Bottom nav posición 1 (`01-VISION-DEL-PRODUCTO.md` §5) |

**Sidebar visible:** los 6 módulos compartidos (Sistema Diseño §5.1) + módulos exclusivos Empresa cuando estén documentados. Inicio permanece en posición 1.

**No incluido en sidebar:** Cotizaciones (flujo secundario — `05-MODULO-COTIZACIONES-EMPRESA.md`).

---

# 4. Layout general

Estructura de escritorio conforme a Sistema Diseño §5 y patrón Admin Dashboard §5, adaptada al alcance funcional de Inicio Móvil:

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER SUPERIOR (§5.1)                          │
│  240px      ├──────────────────────────────────────────────────┤
│  navy       │  FILA KPI — 3 cards (§5.2)                       │
│             ├──────────────────────────────────────────────────┤
│  Inicio ●   │  CTA Nuevo presupuesto (§5.3)                    │
│  Clientes   ├──────────────────────────────────────────────────┤
│  IA         │  ACCESOS RÁPIDOS — 2 cards (§5.4)                │
│  Facturas   ├──────────────────────────────────────────────────┤
│  Cierre     │  CAPÍTULOS DE OBRA — pills (§5.5)                │
│  Más        ├──────────────────────────────────────────────────┤
│  …          │  ÚLTIMOS PRESUPUESTOS — tabla compacta (§5.6)    │
└─────────────┴──────────────────────────────────────────────────┘
```

* Fondo área de contenido: `T.slate` · padding 24–32px · ancho útil mín. 1024px (Sistema Diseño §5.3).
* Cards: radius 14px · fondo `T.white` (Sistema Diseño §6).

---

# 5. Estructura de pantalla

## 5.1 Header superior

Zona superior del área de contenido (patrón Sistema Diseño §5.2, contenido específico de Inicio Móvil §2):

| Elemento | Descripción | Origen |
|----------|-------------|--------|
| Saludo | «¡Hola de nuevo!» | Móvil §2 |
| Título | Nombre del **Gerente** conectado | Móvil §2 · Visión §6 |
| Badge | **DARIVO PRO** — fondo `T.blue`, radius 14px | Móvil §2 |
| Notificaciones | Icono campana — esquina derecha | Sistema Diseño §5.2 |
| Usuario | Avatar / menú Gerente — esquina derecha | Sistema Diseño §5.2 |

**Excluido explícitamente** (existen en Admin Dashboard §5 pero **no** en Móvil Inicio):

* Buscador global.
* Selector de rango de fechas.
* Ayuda contextual de plataforma.

## 5.2 Tarjetas KPI

Tres cards en fila horizontal (adaptación del grid 3 columnas del `DarkHeader` móvil — Móvil §2 · Admin Dashboard §5 «Tarjetas de resumen»):

| KPI | Token color | Valor mostrado | Cálculo |
|-----|-------------|----------------|---------|
| Aprobados | `T.green` | Número entero | Nº cotizaciones estado **Aprobado** |
| Pendientes | `T.amber` | Número entero | Nº cotizaciones estado **Pendiente** |
| Ingresos S/ | `T.blue` | Importe en soles | Suma importes cotizaciones **Aprobadas** |

Moneda: **S/** (Móvil §5 · Sistema Diseño §3).

Cada card: título del KPI · valor destacado · color de acento según tabla.

## 5.3 CTA — Nuevo presupuesto

Card de acción principal a ancho completo del área de contenido:

| Atributo | Valor |
|----------|-------|
| Estilo | Gradiente `T.blue` → `T.blueL`, radius 20px |
| Icono | `I.zap` en caja translúcida |
| Título | «Nuevo presupuesto» |
| Subtítulo | «Combina partidas · menos de 60 seg» |
| Jerarquía | Botón primario (Sistema Diseño §6) |

**Acción:** abre el wizard de cotización — Partidas → Cliente → Resumen (`05-MODULO-COTIZACIONES.md` §2 · Empresa pendiente).

## 5.4 Accesos rápidos

Dos cards en fila horizontal (equivalente al grid 2 columnas móvil — Móvil §2 · Admin Dashboard §6 «Acciones rápidas»):

| Card | Destino | Tipo navegación |
|------|---------|-----------------|
| **Clientes** | Módulo Clientes | Sidebar posición 2 |
| **Presupuestos** | Módulo Clientes | Sidebar posición 2 — historial por cliente (Cotizaciones §3) |

Iconografía de las cards: **Pendiente de documentación oficial** en MD Móvil Inicio §2 — no inventar iconos hasta que existan en fuente Móvil o Fable 5 §5.2.

## 5.5 Capítulos de obra

Fila de pills/chips horizontales (Móvil §2 · Sistema Diseño §6 `Pill`):

* Una pill por **categoría habilitada** del catálogo de la empresa.
* Colores de categoría: tokens catálogo Fable 5 §3.2 (marca compartida).
* **Acción al pulsar:** abre wizard de cotización con la categoría preseleccionada (`05-MODULO-COTIZACIONES.md` §2).

## 5.6 Últimos presupuestos

Sección inferior — equivalente a «Actividad reciente» del Admin Dashboard §5, con alcance Inicio Móvil §2:

**Encabezado de sección:** «Últimos presupuestos» · enlace textual **Ver todos →** (destino: módulo **Clientes** — Cotizaciones §3: no existe lista global).

**Tabla compacta** — máximo **4 filas** (Sistema Diseño §5.3 · §6):

| Columna | Contenido |
|---------|-----------|
| Cliente | Nombre del cliente |
| Resumen | Descripción breve de la cotización |
| Importe S/ | Importe en soles |
| Estado | `Pill` — Aprobado / Pendiente / etc. |

Cabecera de tabla: fondo `T.navyLight`, texto claro (patrón Admin tablas).

> El historial autoritativo por cliente permanece en `03-MODULO-CLIENTES-EMPRESA.md` (Móvil §3). Esta tabla es **atajo visual**, no sustituye al historial por cliente.

**Acción al pulsar fila:** Pendiente de documentación oficial en MD Móvil Inicio — no documentar hasta que exista en fuente Móvil.

---

# 6. Botones y acciones (resumen)

| Elemento | Tipo | Acción |
|----------|------|--------|
| CTA Nuevo presupuesto | Primario | Wizard cotización |
| Card Clientes | Acceso rápido | Navega a Clientes (sidebar 2) |
| Card Presupuestos | Acceso rápido | Navega a Clientes (sidebar 2) |
| Pill capítulo obra | Chip | Wizard cotización (categoría) |
| Ver todos → | Enlace | Módulo Clientes |
| Notificaciones | Icono header | Patrón header Empresa (Sistema Diseño §5.2) — acción específica **pendiente** en Móvil |
| Menú usuario | Header | Patrón header Empresa (Sistema Diseño §5.2) — acción específica **pendiente** en Móvil |

---

# 7. Funcionalidad (referencia Móvil §3)

* Muestra resumen de cotizaciones aprobadas, pendientes e ingresos.
* Acceso rápido al wizard de cotización (Partidas → Cliente → Resumen).
* Acceso rápido al módulo Clientes.
* No duplica gestión de clientes, facturas ni cierre.
* Las cotizaciones guardadas se consultan en la ficha de cada Cliente (Móvil §3).
* Sin acceso directo a Facturas, Cierre ni Más (Móvil §4).
* Sin flujos fiscales ni cierre mensual (Móvil §5).

---

# 8. Relaciones con otros módulos

| Módulo | Relación |
|--------|----------|
| Clientes (03) | Acceso rápido desde card · historial autoritativo por cliente |
| Cotizaciones (05) | CTA, pills y tabla → wizard o lista secundaria |
| IA (08) | El wizard también puede iniciarse desde IA (sidebar 3) |
| Facturas (06) | Sin acceso directo desde Inicio |
| Cierre (09) | Sin acceso directo desde Inicio |
| Más (07) | Sin acceso directo desde Inicio |

---

# 9. Permisos

Usuario: **Gerente** en Darivo Pro Empresa (`01-VISION-DEL-PRODUCTO.md` §6).

Detalle de permisos: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` (pendiente de producción FASE 2).

---

# 10. Validación (Reglas §9 · §15)

### §9.1 Diseño documentado

* [x] Lógica de negocio ↔ Móvil `02-MODULO-INICIO.md`
* [x] Diseño escritorio ↔ Admin Dashboard §5 + Sistema Diseño Empresa §5–§6.1
* [x] MD documenta estructura, navegación, botones y funcionalidades
* [x] Alcance ↔ Visión §5, §6, §9

### §9.2 Cierre del módulo

* [x] Imagen oficial creada y validada ↔ MD (Reglas §15 FASE 5)
* [x] Producción completada en índice

---

# 11. Estado

✅ **Producción completada** — Reglas §15 (02/07/2026).

**Fin del documento.**
