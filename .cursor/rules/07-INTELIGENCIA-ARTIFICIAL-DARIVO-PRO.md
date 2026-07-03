# 07 – INTELIGENCIA ARTIFICIAL – IMPLEMENTACIÓN DARIVO PRO

**Versión:** 1.0

**Fecha:** 03/07/2026

**Estado:** Documento técnico oficial — capa de implementación

**Referencias:**

* `02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2 (OpenAI API)
* `01-darivo-pro-movil/08-MODULO-IA.md` (cotizaciones)
* `01-darivo-pro-movil/09-MODULO-CIERRE.md` §6–§7 (análisis documentos gastos)
* `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` (límites IA por plan)

---

# 1. Objetivo

Documentar la **integración oficial OpenAI API** en el frontend Next.js: cliente server-side, rutas API, prompts, UI Móvil y control de límites por plan.

---

# 2. Proveedor y configuración

| Variable | Obligatoria | Default | Uso |
|----------|-------------|---------|-----|
| `OPENAI_API_KEY` | Sí | — | Autenticación API (solo server) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Cotizaciones (texto) |
| `OPENAI_VISION_MODEL` | No | `gpt-4o-mini` | Análisis imágenes Cierre |

**Registro oficial:** `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.2.

**Migración:** se eliminó `ANTHROPIC_API_KEY` / Anthropic del código producto (incidencia AM §11.4 — resuelta Tarea 07).

---

# 3. Arquitectura de archivos

```
frontend/src/lib/
  openai.ts           — Cliente OpenAI (chat/completions, JSON mode, visión)
  presupuesto-ia.ts   — System prompt cotizaciones + recálculo totales
  gasto-ia.ts         — System prompt extracción gastos Cierre

frontend/src/app/api/ia/
  presupuesto/route.ts — POST cotización desde descripción/voz
  gasto/route.ts       — POST análisis gasto (texto o imagen)

frontend/src/components/
  presupuesto/IAPresupuestoFlow.tsx — Flujo IA cotización (Módulo IA)
  cierre/CierreView.tsx             — Registro gastos + análisis imagen

frontend/src/app/(auth)/ia/page.tsx — Pantalla Módulo IA
```

---

# 4. Módulo IA — Cotizaciones

**Ruta API:** `POST /api/ia/presupuesto`

**Entrada:** `{ descripcion: string }`

**Flujo:**

1. Autenticación Supabase.
2. `verificarLimiteIA` — tabla `ia_uso_diario`, límites según plan.
3. Catálogo mergeado (base + overrides + partidas propias).
4. `openaiChatJSON` con system prompt de `presupuesto-ia.ts`.
5. Mapeo `svcId` → partidas reales; precios **siempre del catálogo**.
6. `registrarUsoIA` si el plan no es ilimitado (Pro).

**UI:** `IAPresupuestoFlow` — texto, voz (Web Speech API del navegador, no API externa), revisión y guardado en presupuesto.

---

# 5. Módulo Cierre — Análisis de gastos

**Ruta API:** `POST /api/ia/gasto`

**Entrada:** `{ descripcion?: string, imageBase64?: string, mimeType?: string }`

**Flujo:**

1. Autenticación + límite IA (igual que presupuesto).
2. Si hay imagen → `openaiVisionJSON`; si solo texto → `openaiChatJSON`.
3. JSON normalizado vía `normalizarGastoIA`.
4. UI abre modal «Revisar gasto» con campos prefilled.

**UI CierreView:**

| Acción | Estado |
|--------|--------|
| Tomar foto | ✅ Imagen → OpenAI Vision |
| Seleccionar imagen | ✅ Imagen → OpenAI Vision |
| Subir PDF | ⏳ Pendiente (deuda técnica) |
| Registro manual | ✅ Sin IA |

---

# 6. Límites y planes

Implementación en `lib/plan-limits.ts` + `roles-planes-oficial.ts`:

* Verificación antes de cada llamada IA.
* Registro en `ia_uso_diario` post-éxito (excepto plan Pro ilimitado).
* Respuesta `429` + modal upgrade (`ia_limite`) en cliente.

**No modificar lógica de suscripciones** (Tarea 08).

---

# 7. Deuda técnica

| ID | Descripción | Tarea |
|----|-------------|-------|
| DT-07-01 | Análisis PDF en Cierre (solo imágenes hoy) | Futuro |
| DT-07-02 | Persistencia gastos en Supabase (`useGastos` → localStorage) | BD / Cierre |
| DT-07-03 | Flujos IA facturas e informes (`08-MODULO-IA.md`) | Pendiente doc propietario |
| DT-07-04 | Superficie Empresa (reutilizar rutas `/api/ia/*`) | Tarea 05/Empresa |

---

# 8. Validación

* `npx tsc --noEmit` en `frontend/` — obligatorio en cierre Tarea 07.
* Sin referencias Anthropic/Claude en código producto.
* Claves solo en `.env.local` / variables Vercel server.

---

# 9. Historial

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 03/07/2026 | Implementación OpenAI — cotizaciones + gastos Cierre |
