# Informe Final — IA Darivo Pro Móvil (dos agentes oficiales)

**Fecha:** 04/07/2026

**Tarea:** Actualización documental oficial — Inteligencia Artificial Darivo Pro Móvil

**Metodología:** FASE 1 (análisis y propuesta) · FASE 2 (implementación autorizada)

**Estado:** ✅ Completada

---

## Objetivo

Documentar el funcionamiento oficial de la Inteligencia Artificial conversacional de Darivo Pro Móvil: dos agentes, ámbito, protección anti-robots y relación con el Módulo Cierre.

---

## Documentos actualizados

| Documento | Versión anterior | Versión nueva |
|-----------|------------------|---------------|
| `01-darivo-pro-movil/08-MODULO-IA.md` | 1.4 | **1.5** |
| `01-VISION-DEL-PRODUCTO.md` §13 | 2.7 | **2.8** |
| `01-darivo-pro-movil/07-MODULO-MAS.md` | 1.9 | **2.0** |

---

## Contenido incorporado

### Agente IA 1 — Presupuestos y Facturas

- Crear y editar cotizaciones (presupuestos).
- Crear facturas y convertir cotizaciones en facturas.
- Flujos Escribir / Hablar conservados.
- Integración funcional con `06-MODULO-FACTURAS.md` (sin API de facturación electrónica).

### Agente IA 2 — Soporte y Tickets

- Dudas, uso de la app, errores, tickets (crear, consultar, ampliar, cerrar, escalar).
- Acceso desde **Más → Soporte** y entrada en `IAMenuScreen`.

### Ámbito y restricciones

- Lista oficial de temas permitidos y rechazados.
- Mensaje estándar ante consultas fuera de ámbito.

### Protección frente a robots

- Detección (20+ preguntas consecutivas, repetición, concurrencia, patrones de bot).
- Registro, suspensión temporal, aviso al usuario, reanudación tras período de protección.

### IA del Módulo Cierre (Opción A aprobada)

- La IA automática de gastos **no** es un tercer agente conversacional.
- Documentada en Visión §13 y referenciada desde `08-MODULO-IA.md` §1.

---

## Restricciones respetadas

- ✅ Sin nuevos módulos, tablas, APIs ni endpoints
- ✅ Sin modificación de arquitectura ni código
- ✅ Sin mención de proveedores de facturación electrónica
- ✅ Solo documentación aprobada, formato oficial Darivo Pro

---

## Documentos no modificados (por alcance)

- `DARIVO-PRO-ARQUITECTURA-MAESTRA.md`
- `07-INTELIGENCIA-ARTIFICIAL-DARIVO-PRO.md`
- `03-darivo-pro-empresa/08-MODULO-IA-EMPRESA.md`
- `09-MODULO-CIERRE.md` (sin cambio; coherente vía Visión §13)
- Código y base de datos

---

## Pendientes futuros (fuera de esta tarea)

- ~~Detalle visual Fable 5 de la card «Soporte con IA» en `IAMenuScreen` (`16-SISTEMA-DE-DISEÑO-FABLE5.md`).~~ ✅ Documentado §6.8.2 (04/07/2026) — pendiente implementación en prototipo JSX.
- ~~Sincronización Darivo Pro Empresa (`08-MODULO-IA-EMPRESA.md`) cuando el propietario lo autorice.~~ ✅ v1.1 (04/07/2026).
- Imagen oficial Empresa con card Soporte con IA.
- Implementación en código de Agente 2, flujos de factura por IA y protección anti-robots.

---

## Metodología

Metodología oficial del proyecto restaurada. Tarea documental cerrada.
