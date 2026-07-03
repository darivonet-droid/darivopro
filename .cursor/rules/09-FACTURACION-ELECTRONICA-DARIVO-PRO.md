# 09 – FACTURACIÓN ELECTRÓNICA – DARIVO PRO

**Versión:** 1.0

**Fecha:** 03/07/2026

**Estado:** 🛑 **OMITIDA / BLOQUEADA** — sin implementación de código

**Referencias:**

* `25 – CATÁLOGO OFICIAL DE TAREAS` §Tarea 09
* `02-darivo-pro-admin/08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.4
* `01-darivo-pro-movil/06-MODULO-FACTURAS.md`
* `03-darivo-pro-empresa/06-MODULO-FACTURAS-EMPRESA.md`

---

# 1. Decisión oficial

La Tarea 09 permanece **bloqueada** hasta que el propietario apruebe oficialmente un proveedor de facturación electrónica (SUNAT directo u OSE/CPE autorizado) y lo registre en `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.4.

**No se implementó** integración API en esta fase (autorización propietario para tareas 9–10 no incluye desbloqueo de proveedor).

---

# 2. Estado actual del producto (sin FE)

| Capacidad | Implementación |
|-----------|----------------|
| Facturas locales (PDF) | ✅ `api/pdf/factura`, módulo Facturas Móvil |
| Campos tributarios UI | ✅ RUC, serie, número (formulario) |
| Verificación SUNAT / emisión electrónica | ❌ Pendiente proveedor |
| Tabla `comprobante_series` | Existe en BD — no usada (DT-02-01) |

---

# 3. Prerrequisitos para desbloquear

1. Decisión propietario: proveedor (§5.4).
2. Registro en `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md`.
3. Documentación funcional actualizada en `06-MODULO-FACTURAS*.md`.
4. Nueva autorización explícita Tarea 09 en catálogo `25`.

---

# 4. Deuda técnica vinculada

| ID | Descripción |
|----|-------------|
| DT-09-01 | Proveedor FE no aprobado |
| DT-09-02 | Integración OSE/CPE |
| DT-09-03 | Sincronización estados Verificada / NO verificada (Empresa §06) |

---

# 5. Historial

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 03/07/2026 | Cierre formal omitida — Tarea 10 procede sin FE |
