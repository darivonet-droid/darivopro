# 21/07/2026 (ejecutado 22/07/2026) — Merge de `develop` → `main` vía Pull Request (Etapas 1-7)

Autorización explícita de Mohamed ("producción autónomo") para esta tarea puntual: llevar los commits acumulados de `develop` a `main` mediante PR, fusionar, y confirmar deploy en Vercel.

## Qué se fusionó

48 commits de `develop` a `main` (46 de las Etapas 1-7 + 1 commit de reestructuración de `CLAUDE.md` que quedaba local sin empujar + 1 commit del fix de Tarea 2 de esta misma sesión). Resumen de módulos tocados:

- **Auditoría de seguridad/roles (Etapas 1-5)**: matriz de roles vs. estándar RBAC, auditoría RLS de 35 tablas (3 gaps de escalada de privilegios intra-sesión corregidos vía migración sin ejecutar), esquema de factura preparado para Bizlinks, `darivo_admin_empleados` como fuente principal de Admin, baja de `darivonet@gmail.com` como Admin.
- **Etapa 6 — Matriz de Roles y Permisos real**: `admin/roles` renderiza dinámicamente 21 acciones × 5 roles (commit `9c2c33b`); importar CSV en Admin: Empleados, Catálogo, Empresas, Usuarios (commits `0f14308`, `949afb9`, `605d859`, `8e9164b`).
- **Etapa 7 — Cierre de celdas pendientes y planes editables**: activación de `MATRIZ_PERMISOS_APROBADA`, catálogo de suscripciones editable desde BD (`planes_catalogo`, sin efecto real en checkout todavía), Empresa reemplaza rol fijo Técnico por módulos activables, toggle de acceso Partner→Móvil desde Admin, sección de Soporte en Panel Partner (commit `156b926` / `d175e40`).
- **Restricción por dispositivo**: bloqueo total implementado y luego **revertido** el mismo día por decisión de Mohamed — reemplazado por banner informativo descartable, nunca mostrado a Partner (commit `4bd6532`).
- **Mora de pagos**: banner + marca/limpia estado desde webhook (commit `55cd7be`).
- **Límite plan Gratis**: trigger BD que refuerza el límite de 5 cotizaciones (commit `bd972cf`).
- **Latitude Telemetry**: instalada para las 3 llamadas a OpenAI (commit `1c07f60`).
- Múltiples actualizaciones de `CLAUDE.md`/MDs oficiales documentando cada etapa, incluida la reestructuración final de `CLAUDE.md` (normas permanentes + índice, detalle en `docs-internos/tareas/`).

Hashes de referencia usados en el diagnóstico previo: `9c2c33b`, `156b926`, `4bd6532`, `35da939`.

## Fix incluido (Tarea 2 — `force-dynamic` en admin/roles)

`frontend/src/app/admin/roles/page.tsx` no tenía `export const dynamic = "force-dynamic";`, a diferencia del resto de pantallas de Admin (patrón confirmado en `admin/catalogo/page.tsx` y `admin/usuarios/page.tsx`, línea 6 en ambos). Se agregó la misma línea inmediatamente después de los imports. Verificado antes del merge: `tsc --noEmit` limpio, `next lint` limpio (mismos 3 warnings preexistentes de `useCotizacion.ts`/`useFactura.ts`, sin relación), `next build` limpio (`/admin/roles` listada como `ƒ` dinámica). Commit: `62ee5b7` — "fix(admin/roles): agrega force-dynamic, coherente con el resto de pantallas Admin".

## Pull Request y merge

- **PR #[N]**: `[URL]` — "[título]" — develop → main.
- Fusionado con `gh pr merge --merge` (merge commit normal, preserva los commits individuales) bajo la autorización de "producción autónomo" de esta tarea.

## Resultado en producción

- Nuevo HEAD de `origin/main`: `[hash]`.
- Deployment Vercel: `[deployment id]`, `target: production`, estado `[READY/ERROR]`, commit `[hash]`.

## Verificación en vivo

- `https://darivopro.com/`: `[resultado]`.
- `https://admin.darivopro.com/admin/roles`: `[resultado — con o sin sesión autenticada, qué se pudo confirmar sin escribir contraseña]`.

## Cambio ajeno no tocado

`frontend/public/sw.js` apareció modificado sin commitear en el árbol de trabajo (cambio de otra sesión) — no se tocó, no se comiteó, no se incluyó en este merge.

## Pendiente / sin cambios de esta tarea

Ningún otro cambio de código además del fix de `force-dynamic` de arriba. Deuda técnica y decisiones de negocio pendientes siguen siendo las mismas ya documentadas en el índice de `CLAUDE.md` (catálogo de planes sin efecto real en checkout, migración `facturas_bizlinks_esquema` en pausa, etc.) — no se tocaron en esta tarea.
