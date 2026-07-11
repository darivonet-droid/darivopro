# Darivo Pro — Guía para Claude Code

## Autonomía de ejecución

Por defecto, tienes autorización para ejecutar tareas de forma autónoma, sin pedir permiso paso a paso ni confirmación intermedia.

ÚNICAS EXCEPCIONES — debes parar y pedir confirmación explícita antes de actuar cuando la tarea implique:

1. **Base de datos**: cualquier cambio en schema, migraciones, o datos (Supabase).
2. **Deploy**: cualquier acción que dispare un despliegue a producción (push a main, redeploy manual, o equivalente).

Para todo lo demás (código de frontend/backend, commits a develop, buscar e implementar assets, build/lint/typecheck, correcciones de texto, etc.) actúa sin preguntar, salvo que tú mismo detectes una ambigüedad real que no puedas resolver razonablemente por tu cuenta.

## Flujo de ramas (Git)

Todo el trabajo se hace en la rama `develop`, nunca directamente en `main`. Cuando una tarea (o un conjunto de tareas relacionadas) esté lista y verificada, se abre un Pull Request de `develop` hacia `main` para que Mohamed lo revise antes de fusionar.

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

## Reglas de frontend / contenido público

### Nunca exponer Markdown en crudo al usuario

Ningún archivo .md ni su contenido en formato Markdown sin procesar debe ser accesible o visible para un visitante de darivopro.com o cualquiera de sus subdominios (app., empresa., admin., partner.). Esto incluye:
- Servir un .md directamente como respuesta de una ruta pública.
- Mostrar sintaxis de Markdown sin renderizar (#, **, -, etc.) en cualquier página visible para el usuario final.
- Cualquier archivo de documentación interna (CLAUDE.md, MDs de arquitectura, visión de producto, contexto de negocio, etc.) accesible desde una URL pública.

Todo contenido que se muestre al usuario final debe estar renderizado como HTML con el diseño del sitio, sin excepción. Los .md internos son fuente de contenido o documentación de desarrollo, nunca la salida final que ve un visitante.

*(Verificado 09/07/2026: `/terminos` y `/privacidad` ya renderizan correctamente vía `frontend/src/components/legal/MarkdownLegal.tsx` — no servían el .md crudo. El bug real encontrado fue más sutil: el parser no soportaba itálica de un asterisco `*texto*` ni código en línea con backtick, así que esa sintaxis quedaba visible sin procesar en 6 puntos entre ambas páginas. Corregido — el componente ahora soporta negrita, itálica y código en línea, con anidamiento recursivo. Los marcadores `[pendiente]` siguen visibles a propósito, es una decisión de contenido documentada, no un bug de renderizado.)*

## Antes de modificar cualquier MD oficial

Estos documentos tienen protección explícita ("solo el propietario puede modificarlos"). Si Mohamed te pide un cambio, tienes autorización — pero:
- Actualiza siempre la versión y añade una línea de changelog.
- Si el cambio afecta a la Visión (`01-VISION-DEL-PRODUCTO.md`), revisa si otros MD referencian esa sección y quedarían desincronizados.
- Nunca dupliques planes, precios ni límites fuera de `04-PANEL-ADMIN-SUSCRIPCIONES.md` (regla del propio ecosistema, Visión §12).

## Tareas de código pendientes conocidas (06/07/2026)

- ~~Tarea 3: Módulo Admin 05 — Edición de Productos~~ ✅ **Construido** (`frontend/src/app/admin/productos/`, `frontend/src/lib/admin-queries.ts` `fetchAdminProductos`/`AdminProductoRow`) — cumple casi todo `05-PANEL-ADMIN-EDICION-DE-PRODUCTOS.md` v1.1 (edita nombre/descripción/activo de las 3 filas existentes; `slug` no editable; sin historial/auditoría por falta de `updated_at`).
- Tarea 5: Middleware de subdominios (app./empresa./admin./partner.darivopro.com) — preparar, no activar hasta conectar dominio. ✅ Auditoría 09/07/2026 confirma que sigue correctamente apagado (los 4 subdominios ni siquiera resuelven en DNS) — no tocar todavía.
- ~~Migración completa de terminología presupuesto→cotización en BD~~ ✅ **Confirmado COMPLETO por auditoría 09/07/2026** (migraciones, rutas, tipos, caché PWA) — no repetir este trabajo.

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

## Estado de remediación — Auditoría 09/07/2026 (leer antes de continuar)

Se ejecutó una auditoría de solo lectura (4 agentes en paralelo + verificación directa en producción) comparando MD ↔ BD ↔ código ↔ producción. Nada se modificó en esa sesión. Esta sección es el registro vivo de esos hallazgos — se marca cada punto aquí mismo al corregirlo, no se crean informes nuevos.

**Regla de trabajo:** un punto a la vez, en el orden de abajo. Para cada uno: releer el archivo:línea citado → aplicar el cambio mínimo → verificar en vivo/local que el síntoma desaparece → marcar `[x]` aquí.

### Prioridad 1 — Crítico (páginas públicas / venta)

- [ ] **Plan Business ausente en `/precios`.** `frontend/src/lib/planes.ts:24-61` solo tiene Básico y Pro; `roles-planes-oficial.ts` sí tiene los 3. Metadata de la página dice *"Planes Básico y Pro"*. Sincronizar `planes.ts` con `roles-planes-oficial.ts` (fuente de verdad) y corregir metadata. *(Esto es lo mismo que el punto 3 del plan de mañana — al llegar ahí, usar esta descripción exacta, el bug sigue activo.)*
- [ ] **"IA" visible al usuario en 16 archivos (31 apariciones)**, cuando la regla de negocio exige "Calculadora inteligente" (o el término aprobado). **Antes de tocar código:** confirmar con Mohamed si la regla es solo de landing (como dice `LANDING-PAGE-DARIVO-PRO.md` v1.3) o global de producto — si es global, los MD internos (`08-MODULO-IA.md`, etc.) también hay que renombrarlos.
  - `components/ui/BottomNav.tsx:53` (botón central) · `(auth)/ia/page.tsx:9` (título)
  - `components/cotizacion/IACotizacionFlow.tsx:107,123,128,189,253` (copys/toasts) — ojo: línea 94 persiste "Notas IA:" en la cotización, decidir si el dato guardado también cambia
  - `lib/planes.ts:35,53` ("IA por voz", "IA texto + voz 🎤") · `components/plan/UpgradeModal.tsx:10` · `lib/plan-limits.ts:31-32`
  - `components/mas/MasOpcionesList.tsx:49-50` ("IA — Preferencias") + pantalla de preferencias del asistente
  - `CierreView.tsx:131,412` · label de navegación en Empresa · "IA cotizaciones/día" en Admin
  - Casos límite a decidir explícitamente (no corregir sin decisión): rutas URL `/ia`, `/empresa/ia`, `/mas/ia-preferencias` — renombrar puede romper bookmarks, evaluar redirect 301.

### Prioridad 2 — Incumplimiento de MD / bug funcional

- [ ] **Bug de facturación:** `verificarLimiteFactura` (`lib/plan-limits.ts:106`) permite facturas al plan `gratis` pese a que `LIMITES_PLAN.gratis.facturasHabilitado = false`. Corregir la lógica para que respete el flag.
- [ ] **Logout ausente en Admin/Empresa/Partner** — solo tienen "← Volver a Móvil", pese a que el MD de Admin lo exige explícitamente en §Sesión y §Panel lateral. Añadir botón real reutilizando `cerrarSesion` de `AjustesForm.tsx:53-57` en los 3 paneles.
- [ ] **Logout enterrado en Móvil** — existe en `AjustesForm.tsx:141-147` pero solo dentro de Más → pestaña "Empresa" (3ª pestaña, con scroll); el menú principal `MasOpcionesList.tsx` (7 items) no tiene ninguno. Añadir botón al final de `MasOpcionesList.tsx` (mismo estilo de fila, reutilizando `cerrarSesion`). Actualizar la ubicación en el MD de autenticación si cambia.

### Prioridad 3 — Contradicciones de precio/nombre entre MD

- [ ] **Precio Básico: S/39 vs S/49.** Un MD de roles/permisos dice S/39; `04-PANEL-ADMIN-SUSCRIPCIONES.md` y el código dicen S/49. Unificar a S/49 (el que está en código) en el MD que lo tenga mal.
- [ ] **Nombre del 3er plan inconsistente dentro del mismo MD** — aparece como "Empresa" (cabecera), "Business" (cuerpo) y "empresa=legacy no comercial" en otra sección. BD y código usan `business`. Unificar a "Business" en todo ese documento.

### Prioridad 4 — Documentación desactualizada (no bloquea producto)

- [ ] `00-ECOSISTEMA-DARIVO-PRO.md` usa dominio obsoleto `darivo.net` y menciona producto "Multiempresa" (no existe en ningún otro sitio); no menciona Partner. Actualizar a `darivopro.com`, quitar "Multiempresa", añadir Partner. Corregir también la referencia rota a `01-VISION-DEL-PRODUCTO.md` (nombre de archivo incorrecto).
- [ ] `02-BASE-DATOS.md` desactualizado: sigue documentando `presupuestos`/`presupuesto_items` (ya renombradas — ver arriba, esto sí está resuelto en código, falta reflejarlo en el MD); documenta columnas `perfiles.categorias` y `productos_master.orden/updated_at` que no existen; no documenta la tabla `roles_personalizados` ni ~8 tablas más. Regenerar el esquema documentado desde la BD real (33 tablas).
- [ ] Versionados internos inconsistentes (ARQUITECTURA-MAESTRA con v2.9 en cabecera y v3.4 en §12, etc.) y referencias a docs eliminados en la Tarea 0 (22-25) o inexistentes (`04-SIMBOLOS-Y-BOTONES.md`). Bajo esfuerzo, limpiar cuando se toquen esos archivos por otra razón.
- [ ] "Referidos" vs "Partners": Visión ya lo cerró (es "Partners"), pero ARQUITECTURA §11.4 lo presenta como "decisión abierta". Cerrar esa sección alineada con Visión.

### Prioridad 5 — Deuda conocida, no urgente (requiere decisión de negocio)

- [ ] La jerarquía "Suscripción → Producto → Rol → Permisos" solo está implementada hasta la mitad: Producto se gatea por allowlist de emails en env vars (no por tabla `suscripciones`); Rol → Permisos → Funcionalidades no gatea nada (`MATRIZ_PERMISOS_APROBADA = false`, RBAC administrable pero inerte). Esto ya está documentado como pendiente (DT-04-02) en el MD de roles — **no es una sorpresa**. Acción mínima ahora: corregir ARQUITECTURA-MAESTRA §4.6, que la presenta como "secuencia vigente" cuando no lo está. Decisión de activarla de verdad: pendiente de Mohamed, no hacerlo sin confirmación.

### Verificado como coherente en la auditoría — no tocar

Migraciones de terminología cotización (completo) · `roles-planes-oficial.ts` ↔ `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 · Middleware de subdominios (correctamente apagado) · Landing v1.3 ↔ MD v1.3 · los 3 botones del header · RLS activo en todas las tablas de usuario.

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

Cambiar metadata y contenido de "Planes Básico y Pro" a los 3 planes oficiales (`04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 — precios marcados como provisionales). Ver detalle exacto de archivo:línea en "Estado de remediación — Auditoría 09/07/2026" → Prioridad 1. Al terminar, marcar ese checkbox también, no solo tachar esto de la lista de mañana.

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

## Cuenta de prueba QA (permanente)

Para probar cualquier feature (facturación, IA, roles personalizados, Empresa) sin depender de una cuenta real:

- **Email:** `demo@darivopro.com`
- **Plan:** `business` (acceso total — facturación, IA ilimitada, roles personalizados, producto Empresa)
- **Contraseña:** definida por Mohamed al crear el usuario, no versionada en este repo — no la pidas ni la escribas aquí si te la comparte.
- **Creación:** Supabase Dashboard → Authentication → Users → Add user (email de arriba, contraseña a elección, "Auto Confirm User"). El trigger `handle_new_user()` crea el `perfiles` automáticamente en plan `gratis`/`onboarding_done=false` — después de crear el usuario, correr en el SQL Editor:
  ```sql
  UPDATE public.perfiles
  SET plan_tipo = 'business', onboarding_done = true, razon_social = 'Constructora Demo QA'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'demo@darivopro.com');
  ```
- **Datos de ejemplo:** un cliente + una cotización de muestra (para probar historial de cliente, "Re-cotizar" y PDF desde el primer momento) — SQL opcional:
  ```sql
  WITH u AS (SELECT id FROM auth.users WHERE email = 'demo@darivopro.com'),
  c AS (
    INSERT INTO public.clientes (user_id, nombre, telefono, ciudad)
    SELECT id, 'Cliente Demo QA', '51987654321', 'Lima' FROM u
    RETURNING id, user_id
  ),
  q AS (
    INSERT INTO public.cotizaciones (user_id, cliente_id, client_name, phone, city, margin, total_base, total_labor, total_final, status)
    SELECT c.user_id, c.id, 'Cliente Demo QA', '51987654321', 'Lima', 40, 850, 340, 1190, 'Aprobado' FROM c
    RETURNING id
  )
  INSERT INTO public.cotizacion_items (cotizacion_id, svc_id, cat_label, svc_label, calc_type, base_price, unit, qty, unit_price, subtotal)
  SELECT q.id, 'alb-muro', 'Albañilería', 'Muro de ladrillo', 'm2', 85, 'm²', 10, 85, 850 FROM q;
  ```
  La factura de prueba es mejor crearla en vivo desde la app (prueba el flujo real de numeración/detracción/PDF) en vez de insertarla directo en BD.
- No documentar aquí ninguna otra cuenta de prueba — reutilizar siempre `demo@darivopro.com` para que quede permanente entre sesiones.

## Bloqueado — no iniciar sin confirmación explícita

- Conexión API Claude/Anthropic para los Agentes IA 1 y 2: decisión de arquitectura pendiente (¿sustituye o convive con OpenAI?).


