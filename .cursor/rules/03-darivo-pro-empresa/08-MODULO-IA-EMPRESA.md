# 08 – MÓDULO IA – DARIVO PRO EMPRESA

**Versión:** 1.0

**Estado:** ✅ Producción completada — imagen oficial (fase global §7 — 02/07/2026).

**Relacionado:** `01-VISION-DEL-PRODUCTO.md` §5, §13 · `16-SISTEMA-DE-DISEÑO-EMPRESA.md` §6.6 · `01-darivo-pro-movil/08-MODULO-IA.md` v1.4

⚠️ Este documento es la **única fuente autorizada** para la adaptación a escritorio del **Módulo IA** en Darivo Pro Empresa.

> **Lógica de negocio:** exclusivamente `01-darivo-pro-movil/08-MODULO-IA.md`. La IA es un **atajo** al wizard de Cotizaciones — nunca un flujo paralelo (`05-MODULO-COTIZACIONES.md` · Móvil IA §1).

---

# 0. Fuentes consultadas (Reglas §7.2 · §15 FASE 1)

| Fuente | Documento | Uso en este MD |
|--------|-----------|----------------|
| Lógica de negocio | `01-darivo-pro-movil/08-MODULO-IA.md` v1.4 | Escribir/Hablar, flujos, reglas, límites plan |
| Cotizaciones | `01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` | Destino wizard post-IA |
| Cotizaciones Empresa | `05-MODULO-COTIZACIONES-EMPRESA.md` v1.0 | Presentación wizard escritorio |
| Referencia diseño escritorio | `02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` v1.0 | Cards de acción en área central |
| Sistema de Diseño Empresa | `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.4 | Sidebar, header, §6.6 |

> **Sin MD Admin equivalente** del Módulo IA producto.

**Informe módulo anterior (Cierre):** ✅ Doc completada — imagen fase global (§14 `09-MODULO-CIERRE-EMPRESA.md`).

---

# 1. Objetivo

Asistente integrado para crear **cotizaciones** describiendo el trabajo en lenguaje natural (texto o voz), como atajo al wizard manual (`01-VISION-DEL-PRODUCTO.md` §13 · Móvil §1).

**Acceso:** sidebar posición **IA** (3) · equivalente Móvil bottom nav posición 3 (botón central destacado en móvil).

En escritorio **no** se replica el botón flotante elevado de la bottom nav móvil; el acceso es el ítem **IA** del sidebar (Sistema Diseño §5.1).

No define Base de Datos, APIs técnicas ni permisos granulares.

---

# 2. Imagen oficial

**Archivo:** `08 - MODULO IA - DARIVO PRO EMPRESA.png`

![Módulo IA — Darivo Pro Empresa](./08%20-%20MODULO%20IA%20-%20DARIVO%20PRO%20EMPRESA.png)

**Estado:** ✅ Imagen oficial generada (fase global §7 — 02/07/2026).

---

# 3. Navegación

| Elemento | Valor |
|----------|-------|
| Sidebar | Posición **IA** (3) |
| Vistas | **Menú IA** (por defecto) · **Escribir con IA** · **Hablar con IA** · wizard Cotizaciones (destino) |
| Equivalente Móvil | `IAMenuScreen` → flujos texto/voz (Móvil §2) |

---

# 4. Layout general — Menú IA

Área central con **dos cards horizontales** (patrón accesos rápidos Inicio Empresa §5.4 · Admin Dashboard):

```
┌─────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR    │  HEADER — IA · subtítulo guía · usuario            │
│  240px      ├──────────────────────────────────────────────────┤
│             │  ┌─────────────────────┐ ┌─────────────────────┐│
│  IA ●       │  │  Escribir con IA    │ │  Hablar con IA      ││
│             │  │  I.edit · morado    │ │  I.phone · morado   ││
│             │  └─────────────────────┘ └─────────────────────┘│
└─────────────┴──────────────────────────────────────────────────┘
```

| Elemento | Descripción | Origen |
|----------|-------------|--------|
| Título | «IA» | Móvil §2 |
| Subtítulo | Guía breve (ej. *Describe tu trabajo y genera una cotización*) | Móvil §2 DarkHeader |
| Card 1 | **Escribir con IA** — fondo `T.purplePale` · icono `I.edit` | Móvil §2 |
| Card 2 | **Hablar con IA** — fondo `T.purplePale` · icono micrófono/`I.phone` | Móvil §2 |

Cards en fila 50/50 en viewport ≥1024px; apiladas en viewport estrecho.

---

# 5. Flujo — Escribir con IA

Equivalente Móvil §3. Presentación escritorio: vista modal o página dedicada con formulario amplio (dos columnas opcionales).

## 5.1 Diseño

| Elemento | Descripción |
|----------|-------------|
| Textarea | Grande, placeholder de ejemplo (Móvil §3) |
| Botón | **Generar cotización** — primario azul gradiente |
| Loader | Skeleton mientras procesa (máx. ~5 s) |

## 5.2 Funcionalidad (referencia Móvil §3)

* Texto → **OpenAI API** según `01-darivo-pro-movil/08-MODULO-IA.md` §3 · registro `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2.
* Items estructurados: descripción, cantidad, unidad, precio unitario, total.
* Precios referencia mercado peruano (Lima).
* Vocabulario peruano correcto (gasfitero, maestro de obra, etc.).
* Cálculo subtotal + IGV 18% + total.

---

# 6. Flujo — Hablar con IA

Equivalente Móvil §4.

| Elemento | Descripción |
|----------|-------------|
| UI | Misma base que Escribir + control micrófono destacado |
| Animación | Estado «escuchando» durante grabación |
| Fallback | Si Web Speech API no disponible → modo Escribir |

Transcripción → **mismo procesamiento** que Escribir con IA (Móvil §4).

---

# 7. Después de generar — destino Cotizaciones

Regla fundamental (Móvil §5 · Cotizaciones §1):

1. Lista de ítems **editable** (calculadora libre — `05-MODULO-COTIZACIONES-EMPRESA.md`).
2. Usuario continúa **Paso 2 Cliente** del wizard normal.
3. Al guardar → numeración **COT-** estándar.
4. **No** existe tipo «documento IA» en BD — cotización idéntica a la manual.

Presentación escritorio del wizard: `05-MODULO-COTIZACIONES-EMPRESA.md` §4–§5.

---

# 8. Límites por plan

Referencia única: `04-PANEL-ADMIN-SUSCRIPCIONES.md` (Móvil §6):

* Plan **Básico:** sin acceso IA — mensaje claro invitando a Plan Pro.
* Plan **Pro:** acceso según limitaciones del plan.

No duplicar nombres de planes ni límites numéricos en este MD.

**Necesidades API:** OpenAI API ✅ aprobada (`08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2).

---

# 9. Reglas de negocio (referencia Móvil §7)

* IA = atajo, nunca documento paralelo.
* Siempre termina en cotización **COT-** normal.
* Texto y voz → mismo procesamiento final.
* Resultado editable antes de guardar.
* Restricciones aplicadas por plan contratado.

**Ámbito documentado en Móvil §1:** cotizaciones. Flujos IA para facturas e informes: **Pendiente de documentación oficial** en MD Móvil — no inventar en Empresa.

---

# 10. Relaciones

| Módulo | Relación |
|--------|----------|
| Cotizaciones (05) | Destino obligatorio post-generación |
| Cierre (09) | IA integrada en gastos (Móvil Cierre §14) — flujo distinto, no desde este menú |
| Clientes (03) | Paso 2 wizard tras IA |
| Inicio (02) | Puede ofrecer atajos; acceso principal = sidebar IA |

---

# 11. Permisos

**Gerente** (`01-VISION-DEL-PRODUCTO.md` §6).

Detalle: `11-ROLES-PLANES-PERMISOS-EMPRESA.md` — **matriz detallada pendiente aprobación propietario**.

---

# 12. Validación (Reglas §9 · §15)

* [x] Lógica ↔ Móvil `08-MODULO-IA.md` v1.4
* [x] Destino ↔ `05-MODULO-COTIZACIONES-EMPRESA.md`
* [x] Diseño ↔ Sistema Diseño §6.6
* [x] Sin flujos paralelos ni documentos IA inventados
* [x] Imagen oficial ↔ MD (fase global §7 — 02/07/2026)

---

# 13. Estado

✅ **Producción completada** — Reglas §15 (02/07/2026).

**Fin del documento.**
