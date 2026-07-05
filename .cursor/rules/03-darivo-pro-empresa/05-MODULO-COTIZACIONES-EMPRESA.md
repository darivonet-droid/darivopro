# 05 – MÓDULO COTIZACIONES – DARIVO PRO EMPRESA

**Versión:** 1.2

**Estado:** ✅ Sincronizado con Móvil v1.6 (05/07/2026)

**Relacionado:** `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO…` · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.3

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **flujo de Cotizaciones** en Darivo Pro Empresa.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso |
|--------|-----------|-----|
| Lógica de negocio | `01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` v1.6 | Wizard 4 pasos, wizard único, Reglas 1–10 |
| Referencia diseño escritorio | — | *Sin MD Admin equivalente* — layout multi-panel (Sistema Diseño §5.3) |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | Paneles, tablas, formularios amplios |
| Maestro | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO…` | Catálogo, Tarifa Pro, motor cotización |

---

# 1. Objetivo

Flujo de **cotización** (presupuesto de trabajo) en escritorio — wizard **Selección → Cantidades → Resumen → Cliente** (Móvil §2 · Reglas 1–10).

**Wizard único:** un solo wizard para todas las categorías; mismos StepDots (4 pasos) para todos los usuarios. La única diferencia es la navegación inicial del Paso 1 hasta Partidas (Construcción → subcategorías).

No tiene validez fiscal. Numeración COT-001, COT-002… al confirmar (Móvil §4 Regla 10).

**No es ítem del sidebar** (`01-VISION-DEL-PRODUCTO.md` §5 · Móvil §1).

---

# 2. Imagen oficial

**Archivo:** `05 - MODULO COTIZACIONES - DARIVO PRO EMPRESA.png`

![Módulo Cotizaciones — Darivo Pro Empresa](./05%20-%20MODULO%20COTIZACIONES%20-%20DARIVO%20PRO%20EMPRESA.png)

Prevalece siempre este MD ante cualquier diferencia funcional. La imagen puede reflejar layout anterior; la lógica vigente es la de Móvil v1.6.

---

# 3. Navegación y accesos

| Origen | Acción |
|--------|--------|
| Inicio (02) | CTA «Nuevo presupuesto» · pills capítulos obra → **flujo manual** |
| Clientes (03) | «+ Nuevo» en ficha · Editar / Re-cotizar en historial |
| IA (08) | Flujos Escribir / Hablar con IA → converge a **Cantidades** (Móvil §2) |

**Consulta de cotizaciones guardadas:** únicamente en ficha de Cliente (Móvil §3 — **no** existe lista global).

---

# 4. Layout wizard (escritorio)

Vista a pantalla completa dentro del área de contenido (sin sidebar oculto).

**Paso 1 — Selección:** tres zonas simultáneas:

```
┌─────────────────────────────────────────────────────────────┐
│  Header: «Nueva cotización» · StepDots (1·2·3·4)            │
├──────────────┬──────────────────────────┬───────────────────┤
│  PANEL CAT.  │  PANEL PARTIDAS          │  (sin total calc.)│
│  ~240px      │  central flexible        │                   │
│  §5.1        │  §5.1                    │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

**Paso 2 — Cantidades:** panel central con controles por tipo y totales parciales (§5.2).

**Paso 3 — Resumen:** panel central con tabla, hero total, margen, notas y acciones (§5.3).

**Paso 4 — Cliente:** formulario cliente + confirmación (§5.4).

En Pasos 2–4 el panel categorías puede colapsar o mostrar contexto.

---

# 5. Pasos del wizard

## 5.1 Paso 1 — Selección (Categorías / Partidas)

Equivalente Móvil §2 Paso 1 · Doc 21 · Reglas 2–3.

**Panel categorías (izquierda):** cards por categoría habilitada. Flujo Construcción → subcategorías navegación.

**Panel partidas (centro):** lista partidas · toggle multi-selección · **solo partidas visibles** · **sin cantidades, sin calculadora, sin controles numéricos**.

**FloatBar / acción:** contador de partidas seleccionadas + **Continuar → Cantidades** (sin total calculado).

## 5.2 Paso 2 — Cantidades

Equivalente Móvil §2 Paso 2 · Reglas 4–9.

| Bloque | Contenido |
|--------|-----------|
| Lista dinámica | Partidas seleccionadas · agrupadas por categoría · orden Catálogo Maestro |
| Controles | Un control por partida según tipo (Regla 5) · sin calculadora genérica |
| Totales | Recálculo automático: importe · subtotales · total parcial |
| Validación | «Continuar → Resumen» solo si Cantidades completo (Regla 8) |

Motor de precios: Mis Tarifas → Tarifa Pro al calcular en Cantidades (Doc 21).

Navegación atrás: conservación de mediciones (Regla 6).

## 5.3 Paso 3 — Resumen

Equivalente Móvil §2 Paso 3 · solo presentación.

| Bloque | Contenido |
|--------|-----------|
| Hero total | Gradiente azul · TOTAL · desglose material / mano de obra |
| Tabla | Partidas · subtotales · agrupadas por categoría |
| Margen MO | Slider 0–120% + presets |
| Notas | Campo texto (PDF) |
| Estado / acciones | Borrador/Pendiente/Aprobado · PDF · WhatsApp |
| Acción | «Continuar → Cliente» |

**No realiza cálculos nuevos** ni controles de medición por partida.

## 5.4 Paso 4 — Cliente y confirmación

Equivalente Móvil §2 Paso 4 · Regla 10.

Card formulario (nombre · teléfono · ciudad opcional). Auto-vinculación / creación cliente.

Tras Cliente — botones (Móvil §2 · Fable 5 §5.2):

| Botón | Icono | Condición |
|-------|-------|-----------|
| Guardar | `I.save` | Primario verde · guardado definitivo |
| WhatsApp | `I.wa` | Secundario |
| Generar y enviar PDF | `I.pdf` | Secundario |
| Convertir en Factura → | `I.receipt` | Solo si ya guardado y Aprobado |
| Nuevo presupuesto | — | Dashed · resetea wizard |

Selector estado: Borrador / Pendiente / Aprobado (en confirmación).

---

# 6. Edición desde Clientes

Desde historial en ficha Cliente (`03-MODULO-CLIENTES-EMPRESA.md` §6.5):

* **Editar** — wizard precargado · mediciones en Cantidades · actualiza misma COT-
* **Re-cotizar** — wizard precargado · nueva COT-
* **Eliminar** — borrado inmediato
* **Facturar** — solo Aprobado → `06-MODULO-FACTURAS-EMPRESA.md`

---

# 7. Funcionalidad (referencia Móvil §4)

* Multi-categoría permitida.
* Entrada numérica libre (coma/punto) **por control de partida en Cantidades**.
* Moneda **S/**.
* PDF en segundo plano al guardar definitivo.
* Reglas 1–10: ver `05-MODULO-COTIZACIONES.md` §4.

---

# 8. Relaciones

| Módulo | Relación |
|--------|----------|
| Clientes (03) | Destino post-guardado · edición historial |
| Facturas (06) | Convertir en factura |
| IA (08) | Entrada al wizard → Cantidades |
| Inicio (02) | CTA manual |
| Más (07) | Mis Tarifas afecta precios (Doc 21) |

---

# 9. Permisos

**Gerente** (`01-VISION-DEL-PRODUCTO.md` §6). Detalle: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` (pendiente).

---

# 10. Validación · Estado

* [x] Lógica ↔ Móvil `05-MODULO-COTIZACIONES.md` v1.6 + Doc 21
* [x] Diseño ↔ Sistema Diseño §5.3 multi-panel
* [x] Sin lista global (coherente con Móvil §3)
* [ ] Imagen ↔ MD (layout puede requerir actualización visual en fase posterior)

✅ **Sincronizado funcionalmente** — 05/07/2026.

**Fin del documento.**
