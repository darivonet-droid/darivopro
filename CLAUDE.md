# Darivo Pro — Guía para Claude Code

Este documento contiene únicamente **normas permanentes** (gobernanza, disciplina de cambios, documentación) y el **estado real resumido** del proyecto. El detalle histórico completo de cada tarea/etapa vive en `docs-internos/tareas/` — ver el índice al final de este documento.

## Regla de oro (metodología, antes de tocar nada)

**Verificar antes de afirmar. Reproducir antes de arreglar. Buscar causa raíz, no síntoma.**

- Ninguna afirmación de estado ("funciona", "está roto") vale sin **evidencia dura**
  de esta sesión (HTTP status, bytes, píxeles, valores en BD). La confianza no es evidencia.
- No se arregla nada que no se haya **reproducido** en esta sesión. Si no reproduce, se dice — no se "arregla" igual.
- Etiquetar cada conclusión como *confirmada* o *sospecha*. "Apunta al build" ≠ "es el build".
- Todo bug arreglado lleva su **test de regresión** (o los pasos manuales exactos de verificación).
- El reporte final separa siempre: **verificado / sospecha / pendiente**.

## Gobernanza CTO — aislamiento multi-tenant y disciplina de no-romper-lo-que-funciona

Estas dos reglas son la base de gobernanza del proyecto (Darivo Pro es un SaaS multi-tenant en producción, stack Vercel + Supabase + GitHub) y no se relajan nunca sin aprobación explícita de Mohamed:

### 1. Aislamiento estricto multi-tenant — protocolo de "alto obligatorio"

Ninguna cuenta, cliente, empresa o funcionalidad puede mezclar datos con otra. Antes de implementar cualquier cambio que toque base de datos, RLS, cuentas de clientes, o cualquier punto donde datos de una cuenta pudieran quedar visibles/escribibles por otra, **detente y pide confirmación explícita** si:

- El cambio pedido implicaría, aunque sea como efecto colateral, que una cuenta pueda leer o escribir datos de otra cuenta/empresa/partner.
- No es evidente, por el propio esquema de RLS existente, que el aislamiento por fila se mantiene intacto tras el cambio.

Este protocolo de "alto obligatorio" no se salta nunca, ni siquiera bajo "producción autónomo" (ver más abajo) — autonomía de despliegue no es lo mismo que autorización para mezclar datos entre cuentas.

### 2. Disciplina de cambios no destructivos

El proyecto está en producción real. Toda funcionalidad nueva es **aditiva por defecto**:

- No se rompe ni se reemplaza un módulo **CONGELADO** ni funcionalidad ya existente sin aviso explícito y aprobación de Mohamed.
- Ante la duda de si un cambio pedido rompería algo que ya funciona, se investiga primero (Regla de oro) y se reporta el riesgo antes de tocar código, en vez de asumir que "probablemente no importa".
- Ver el estado real de qué está CONGELADO más abajo.

## Autonomía de ejecución

Por defecto, autorización para ejecutar tareas de forma autónoma, sin pedir permiso paso a paso ni confirmación intermedia — con las excepciones de abajo, que nunca se levantan salvo lo indicado explícitamente en cada una.

### Dos modos de despliegue (vigente desde 19/07/2026, reemplaza "Autonomía total sobre main" del 12/07/2026)

- **`main` = producción real: solo se despliega cuando el propietario lo avisa explícitamente.** Claude NO mergea ni sube a `main` por su cuenta. Prepara el cambio, lo deja verificado (build/lint/typecheck limpios, sin regresiones) y **espera el aviso**.
- **Producción autónoma (bajo demanda):** solo cuando el propietario diga la frase **"producción autónomo"**, Claude despliega/trabaja de forma autónoma para esa tarea, sin confirmación paso a paso. El permiso es **por tarea, no permanente** — no se asume vigente en la siguiente sesión sin que se repita.
- **Verificación siempre en:** `https://darivopro.com/` (dominio real de producción), iniciando sesión con **Google usando la sesión ya abierta en el navegador** ("Continuar con Google"). Claude **nunca escribe la contraseña**; si algún login la pidiera, la escribe el propietario.

**Las excepciones de abajo siguen intactas, sin excepción, ahora y siempre.** El modo "producción autónoma" **solo** levanta la confirmación de Deploy (#2) para esa tarea; **nunca** anula Base de datos (#1), contraseñas (#3) ni endpoints de diagnóstico (#4):

ÚNICAS EXCEPCIONES — parar y pedir confirmación explícita antes de actuar cuando la tarea implique:

1. **Base de datos**: cualquier cambio en schema, migraciones, o datos (Supabase). Las migraciones siempre se entregan como SQL escrito, sin ejecutar — el propietario las corre él mismo en el SQL Editor.
2. **Deploy**: cualquier acción que dispare un despliegue a producción (push a main, redeploy manual, o equivalente) — **salvo "producción autónomo" para esa tarea**, en cuyo caso procede sin preguntar.
3. **Nunca contraseñas en ningún login** — ni en formularios de preview, ni en ningún otro flujo de autenticación, sin importar la fuente.
4. **Nunca desplegar a producción un endpoint de diagnóstico sin autenticación** — cualquier ruta que devuelva en su respuesta HTTP metadata de configuración interna (aunque sea parcial: `ref`/`role` de un JWT, longitud de una key, nombre de proyecto) debe ir gateada por la misma auth de Admin ya existente, o loguearse solo server-side vía `console.error` — nunca en el body de una respuesta HTTP alcanzable sin sesión. El repo es público en GitHub, un "query param secreto" tampoco es defensa real.

Para todo lo demás (código de frontend/backend, commits a develop, buscar e implementar assets, build/lint/typecheck, correcciones de texto, etc.) actúa sin preguntar, salvo ambigüedad real que no se pueda resolver razonablemente por cuenta propia.

### Verificación obligatoria de schema en migraciones

Toda migración que referencie columnas de una tabla ya existente debe incluir, como parte de la respuesta, el extracto literal del `CREATE TABLE` de esa tabla (con número de archivo y líneas), no solo la afirmación de que se verificó el schema. Si la tabla pudo haber sido modificada por `ALTER TABLE` en otra migración posterior, debe confirmarse explícitamente que no hay ningún `ALTER TABLE` que la afecte, listando el resultado de esa búsqueda. Sin este extracto, la migración no se considera verificada y no debe entregarse como final.

### Migraciones de base de datos — cómo entregarlas

1. El SQL completo va **pegado directamente en la respuesta de chat**, dentro de un bloque de código, listo para copiar y pegar tal cual en el SQL Editor de Supabase.
2. **Nunca** dar solo un enlace o ruta de archivo como única forma de ver el contenido — Mohamed no puede abrir esos enlaces desde donde revisa esto.
3. Si el archivo ya existe guardado en el repo, está bien mencionarlo, pero el contenido completo también debe aparecer pegado en el chat en el mismo mensaje.
4. Aplica a toda migración futura, sin que haya que pedirlo cada vez.

### Seguridad — credenciales

Las credenciales (tokens, contraseñas de BD, claves de API) **nunca se pegan en el chat con la IA**. Van directamente en GitHub Secrets o en `.env.local` local, nunca en un mensaje. Si Claude Code necesita saber si una variable existe, que pregunte o revise `.env.example`, nunca que pida el valor real.

## Reglas permanentes de documentación

- **Siempre indicar qué MD tocar en cada tarea** — al pedir o ejecutar un cambio, identificar explícitamente qué archivo(s) `.md` (incluido `01-VISION-DEL-PRODUCTO.md` si aplica) deben actualizarse y en qué sección.
- **Borrar contenido obsoleto en vez de acumularlo** — si algo cambió de estado (una decisión se revirtió, un bug se corrigió, una celda pendiente se cerró), se corrige/reemplaza el texto existente; no se agrega un párrafo nuevo contradictorio dejando el viejo sin tocar.
- **Documentación en español**, siempre.
- **Nunca releer toda la carpeta `.cursor/rules/` de golpe** — este proyecto tiene 60+ documentos MD. Usar este archivo como mapa y leer **solo** el MD específico que se necesite para la tarea concreta.
- **Los 3 documentos que sí se leen siempre, al empezar cualquier tarea:**
  1. `.cursor/rules/01-VISION-DEL-PRODUCTO.md` — fuente de verdad de todo el ecosistema. Si hay contradicción con cualquier otro MD, gana este.
  2. El índice del área en la que se va a trabajar (Admin → `INDICE-OFICIAL-PANEL-ADMIN.md`, Empresa → `INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md`).
  3. El MD específico del módulo que se va a tocar (el índice indica cuál es).
- **Cómo confirmar un dato puntual sin releer todo**: usar `grep`/búsqueda dirigida sobre el MD específico en vez de abrirlo entero, si solo se necesita confirmar un nombre de columna, un estado válido, un límite de plan, etc.
- **Antes de modificar cualquier MD oficial** (documentos con protección explícita "solo el propietario puede modificarlos"): si Mohamed pide el cambio, hay autorización — pero (a) actualizar siempre la versión y añadir línea de changelog; (b) si el cambio afecta `01-VISION-DEL-PRODUCTO.md`, revisar si otros MD referencian esa sección y quedarían desincronizados; (c) nunca duplicar planes/precios/límites fuera de `04-PANEL-ADMIN-SUSCRIPCIONES.md`.
- **Nueva tarea/etapa**: se crea su archivo en `docs-internos/tareas/` al empezar (o se anota ahí desde el primer commit), y se corrige/completa ahí mismo al cerrarla — el detalle completo nunca se vuelve a escribir dentro de este `CLAUDE.md`. Nomenclatura: `AAAA-MM-DD-nombre-corto-de-la-tarea.md`.
- **Fuente de verdad del esquema de base de datos**: `supabase/migrations/` — siempre prevalece sobre lo que diga cualquier MD si hay contradicción. Antes de asumir una columna o tabla desde un MD, comprobarla en la migración real.
- **Terminología oficial**: usar siempre **"cotización/cotizaciones"**, nunca "presupuesto/presupuestos", en código y documentación nuevos (migración de terminología ya completada en BD/código/tipos — confirmado, no repetir ese trabajo).

### Nunca exponer contenido `.md` interno al usuario final (regla permanente de seguridad/producto)

- Ningún archivo `.md` ni su contenido en Markdown sin procesar debe ser accesible o visible para un visitante de `darivopro.com` ni de ninguno de sus subdominios (`app.`, `empresa.`, `admin.`, `partner.`): ni servido crudo, ni con sintaxis sin renderizar, ni como documentación interna (`CLAUDE.md`, MDs de arquitectura/visión/contexto) accesible desde una URL pública.
- **Extensión de la regla**: tampoco puede aparecer citado por nombre — ningún nombre de archivo `.md`, el símbolo `§`, ni atajos tipo "Doc N"/"el MD" pueden aparecer como texto visible en ninguna pantalla de ningún panel ni dominio (ni en JSX/texto renderizado, ni en datos que se rendericen). Notas de trabajo internas ("pendiente de definir en BD", justificaciones de por qué algo no está construido) van solo en `frontend/docs-internos/TODO-PENDIENTES-DARIVO-PRO.md`, nunca en la UI real. Comentarios de código (`//`, `/* */`, `{/* */}`) sí pueden citar `.md`/`§` con normalidad — nunca llegan al navegador.
- **Excepción confirmada, no una violación**: `frontend/src/content/legal/{terminos,privacidad,cookies}.md` y `frontend/src/content/darivo/conocimiento.md` sí se leen en runtime a propósito — son contenido de producto (páginas legales públicas, base de conocimiento del chat de soporte), no documentación de desarrollo.
- Auditoría de cumplimiento (20/07/2026, 15 archivos corregidos) y su detalle: `docs-internos/tareas/2026-07-20-auditoria-markdown-visible-ui.md`.

## Lo que NO existe en este producto (para no reinventarlo)

- Ninguna funcionalidad de marketing/anuncios dentro de la app. Las "APIs de marketing" de `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` son herramientas externas del negocio, no una feature del producto.
- "Referidos" no existe — se llama "Partners".
- Integración técnica de envío a SUNAT — el proveedor OSE **sí está contratado**: Bizlinks (pool ~S/500/mes), arma el XML UBL 2.1, lo firma y lo envía a SUNAT. Darivo Pro no genera XML firmado ni tiene certificado digital propio. Lo pendiente es la integración técnica real (llamada a la API de Bizlinks) — no construir ese código sin pedido explícito.

## Antes de publicar la Política de Privacidad y Términos de Uso

⚠️ No publicar `POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md` ni `TERMINOS-Y-CONDICIONES-DARIVO-PRO.md` sin antes: (1) actualizar `INVENTARIO-PROVEEDORES-DATOS-DARIVO-PRO.md` con cualquier servicio nuevo integrado; (2) copiar esa lista a la tabla de proveedores de Privacidad (§4); (3) rellenar todos los corchetes `[...]` de ambos documentos; (4) confirmar revisión por abogado real — son borradores de IA, no válidos para publicar tal cual.

## Cuenta de prueba QA (permanente)

- **Móvil/Empresa (Business, acceso total):** `demo@darivopro.com`.
- **Partner:** `demo1@gmail.com` (`codigo='DEMO1'`, `estado='Activo'`).
- Credenciales de las 4 cuentas demo (admin/partner/empresa/móvil) en `.env.test` (raíz del repo, no versionado) — nunca pegar esos valores en el chat aunque se lean, usarlos solo para iniciar sesión en el navegador de preview.
- No documentar ninguna otra cuenta de prueba nueva — reutilizar siempre estas para que queden permanentes entre sesiones. Detalle de creación/SQL de datos de ejemplo: `docs-internos/tareas/2026-07-12-cuenta-prueba-qa-setup.md`.

## Flujo de ramas (Git)

Todo el trabajo se hace en `develop`, nunca directamente en `main`. Cuando una tarea (o un conjunto de tareas relacionadas) esté lista y verificada, se abre un Pull Request de `develop` hacia `main` para que Mohamed lo revise antes de fusionar.

## CI/CD

`deploy.yml` **no tiene** (y no debe reconstruirse sin confirmar con el propietario primero) un job de migración automática de Supabase (`supabase db push` en cada push a `main`) — eliminado a propósito el 12/07/2026 porque saltaba en silencio la regla de "Migraciones de base de datos" de arriba. Si aparece un fallo de CI mencionando Supabase/migraciones, no reconstruir ese job sin confirmar antes. Detalle: `docs-internos/tareas/2026-07-12-cicd-job-supabase-eliminado.md`.

## Skills a utilizar

De las skills personales disponibles, usar en el flujo normal de trabajo de este proyecto: `/Superpowers` (planificar antes de ejecutar cambios de código), `/GSD` (mantener foco en tareas largas), `/Review`/`/Ultrareview` (después de cada tarea de código, antes de dar un commit por bueno), `/Context-Mode` (conversaciones largas), `/Claude-Mem` (memoria entre sesiones). Detalle y propuesta de skills propias de Darivo Pro: `docs-internos/tareas/2026-07-07-skills-a-utilizar-propuesta.md`.

## Bloqueado — no iniciar sin confirmación explícita

- Conexión API Claude/Anthropic para los Agentes IA 1 y 2: decisión de arquitectura pendiente (¿sustituye o convive con OpenAI?).

---

## ESTADO REAL DEL PROYECTO (resumen — el detalle completo vive en `docs-internos/tareas/`)

**CONGELADO / verificado sólido** (no tocar sin pedido explícito, ver detalle en las tareas citadas):
- Móvil — wizard de cotización (3 pasos), CRUD de cotizaciones/facturas, PDF (Storage con URL firmada, corregido 19/07/2026), generación/envío por WhatsApp.
- Admin — 11/11 pantallas completas y verificadas visualmente (Dashboard, Usuarios, Partners, Empresas, Suscripciones, Catálogo Maestro, Empleados, Config. de APIs, Configuración), diseño propio `ADMIN_COLORS` (morado/blanco, independiente de Fable 5).
- Empresa — 9/9 pantallas auditadas MD↔código y verificadas visualmente, migradas a `ADMIN_COLORS`.
- RLS: 35 tablas en `public`, las 35 con RLS habilitado. Aislamiento por fila cross-tenant correcto en las 35 (auditoría de seguridad Etapas 1-5, 21/07/2026) — 3 gaps de escalada de privilegios intra-sesión corregidos vía migración (pendiente de ejecutar, ver abajo).
- Fuente de verdad de Admin: tabla `darivo_admin_empleados` (la env `DARIVO_ADMIN_EMAILS` queda como fallback de arranque, no fuente principal).
- Roles Gerente/Técnico (Empresa+Móvil): gating real por flags de BD (`factura_habilitada`/`informe_habilitado`), no solo por UI.
- Restricción por dispositivo: **REVERTIDA** — no hay bloqueo real, solo un banner informativo descartable (`AvisoDispositivoBanner`), nunca mostrado a Partner.
- Email transaccional: 9/9 eventos oficiales conectados en código — bloqueado solo por infraestructura externa pendiente del propietario (`GMAIL_SERVICE_ACCOUNT_JSON` sin configurar).
- Asistente de soporte "Darivo" (Agente IA 2): construido y conectado a tickets reales.

**Migraciones SQL pendientes de que Mohamed las corra en el SQL Editor** (10 de 11 acumuladas hasta el 21/07/2026 ya corridas — detalle completo y el orden exacto en `docs-internos/tareas/2026-07-21-estado-migraciones-supabase.md`):
- `20260721180000_facturas_bizlinks_esquema.sql` — **no correr todavía**, en pausa a propósito (decisión explícita de Mohamed, preguntas #6/#7 de la auditoría de seguridad sin resolver).

**Deuda técnica / decisiones de negocio pendientes de Mohamed** (no improvisar, ver detalle en las tareas citadas):
- Migrar `facturas.items` (jsonb) a tabla hija estructurada — plan por fases, fase 0 hecha (`factura_items` creada, inerte).
- Series de comprobante por emisor para Bizlinks — pendiente de que Bizlinks confirme cómo asigna series al registrar cada empresa.
- `04-PANEL-ADMIN-SUSCRIPCIONES.md`: catálogo ahora editable desde BD (`planes_catalogo`) pero sin efecto real en checkout/`/precios`/límites (siguen leyendo `PRECIOS_OFICIALES`/`LIMITES_PLAN` en código) — fase 2 de recableado no construida.
- Middleware de subdominios: preparado, **apagado a propósito** (`SUBDOMAIN_ROUTING_ENABLED` no es `"1"`) — no activar sin aviso, es un cambio de Deploy.
- Reset de contraseña: a veces muestra plantilla genérica de Supabase — posible bloqueo de plan/proyecto, pendiente de que Mohamed confirme plan y fecha de creación del proyecto en el Dashboard.

**Índice completo de tareas históricas**: ver `docs-internos/tareas/` más abajo — cada tarea/etapa desde el 06/07/2026 tiene su propio archivo con qué se pidió, qué se implementó, qué quedó pendiente y qué preguntas siguen abiertas.

---

## Índice de tareas (`docs-internos/tareas/`)

- [2026-07-06-handoff-cursor-a-claude-code.md](docs-internos/tareas/2026-07-06-handoff-cursor-a-claude-code.md) — cerrada. Handoff de Cursor (Composer 2.5) a Claude Code, qué ya estaba hecho y verificado.
- [2026-07-06-tareas-codigo-pendientes-iniciales.md](docs-internos/tareas/2026-07-06-tareas-codigo-pendientes-iniciales.md) — cerrada. Cola inicial de 3 tareas (Módulo Admin 05, middleware subdominios, migración terminología) — las 3 completadas.
- [2026-07-07-plan-trabajo-primeros-dias.md](docs-internos/tareas/2026-07-07-plan-trabajo-primeros-dias.md) — cerrada. Plan día-a-día de los primeros días (terminología, Landing, /precios, Módulo Admin 05, middleware).
- [2026-07-07-skills-a-utilizar-propuesta.md](docs-internos/tareas/2026-07-07-skills-a-utilizar-propuesta.md) — referencia. Qué 6 skills personales usar y propuesta de 6 skills propias de Darivo Pro (no construidas).
- [2026-07-09-auditoria-remediacion.md](docs-internos/tareas/2026-07-09-auditoria-remediacion.md) — cerrada. Auditoría MD↔BD↔código↔producción, 5 prioridades — todas resueltas salvo deuda de negocio ya documentada.
- [2026-07-12-auditoria-admin-empresa-partner.md](docs-internos/tareas/2026-07-12-auditoria-admin-empresa-partner.md) — cerrada. 3 agentes en paralelo, hallazgos de Admin/Empresa/Partner — todos resueltos en sesiones posteriores.
- [2026-07-12-cambios-mergeados-main-partner-empleados.md](docs-internos/tareas/2026-07-12-cambios-mergeados-main-partner-empleados.md) — cerrada. Fix Partner suspendido conservaba acceso + acciones Editar/Permisos en Empleados Empresa.
- [2026-07-12-chequeo-end-to-end-completo.md](docs-internos/tareas/2026-07-12-chequeo-end-to-end-completo.md) — cerrada. Nota de chequeo end-to-end (6 auditorías en paralelo + bug reset-password).
- [2026-07-12-cicd-job-supabase-eliminado.md](docs-internos/tareas/2026-07-12-cicd-job-supabase-eliminado.md) — cerrada. Por qué se eliminó el job de migración automática de Supabase en CI — no reconstruir sin confirmar.
- [2026-07-12-cuenta-prueba-qa-setup.md](docs-internos/tareas/2026-07-12-cuenta-prueba-qa-setup.md) — referencia. SQL de creación de las cuentas QA Móvil/Empresa y Partner, con datos de ejemplo.
- [2026-07-12-email-transaccional-gmail-api.md](docs-internos/tareas/2026-07-12-email-transaccional-gmail-api.md) — abierta (bloqueada por infraestructura externa). Los 9 eventos conectados en código, pendiente `GMAIL_SERVICE_ACCOUNT_JSON` del propietario.
- [2026-07-12-landing-pwa-mejoras-tecnicas.md](docs-internos/tareas/2026-07-12-landing-pwa-mejoras-tecnicas.md) — cerrada. Fix de caché offline PWA, apple-touch-icon, manifest, SEO/OG, accesibilidad.
- [2026-07-12-problemas-abiertos-reset-password-pwa.md](docs-internos/tareas/2026-07-12-problemas-abiertos-reset-password-pwa.md) — abierta (parcial). Bug de plantilla genérica de reset-password (pendiente confirmar plan Supabase); separación PWA ya resuelta.
- [2026-07-13-admin-colors-completo-sesion-continua.md](docs-internos/tareas/2026-07-13-admin-colors-completo-sesion-continua.md) — cerrada. `ADMIN_COLORS` completado al 100% en Admin, precio anual corregido a "Pendiente".
- [2026-07-13-auditoria-md-codigo-admin.md](docs-internos/tareas/2026-07-13-auditoria-md-codigo-admin.md) — cerrada. Auditoría visual de las 11 pantallas de Admin + fix de credenciales Supabase mal configuradas en Vercel (proyecto real `vyrtokggypcmpforglch`).
- [2026-07-13-auditoria-md-codigo-empresa.md](docs-internos/tareas/2026-07-13-auditoria-md-codigo-empresa.md) — cerrada. Auditoría de las 9 pantallas de Empresa, plan de reconstrucción de Cotizaciones/Facturas/Cierre y migración a `ADMIN_COLORS`.
- [2026-07-15-estado-solido-verificado-en-progreso-sin-auditar.md](docs-internos/tareas/2026-07-15-estado-solido-verificado-en-progreso-sin-auditar.md) — referencia (snapshot 12/07). Clasificación de qué estaba sólido/en progreso/sin auditar en esa fecha.
- [2026-07-15-main-sincronizado-develop.md](docs-internos/tareas/2026-07-15-main-sincronizado-develop.md) — cerrada. Confirmación de que `develop` ya no tenía trabajo pendiente de mergear a `main`.
- [2026-07-15-wizard-email-onboarding-partner-panel.md](docs-internos/tareas/2026-07-15-wizard-email-onboarding-partner-panel.md) — cerrada. Reversión quirúrgica del wizard de cotización, email opcional en Clientes, fix onboarding paso 2, Panel Partner completo con PWA propia.
- [2026-07-16-diagnostico-fix-wizard-cotizacion.md](docs-internos/tareas/2026-07-16-diagnostico-fix-wizard-cotizacion.md) — cerrada. Diagnóstico y fix del bug "partida seleccionada sin cantidad" en el wizard de cotización Móvil.
- [2026-07-16-fase2-legal-privacidad-cookies-terminos.md](docs-internos/tareas/2026-07-16-fase2-legal-privacidad-cookies-terminos.md) — abierta (borrador, pendiente de abogado). Privacidad/Cookies/Términos actualizados cubriendo RGPD + Ley 29733 Perú.
- [2026-07-16-fase3-asistente-soporte-darivo.md](docs-internos/tareas/2026-07-16-fase3-asistente-soporte-darivo.md) — cerrada (parcial, ver pendientes de email). Asistente de soporte "Darivo" (Agente IA 2) construido y conectado a tickets reales.
- [2026-07-16-flujo-categoria-partida-resumen-diseno.md](docs-internos/tareas/2026-07-16-flujo-categoria-partida-resumen-diseno.md) — cerrada. Confirmación de diseño intencional del drill-down Categoría→Partida→Resumen + fix del acordeón que no lo cumplía.
- [2026-07-17-cola-tareas-precios-roles-partners.md](docs-internos/tareas/2026-07-17-cola-tareas-precios-roles-partners.md) — cerrada (5c parcial). Cola de 5 tareas: precios oficiales, roles Gerente/Técnico, condiciones Partners, TODO interno, limpieza Panel Empresa.
- [2026-07-17-correccion-cotizacion-clientes-facturas-sync.md](docs-internos/tareas/2026-07-17-correccion-cotizacion-clientes-facturas-sync.md) — cerrada. Corrección de tarjeta Total, PDF por WhatsApp como archivo real, vinculación factura↔cliente, filtrado Clientes/Facturas.
- [2026-07-17-fix-floatbar-safe-area-android.md](docs-internos/tareas/2026-07-17-fix-floatbar-safe-area-android.md) — cerrada. Fix de `viewport-fit=cover` para que la barra flotante respete la barra de gestos de Android.
- [2026-07-17-password-toggle-partner-reorder-landing.md](docs-internos/tareas/2026-07-17-password-toggle-partner-reorder-landing.md) — cerrada. Botón mostrar/ocultar contraseña en los 5 campos, reorden del Panel Partner, rediseño de la landing pública.
- [2026-07-17-tarea0-limpieza-documentacion-cursor.md](docs-internos/tareas/2026-07-17-tarea0-limpieza-documentacion-cursor.md) — cerrada. Confirmación de que los archivos de metodología Cursor ya no existen en el repo.
- [2026-07-18-defensa-profundidad-server-actions-admin.md](docs-internos/tareas/2026-07-18-defensa-profundidad-server-actions-admin.md) — cerrada. Auditoría de `partners.estado='Activo'` + guard `errorSiNoEsAdmin()` agregado a 22 Server Actions de Admin.
- [2026-07-19-auditoria-dominios-subdominios.md](docs-internos/tareas/2026-07-19-auditoria-dominios-subdominios.md) — cerrada. Fix de acceso directo a `admin.darivopro.com` y del mapa de subdominios (`partner`→`partners`).
- [2026-07-19-logo-pie-documento-whatsapp-manoobra.md](docs-internos/tareas/2026-07-19-logo-pie-documento-whatsapp-manoobra.md) — cerrada. Logo de empresa en PDF, texto de pie "darivopro.com", eliminado auto-envío WhatsApp, % mano de obra oculto en PDF.
- [2026-07-19-pdf-inaccesible-pagina-blanco-floatbar.md](docs-internos/tareas/2026-07-19-pdf-inaccesible-pagina-blanco-floatbar.md) — cerrada. 3 causas raíz reales: bucket privado sin URL firmada, `window.open` con `noopener` devolviendo `null`, animación CSS pisando transform inline.
- [2026-07-19-rediseno-cotizacion-bizlinks.md](docs-internos/tareas/2026-07-19-rediseno-cotizacion-bizlinks.md) — cerrada. Rediseño del PDF de Cotización estilo Bizlinks (sin tocar Factura), flujo "Convertir a Factura" con revisión obligatoria.
- [2026-07-20-auditoria-markdown-visible-ui.md](docs-internos/tareas/2026-07-20-auditoria-markdown-visible-ui.md) — cerrada. Auditoría de 15 archivos que citaban nombres de `.md`/`§` visibles en UI — todos corregidos.
- [2026-07-20-filtros-fecha-telefono-modelo-datos.md](docs-internos/tareas/2026-07-20-filtros-fecha-telefono-modelo-datos.md) — cerrada. Filtros Hoy/Semanal/Mensual, validación de teléfono, regla de negocio Cliente↔Cotización↔Factura, Maps Autocomplete.
- [2026-07-20-login-google-bienvenida-maps.md](docs-internos/tareas/2026-07-20-login-google-bienvenida-maps.md) — abierta (pendiente activar proveedor Google en Supabase). Email de bienvenida en primer login Google, clic en dirección → Maps.
- [2026-07-20-redireccion-post-login-timestamp-peru.md](docs-internos/tareas/2026-07-20-redireccion-post-login-timestamp-peru.md) — cerrada (checklist de verificación en vivo pendiente). Redirección post-login por rol real + timestamp/filtros en hora de Perú.
- [2026-07-21-auditoria-coherencia-md-codigo.md](docs-internos/tareas/2026-07-21-auditoria-coherencia-md-codigo.md) — cerrada. Auditoría de coherencia documental Visión↔código, 2 documentos desactualizados corregidos.
- [2026-07-21-auditoria-seguridad-cierre-etapas1-3.md](docs-internos/tareas/2026-07-21-auditoria-seguridad-cierre-etapas1-3.md) — cerrada (resumen ejecutivo). Consolida Etapas 1-3 de la auditoría de seguridad/roles/esquema, 10 preguntas abiertas para Mohamed.
- [2026-07-21-auditoria-seguridad-etapa1-matriz-roles.md](docs-internos/tareas/2026-07-21-auditoria-seguridad-etapa1-matriz-roles.md) — cerrada. Matriz de roles vs. estándar RBAC multi-tenant, veredicto por rol.
- [2026-07-21-auditoria-seguridad-etapa2-rls.md](docs-internos/tareas/2026-07-21-auditoria-seguridad-etapa2-rls.md) — cerrada. Auditoría RLS completa: 35 tablas, 3 gaps de escalada de privilegios encontrados y corregidos (migración sin ejecutar).
- [2026-07-21-auditoria-seguridad-etapa4-preguntas.md](docs-internos/tareas/2026-07-21-auditoria-seguridad-etapa4-preguntas.md) — cerrada (3 preguntas siguen pendientes del propietario: #2, #3, #7). Resolución de 10 preguntas abiertas — fuente de verdad de Admin unificada.
- [2026-07-21-auditoria-seguridad-etapa5-cierre.md](docs-internos/tareas/2026-07-21-auditoria-seguridad-etapa5-cierre.md) — cerrada. Baja de `darivonet@gmail.com` como Admin, cierre de la auditoría de seguridad/roles/esquema.
- [2026-07-21-estado-migraciones-supabase.md](docs-internos/tareas/2026-07-21-estado-migraciones-supabase.md) — abierta. Registro de las 11 migraciones acumuladas — 10 corridas, 1 en pausa a propósito (`facturas_bizlinks_esquema`).
- [2026-07-21-etapa6-matriz-roles-permisos.md](docs-internos/tareas/2026-07-21-etapa6-matriz-roles-permisos.md) — cerrada (6 celdas ❓ documentadas). Matriz de Roles y Permisos real (`matriz-permisos.ts`) + cierre de gaps CSV en 5 módulos Admin.
- [2026-07-21-etapa7-cierre-celdas-planes-editables.md](docs-internos/tareas/2026-07-21-etapa7-cierre-celdas-planes-editables.md) — cerrada. Cierre de las 6 celdas ❓ pendientes + planes editables desde BD (sin efecto real en checkout todavía).
- [2026-07-21-etapa7-dispositivo-google-limite-cotizaciones.md](docs-internos/tareas/2026-07-21-etapa7-dispositivo-google-limite-cotizaciones.md) — cerrada (bloqueo por dispositivo revertido después, ver `2026-07-21-reversion-bloqueo-dispositivo.md`). Restricción por dispositivo, bug Google→Empresa no reproducido, límite 5 cotizaciones reforzado con trigger BD.
- [2026-07-21-latitude-telemetry.md](docs-internos/tareas/2026-07-21-latitude-telemetry.md) — abierta (pendiente `LATITUDE_API_KEY` del propietario). Instalación de Latitude Telemetry para los 3 puntos de llamada a OpenAI.
- [2026-07-21-reversion-bloqueo-dispositivo.md](docs-internos/tareas/2026-07-21-reversion-bloqueo-dispositivo.md) — cerrada. Reemplaza el bloqueo total por dispositivo (Etapa 7) por un banner informativo no bloqueante.
