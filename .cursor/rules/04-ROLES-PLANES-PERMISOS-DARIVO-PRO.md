# 04 – ROLES, PLANES Y PERMISOS – DARIVO PRO

**Versión:** 1.2

**Fecha:** 05/07/2026

**Estado:** Documento técnico oficial — implementación Darivo Pro Móvil (capa de límites y catálogo)

**Cambio principal (v1.2 — 09/07/2026):** corrección documental. DT-04-04 marcada ✅ resuelta (migración `20260706123000_plan_tipo_business.sql`). §5.1 y §6 corrigen referencias residuales a `verificarLimitePresupuesto`/tabla `presupuestos` por `verificarLimiteCotizacion`/`cotizaciones` (la migración de terminología ya está completa en código, este MD no lo reflejaba).

**Cambio principal (v1.1):** catálogo oficial ampliado a 3 planes (Básico, Pro, Empresa) — sincronizado con `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6.

**Referencias:**

* `02-darivo-pro-admin/12 – ROLES, PLANES Y PERMISOS – PANEL ADMIN.md` v1.5
* `03-darivo-pro-empresa/11-ROLES-PLANES-PERMISOS-EMPRESA.md` v1.0
* `02-darivo-pro-admin/04-PANEL-ADMIN-SUSCRIPCIONES.md` §6
* `01-VISION-DEL-PRODUCTO.md` §8 · §18
* `01-darivo-pro-movil/07-MODULO-MAS.md` §8 (Mi Plan)
* `02-BASE-DATOS.md` §4.1 (`perfiles.plan_tipo`)
* `03-AUTENTICACION-DARIVO-PRO.md` v1.0

---

# 1. Objetivo

Documentar la **implementación Móvil** de roles, planes y permisos conforme a la arquitectura aprobada.

Darivo Pro Móvil **no administra** roles ni permisos granulares (Doc 12 §16). Aplica **limitaciones de plan** según `perfiles.plan_tipo` y expone el catálogo comercial oficial en `/precios`.

La matriz detallada de permisos por empleado permanece **pendiente de aprobación del propietario** (Doc 12 §8 · Catálogo `25` Tarea 04).

---

# 2. Roles oficiales (Doc 12 §6)

## 2.1 Plataforma

| Rol | Producto | Implementación Móvil |
|-----|----------|----------------------|
| Administrador Darivo | Panel Admin | **No implementado** — Tarea 05 |

## 2.2 Cliente (empresa contratante)

| Rol | Descripción | Implementación Móvil |
|-----|-------------|----------------------|
| Gerente | Acceso completo al negocio | **Implícito** — usuario solo Móvil = Gerente + Técnico (Visión §5) |
| Técnico | Acceso operativo limitado | **Implícito** — mismo usuario en Móvil solo |

No existe columna `rol` en `perfiles` ni tablas de roles (Doc 12 §12 — BD pendiente).

Constantes: `frontend/src/lib/roles-planes-oficial.ts` → `ROLES_PLATAFORMA`, `ROLES_CLIENTE`, `ROL_IMPLICITO_MOVIL_SOLO`.

---

# 3. Planes de suscripción oficiales (04 §6)

Únicos nombres comerciales aprobados:

| Plan | Mensual | Anual | Límites Móvil |
|------|---------|-------|---------------|
| **Básico** | S/39 | S/390 | 20 cotizaciones/mes · 10 facturas/mes · 3 IA/día |
| **Pro** | S/79 | S/790 | Ilimitado (cotizaciones, facturas, IA) |

**Prohibido** en documentación y UI comercial: Premium, Plan Prueba, Plan Autónomo, Plan Empresa, etc. (04 §6). Planes oficiales: Básico, Pro y Business.

Fuente única de precios y características comerciales: `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6.

Implementación:

* `frontend/src/lib/roles-planes-oficial.ts` → `PLANES_SUSCRIPCION_OFICIALES`, `PRECIOS_OFICIALES`, `LIMITES_PLAN`
* `frontend/src/lib/planes.ts` → tarjetas `/precios`
* `frontend/src/components/plan/UpgradeModal.tsx` → upsell a Pro

---

# 4. Estado `plan_tipo` en base de datos

Columna `perfiles.plan_tipo` (migración 005):

| Valor | Significado | Límites |
|-------|-------------|---------|
| `gratis` | Sin suscripción de pago (default al registrarse) | 5 cotizaciones **totales** · 3 IA/día · facturas sin límite mensual en código |
| `basico` | Plan Básico activo | Según §3 |
| `pro` | Plan Pro activo | Ilimitado |
| `empresa` | **Valor técnico legacy** — NO es plan comercial | Tratado como Pro para límites hasta decisión propietario / Tarea 08 |

**Nota:** `gratis` no es un plan comercial; es el estado previo a suscripción (onboarding: 5 cotizaciones).

**Darivo Pro Empresa** es un **producto** del ecosistema (escritorio), no un plan de suscripción. En `/precios` se muestra bloque de contacto (`CONTACTO_PRODUCTO_EMPRESA`), no tarjeta de precio.

---

# 5. Permisos

## 5.1 Móvil

* No hay matriz de permisos implementada.
* Control de acceso: autenticación (Tarea 03) + RLS por `user_id`.
* Control de uso: funciones en `frontend/src/lib/plan-limits.ts`:
  * `verificarLimiteCotizacion` (renombrada de `verificarLimitePresupuesto` — migración de terminología presupuesto→cotización, completa)
  * `verificarLimiteFactura`
  * `verificarLimiteIA`
  * `registrarUsoIA` → tabla `ia_uso_diario` + RPC `incrementar_ia_uso`

## 5.2 Empresa / Admin

Pendiente Tareas 05 y 08. Estructura documentada en Doc 11 (toggles por módulo) sin lista fila a fila aprobada.

`MATRIZ_PERMISOS_APROBADA = false` en `roles-planes-oficial.ts`.

---

# 6. Integración Supabase Auth y RLS

| Aspecto | Implementación |
|---------|----------------|
| Identidad | `auth.users.id` = `perfiles.id` |
| Plan | Lectura `perfiles.plan_tipo` tras `getUser()` |
| Límites cotizaciones | Count en `cotizaciones` filtrado por `user_id` (+ mes para básico) |
| Límites IA | `ia_uso_diario` por `user_id` + fecha |
| RLS | Políticas existentes por tenant — sin cambios en Tarea 04 |

---

# 7. Archivos de implementación

| Archivo | Responsabilidad |
|---------|-----------------|
| `frontend/src/lib/roles-planes-oficial.ts` | Constantes oficiales roles/planes/límites |
| `frontend/src/lib/plan-limits.ts` | Verificación de límites en runtime |
| `frontend/src/lib/planes.ts` | Catálogo UI `/precios` (Básico, Pro) |
| `frontend/src/components/precios/PreciosView.tsx` | Vista precios + contacto Empresa + prueba gratuita |
| `frontend/src/components/plan/UpgradeModal.tsx` | Modal upgrade |
| `frontend/src/app/api/ia/cotizacion/route.ts` | Límite IA + registro uso |
| `supabase/migrations/005_plan_limits.sql` | Schema `plan_tipo`, `ia_uso_diario` |

---

# 8. Deuda técnica registrada

| ID | Descripción | Tarea |
|----|-------------|-------|
| DT-04-01 | Matriz detallada permisos empleado | Propietario + 05/08 |
| DT-04-02 | Tablas BD roles/permisos (Doc 12 §12) | 02 / propietario |
| DT-04-03 | Escritura `plan_tipo` vía dLocal webhook (Tarea 08) | ✅ Resuelta |
| DT-04-04 | Renombrar/eliminar valor `empresa` en CHECK `plan_tipo` | ✅ Resuelta — migración `supabase/migrations/20260706123000_plan_tipo_business.sql` |
| DT-04-05 | UI Mi Plan en Más (Doc 07 §8) | 05 Frontend |
| DT-04-06 | Auth y roles Admin/Empresa | 05 Frontend |

---

# 9. Estado del documento

**Versión:** 1.0

**Estado:** Documento oficial — Tarea 04 cerrada (03/07/2026).

**Fin del documento.**
