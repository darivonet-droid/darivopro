# Informe Subtarea 01.3 — Dependencias

**Tarea:** 01 – Arquitectura  
**Subtarea:** 01.3 – Dependencias  
**Fecha cierre:** 03/07/2026  
**Estado:** ✅ Cerrada

---

## Trabajo realizado

Auditoría de librerías, dependencias y versiones en `frontend/package.json` y `backend/requirements.txt`.

## Frontend (`frontend/package.json`)

| Dependencia | Versión | Alineación AM |
|-------------|---------|---------------|
| next | 14.2.0 | ✅ Stack §5 |
| @supabase/ssr, @supabase/supabase-js | ^0.4 / ^2.43 | ✅ Supabase Auth + BD |
| zod | ^3.23 | ✅ Validación |
| zustand | ^4.5 | ✅ Estado global |
| @react-pdf/renderer | ^4.3 | ✅ PDF en Next.js |
| typescript | ^5.4 | ✅ |

## Backend legacy (`backend/requirements.txt`)

| Dependencia | Versión | Notas |
|-------------|---------|-------|
| fastapi | 0.111.0 | Legacy — no extender |
| supabase | >=2.6 | ✅ |
| weasyprint | 61.2 | Legacy PDF — producto usa Next.js |

## Desalineación documentada

| ID | Severidad | Descripción | Acción |
|----|-----------|-------------|--------|
| INC-01.3-01 | Media | IA en código usa Anthropic API; registro oficial aprueba OpenAI API | Registrado AM §11.4 — Tarea 07 |

## Estado final

Dependencias frontend coherentes con stack oficial. Backend legacy acotado y documentado. Sin incidencias críticas ni altas en alcance 01.3.

**Fin del informe.**
