# Darivo Pro — Guía para Claude Code

## Skills a utilizar (confirmado por el propietario, 07/07/2026)

De las skills personales disponibles, usar solo estas 6 (7 comandos, Review+Ultrareview cuentan como una pareja):

| Skill | Qué hace | Cuándo usarla en este proyecto |
|---|---|---|
| **/Skill-Creator** | Convierte descripciones de flujos de trabajo en una skill reutilizable | Para crear las skills propias de Darivo Pro (ver propuesta de 6 skills del 07/07/2026 más abajo) |
| **/Superpowers** | Obliga a planificar y analizar requisitos/casos límite antes de ejecutar, evita cambios improvisados | Usar en cualquier tarea de código nueva (Módulo 05, middleware, migración BD) — encaja con la disciplina de "muéstrame el diff antes de aplicar" que ya seguimos hoy |
| **/GSD (Get Stuff Done)** | Mantiene el foco en tareas largas | Útil para las tareas largas de varios pasos ya definidas en este documento |
| **/Review y /Ultrareview** | Analiza el propio código para detectar y corregir errores antes de producción | Usar después de cada tarea de código, antes de dar el commit por bueno — refuerza la verificación que ya hacíamos manualmente |
| **/Context-Mode** | Mantiene coherencia en conversaciones largas, evita degradación | Útil dado que este proyecto tiene mucho historial acumulado (Visión, Suscripciones, Roles, etc.) |
| **/Claude-Mem** | Memoria entre sesiones — recuerda proyecto y contexto semanas después | Especialmente valioso aquí: permite que Claude Code recuerde este handoff sin depender de que releas todo este `CLAUDE.md` cada vez |

**Propuesta de 6 skills propias de Darivo Pro** (a construir con /Skill-Creator, no ahora — cuando Mohamed lo indique):

1. `auditoria-darivo-pro` — clona el repo real, compara documentación vs código, busca contradicciones/referencias rotas/versiones desincronizadas.
2. `verificar-main` — compara archivos concretos de `main` contra una versión esperada, confirma si un commit se aplicó bien.
3. `sincronizar-vision` — cuando cambia `01-VISION-DEL-PRODUCTO.md`, identifica qué otros MD referencian esa sección.
4. `nuevo-modulo-md` — crea un MD de módulo nuevo con la plantilla oficial exacta.
5. `prompt-cursor-seguro` — genera prompts para Cursor con pasos numerados y verificación antes de acciones destructivas.
6. `modelo-financiero-darivo` — construye/actualiza el Excel de comisiones y proyecciones con fórmulas, no valores fijos.

## Regla de oro: NO leas toda la carpeta `.cursor/rules/` de golpe

Este proyecto tiene 60+ documentos MD. Leerlos todos en cada sesión gasta tokens innecesariamente. Usa este archivo como mapa y lee **solo** el MD específico que necesites para la tarea concreta que tengas delante.

## Los 3 documentos que SÍ debes leer siempre, al empezar cualquier tarea

1. `.cursor/rules/01-VISION-DEL-PRODUCTO.md` — fuente de verdad de todo el ecosistema. Si hay contradicción con cualquier otro MD, gana este.
2. El índice del área en la que vas a trabajar:
   - Admin → `.cursor/rules/02-darivo-pro-admin/INDICE-OFICIAL-PANEL-ADMIN.md`
   - Empresa → `.cursor/rules/03-darivo-pro-empresa/INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md`
3. El MD específico del módulo que vas a tocar (el índice te dice cuál es).

**No leas los demás módulos** salvo que la tarea los mencione explícitamente o el módulo que estás leyendo te remita a otro con una referencia cruzada.

## Cómo confirmar una tarea sin releer todo

Antes de escribir código, usa `grep`/búsqueda dirigida sobre el MD específico en vez de abrirlo entero, si solo necesitas confirmar un dato puntual (ej. un nombre de columna, un estado válido, un límite de plan).

## Fuente de verdad del esquema de base de datos

`supabase/migrations/` — **siempre prevalece sobre lo que diga cualquier MD** si hay contradicción (regla ya escrita en `02-BASE-DATOS.md` §0). Antes de asumir una columna o tabla desde un MD, compruébala en la migración real.

## Terminología oficial (unificada 06/07/2026)

Usa siempre **"cotización/cotizaciones"**, nunca "presupuesto/presupuestos", en código y documentación nuevos. Migración en curso — si encuentras "presupuesto" en tablas de BD, tipos TS (`interface Presupuesto`) o `components/presupuesto/`, es deuda técnica pendiente, no lo repliques en código nuevo.

## Antes de modificar cualquier MD oficial

Estos documentos tienen protección explícita ("solo el propietario puede modificarlos"). Si Mohamed te pide un cambio, tienes autorización — pero:
- Actualiza siempre la versión y añade una línea de changelog.
- Si el cambio afecta a la Visión (`01-VISION-DEL-PRODUCTO.md`), revisa si otros MD referencian esa sección y quedarían desincronizados.
- Nunca dupliques planes, precios ni límites fuera de `04-PANEL-ADMIN-SUSCRIPCIONES.md` (regla del propio ecosistema, Visión §12).

## Tareas de código pendientes conocidas (06/07/2026)

- Tarea 3: Módulo Admin 05 — Edición de Productos (MD listo, código no empezado).
- Tarea 5: Middleware de subdominios (app./empresa./admin./partner.darivopro.com) — preparar, no activar hasta conectar dominio.
- Migración completa de terminología presupuesto→cotización en BD (tablas `presupuestos`, `presupuesto_items`), tipos TS (`interface Presupuesto`) y `components/presupuesto/`.

## Lo que NO existe en este producto (para no reinventarlo)

- Ninguna funcionalidad de marketing/anuncios dentro de la app (ni Admin, ni Empresa, ni Móvil). Las "APIs de marketing" documentadas en `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` son herramientas externas del propio negocio, no una feature del producto.
- "Referidos" no existe — se llama "Partners".
- Integración SUNAT real — todavía no hay proveedor OSE contratado (Vision §18). No inventar código de integración real hasta confirmarlo.

## Seguridad — regla que se mantiene con el cambio de herramienta

Las credenciales (tokens, contraseñas de BD, claves de API) **nunca se pegan en el chat con la IA** — ni en Cursor ni en Claude Code. Van directamente en GitHub Secrets o en el archivo `.env.local` local, nunca en un mensaje. Si Claude Code necesita saber si una variable existe, que pregunte o revise `.env.example`, nunca que pida el valor real.

## Tarea 0 (primera, antes del Día 1) — Limpieza de documentación de proceso Cursor

Ya verificado con nombres exactos (06/07/2026) — no hace falta redescubrir nada, ejecuta directo:

```powershell
Remove-Item ".cursor/rules/22 – METODOLOGÍA OFICIAL DE IA – DARIVO PRO.md"
Remove-Item ".cursor/rules/23 – METODOLOGÍA OFICIAL – TRABAJO EN PARALELO CON DOS AGENTES IA – DARIVO PRO.md"
Remove-Item ".cursor/rules/23-A – PROMPT OFICIAL – AGENTE 1 – PRODUCCIÓN – DARIVO PRO.md"
Remove-Item ".cursor/rules/23-B – PROMPT OFICIAL – AGENTE 2 – AUDITORÍA DEL ECOSISTEMA – DARIVO PRO.md"
Remove-Item ".cursor/rules/23-C – PROMPT OFICIAL – AGENTE 3 – IMPLEMENTACIÓN DEL PRODUCTO – DARIVO PRO.md"
Remove-Item ".cursor/rules/24 – PROMPT OFICIAL – PRODUCCIÓN E IMPLEMENTACIÓN – DARIVO PRO.md"
Remove-Item ".cursor/rules/25 – CATÁLOGO OFICIAL DE TAREAS – IMPLEMENTACIÓN DARIVO PRO.md"
Remove-Item ".cursor/rules/informes" -Recurse
Remove-Item ".cursor/rules/03-darivo-pro-empresa/INFORME-FASE-FINAL-DARIVO-PRO-EMPRESA.md"
Remove-Item ".cursor/audit-db-output.json"
Remove-Item ".cursor/rules/DARIVO-PRO-FINAL.mdc"
# NOTA (nombres reales verificados 08/07/2026): los archivos 22–25 usan raya "–" (U+2013),
# NO guion "-", y llevan tildes (METODOLOGÍA, PRODUCCIÓN, etc.). Cópialos literalmente o el
# Remove-Item no encontrará el archivo. El .mdc confirmado es DARIVO-PRO-FINAL.mdc.
```

Después de borrar, verifica: `(Get-ChildItem -Path ".cursor/rules" -Filter "*.md" -Recurse -File | Measure-Object).Count` debe dar **48** (no 30 — ese número era un error de conteo, ya corregido). Si no da 48, para y compara contra la lista de "MD esenciales" más abajo antes de hacer commit.

Un solo commit: "chore: eliminar documentación de proceso Cursor (metodología, prompts de agentes, informes) — no necesaria para Claude Code"

## Handoff: de Cursor (Composer 2.5) a Claude Code

Hasta el 06/07/2026, el trabajo de código se hizo con Cursor (Composer 2.5). A partir de ahora, Claude Code toma el relevo. Ya hecho y verificado por Claude (no repetir):

* Planes Básico/Pro/Business en código (`roles-planes-oficial.ts`, `plan-limits.ts`, `acceso-producto.ts`).
* 6 estados oficiales de factura (`Borrador/En proceso/Emitida/Rechazada/Pendiente de envío/Cobrada`) — migración, tipos, colores, lógica de `FacturaCard`.
* Roles personalizados (RBAC) — migración `roles_personalizados` + UI en `RolesPermisosView.tsx`.
* Pantalla de Inicio (Móvil) corregida — sin enlace a Empresa, sin accesos rápidos a Clientes/Cotizaciones.

**Pendiente de verificar por Claude Code al empezar** (Cursor lo hizo pero no se auditó a fondo): la migración de terminología presupuesto→cotización en rutas de página/API (commits `6f19ea5`, `3538514`, `a897249`) — confirmar que quedó bien antes de continuar con el Día 1.

## Plan de trabajo — MAÑANA (todo excepto SUNAT)

SUNAT queda para **pasado mañana**, cuando el dominio y `info@darivopro.com` estén operativos y se pueda enviar el correo a Bizlinks. No lo toques mañana.

Orden de prioridad para mañana (de mayor a menor riesgo — hazlo en este orden, un commit por bloque, muéstrame cada diff antes de aplicar):

### 1. Migración de terminología (presupuesto → cotización) — el más arriesgado, primero con la mente fresca

1. Inventario completo (tablas, columnas, tipos TS, archivos/carpetas) agrupado por riesgo — sin tocar nada todavía.
2. Revisar el inventario con Mohamed antes de continuar.
3. Ejecutar primero lo de bajo riesgo (tipos TS, nombres de archivo/carpeta de componentes).
4. Tablas de BD con datos reales al final, con migración que preserve los datos (no DROP/CREATE).
5. Verificación final: grep global de "presupuesto" en todo el proyecto.

### 2. Landing Page (`darivopro.com`)

**No la construyas — Mohamed la hace él mismo mañana por la mañana en Cursor, ANTES de que tú toques el Bloque 5 (middleware).** MD oficial ya listo: `LANDING-PAGE-DARIVO-PRO.md` (v1.0) + mockup de referencia `mockup-landing-darivopro.html`. Si te pide ayuda puntual con esto, sigue exactamente ese MD, no inventes estructura nueva.

**Orden acordado:** Landing (Mohamed, Cursor) → luego Bloque 5 (tú, middleware). No los hagas en paralelo — ambos tocan `frontend/src/app/page.tsx`.

### 3. Precios (`/precios`) — actualizar a 3 planes

Cambiar metadata y contenido de "Planes Básico y Pro" a los 3 planes oficiales (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 — precios marcados como provisionales).

### 4. Módulo Admin 05 (Edición de Productos)

MD ya oficial: `.cursor/rules/02-darivo-pro-admin/05-PANEL-ADMIN-EDICION-DE-PRODUCTOS.md` (v1.1 — usa `slug`, no `codigo`).

1. Migración: añadir `orden` y `updated_at` a `productos_master` solo si Mohamed lo confirma — hoy no existen.
2. Pantalla en `frontend/src/app/admin/productos/` — solo edición de las 3 filas existentes, sin crear/eliminar.
3. Entrada en el sidebar de Admin, siguiendo `16-SISTEMA-DE-DISEÑO-ADMIN.md`.

### 5. Middleware de subdominios (preparar, no activar)

⚠️ **NO empieces este bloque hasta confirmar con Mohamed que ya construyó la Landing Page en Cursor esta mañana.** Si no la ha terminado todavía, salta este bloque y avísale — no lo hagas en paralelo, los dos tocáis la misma ruta raíz (`frontend/src/app/page.tsx`) y os podéis pisar.

Una vez confirmado que la Landing ya existe:

Estructura: `darivopro.com` (landing, ya construida por Mohamed) · `app.` (Móvil) · `empresa.` (Empresa) · `admin.` (Admin) · `partner.` (Partner).

1. Revisar `frontend/src/middleware.ts` actual, mostrarlo antes de tocar.
2. Confirmar dónde quedó la Landing Page real (puede que Mohamed haya movido el contenido de `page.tsx` o creado una ruta nueva) — pregúntale si no está claro, no asumas.
3. Rewrite (no redirect) por hostname, sin romper localhost/desarrollo.
4. No tocar `next.config.mjs` ni crear `vercel.json` todavía — eso se hace cuando el dominio esté conectado a Vercel.

## Pasado mañana — SUNAT (no antes)

Una vez `info@darivopro.com` esté operativo:

1. Enviar el correo ya redactado a Bizlinks (pedir a Mohamed que confirme si ya lo envió y qué respondieron).
2. No escribir ningún código de integración real hasta tener condiciones confirmadas del proveedor OSE.

## Antes de publicar la Política de Privacidad y Términos de Uso

⚠️ **No publicar `POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md` ni `TERMINOS-Y-CONDICIONES-DARIVO-PRO.md` sin antes:**

1. Actualizar `INVENTARIO-PROVEEDORES-DATOS-DARIVO-PRO.md` con cualquier servicio nuevo que se haya integrado desde el 07/07/2026.
2. Copiar esa lista completa a la tabla de proveedores de la Política de Privacidad (§4).
3. Rellenar todos los corchetes `[...]` de ambos documentos (razón social, NIF, email de contacto).
4. Confirmar que un abogado ha revisado ambos documentos — son borradores de IA, no válidos para publicar tal cual.

## Bloqueado — no iniciar sin confirmación explícita

- Conexión API Claude/Anthropic para los Agentes IA 1 y 2: decisión de arquitectura pendiente (¿sustituye o convive con OpenAI?).


