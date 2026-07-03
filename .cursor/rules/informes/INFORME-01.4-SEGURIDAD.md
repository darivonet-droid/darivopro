# Informe Subtarea 01.4 — Seguridad

**Tarea:** 01 – Arquitectura  
**Subtarea:** 01.4 – Seguridad  
**Fecha cierre:** 03/07/2026  
**Estado:** ✅ Cerrada

---

## Trabajo realizado

Auditoría de variables de entorno, accesos y buenas prácticas.

## Verificación

| Control | Estado | Evidencia |
|---------|--------|-----------|
| `.gitignore` excluye secretos | ✅ | `.env`, `.env.local`, `backend/.env` |
| Plantillas `.env.example` sin valores reales | ✅ | frontend + backend |
| `NEXT_PUBLIC_*` solo claves públicas Supabase | ✅ | `frontend/.env.example` |
| `SUPABASE_SERVICE_ROLE_KEY` solo server | ✅ | No expuesta como NEXT_PUBLIC |
| Route Handlers con auth | ✅ | `/api/ia/presupuesto`, `/api/pdf/*` verifican `getUser()` |
| WA tokens deprecados en backend | ✅ | `backend/.env.example` comentado |
| WhatsApp wa.me sin tokens | ✅ | `frontend/src/app/api/whatsapp/enviar/route.ts` |

## Incidencias

Ninguna crítica ni alta detectada en alcance 01.4.

## Recomendaciones (baja / informativa)

- Rotar keys si alguna estuvo expuesta en historial git (verificación manual propietario).
- Mantener `SERVICE_KEY` legacy solo en backend Railway si el servicio permanece activo.

## Estado final

Prácticas de seguridad alineadas con AM §10 y reglas `DARIVO-PRO-FINAL.mdc` (C5 Auditor).

**Fin del informe.**
