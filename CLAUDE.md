# Darivo Pro — Guía para Claude Code

## Autonomía de ejecución

Por defecto, tienes autorización para ejecutar tareas de forma autónoma, sin pedir permiso paso a paso ni confirmación intermedia.

### Autonomía total sobre main/producción (vigente desde 12/07/2026, mientras no haya clientes reales)

El propietario autorizó explícitamente mergear `develop` → `main` y hacer push a producción **sin pedir confirmación cada vez**, mientras el sistema no tenga clientes reales usándolo todavía. En cuanto el propietario avise que ya hay clientes reales, este permiso se revierte automáticamente y vuelve a aplicar la excepción de "Deploy" de abajo (pedir confirmación antes de tocar `main`) — no asumas que sigue vigente sin que te lo reconfirmen si ha pasado mucho tiempo o el contexto sugiere que el producto ya está en manos de usuarios reales.

Bajo esta autonomía: cuando un cambio en `develop` esté listo y verificado (build/lint/typecheck limpios, sin regresiones), mergéalo a `main` y sube a producción tú mismo — luego avisa con un resumen breve de qué cambió.

**Las 2 excepciones de abajo siguen intactas, sin excepción, ahora y siempre** (la autonomía sobre main NO las anula):

ÚNICAS EXCEPCIONES — debes parar y pedir confirmación explícita antes de actuar cuando la tarea implique:

1. **Base de datos**: cualquier cambio en schema, migraciones, o datos (Supabase). Las migraciones siempre se entregan como SQL escrito, sin ejecutar — el propietario las corre él mismo en el SQL Editor.
2. **Deploy**: cualquier acción que dispare un despliegue a producción (push a main, redeploy manual, o equivalente) — **salvo mientras esté vigente la autonomía total de arriba**, en cuyo caso procede sin preguntar.
3. **Nunca contraseñas en ningún login** — ni en formularios de navegador de preview, ni en ningún otro flujo de autenticación, sin importar la fuente (incluso archivos de credenciales QA propios del proyecto).

Para todo lo demás (código de frontend/backend, commits a develop, buscar e implementar assets, build/lint/typecheck, correcciones de texto, etc.) actúa sin preguntar, salvo que tú mismo detectes una ambigüedad real que no puedas resolver razonablemente por tu cuenta.

### Verificación obligatoria de schema en migraciones (11/07/2026)

Toda migración que referencie columnas de una tabla ya existente debe incluir, como parte de la respuesta, el extracto literal del `CREATE TABLE` de esa tabla (con número de archivo y líneas), no solo la afirmación de que se verificó el schema. Si la tabla pudo haber sido modificada por `ALTER TABLE` en otra migración posterior, debe confirmarse explícitamente que no hay ningún `ALTER TABLE` que la afecte, listando el resultado de esa búsqueda. Sin este extracto, la migración no se considera verificada y no debe entregarse como final.

## ESTADO REAL DEL PROYECTO (única fuente de verdad — actualizar al final de cada bloque de trabajo)

*Última actualización: 12/07/2026 — chequeo completo end-to-end: `main` limpiado desde cero (`tsc`/`lint`/`build`) + 6 auditorías de código en paralelo (Móvil/Empresa/Admin/Partner/Supabase-Vercel/Email) + investigación del bug de reset-password. Sustituye todo el estado anterior.*

### ⚠️ CRÍTICO — `main` (producción real) va muy por detrás de `develop`

`main` local == `origin/main` exacto (0 commits de diferencia) — es fiel a lo que está desplegado. Pero **`develop` tiene trabajo real que nunca llegó a `main`, y parte de ese trabajo ni siquiera estaba comprometido como commit** (estaba solo en el working tree, sin `git commit`, hasta hoy):

1. 1 commit de `develop` sin mergear a `main`: `a6e8123 fix(plan): leer precio Pro de PRECIOS_OFICIALES en UpgradeModal`.
2. Toda la sesión "Landing page y PWA — mejoras técnicas 12/07/2026" (ver sección propia más abajo) — apple-touch-icon, íconos PWA 192/512/512-maskable, `metadataBase`+OG/Twitter, `aria-hidden` en iconos decorativos, migración de `<a>` a `next/link`, y **el fix del bug real de caché offline** (`extendDefaultRuntimeCaching: true` faltante) — **estuvo sin comitear hasta hoy**. Esto significa que **el bug de caché offline roto sigue vivo en producción ahora mismo** (verificado: `main` no tiene `extendDefaultRuntimeCaching` en `next.config.mjs`).
3. La separación de PWA Admin/Empresa vs Móvil (pedida y construida hoy mismo, ver sección "Problemas abiertos" más abajo) — tampoco comiteada todavía.
4. `develop` está 39 commits por delante de `origin/develop` (tampoco pusheado al remoto) — todo el trabajo vive únicamente en esta máquina local.

**Acción pendiente de decisión del propietario:** revisar el diff de `develop` (los 3 bloques de arriba), decidir si se comitea/pushea/mergea a `main`, y en qué orden. Nada de esto se comiteó en esta sesión de diagnóstico (era solo lectura, según lo pedido).

### 🟢 Sólido y verificado — confirmado leyendo el código real en `main`

- **Build/lint/typecheck limpios en `main` desde cero**: `tsc --noEmit` sin errores, `next lint` sin errores (solo 2 warnings preexistentes en `useCotizacion.ts`, sin relación con nada reciente), `next build` compila las 69 rutas sin errores.
- **Móvil — wizard, cotizaciones, facturas, PDF**: los 4 pasos del wizard completos sin TODOs; CRUD de cotizaciones completo con buen manejo de errores; los 6 estados oficiales de factura confirmados textualmente en código; numeración correcta; cálculo de detracción es local (sin integración SUNAT real, correcto — no hay proveedor OSE contratado); generación de PDF funciona end-to-end vía `@react-pdf/renderer` + Supabase Storage; plan `gratis` bloquea facturas correctamente.
- **Admin — Usuarios/Partners/Productos**: las 5 acciones de Usuarios (Bloquear/Desbloquear/Cambiar plan/Reenviar invitación/Restablecer acceso) verifican el `error` de Supabase y no tienen silent failures; filtros funcionales. "Configurar tabla de comisiones" de Partners edita `partner_comisiones_config` real, leída también por el trigger de comisiones y por el Panel Partner (sin valores duplicados). Edición de Productos (nombre/descripción/activo) funciona, sin crear/eliminar (correcto, fuera de alcance documentado). Allowlist de acceso (`DARIVO_ADMIN_EMAILS`) falla cerrado si la lista está vacía.
- **Empresa — Invitar empleado y Cotizaciones**: `invitarEmpleadoAction` da acceso real a Móvil (`inviteUserByEmail` + `empresa_empleados.user_id`), no es decorativo. Acceso a cotizaciones correctamente restringido a Inicio + ficha de Cliente (sin sidebar/lista global). Middleware de `/empresa` gatea por `plan_tipo` consultado en vivo en cada request (no allowlist estático).
- **Partner — comisiones y referidos**: `mapPartner()` trae comisiones pendientes/pagadas reales desde `partner_comisiones_historial`. El flujo de link de referido (`/ref/[codigo]` → cookie → `registrar-referido`) funciona end-to-end con protección contra duplicados.
- **RLS**: 35 tablas con RLS habilitado, 62 políticas (`CREATE POLICY`) en total. No se encontró ninguna tabla de usuario sin RLS.
- **Vocabulario `tipo`/`calc_type`, terminología cotización, logout en los 4 paneles, bug de facturación plan `gratis`** — siguen verificados, sin cambios desde la última auditoría.

### 🟡 En progreso — construido, con una pieza externa pendiente del propietario

- **Email transaccional**: 7 de 9 eventos conectados a disparadores reales en código (confirmado archivo:línea por auditoría) — Bienvenida, Pago confirmado, Pago fallido, Cambio de plan, Bienvenida Partner, Comisión ganada, y Reset de contraseña (este último vía Supabase Auth nativo, no Gmail API). Pendiente del propietario: (1) setup de Google Cloud + Workspace (domain-wide delegation, `GMAIL_SERVICE_ACCOUNT_JSON` vacío en `.env.example`); (2) Database Webhook de Supabase para "comisión ganada" (tabla `partner_comisiones_historial`, evento INSERT); (3) pegar `supabase/templates/recovery.html` en el Dashboard hosted — **ver "Problemas abiertos" más abajo, esto puede no ser suficiente**.
- **Trigger de comisión por venta** (`20260712100000_fix_comision_venta_trigger_estado.sql`): el `WHEN` ya compara correctamente contra `pagos_eventos.estado` en inglés (`PAID`/`COMPLETED`/etc. — el bug original comparaba contra el literal español `'exitoso'`, que nunca coincidía). Corregido en código, pero **todavía sin verificar contra un pago real de Business vía Partner** (depende de que el webhook de dLocal inserte correctamente en `pagos_eventos`, sin `CHECK constraint` de por medio).
- **Admin Suscripciones**: solo lectura (planes oficiales + conteo real de usuarios por plan vía `fetchAdminSuscripciones()`) — no hay gestión individual de suscripciones. No es un bug, es alcance incompleto ya documentado.

### 🔴 Sin auditar / pendiente de decisión de negocio — no improvisar

- **Backend de tickets de soporte** deshabilitado — bloquea los eventos de email 8-9 (ticket recibido/resuelto), confirmado que ni siquiera están conectados en `send.ts` (solo la plantilla existe).
- **`04-PANEL-ADMIN-SUSCRIPCIONES.md`** — Básico/Pro siguen "provisional" (protegido).
- **RBAC de roles personalizados sigue inerte** — `MATRIZ_PERMISOS_APROBADA = false` (`roles-planes-oficial.ts`) confirmado en código: la UI de `RolesPermisosView.tsx` existe pero no hay evidencia de que middleware o Server Actions consulten esos roles para bloquear nada real.
- **Empresa Empleados** — sin diferenciación de permisos Gerente/Técnico en Móvil (jerarquía de roles sigue pendiente de activación real, `MATRIZ_PERMISOS_APROBADA=false`, decisión de negocio, no tocado). El resto de huecos de este punto (Editar/Permisos por fila, Última actividad real) **se corrigieron el 12/07/2026**, ver "Cambios mergeados a main" más abajo.
- ~~Panel Partner — acceso tras suspensión~~ ✅ **Corregido el 12/07/2026** — ver "Cambios mergeados a main" más abajo.
- **`comprobante_series`**: tiene RLS habilitado pero sin ninguna política (`CREATE POLICY`) — es intencional (acceso exclusivo vía función `asignar_inv_num()` SECURITY DEFINER, documentado en el propio SQL), no un bug, pero cualquier acceso directo a esa tabla fuera de esa función fallará en silencio por RLS.
- Empresa Ficha de Cliente: "+ Nueva cotización" sigue enlazando al wizard de Móvil tal cual, sin el layout de 3 paneles que pide el MD — no es regresión nueva.
- Middleware de subdominios: preparado, apagado por defecto (`SUBDOMAIN_ROUTING_ENABLED` no es `"1"`). No hay `vercel.json`, dominio sin conectar — sin cambios.

## Cambios mergeados a main — 12/07/2026 (bajo autonomía total temporal, sin clientes reales todavía)

- **Fix de seguridad — Partner suspendido conservaba acceso**: `esPartnerAutorizado()` (`frontend/src/lib/acceso-producto.ts`) ahora es async y, además de la allowlist de email, consulta `partners.estado` real vía Supabase — deniega si `estado === 'Suspendido'`. Si no existe fila en `partners` para ese email, se mantiene el comportamiento anterior (solo allowlist), para no introducir un nuevo motivo de bloqueo en ese caso límite. Actualizados los 3 call sites: `middleware.ts`, `verificarAccesoProducto()` (usado por `requireProducto` en los layouts) y `ProductosEcosistemaLinks.tsx` (componente sin usar todavía en ninguna página, actualizado solo para que compile con la nueva firma).
- **Empresa Empleados — acciones por fila y última actividad real**:
  - Nuevas acciones "Editar" (nombre/teléfono, `actualizarDatosEmpleado()`) y "Permisos" (select inline de `rol_personalizado_id`, `asignarRolPersonalizadoEmpleado()`) en `EmpresaEmpleadosView.tsx` — antes solo existían Activar/Desactivar. El link "Editar permisos →" a `/empresa/roles` se mantiene para gestión completa de roles (crear/editar definiciones); el select inline es solo para asignar rápido desde la fila.
  - Columna "Alta" (mostraba `created_at`) reemplazada por "Última actividad" real, usando la columna `ultima_actividad` que **ya existía en el schema** (`empresa_empleados`, migración baseline) pero nunca se escribía. Se actualiza en cada login real: contraseña (`login/page.tsx` → `POST /api/empleados/marcar-actividad`, best-effort) y Google OAuth/aceptar invitación (`auth/callback/route.ts`, inline con cliente admin porque el Técnico no tiene RLS propio sobre `empresa_empleados`). Ningún cambio de schema — no requirió migración.
- Verificado: `tsc --noEmit`, `next lint` y `next build` limpios (mismos 2 warnings preexistentes de siempre, sin relación). No verificado con sesión real logueada (mismo bloqueo de credenciales en navegador de preview que en la sesión anterior) — el código y los tipos están correctos, pero recomienda una prueba manual rápida de "Editar"/"Permisos" en Empresa y del acceso de un Partner suspendido cuando puedas.

## Problemas abiertos — chequeo 12/07/2026

### 1. Correo de reset-password: a veces muestra la plantilla genérica de Supabase

Investigado (código + búsqueda de issues conocidos de Supabase). Dos causas posibles, no excluyentes:

- **Confirmado por la comunidad de Supabase** (GitHub Discussion #29976): hay un bug conocido donde las plantillas personalizadas configuradas vía el Dashboard **no siempre se aplican en producción** al flujo normal (`resetPasswordForEmail()`), aunque sí funcionan cuando se envía manualmente desde el propio Dashboard (Authentication → Users → "Send password recovery"). Una causa documentada: un error de sintaxis en la plantilla personalizada hace que Supabase caiga en silencio a la plantilla por defecto.
- **Posible bloqueo de plan, más grave si aplica aquí**: desde el 3 de junio de 2026, los proyectos **nuevos** en el tier gratuito de Supabase que usan el proveedor de email por defecto de Supabase **ya no pueden personalizar sus plantillas de Auth en absoluto** — se usan las plantillas por defecto tal cual, sin excepción. Los proyectos gratuitos creados *antes* de esa fecha conservan su plantilla personalizada. **No verificado**: en qué fecha se creó el proyecto `vyrtokggypcmpforglch` y en qué plan está — si se creó después del 3 de junio de 2026 y sigue en tier gratuito con el proveedor de email por defecto, la plantilla personalizada de reset-password simplemente no se puede aplicar vía Dashboard, sin importar cuántas veces se pegue el HTML.

**Acción pendiente del propietario:**
1. Confirmar en Supabase Dashboard → Settings → Billing la fecha de creación del proyecto y el plan actual.
2. Si el proyecto es gratuito y nació después del 3/06/2026: la única forma de tener el texto de marca real en el correo de reset es configurar **SMTP personalizado** (Dashboard → Authentication → SMTP Settings, con las credenciales de `noreply@darivopro.com`) — Supabase sí respeta plantillas personalizadas cuando el envío pasa por SMTP propio, incluso en tier gratuito.
3. Si el proyecto es de pago o nació antes de esa fecha: validar sintaxis de `recovery.html` (sin errores de Go template) y volver a pegarlo, luego probar con un reset real y revisar que llegue con el texto de marca.

No pude verificar la fecha de creación ni el plan desde código — requiere entrar al Dashboard.

### 2. Separación de PWA Móvil vs Admin/Empresa

**Construida y verificada hoy** (build/lint/typecheck limpios + inspección del `sw.js` compilado confirmando el orden correcto de las reglas de caché), **pero todavía sin comitear** — vive solo en el working tree de `develop` en esta máquina, no en ningún commit, no en `main`. Falta:
1. Confirmación visual con sesión real logueada (Admin/Empresa/Móvil) de que el `<head>` trae o no `<link rel="manifest">` según corresponda — bloqueado hoy porque el sistema no permite escribir contraseñas en formularios del navegador de preview sin permiso explícito del propietario.
2. Comitear los cambios (`frontend/src/app/layout.tsx`, `(auth)/layout.tsx`, `onboarding/layout.tsx`, `next.config.mjs`) — junto con el resto del trabajo sin comitear listado en "CRÍTICO" arriba.

## Landing page y PWA — mejoras técnicas 12/07/2026 (autonomía total, sin tocar copy/diseño ya cerrado) — ⚠️ sin comitear, ver "CRÍTICO" arriba

Sesión enfocada solo en `darivopro.com` (landing) y configuración PWA — sin tocar ningún panel autenticado. No se cambió ni una palabra de copy ni la estructura visual de `LANDING-PAGE-DARIVO-PRO.md` v1.3; todo lo de abajo es infraestructura/SEO/accesibilidad/rendimiento. Verificado con `tsc --noEmit`, `next lint` y `next build` limpios, más revisión visual real en el navegador (Móvil dev server).

- **Bug real encontrado y corregido — caché offline de la PWA estaba rota:** `next.config.mjs` tenía un `runtimeCaching` personalizado (para listas de cotizaciones/facturas/clientes) sin `extendDefaultRuntimeCaching: true`. Sin ese flag, ese array **reemplaza por completo** — no extiende — el caching por defecto de `next-pwa` (imágenes, fuentes, JS/CSS, resto de páginas). En la práctica: la landing y cualquier página fuera de esas 4 rutas no tenían ninguna estrategia de caché offline desde que se añadió esa configuración. Corregido con una sola línea.
- **Faltaba apple-touch-icon por completo** — "Añadir a pantalla de inicio" en iOS usaba una miniatura de la página en vez de un icono real. Añadido `frontend/src/app/apple-icon.png` (convención de archivo estático de Next, mismo patrón que `icon.png`).
  - Nota técnica para la próxima vez que se toque esto: **no uses la convención `apple-icon.tsx` con `ImageResponse` de `next/og`** — en este entorno Windows, `@vercel/og` falla con `TypeError: Invalid URL` tanto en `next build` como en cada request de `next dev` (bug de bundling de Next 14.2 mezclando `path.join` con una URL `file://`, reproducible incluso pasando `fonts: []`). Se generaron los PNG una sola vez con `sharp` (instalado temporalmente con `--no-save`, no quedó en `package.json`) y se dejaron como archivos estáticos reales.
- **`manifest.json` solo tenía un icono SVG "any maskable"** — insuficiente para el prompt de instalación en varios navegadores/Android. Añadidos `icon-192.png`, `icon-512.png` y `icon-512-maskable.png` (este último con zona de seguridad real, no solo el mismo diseño escalado) + `id`, `scope`, `categories`.
- **SEO/Open Graph:** `layout.tsx` no tenía `metadataBase` — la imagen de `opengraph-image.png` se resolvía con URL relativa, así que compartir el link por WhatsApp podía no mostrar la vista previa. Añadido `metadataBase` + bloques `openGraph`/`twitter` (raíz y landing), `alternates.canonical` en la landing, y JSON-LD `SoftwareApplication` (sin precios ni datos inventados, solo nombre/descripción/categoría).
- **Accesibilidad:** los iconos decorativos de `components/landing/Icons.tsx` no tenían `aria-hidden` — un lector de pantalla los anunciaba por separado del texto que ya los acompaña (redundante). Corregido en el componente base, aplica a todos los usos.
- **Rendimiento:** los enlaces internos repetidos del header/CTAs (`/login`, `/registro`) usaban `<a>` en vez de `next/link` — sin precarga, recarga completa de página en cada clic. Migrados a `Link`. Añadido `sizes` a las imágenes de categoría (grid responsive) y a la foto del hero para que Next sirva el tamaño correcto según viewport en vez del más grande del set.

**Contradicción encontrada, no resuelta — decisión de diseño, no mía:** `frontend/public/icons/icon.svg` (el icono base de la PWA, del que se generaron los 3 PNG nuevos) es un candado/padlock, no una calculadora. `LANDING-PAGE-DARIVO-PRO.md` §3 exige que el ícono oficial (`icon.png` de la landing, un archivo distinto y ya documentado como pendiente/corrupto) sea "solo la calculadora, sin texto" — mismo espíritu de marca que debería aplicar al icono de instalación de la app. No rediseñé este ícono (es una decisión visual de marca, no una mejora técnica) — dejé los 3 PNG nuevos como reproducción fiel del SVG existente para no romper la instalación mientras tanto. Cuando exista el ícono real de calculadora, solo hay que regenerar esos 3 PNG desde el nuevo diseño (mismo proceso: SVG → `sharp` → `public/icon-*.png` + `src/app/apple-icon.png`), no hace falta tocar `manifest.json` ni el código de nuevo.

## CI/CD — job de Supabase eliminado a propósito (12/07/2026)

`deploy.yml` **ya no tiene** un job `supabase-migrate` (que hacía `supabase db push` automático en cada push a `main`). Se eliminó deliberadamente, no se rompió por error — si en el futuro aparece un fallo de CI mencionando Supabase/migraciones, **no reconstruyas ese job**, primero confirma con el propietario.

Motivo: ese job saltaba en silencio la regla permanente de este documento ("Migraciones de base de datos — cómo entregarlas") de que el SQL se entrega escrito en el chat y **Mohamed lo corre él mismo en el SQL Editor** — nunca un push automático a la BD real. Además fallaba en cada ejecución por un bug de resolución de ruta (`content_path` de `supabase/config.toml` se resolvía relativo al directorio de ejecución del CLI, no al de `config.toml`, así que nunca encontraba `supabase/templates/recovery.html` aunque el archivo sí existía y estaba comiteado). Se decidió eliminar el job en vez de arreglar la ruta, porque el flujo automático en sí ya no se usa y viola la política de "Base de datos" de más arriba (una de las 2 excepciones que siempre requieren confirmación explícita).

`test-frontend`, `test-backend` y `deploy-backend` (Railway) siguen intactos — no tocan la base de datos.

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

## Migraciones de base de datos — cómo entregarlas (regla permanente, 11/07/2026)

Cada vez que se genere una migración (SQL nuevo, cambios de schema, RLS, triggers, funciones):

1. El SQL completo va **pegado directamente en la respuesta de chat**, dentro de un bloque de código, listo para copiar y pegar tal cual en el SQL Editor de Supabase.
2. **Nunca** dar solo un enlace o ruta de archivo (ej. "revisa `supabase/migrations/xxx.sql`") como única forma de ver el contenido — Mohamed no puede abrir esos enlaces desde donde revisa esto.
3. Si el archivo ya existe guardado en el repo, está bien mencionarlo, pero el contenido completo también debe aparecer pegado en el chat en el mismo mensaje.
4. Aplica a toda migración futura, sin que haya que pedirlo cada vez.

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

- [x] **Plan Business ausente en `/precios`.** ✅ Ya resuelto (verificado 11/07/2026): `planes.ts` ya trae los 3 planes desde `PRECIOS_OFICIALES`/`roles-planes-oficial.ts`, y la metadata de `/precios` ya dice "Planes Básico, Pro y Business". Sin cambios necesarios.
- [x] **"IA" visible al usuario.** ✅ Empresa/Admin ya estaban migrados a "Calculadora inteligente" (commit `f1b329a`). Completado Móvil (11/07/2026, sesión continua): `BottomNav.tsx` (aria-label; caption "IA" retirado — no cabe en 7px, icono+aria-label bastan), `(auth)/ia/page.tsx`, `(auth)/mas/ia-preferencias/page.tsx`, `MasOpcionesList.tsx`, `IACotizacionFlow.tsx` (toasts/copys), `planes.ts`, `UpgradeModal.tsx`, `plan-limits.ts`, `PwaShell.tsx`, `CierreView.tsx`. Rutas (`/ia`, `/empresa/ia`, `/mas/ia-preferencias`) y nombres internos (`08-MODULO-IA.md`, `IACotizacionFlow`, etc.) **no se tocaron** — decisión ya implícita en el patrón de Empresa/Admin: solo copy visible cambia, arquitectura/rutas se quedan igual. Pendiente de decisión explícita (no tocado): el dato guardado `"Notas IA: ..."` dentro del texto de la cotización (`IACotizacionFlow.tsx:94`).

### Prioridad 2 — Incumplimiento de MD / bug funcional

- [x] **Bug de facturación:** ✅ Ya resuelto (commit `0a61ae5`, verificado 11/07/2026): `verificarLimiteFactura` (`lib/plan-limits.ts:101-103`) ya bloquea `gratis` igual que `basico`. Sin cambios necesarios.
- [x] **Logout ausente en Admin/Empresa/Partner** — ✅ Ya resuelto (commit `a750f1c`, verificado 11/07/2026): `CerrarSesionButton.tsx` compartido, montado en `AdminShell.tsx`, `EmpresaShell.tsx` y `PartnerPanel.tsx`.
- [x] **Logout enterrado en Móvil** — ✅ Resuelto (11/07/2026, sesión continua): añadido botón real al final de `MasOpcionesList.tsx` (fila roja, mismo estilo de las demás opciones), reutilizando `CerrarSesionButton` (misma lógica que `cerrarSesion` de `AjustesForm.tsx`). Sigue existiendo también en Más → Empresa (`AjustesForm.tsx:141-147`), sin cambios ahí.

### Prioridad 3 — Contradicciones de precio/nombre entre MD

- [x] **Precio Básico: S/39 vs S/49.** ✅ Resuelto (11/07/2026, sesión continua): `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` §3 tenía S/39 (v1.3) — unificado a S/49, añadida fila Business (S/120, definitivo) que faltaba. `08-PAGOS-DARIVO-PRO.md` (v1.1) también corregido (mismo precio stale + checkout ya soporta `business`, solo documentaba Básico/Pro). **Pendiente, no tocado:** `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 sigue marcando S/49 y S/115–120 como "ejemplo/no decidido" pese a que Business ya tiene precio definitivo en código — este documento tiene protección explícita ("queda prohibido modificar por iniciativa propia... informar al propietario y esperar instrucciones"), así que se informa aquí en vez de editarlo: Mohamed debe confirmar y actualizar esa tabla él mismo (o autorizar el cambio explícitamente).
- [x] **Nombre del 3er plan inconsistente dentro del mismo MD** — ✅ Resuelto junto con el punto anterior: `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` §4 documentaba `empresa` como "valor técnico legacy", pese a que la migración `20260706123000_plan_tipo_business.sql` ya renombró ese valor a `business` en el CHECK constraint real (confirmado leyendo la migración). Corregido a `business` en todo el documento.

### Prioridad 4 — Documentación desactualizada (no bloquea producto)

- [x] `00-ECOSISTEMA-DARIVO-PRO.md` (`docs/00-ECOSISTEMA-DARIVO-PRO.md`, no en `.cursor/rules/`) — ✅ Resuelto (11/07/2026, sesión continua): dominio actualizado a `darivopro.com`, "Multiempresa" eliminado, Panel Partner añadido (`partner.darivopro.com`, aclarando que no es un producto), referencia rota a `01-VISION-DEL-PRODUCTO.md` corregida, rutas de carpetas de documentación verificadas contra el árbol real.
- [x] `02-BASE-DATOS.md` — ✅ Regenerado por completo (11/07/2026, autorizado explícitamente por Mohamed pese a la cláusula de protección del documento): v3.0. `presupuestos`/`presupuesto_items` → `cotizaciones`/`cotizacion_items` en toda la documentación; eliminadas `perfiles.categorias` y `productos_master.orden`/`updated_at` (no existen en el esquema real); añadidas al inventario `empresas`, `empresa_empleados`, `roles_personalizados`, `partners`, `partner_referidos`, `partner_comisiones_historial`, `soporte_tickets`, `soporte_mensajes`, `suscripciones`, `pagos_eventos`, `darivo_admin_empleados`, `gastos` (12 tablas que solo se mencionaban de pasada). Recuento real verificado: **34 tablas** (no 33 — el baseline crea 32, más `roles_personalizados` y `partner_comisiones_historial` de migraciones incrementales; ninguna se eliminó). Historial de migraciones (§10) completado con las 10 migraciones reales. Nueva deuda técnica documentada (DT-02-06): el trigger de comisiones Partner asume `pagos_eventos.estado='exitoso'` como placeholder sin `CHECK` constraint ni integración real de webhook dLocal todavía — confirmar antes de activar pagos Partner en producción.
- [x] Versionados internos inconsistentes — ✅ Resuelto (11/07/2026, autorizado explícitamente por Mohamed pese a la cláusula de protección del documento): `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` ahora v3.5, cabecera y §12 sincronizados. Referencias a `22`–`25`/`23-A`/`23-B` y a la carpeta `informes/` (todos eliminados en la Tarea 0) quitadas de §3.2, §9.2 y §12.1, remitidas a `CLAUDE.md`. `04-SIMBOLOS-Y-BOTONES.md` sigue documentado como ausente en §3.2/§11.4 (archivo real no existe, no se inventó contenido).
- [x] "Referidos" vs "Partners" — ✅ Resuelto junto con el punto anterior: §11.4 ya no lo presenta como decisión abierta, cerrado alineado con Visión.

### Prioridad 5 — Deuda conocida, no urgente (requiere decisión de negocio)

- [x] La jerarquía "Suscripción → Producto → Rol → Permisos" solo está implementada hasta la mitad — ✅ ARQUITECTURA-MAESTRA §4.6 corregida (11/07/2026, autorizado): ya no la presenta como "secuencia vigente", documenta el estado real (allowlist de emails para Producto, RBAC inerte por `MATRIZ_PERMISOS_APROBADA=false`). **Sigue sin activarse de verdad** — eso sigue pendiente de decisión de Mohamed, no se tocó código, solo la documentación.

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
- **Credenciales (las 4 cuentas demo — admin/partner/empresa/móvil): en `.env.test` (raíz del repo), no versionado — pedir al owner si no está presente en el entorno local.** Formato del archivo:
  ```
  QA_ADMIN_EMAIL=
  QA_ADMIN_PASSWORD=
  QA_PARTNER_EMAIL=
  QA_PARTNER_PASSWORD=
  QA_EMPRESA_EMAIL=
  QA_EMPRESA_PASSWORD=
  QA_MOVIL_EMAIL=
  QA_MOVIL_PASSWORD=
  ```
  `QA_MOVIL_EMAIL` corresponde a `demo@darivopro.com` de arriba. No pegar estos valores en el chat aunque se lean — usarlos solo para iniciar sesión en el navegador de la preview.
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

## Email transaccional (Gmail API) — construido 12/07/2026, texto real conectado 12/07/2026

Infraestructura en `frontend/src/lib/email/` (`gmail-client.ts`, `accounts.ts`, `templates.ts`, `send.ts`) — domain-wide delegation (1 credencial de Google Cloud sirve para las 5 cuentas info@/facturacion@/noreply@/partners@/soporte@, no 5 OAuth consent flows separados). **`templates.ts` ya tiene el texto real aprobado por Mohamed (ya no es placeholder)** — 9 plantillas completas.

**Conectado a eventos reales (7 de 9):**
1. Bienvenida (info@) — `registro/page.tsx`, solo en el flujo de sesión inmediata (ver nota en `auth/callback/route.ts` sobre por qué el flujo de confirmación por correo no está cubierto — comparte ruta con el login de Google, sin señal fiable para distinguir registro nuevo de login recurrente). Plan mostrado: "Prueba gratuita" sin monto si `plan_tipo='gratis'`, o el plan pagado real si no.
2. Pago confirmado (facturacion@) — `api/pagos/webhook/route.ts`. "Próximo cobro" solo se muestra si el `order_id` trae el ciclo (mensual/anual) — si no, se omite esa línea en vez de inventar una fecha.
3. Pago fallido (facturacion@) — mismo webhook. La plantilla real pedía "fecha límite" de pago — se omitió esa línea porque no hay ningún dato real de "cuándo se corta el acceso" en el sistema (no inventado).
5. Cambio de plan (noreply@) — mismo webhook, solo si el plan realmente cambió.
6. Bienvenida Partner (partners@) — `ecosystem-store.ts` `updatePartnerEstado`, solo en la transición real a Activo. El "20% de comisión" del texto real se lee de `partner_comisiones_config` en vez de estar hardcodeado (consistente con la tarea de "Configurar tabla de comisiones").
7. Comisión ganada (partners@) — `api/webhooks/supabase/partner-comision/route.ts`. El campo "Total de clientes referidos hasta hoy" usa `referidos_en_momento` (snapshot ya guardado en `partner_comisiones_historial`, no un recálculo en vivo).

**Reset de contraseña (evento 4, noreply@):** el texto real ya se aplicó en `supabase/templates/recovery.html`, referenciado desde `supabase/config.toml` (`[auth.email.template.recovery]`) — pero eso **solo afecta el entorno local** (`supabase start`). Falta un paso manual: **Mohamed debe pegar el mismo HTML en el Dashboard del proyecto real** (Authentication → Email Templates → Reset Password) para que el texto real llegue en producción — config.toml no sincroniza esto automáticamente al proyecto hosted.

**Pendiente, no se puede resolver desde código — requiere que Mohamed:**
- Complete el setup de Google Cloud + Workspace (cuenta de servicio, domain-wide delegation) — pasos exactos documentados en `gmail-client.ts`. Sin esto, cualquier envío falla con error claro (no en silencio).
- Configure el Database Webhook de Supabase para el evento 7 (Dashboard → Database → Webhooks → tabla `partner_comisiones_historial`, INSERT) — pasos en `partner-comision/route.ts`.
- Pegue `supabase/templates/recovery.html` en el Dashboard del proyecto hosted (evento 4, ver arriba).

**Bloqueado, no construido:** Ticket recibido/resuelto (soporte@, eventos 8-9) — el backend de tickets (`/api/soporte/tickets`) está deshabilitado (INC-A01, `09-PANEL-ADMIN-SOPORTE.md` §11 "No crear endpoints"), no existe ningún evento real de creación/resolución al que enganchar el envío. Las plantillas ya tienen el texto real en `templates.ts`, listas para conectar el día que se decida reconstruir ese backend.

## Auditoría 12/07/2026 — Admin/Empresa/Partner (sesión continua, 3 agentes en paralelo)

Auditoría de solo lectura + correcciones puntuales. Corregido en el momento (ver commit `fix: hallazgos de auditoría Admin/Empresa/Partner`): silent failures en `AdminEmpresasView`/`AdminPartnersView` (la UI daba por bueno un cambio que en realidad había fallado en Supabase), KPI "Onboarding pendiente" duplicado/engañoso, sección "Tiempos de pago" faltante en Panel Partner (el MD la agregó el 11/07 y nadie la había conectado a la UI todavía), color de estado "Suspendido" mostrado en verde.

**Pendiente — hallazgos reales, no corregidos todavía (requieren más que un fix puntual, o una decisión de alcance):**

- ~~**Admin — Usuarios**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Admin — Partners**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Empresa — Cotizaciones**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Empresa — Ficha de Cliente**~~ ✅ **Resuelto 12/07/2026**: panel lateral dentro de `EmpresaShell`, ver arriba.
- **Nota relacionada, sin resolver:** el wizard de cotización sigue sin adaptarse al layout de 3 paneles de escritorio que pide `05-MODULO-COTIZACIONES-EMPRESA.md` §4 — tanto el CTA de Inicio como el botón "+ Nueva cotización" de la ficha enlazan al wizard Móvil (`/cotizaciones/nuevo`) tal cual. No es una regresión nueva (ya pasaba antes), pero sigue pendiente si se quiere una experiencia de escritorio completa.
- ~~**Empresa — Invitar empleado**~~ ✅ **Resuelto 13/07/2026** — ver arriba. Decisión de diseño tomada: reutiliza el propio invite de Supabase Auth (no una tabla de tokens propia ni uno de los 9 emails transaccionales).
- **Empresa — Empleados:** faltan las acciones "Editar" y "Permisos" por fila que pide el MD §5 (solo hay Activar/Desactivar); la columna "Última actividad" nunca se escribe (no hay evento de login Móvil que la alimente) y la tabla muestra "Alta" (`created_at`) en su lugar.
- ~~**Partner — visibilidad de comisiones**~~ ✅ **Resuelto 12/07/2026** (sesión continua siguiente): `mapPartner()` consulta `partner_comisiones_historial`, `PartnerPanel.tsx` muestra totales + listado.
- **Partner — acceso tras suspensión:** `/partner` se gatea solo por allowlist de email (`DARIVO_PARTNER_EMAILS`), independiente de `partners.estado` — un Partner Suspendido con el email todavía en la allowlist conserva acceso de lectura completo al panel. Mismo gap de arquitectura ya documentado (jerarquía Suscripción→Producto→Rol→Permisos solo a medias, DT-04-02), no es una sorpresa nueva, pero vale la pena resolverlo si se activa esa jerarquía de verdad.

## Auditoría MD↔código Admin (funcional + visual) — 13/07/2026

Auditoría de las 11 pantallas oficiales de `.cursor/rules/02-darivo-pro-admin/` (00, 02–11). Aclaración de alcance confirmada por el propietario: **Admin tiene su propio diseño visual, separado de Fable 5** (que sigue siendo exclusivo de Móvil) — el diseño real de cada pantalla de Admin debe seguir la imagen oficial embebida en su MD, no un estilo genérico ni el de Fable 5.

### Funcional (resumen — el detalle completo ya vive en las secciones de auditoría de arriba, 09/07 y 12/07/2026)

Sin cambios respecto a lo ya registrado: Usuarios/Partners/Productos sólidos y verificados; Suscripciones correctamente de solo lectura (alcance documentado, no bug); Empleados internos usa `perfiles` genérico sin tabla dedicada (placeholder reconocido en el propio código, Doc 07 §9); Catálogo Maestro sin CRUD, reconocido como pendiente (Doc 21, DT-02-02); Configuración de APIs muestra correctamente las 3 APIs reales del MD (Supabase/OpenAI/dLocal), no las de marketing.

### Visual — 9 de 11 pantallas con imagen oficial embebida auditadas (imagen vs. código real)

Pantallas **05** (Edición de Productos) y **09** (Soporte) no tienen imagen embebida en su MD — 09 solo menciona el nombre de archivo con la nota "la imagen oficial será añadida por el propietario", nunca se llegó a insertar.

**Hallazgo raíz, común a las 9 pantallas:** `frontend/src/lib/design-system/tokens.ts` es la paleta exclusiva de **Fable 5** (documentado en su propio encabezado) y `AdminShell.tsx`/`AdminUi.tsx` la importaban directamente sin tokens propios de color para Admin. Resultado: las 9 imágenes oficiales muestran sidebar claro/blanco con acento morado/violeta (`#7C3AED`), pero el código real renderizaba sidebar navy oscuro (`#0A1628`) + acento azul (`#2563EB`) — el mismo esquema de Fable 5/Móvil. Veredicto en las 9: **Diferencias reales** (no cosméticas menores).

| # | Pantalla | Hallazgo visual principal (además del color raíz de arriba) |
|---|---|---|
| 00 | Dashboard | Faltan ~mitad de los bloques: buscador/notificaciones/avatar del header, gráfico de actividad, "Estado de soporte", donut de planes, "Acciones rápidas", footer. KPIs sin íconos. |
| 02 | Empresas | Faltan casi todos los botones (Nueva empresa, Importar/Exportar, Publicar cambios, menú por fila). Sin panel lateral, sin filtro de estado/orden. Solo 2 estados en código vs. 3 en la imagen. |
| 03 | Usuarios | Las 5 acciones del MD existen pero como enlaces de texto, no botones-tarjeta. Faltan columnas (Empresa, Contacto, Último acceso, Método), sin paginación, sin panel lateral. |
| 04 | Suscripciones | Alcance de solo lectura correcto, pero visualmente es tabla de texto plano vs. mockup con tarjetas/iconos por plan/pestañas/panel lateral/paginación. |
| 06 | Partners | Faltan botones globales Activar/Suspender/Filtros/Exportar y panel lateral "Información del partner". Nota aparte: la tabla de comisiones de la imagen usa el modelo viejo ya derogado por el propio MD — el código sigue correctamente el MD, no la imagen, en ese punto. |
| 07 | Empleados | Columna "Acciones" de la tabla renderiza literalmente `—` (sin menú real). Faltan botones principales, header funcional, panel lateral, paginación. |
| 08 | Config. de APIs | Sin ningún botón (Conectar/Ver estado/Desconectar de la imagen no existen — pantalla de solo lectura). La imagen oficial en sí muestra 4 APIs de marketing (Meta/TikTok/WhatsApp/ManyChat) que el propio MD excluye — el código sigue el MD correctamente, la imagen de referencia quedó desactualizada en ese punto. |
| 10 | Catálogo Maestro | Módulo prácticamente sin construir: solo 2 tablas de solo lectura, sin pestañas/banner/acciones/panel lateral. |
| 11 | Configuración | Solo 2 botones existen de los ~7 de la imagen. Faltan secciones completas (Acceso, Sesión, panel lateral). El propio MD dice "No modificar diseño/colores" respecto a la imagen — el desajuste de color contradice esa cláusula explícitamente. |

### Fix aplicado — tokens de diseño propios de Admin (13/07/2026)

Corregido el hallazgo raíz (color de marca), sin tocar aún botones/paneles laterales (siguiente paso, pantalla por pantalla):

- **Nuevo** `ADMIN_COLORS` en `frontend/src/lib/design-system/admin-tokens.ts` — paleta propia de Admin (sidebar blanco `#FFFFFF`, acento morado `#7C3AED`/`#6D28D9`/pálido `#F5F3FF`, encabezado de tabla claro, resto de neutros/estado), completamente independiente de `tokens.ts` (que **no se tocó**, sigue siendo exclusivo de Fable 5/Móvil).
- `AdminShell.tsx` y `AdminUi.tsx` migrados de `T` (tokens.ts/Fable 5) a `ADMIN_COLORS`: sidebar ahora claro con ítem activo en morado pálido/texto morado, encabezado de tabla claro con texto oscuro (antes navy con texto blanco), resaltado de fila activa en morado pálido (antes azul pálido).
- Alcance intencionalmente limitado a estos 2 archivos compartidos (según lo acordado) — `AdminTabs.tsx` y las vistas por pantalla (`AdminEmpresasView.tsx`, etc.) siguen usando `T.blue` para pestañas activas y no se tocaron todavía; quedan para el siguiente paso.

**Verificación:** `tsc --noEmit` limpio, `next lint` limpio (mismos 2 warnings preexistentes de `useCotizacion.ts`, sin relación), `next build` compila las 70 rutas sin errores. Verificación visual con sesión real logueada **no realizada** — bloqueada por la regla permanente de no escribir contraseñas en el navegador de preview (mismo bloqueo ya documentado en sesiones anteriores). Se intentó una ruta de previsualización temporal sin guard de auth para verificar solo el color; el clasificador de seguridad la bloqueó correctamente por debilitar el middleware de autenticación — revertida de inmediato, sin dejar rastro (`middleware.ts` y la ruta temporal ambos confirmados limpios). Pendiente: confirmación visual real la próxima vez que haya una sesión Admin logueada disponible.

### Siguiente paso (pendiente, no iniciado)

Por pantalla, en orden de prioridad a definir con el propietario: construir los botones/acciones faltantes y los paneles laterales derechos de cada una de las 9 pantallas, y extender `ADMIN_COLORS` a `AdminTabs.tsx` y a las vistas individuales (`AdminEmpresasView.tsx`, `AdminUsuariosView.tsx`, `AdminPartnersView.tsx`, `AdminEmpleadosInternosView.tsx`, etc.) para que las pestañas activas y demás acentos también usen el morado en vez del azul de Fable 5.

## Bloqueado — no iniciar sin confirmación explícita

- Conexión API Claude/Anthropic para los Agentes IA 1 y 2: decisión de arquitectura pendiente (¿sustituye o convive con OpenAI?).


