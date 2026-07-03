# 05 – MÓDULO COTIZACIONES – DARIVO PRO EMPRESA

**Versión:** 1.0

**Estado:** ✅ Producción completada (Reglas §15 — 02/07/2026)

**Relacionado:** `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO…` · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.3

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **flujo de Cotizaciones** en Darivo Pro Empresa.

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso |
|--------|-----------|-----|
| Lógica de negocio | `01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` v1.4 | Wizard 3 pasos, reglas, motor precios |
| Referencia diseño escritorio | — | *Sin MD Admin equivalente* — layout multi-panel (Sistema Diseño §5.3) |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | Paneles, tablas, formularios amplios |
| Maestro | `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO…` | Catálogo, Tarifa Pro, motor cotización |

---

# 1. Objetivo

Flujo de **cotización** (presupuesto de trabajo) en escritorio — wizard **Partidas → Cliente → Resumen** (Móvil §2).

No tiene validez fiscal. Numeración COT-001, COT-002… (Móvil §4).

**No es ítem del sidebar** (`01-VISION-DEL-PRODUCTO.md` §5 · Móvil §1).

---

# 2. Imagen oficial

**Archivo:** `05 - MODULO COTIZACIONES - DARIVO PRO EMPRESA.png`

![Módulo Cotizaciones — Darivo Pro Empresa](./05%20-%20MODULO%20COTIZACIONES%20-%20DARIVO%20PRO%20EMPRESA.png)

Prevalece siempre este MD ante cualquier diferencia.

---

# 3. Navegación y accesos

| Origen | Acción |
|--------|--------|
| Inicio (02) | CTA «Nuevo presupuesto» · pills capítulos obra |
| Clientes (03) | «+ Nuevo» en ficha · Editar / Re-cotizar en historial |
| IA (08) | Flujos Escribir / Hablar con IA → wizard |

**Consulta de cotizaciones guardadas:** únicamente en ficha de Cliente (Móvil §3 — **no** existe lista global).

---

# 4. Layout wizard (escritorio)

Vista a pantalla completa dentro del área de contenido (sin sidebar oculto). Tres zonas simultáneas:

```
┌─────────────────────────────────────────────────────────────┐
│  Header: «Nueva cotización» · StepDots (1·2·3)              │
├──────────────┬──────────────────────────┬───────────────────┤
│  PANEL CAT.  │  PANEL PARTIDAS          │  PANEL RESUMEN    │
│  ~240px      │  central flexible        │  ~320px flotante  │
│  §5.1        │  §5.2                    │  §5.4 (FloatBar+) │
└──────────────┴──────────────────────────┴───────────────────┘
```

En **Paso 2** y **Paso 3** el panel central muestra el formulario/resumen correspondiente; panel categorías puede colapsar o mostrar contexto.

---

# 5. Pasos del wizard

## 5.1 Paso 1 — Partidas

Equivalente Móvil §2 Paso 1 · Doc 21.

**Panel categorías (izquierda):** cards por categoría habilitada (borde color categoría · emoji · nombre · contador partidas). Flujo Construcción → subcategorías navegación (Móvil §2).

**Panel partidas (centro):** lista partidas de categoría seleccionada · toggle multi-selección · campo cantidad calculadora libre · presets opcionales · precio fijo sin cantidad.

**Panel resumen (derecha):** FloatBar expandido cuando ≥1 partida — contador · lista resumida · total parcial · **Continuar →**.

Motor de precios: Mis Tarifas → Tarifa Pro (Doc 21 · Móvil §2).

## 5.2 Paso 2 — Cliente

Card formulario dos columnas (Sistema Diseño §5.3 formularios amplios):

| Campo | Obligatorio |
|-------|-------------|
| Nombre | ✅ |
| Teléfono / WhatsApp | ✅ |
| Ciudad / Dirección obra | ❌ |

Auto-vinculación / creación cliente (Móvil §2 · `03-MODULO-CLIENTES-EMPRESA.md`).

Botones: **← Partidas** · **Continuar → Resumen**.

## 5.3 Paso 3 — Resumen

| Bloque | Contenido |
|--------|-----------|
| Hero total | Gradiente azul · TOTAL grande · desglose material / mano de obra |
| Tabla | Partidas agrupadas por categoría + subtotales |
| Margen MO | Slider 0–120% + presets 0/25/40/60/80/100% |
| Notas | Campo texto (aparece en PDF) |
| Estado | Selector Borrador / Pendiente / Aprobado |

**Botones (Móvil §2 · Fable 5 §5.2):**

| Botón | Icono | Condición |
|-------|-------|-----------|
| Guardar | `I.save` | Primario verde |
| WhatsApp | `I.wa` | Secundario |
| Generar y enviar PDF | `I.pdf` | Secundario |
| Convertir en Factura → | `I.receipt` | Solo si ya guardado |
| Nuevo presupuesto | — | Dashed · resetea wizard |

---

# 6. Edición desde Clientes

Desde historial en ficha Cliente (`03-MODULO-CLIENTES-EMPRESA.md` §6.5):

* **Editar** — wizard precargado · actualiza misma COT-
* **Re-cotizar** — wizard precargado · nueva COT-
* **Eliminar** — borrado inmediato
* **Facturar** — solo Aprobado → `06-MODULO-FACTURAS-EMPRESA.md`

---

# 7. Funcionalidad (referencia Móvil §4)

* Multi-categoría permitida.
* Cantidad libre (coma/punto).
* Moneda **S/**.
* PDF en segundo plano al guardar.
* Sin validez fiscal.

---

# 8. Relaciones

| Módulo | Relación |
|--------|----------|
| Clientes (03) | Destino post-guardado · edición historial |
| Facturas (06) | Convertir en factura |
| IA (08) | Entrada al wizard |
| Inicio (02) | CTA y pills |
| Más (07) | Mis Tarifas afecta precios (Doc 21) |

---

# 9. Permisos

**Gerente** (`01-VISION-DEL-PRODUCTO.md` §6). Detalle: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` (pendiente).

---

# 10. Validación · Estado

* [x] Lógica ↔ Móvil `05-MODULO-COTIZACIONES.md` + Doc 21
* [x] Diseño ↔ Sistema Diseño §5.3 multi-panel
* [x] Sin lista global (coherente con Móvil §3)
* [x] Imagen ↔ MD

✅ **Producción completada** — Reglas §15 (02/07/2026).

**Fin del documento.**
