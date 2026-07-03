# 08 – PAGOS – IMPLEMENTACIÓN DARIVO PRO

**Versión:** 1.0

**Fecha:** 03/07/2026

**Estado:** Documento técnico oficial — capa de implementación

**Referencias:**

* `02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.3 (dLocal API)
* `02-darivo-pro-admin/04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 · §9 · §13
* `01-darivo-pro-movil/07-MODULO-MAS.md` §8 (Mi Plan)
* `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` (`perfiles.plan_tipo`)

---

# 1. Objetivo

Documentar la **integración oficial dLocal Go API** para suscripciones Básico/Pro: checkout, webhook y activación de `plan_tipo`.

**No se modifica** la lógica de límites por plan (`plan-limits.ts`).

---

# 2. Proveedor y configuración

| Variable | Obligatoria | Default | Uso |
|----------|-------------|---------|-----|
| `DLOCALGO_API_KEY` | Sí | — | API Key (server) |
| `DLOCALGO_API_SECRET` | Sí | — | Secret Key (server) |
| `DLOCALGO_SANDBOX` | No | `true` | `api-sbx.dlocalgo.com` vs live |
| `NEXT_PUBLIC_APP_URL` | Sí (prod) | localhost | URLs success/back/webhook |
| `DLOCALGO_PLAN_*` | No | — | plan_token suscripción recurrente |

**Auth header:** `Bearer {API_KEY}:{SECRET}`

**Docs:** https://docs.dlocalgo.com/integration-api/

---

# 3. Arquitectura de archivos

```
frontend/src/lib/
  dlocal.ts              — Cliente dLocal Go (payments, subscribe URL)
  pagos-suscripcion.ts   — order_id, montos, plan tokens env
  activar-plan.ts        — Escritura plan_tipo (service role)

frontend/src/app/api/pagos/
  checkout/route.ts      — POST inicia checkout
  webhook/route.ts       — POST notificaciones dLocal

frontend/src/components/pagos/
  CheckoutPlanButton.tsx — CTA suscripción (Mi Plan, /precios, UpgradeModal)
  PagoEstadoBanner.tsx   — Feedback ?pago=ok|cancelado

frontend/src/components/mas/MiPlanCard.tsx — UI Mi Plan
```

---

# 4. Flujo de checkout

**Ruta:** `POST /api/pagos/checkout`

**Entrada:** `{ plan: "basico"|"pro", ciclo: "mensual"|"anual" }`

**Autenticación:** Supabase session obligatoria.

**Modos:**

1. **Suscripción** — si existe `DLOCALGO_PLAN_{PLAN}_{CICLO}` → redirect a `subscribe_url` dLocal.
2. **Pago redirect** — `POST /v1/payments` (PEN · PE) → `redirect_url`.

**order_id:** `darivo-{userId}-{plan}-{ciclo}-{timestamp}` para correlación en webhook.

**Precios:** `PRECIOS_OFICIALES` (04 §6) — Básico S/39·390 · Pro S/79·790.

---

# 5. Webhook

**Ruta:** `POST /api/pagos/webhook`

**Acción:** en estados exitosos (`PAID`, `CONFIRMED`, `ACTIVE`, …) → `activarPlanUsuario` → `perfiles.plan_tipo`.

**Resolución usuario:**

* Parse `order_id` (pagos únicos), o
* Email del payer/subscription (suscripciones con plan_token env).

**Reglas de negocio (04 §13):**

* Pago fallido → no baja plan (webhook ignora estados no exitosos).
* Reintento permitido desde Mi Plan / Precios.

---

# 6. UI

| Pantalla | Comportamiento |
|----------|----------------|
| `/precios` | CTA → checkout dLocal (login si 401) |
| `/mas/plan` | Plan actual + suscripción / upgrade |
| `UpgradeModal` | Checkout directo a Pro |
| `?pago=ok` | Banner confirmación (webhook activa plan) |

---

# 7. Deuda técnica

| ID | Descripción | Tarea |
|----|-------------|-------|
| DT-08-01 | Tabla historial pagos / suscripciones (Admin §10 BD pendiente) | Admin / BD |
| DT-08-02 | Fecha renovación / cancelación fin de periodo | BD + webhook |
| DT-08-03 | Vista suscripciones por usuario (Admin §13 pendiente) | Admin |
| DT-08-04 | Validación firma webhook dLocal | ✅ Bearer `DLOCALGO_WEBHOOK_SECRET` (Tarea 10) |
| DT-08-05 | Superficie Empresa Mi Plan | Tarea 05/Empresa |

---

# 8. Validación

* `npx tsc --noEmit` en `frontend/`
* Sandbox: tarjeta test 4111… (docs dLocal Go)
* Webhook URL pública en producción (`NEXT_PUBLIC_APP_URL/api/pagos/webhook`)

---

# 9. Historial

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 03/07/2026 | Integración dLocal Go — checkout + webhook + Mi Plan |
