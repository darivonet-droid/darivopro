# Catálogo de Errores y Códigos — Darivo Pro

**Versión:** 1.0 · **Creado:** 14/07/2026

Catálogo de los códigos que se muestran en la app en vez de un mensaje crudo o un crash. Cuando aparezca un código en pantalla (`ERR-004`, `PEND-001`, `INC-A01`), esta tabla dice qué es, si ya se conoce, y qué hacer.

**Este archivo es solo para consulta humana — nunca se lee en runtime ni se sirve al navegador** (vive en la raíz del repo, no en `frontend/public/`, igual que `CLAUDE.md`). La fuente de verdad que usa el código en producción es `frontend/src/lib/error-catalog.ts` — cualquier código nuevo debe existir en los dos archivos, con el mismo mensaje.

## Cómo funciona

Componente `frontend/src/components/common/CodeNotice.tsx` — se usa así:

```tsx
<CodeNotice code="PEND-001" />          // solo la línea corta
<CodeNotice code="PEND-001" detalle />  // + segunda línea con contexto técnico
```

`CodeNotice` **solo recibe el código**, nunca el mensaje real de un error ni datos dinámicos (stack trace, texto de Supabase, nombre de tabla/columna) — el texto que se muestra sale siempre de `error-catalog.ts`, nunca de lo que haya pasado en ese momento. Así se evita filtrar información técnica sensible sin importar dónde se use el componente.

## Relación con DT-XX-XX e INC-XXX (`.cursor/rules/`)

**No se fusionan — son capas distintas, con referencia cruzada cuando aplica:**

- **DT-XX-XX / INC-[Letra]NN** (tabla `# 7. Deuda técnica` de cada MD numerado de `.cursor/rules/`) son la taxonomía de **planificación**: backlog y bloqueos conocidos por el equipo, muchos de los cuales nunca los ve un usuario. Su fuente de verdad sigue siendo el MD del módulo, no este archivo.
- **ERR-XXX / PEND-XXX** son la taxonomía de **runtime**: lo que efectivamente aparece en una pantalla real en el momento en que alguien se topa con ello.
- Cuando un `PEND-XXX` corresponde a algo que también está documentado como `DT-XX-XX`, se citan mutuamente (ver tabla de abajo). No se crea un `PEND-XXX` por cada `DT-XX-XX` — solo cuando existe de verdad una pantalla donde el usuario puede encontrarse con ese hueco.
- Los códigos `INC-A01`, `INC-M01`, `INC-B01` (definidos en [`05-FRONTEND-DARIVO-PRO.md` §7](.cursor/rules/05-FRONTEND-DARIVO-PRO.md)) ya se muestran hoy en pantalla (Admin y Móvil) — se migraron a `CodeNotice` para no tener el mismo texto repetido a mano en varios archivos, pero **su existencia y estado siguen definidos en ese MD**, no acá. Este catálogo solo espeja el mensaje corto que usa el componente.

## Próximo código disponible

- Próximo `ERR`: **ERR-001** (ninguno usado todavía)
- Próximo `PEND`: **PEND-002** (`PEND-001` ya usado)

## ERR-XXX — Errores reales

Error capturado (crash, excepción, fallo de un servicio externo) que antes hubiera mostrado un mensaje crudo o roto la pantalla.

| Código | Mensaje al usuario | Causa real | Dónde se usa |
|--------|---------------------|------------|--------------|
| _(ninguno todavía — este sistema se probó primero con un caso PEND, ver abajo)_ | | | |

## PEND-XXX — Funcionalidad no implementada

Algo que el usuario puede encontrar en la app y que todavía no existe.

| Código | Mensaje al usuario | Qué falta realmente | Relacionado | Dónde se usa |
|--------|---------------------|----------------------|-------------|--------------|
| `PEND-001` | Editar un gasto ya guardado todavía no está disponible. | `useGastos.ts` solo tiene `agregarGasto()` — no existe ninguna función para modificar un gasto existente, así que el detalle es de solo lectura. | — | `frontend/src/components/cierre/CierreViewEscritorio.tsx` (`PanelDetalleGasto`) |

## INC-XXX ya mostrados en UI (fuente de verdad: MD del módulo, no este archivo)

| Código | Mensaje al usuario | Definición oficial | Dónde se usa |
|--------|---------------------|---------------------|--------------|
| `INC-A01` | El envío de tickets de soporte no se sincroniza con Admin todavía. | [`05-FRONTEND-DARIVO-PRO.md` §7](.cursor/rules/05-FRONTEND-DARIVO-PRO.md) · [`09-PANEL-ADMIN-SOPORTE.md` §11](.cursor/rules/02-darivo-pro-admin/09-PANEL-ADMIN-SOPORTE.md) | `AdminSoporteView.tsx`, `admin/page.tsx` (Dashboard), `SoporteTicketsView.tsx` (Móvil) |
| `INC-M01` | Ver y responder tickets desde Admin todavía no está disponible. | [`05-FRONTEND-DARIVO-PRO.md` §7](.cursor/rules/05-FRONTEND-DARIVO-PRO.md) | `AdminSoporteView.tsx` |
| `INC-B01` | Filtrar tickets por plan todavía no está disponible. | [`05-FRONTEND-DARIVO-PRO.md` §7](.cursor/rules/05-FRONTEND-DARIVO-PRO.md) | `AdminSoporteView.tsx` |

## Cómo agregar un código nuevo

1. Elegí el prefijo correcto: `ERR-` si es un error real capturado, `PEND-` si es funcionalidad que falta y el usuario puede encontrarla en una pantalla real.
2. Tomá el próximo número de la sección "Próximo código disponible" de arriba y actualizá ese contador.
3. Agregá la fila en la tabla correspondiente de este archivo (mensaje corto, causa real, dónde se usa).
4. Agregá la misma entrada en `frontend/src/lib/error-catalog.ts` (`ERROR_CATALOG`) — mismo código, mismo `mensaje`.
5. Usá `<CodeNotice code="..." />` en el punto real de la UI. Nunca pases el mensaje de error real como prop — solo el código.
