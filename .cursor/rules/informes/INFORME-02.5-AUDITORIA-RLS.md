# Informe Subtarea 02.5 — Auditoría de RLS

**Tarea:** 02 – Base de Datos (Supabase)  
**Fecha cierre:** 03/07/2026  
**Estado:** ✅ Cerrada

## Verificación

| Tabla | RLS | Modelo |
|-------|-----|--------|
| Tablas tenant | ✅ ENABLED | auth.uid() = user_id |
| presupuesto_items | ✅ | subquery presupuesto |
| clientes | ✅ | 4 políticas CRUD (016) |
| lookup 015 | ✅ | SELECT autenticados |
| comprobante_series | ⚠️ | SELECT global autenticados — sin tenant |

## Corrección aplicada

Migración **016** restaura RLS granular de clientes (regresión 013).

## Observación (media)

`comprobante_series` permite lectura a cualquier autenticado — aceptable mientras tabla no se use en producción para escritura concurrente.

## Incidencias críticas/altas

Ninguna pendiente.

**Fin del informe.**
