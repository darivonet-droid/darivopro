# TODO — Pendientes de Darivo Pro

**Documento interno. NO es público, NO se sirve por ninguna URL de `darivopro.com`.** Ver la nota de seguridad al final de este archivo para la verificación completa de que así es.

Creado 17/07/2026 (Tarea 4 de la cola pendiente de `CLAUDE.md`). Objetivo: que el propietario o cualquier sesión futura de Claude Code vean de un vistazo qué falta en todo el proyecto — no solo legal, cualquier cosa a medias, placeholder, o pendiente de revisión. El detalle completo de cada punto (con archivo:línea, historial de decisiones) vive en `CLAUDE.md` — este documento es el índice, no el reemplazo. Si algo cambia de estado, actualízalo aquí también, no solo en `CLAUDE.md`.

---

## ✅ Resuelto 18/07/2026 — contradicción de Catálogo Maestro, confirmada autorizada

`10-PANEL-ADMIN-CATALOGO-MAESTRO.md` (documento oficial protegido) decía en su §9/§10 "Pendiente de documentación oficial. No crear tablas/endpoints", pese a que `frontend/src/app/admin/catalogo/actions.ts` ya tenía CRUD real (6 Server Actions) construido el 13/07/2026 (commit `616cee8`, dentro de la tanda ya autorizada de completar las 7 pantallas de Admin — probable descuido de esa restricción específica, no una decisión deliberada de saltársela).

Reportado sin tocar código el mismo 18/07/2026, y **confirmado por el propietario ese mismo día ("ya") como autorizado**. `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` actualizado a v1.3 — §9/§10 ya documentan el CRUD real en vez de decir "pendiente"/"no crear". Nada más cambió en código, solo el MD queda sincronizado con lo que ya estaba en producción.

---

## 1. Requiere una acción externa del propietario (no se puede resolver desde código)

- **Google Cloud + Workspace (domain-wide delegation)**: sin esto, ningún email transaccional real se envía (10 eventos: bienvenida, pago confirmado/fallido, cambio de plan, bienvenida Partner, comisión ganada, ticket recibido/resuelto, contacto landing, invitación de empleado) — todos fallan limpio con el mismo error `GMAIL_SERVICE_ACCOUNT_JSON no configurada`, ya loggeado, nunca en silencio. Pasos exactos en `frontend/src/lib/email/gmail-client.ts` (comentario de cabecera).
- **Plantilla de reset-password en el Dashboard hosted de Supabase**: `supabase/templates/recovery.html` ya tiene el texto real, pero solo aplica en local (`supabase/config.toml`) — el propietario debe pegar el mismo HTML en Authentication → Email Templates → Reset Password del proyecto real (`vyrtokggypcmpforglch`). Sin esto, a veces llega la plantilla genérica de Supabase (puede combinarse con un posible bloqueo de plan gratuito — ver "Problemas abiertos" en `CLAUDE.md`, sección de fecha 12/07/2026, para el diagnóstico completo).
- **Webhook de Supabase para "comisión ganada"** (evento 7 de email): Dashboard → Database → Webhooks, tabla `partner_comisiones_historial`, evento INSERT.
- **Dominio y subdominios sin conectar en DNS**: `SUBDOMAIN_ROUTING_ENABLED` sigue apagado a propósito — `app.`/`empresa.`/`admin.`/`partner.darivopro.com` no resuelven todavía. Afecta directamente a los enlaces nuevos del header de la landing (Tarea de rediseño, 17/07/2026) — apuntan a esas URLs pero no van a funcionar hasta conectar el dominio.
- **Confirmar fecha de creación/plan de Supabase** (`vyrtokggypcmpforglch`) — determina si hace falta SMTP personalizado para que las plantillas de Auth se apliquen de verdad (ver mismo diagnóstico de reset-password arriba).

## 2. Legal — borradores, no válidos para publicar tal cual

- `POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md`, `TERMINOS-Y-CONDICIONES-DARIVO-PRO.md`, `POLITICA-DE-COOKIES-DARIVO-PRO.md` (raíz + copias sincronizadas en `frontend/src/content/legal/`): siguen siendo **borrador**, pendientes de revisión por un abogado real antes de publicar.
- Datos no inventados, dejados explícitamente en corchetes `[pendiente]` o sin rellenar: razón social/NIF/domicilio del responsable del tratamiento, confirmación de si la cookie `darivo_ref` requiere banner de consentimiento, confirmación de región de servidores de Supabase/Vercel (transferencia internacional RGPD), inscripción de banco de datos ante la autoridad peruana (Ley 29733), cláusula de jurisdicción de Términos §11.
- **Antes de publicar**: actualizar `INVENTARIO-PROVEEDORES-DATOS-DARIVO-PRO.md` con cualquier proveedor nuevo desde el 07/07/2026, copiar esa lista a la Política de Privacidad §4, rellenar los corchetes, y confirmar la revisión legal.

## 3. Decisiones de negocio pendientes (no tocar sin que el propietario decida)

- **"Roles personalizados" de Empresa (`RolesPermisosView.tsx` §6.1)**: ya construido y en producción (CRUD real sobre `roles_personalizados`), pero es una *propuesta pendiente de aprobación* según su propio MD — se presenta como si ya estuviera aprobada. Decisión pendiente: aprobar formalmente, o retirar/ocultar hasta aprobarse.
- **RBAC / "Matriz de permisos por empleado" sigue inerte**: `MATRIZ_PERMISOS_APROBADA=false` en `roles-planes-oficial.ts` — la UI de esa matriz es un placeholder sin `onClick`. La Tarea 2 (17/07/2026, roles Gerente/Técnico con Factura/Informe) es un sistema **distinto y ya real** (columnas propias en `empresa_empleados`), no depende de esta matriz ni la reemplaza — no confundir los dos.
- **Precio de "Técnicos adicionales" en Business** (más de 5 técnicos): no decidido. No documentar ningún importe hasta que el propietario lo confirme.
- **Agentes IA — Claude/Anthropic vs OpenAI**: decisión de arquitectura pendiente (¿sustituye o convive con OpenAI?). Bloqueado, no iniciar sin confirmación explícita.
- **Integración SUNAT real**: no hay proveedor OSE contratado. No escribir código de integración real hasta confirmarlo.
- **Testimonios en la landing**: prohibidos hasta tener al menos 3 clientes reales, verificables, con permiso explícito de usar su nombre/negocio (`LANDING-PAGE-DARIVO-PRO.md` §4.1). No añadir aunque se comparta un mockup que los incluya.

## 4. Funcionalidad a medias o placeholder

- ~~**Catálogo Maestro (Admin, pantalla 10) — CONTRADICCIÓN con su propio MD**~~ ✅ **Resuelto 18/07/2026** — ver nota destacada al principio de este archivo. El CRUD real (`admin/catalogo/actions.ts`, construido 13/07/2026) quedó confirmado como autorizado por el propietario; `10-PANEL-ADMIN-CATALOGO-MAESTRO.md` actualizado a v1.3 para reflejarlo.
- ~~**Admin → Empleados internos: acciones "Editar"/"Cambiar departamento" pendientes**~~ — dato desactualizado, corregido 18/07/2026: ya están construidas desde el 13/07/2026 (`EditarEmpleadoForm`, `editarEmpleadoAction` en `admin/empleados/actions.ts`) — confirmado leyendo el código, no solo la nota anterior de este documento.
- **Sección "Documento" (Móvil, PDFs de informes/cotizaciones/facturas)**: investigación **completada y reportada** en `CLAUDE.md` → Tarea 5d (17/07/2026) — confirmado redundante (subconjunto de Cotizaciones/Facturas/Informes, sin filtros ni acciones). No se eliminó nada, sigue pendiente de que el propietario confirme si quiere retirarla.
- ~~**Wizard de cotización en Empresa sin layout de 3 paneles**~~ — dato desactualizado, corregido 18/07/2026: ya se construyó `NuevoCotizacionWizardEscritorio.tsx` el 14/07/2026, con los 3 puntos de entrada reales (Inicio, ficha de Cliente, handoff desde IA) ya enlazando ahí — confirmado en código.
- **Borrador de sesión del wizard de cotización** (`useCotizacionDraft`) no persiste el `basket` real todavía (hallazgo secundario del diagnóstico del 16/07/2026, nunca confirmado como bug reportado, distinto del ya corregido).
- ~~**Server Actions de Admin sin re-verificación interna**~~ ✅ **Resuelto 18/07/2026** — ver `CLAUDE.md` → "Autonomía de ejecución" para el detalle (`errorSiNoEsAdmin()` agregado a las 22 Server Actions que lo necesitaban).

## 5. Cola de trabajo activa

El detalle completo de las 5 tareas en curso (precios ✅, roles Gerente/Técnico ✅, condiciones Partner ✅, este documento, limpieza Panel Empresa) vive en `CLAUDE.md` → sección **"COLA DE TAREAS PENDIENTES"**. No se duplica aquí — solo se referencia para no desincronizar los dos documentos.

## 6. Deuda técnica ya resuelta (mencionada aquí solo para no repetir el trabajo)

- Migración de terminología presupuesto→cotización: **completa**, confirmada por auditoría.
- Precio anual Básico/Pro "Pendiente": **resuelto** 17/07/2026, los 3 planes tienen precio definitivo.
- Separación de PWA Móvil vs Admin/Empresa: **resuelta**.
- Bug de facturación plan `gratis`, logout en los 4 paneles, RLS en todas las tablas de usuario: **verificados sin brechas**.

---

## Verificación de seguridad — este documento no es público

Confirmado con evidencia directa, no solo afirmación (17/07/2026):

1. **Ubicación real**: `frontend/docs-internos/TODO-PENDIENTES-DARIVO-PRO.md` — **fuera** de `frontend/public/` (única carpeta que Next.js sirve como archivos estáticos). `frontend/docs-internos/` ya se usaba desde antes para este mismo propósito (`design/`, `landing/` — movidos ahí explícitamente el 16/07/2026 tras encontrar 2 `.md` expuestos por error en `frontend/public/`, ver "REGLA PERMANENTE" en `CLAUDE.md`).
2. **Ninguna ruta de la app lo sirve**: `frontend/src/app/` no tiene ninguna ruta dinámica tipo `/docs/[...slug]` ni ningún `readFileSync`/`fs.readFile` que apunte a `docs-internos/` (a diferencia de los 3 documentos legales, que sí se sirven a propósito vía `MarkdownLegal.tsx` desde `frontend/src/content/legal/` — una carpeta *distinta*, dentro de `src/`, nunca `docs-internos/`).
3. **Ningún enlace público apunta aquí**: grep de `TODO-PENDIENTES` y de `docs-internos` en toda la landing pública (`frontend/src/app/page.tsx`, `LandingHeader.tsx`, `LandingChatWidget.tsx`) y en el resto de páginas de `(public)/` → cero coincidencias.
4. **`middleware.ts`**: su matcher excluye `_next/static`, `_next/image`, `favicon.ico`, `api/` y cualquier archivo con extensión (`.*\..*`) — no hay ninguna regla que sirva contenido de `docs-internos/` bajo ningún caso.

Si en el futuro se agrega cualquier visor de documentación interna a la app (por ejemplo, un panel de Admin que liste archivos de `docs-internos/`), **debe quedar detrás del mismo login+allowlist de Admin** — nunca accesible sin sesión.
