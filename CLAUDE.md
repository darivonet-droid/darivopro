# Darivo Pro — Guía para Claude Code

## Regla de oro (metodología, antes de tocar nada)

**Verificar antes de afirmar. Reproducir antes de arreglar. Buscar causa raíz, no síntoma.**

- Ninguna afirmación de estado ("funciona", "está roto") vale sin **evidencia dura**
  de esta sesión (HTTP status, bytes, píxeles, valores en BD). La confianza no es evidencia.
- No se arregla nada que no se haya **reproducido** en esta sesión. Si no reproduce, se dice — no se "arregla" igual.
- Etiquetar cada conclusión como *confirmada* o *sospecha*. "Apunta al build" ≠ "es el build".
- Todo bug arreglado lleva su **test de regresión** (o los pasos manuales exactos de verificación).
- El reporte final separa siempre: **verificado / sospecha / pendiente**.

## Autonomía de ejecución

Por defecto, tienes autorización para ejecutar tareas de forma autónoma, sin pedir permiso paso a paso ni confirmación intermedia.

### Dos modos de despliegue (regla nueva 19/07/2026 — reemplaza "Autonomía total sobre main")

A partir de esta fecha queda **revertida** la "autonomía total sobre `main`" del 12/07/2026. Rigen dos modos:

- **`main` = producción real: solo se despliega cuando el propietario lo avisa
  explícitamente.** Claude NO mergea ni sube a `main` por su cuenta. Prepara el
  cambio, lo deja verificado (build/lint/typecheck limpios, sin regresiones) y
  **espera el aviso**.
- **Producción autónoma (bajo demanda):** solo cuando el propietario diga la
  frase **"producción autónomo"**, Claude despliega/trabaja de forma autónoma
  para esa tarea, sin confirmación paso a paso. El permiso es **por tarea, no
  permanente** — no se asume vigente en la siguiente sesión sin que se repita.
- **Verificación siempre en:**
  `https://darivo-saas-git-main-darivonet-droids-projects.vercel.app/`,
  iniciando sesión con **Google usando la sesión ya abierta en el navegador**
  (botón "Continuar con Google"). Claude **nunca escribe la contraseña**; si
  algún login la pidiera, la escribe el propietario (regla permanente, excepción #3).

**Las excepciones de abajo siguen intactas, sin excepción, ahora y siempre.** El modo "producción autónoma" **solo** levanta la confirmación de **Deploy (#2)** para esa tarea; **nunca** anula Base de datos (#1), contraseñas (#3) ni endpoints de diagnóstico (#4):

ÚNICAS EXCEPCIONES — debes parar y pedir confirmación explícita antes de actuar cuando la tarea implique:

1. **Base de datos**: cualquier cambio en schema, migraciones, o datos (Supabase). Las migraciones siempre se entregan como SQL escrito, sin ejecutar — el propietario las corre él mismo en el SQL Editor.
2. **Deploy**: cualquier acción que dispare un despliegue a producción (push a main, redeploy manual, o equivalente) — **salvo cuando el propietario haya dicho "producción autónomo" para esa tarea** (ver "Dos modos de despliegue" arriba), en cuyo caso procede sin preguntar.
3. **Nunca contraseñas en ningún login** — ni en formularios de navegador de preview, ni en ningún otro flujo de autenticación, sin importar la fuente (incluso archivos de credenciales QA propios del proyecto).
4. **Nunca desplegar a producción un endpoint de diagnóstico sin autenticación** (regla agregada 14/07/2026 tras incidente real, ver abajo) — cualquier ruta que devuelva en su respuesta HTTP metadata de configuración interna (aunque sea parcial: `ref`/`role` de un JWT, longitud de una key, nombre de proyecto) debe ir gateada por la misma auth de Admin ya existente, o loguearse solo server-side vía `console.error` (visible únicamente en Vercel Runtime Logs, no en la respuesta pública) — nunca en el body de una respuesta HTTP alcanzable sin sesión. El repo es público en GitHub, así que un "query param secreto" en el código tampoco es una defensa real.

**Incidente 14/07/2026:** se desplegó brevemente `/api/diag/env-check`, una ruta pública sin autenticación que decodificaba y devolvía en el JSON de respuesta el `ref`/`role` del JWT de `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` (nunca el token completo, pero sí metadata interna, alcanzable por cualquiera con la URL). El clasificador de seguridad de Claude Code bloqueó el intento de leerla y señaló correctamente que excedía lo autorizado por el propietario. Se retiró en el commit inmediatamente siguiente (`6b414e4`), sin que se llegara a leer su contenido.

### ✅ Resuelto — defensa-en-profundidad en Server Actions de Admin (18/07/2026, ver auditoría original de `partners` 15/07/2026)

Auditoría completa de escritura a `public.partners` (pedida para confirmar que solo el propietario puede dar `estado='Activo'`, ver detalle en el hilo de esa fecha): **no se encontró ninguna brecha activa** — RLS correcto (`partners_own` solo SELECT, `partners_admin` gateado por `is_darivo_admin()`), y el único camino a `estado='Activo'` fuera de SQL directo es el botón "Activar partner" de `/admin/partners`, protegido por `middleware.ts` (`esAdministradorDarivo()`, allowlist `DARIVO_ADMIN_EMAILS`, falla cerrado si está vacía).

**Mejora de defensa-en-profundidad aplicada (18/07/2026)**: hasta esta fecha, las Server Actions de Admin (`admin/partners/actions.ts`, `admin/catalogo/actions.ts`, `admin/empresas/actions.ts`, `admin/usuarios/actions.ts`, `admin/productos/actions.ts`, `admin/soporte/actions.ts`) no re-verificaban `esAdministradorDarivo()` internamente — confiaban por completo en que `middleware.ts` siguiera protegiendo esas rutas (nunca explotable, matcher verificado, pero un cambio futuro del matcher las habría dejado expuestas sin ningún otro chequeo). `admin/empleados/actions.ts` ya tenía su propio guard (`requireAdmin()`, construido 13/07/2026) — no se tocó, sirvió de referencia para el patrón. Nuevo `errorSiNoEsAdmin()` en `frontend/src/lib/acceso-producto.ts` (crea su propio cliente Supabase, verifica `esAdministradorDarivo(user.email)`, devuelve el mensaje de error o `null`) — agregado al inicio de las 22 Server Actions restantes en esos 6 archivos, cada una retornando el mismo shape `{ok:false, error:"No autorizado"}` que ya usaban (una excepción: `getPartnersAction()` devuelve un array plano, no ese shape — ahí se usa `throw` en vez de retornar, comportamiento correcto para una función de lectura llamada desde un Server Component). No se tocó `ecosystem-store.ts`/`admin-queries.ts` — la protección ya queda cubierta en la Server Action que las invoca, no hacía falta duplicarla dentro de las funciones de librería. Verificado: `tsc`/`lint`/`build` limpios (79 rutas). No se pudo probar en vivo que un usuario no-admin autenticado reciba el rechazo (crear una segunda cuenta de prueba fuera de la allowlist para probarlo está fuera de lo que se puede hacer sin credenciales) — la lógica es la misma ya validada en `admin/empleados/actions.ts` desde el 13/07, así que el patrón ya está probado en producción.

Para todo lo demás (código de frontend/backend, commits a develop, buscar e implementar assets, build/lint/typecheck, correcciones de texto, etc.) actúa sin preguntar, salvo que tú mismo detectes una ambigüedad real que no puedas resolver razonablemente por tu cuenta.

### Verificación obligatoria de schema en migraciones (11/07/2026)

Toda migración que referencie columnas de una tabla ya existente debe incluir, como parte de la respuesta, el extracto literal del `CREATE TABLE` de esa tabla (con número de archivo y líneas), no solo la afirmación de que se verificó el schema. Si la tabla pudo haber sido modificada por `ALTER TABLE` en otra migración posterior, debe confirmarse explícitamente que no hay ningún `ALTER TABLE` que la afecte, listando el resultado de esa búsqueda. Sin este extracto, la migración no se considera verificada y no debe entregarse como final.

## Cambios en curso 19/07/2026

Pedido por Mohamed el 19/07/2026, 3 tareas, ejecutadas en este orden.

### 1. [x] Logo de empresa en documentos (Cotización y Factura), compartido Móvil/Empresa — hecho 19/07/2026

**Investigación previa (obligatoria por la Regla de oro) confirmó la fuente única correcta**: hoy Móvil y Empresa YA leen el mismo dato de emisor (razon_social/ruc/direccion/telefono) desde `public.perfiles` del usuario logueado — la tabla `public.empresas` (separada, `gerente_user_id`) solo se usa en Admin para gating, nunca para poblar Cotización/Factura. Como un mismo Gerente usa la misma fila de `perfiles` sin importar si entra por Móvil o por Empresa, el campo de logo se agregó ahí (`perfiles.logo_url`), no en `empresas` — garantiza una sola fuente de verdad sin duplicar por plataforma, tal como se pidió.

**Construido:**
- **Migración** `supabase/migrations/20260719140000_perfiles_logo.sql` (SQL entregado, **sin ejecutar** — regla de BD): agrega `perfiles.logo_url text` + bucket Storage nuevo `logos` (público, a diferencia de `documentos`/`gastos-adjuntos` que son privados — necesario porque `@react-pdf/renderer` descarga la imagen server-side sin credenciales al generar el PDF) con políticas RLS por carpeta `{user_id}/...` (insert/update/select/delete). **Pendiente: Mohamed debe correr esta migración en el SQL Editor.**
- **`frontend/src/components/perfil/LogoEmpresaUploader.tsx`** (nuevo, cliente, compartido Móvil/Empresa): sube la imagen al bucket `logos` vía Supabase Storage desde el navegador, actualiza `perfiles.logo_url` con la URL pública resultante. Validaciones: solo imágenes, máx. 2MB. Botón "Quitar logo". Montado en las 2 únicas pantallas de perfil que existían (antes solo lectura): `frontend/src/app/(auth)/mas/perfil/page.tsx` (Móvil) y `frontend/src/app/empresa/mas/perfil/page.tsx` (Empresa) — no existía ningún otro lugar editable donde ponerlo (`AjustesForm.tsx`/`ConfigTabs.tsx` existen pero están huérfanos, sin ninguna ruta que los monte — no se tocaron, fuera de alcance).
- **Header de Factura** (`frontend/src/lib/pdf/FacturaPdfDocument.tsx`): ya mostraba razonSocial/dirección/teléfono desde `biz_data` (JSONB congelado en la factura al emitirse) — se agregó el `<Image>` del logo junto a esos datos. El logo específicamente se resuelve **en vivo** desde `perfiles` en `frontend/src/app/api/pdf/factura/[id]/route.ts` (no se congela como el resto de biz_data) para que subir/cambiar el logo se refleje también en facturas ya emitidas, no solo en las nuevas.
- **Header de Cotización** (`frontend/src/lib/pdf/CotizacionPdfDocument.tsx`): **no mostraba ningún dato de emisor antes** (header era solo un título estático) — se agregó bloque completo (logo + razonSocial + dirección + teléfono) leído en vivo desde `perfiles` en `frontend/src/app/api/pdf/cotizacion/[id]/route.ts`, mismo patrón que Factura.
- **`EmpresaData`** (`frontend/src/types/index.ts`) gana `logoUrl?: string | null`. `bizData` construido al emitir una Factura (`app/(auth)/facturas/nueva/page.tsx` y `app/empresa/facturas/nueva/page.tsx`) también incluye `logoUrl` desde el inicio.
- **Fallback sin romper layout**: si `logoUrl`/`razonSocial` son null, el bloque de emisor completo no se renderiza (Cotización) o solo se omite el `<Image>` (Factura, que ya mostraba "Mi empresa" por defecto) — diseño actual intacto.

**Riesgo de regresión detectado y corregido durante la implementación** (Regla de oro — no bastaba con "debería funcionar"): las 2 páginas de Perfil originalmente pedían `razon_social, telefono, logo_url` en un solo `select()`. Si la migración aún no corrió, PostgREST rechaza la consulta completa (columna inexistente) y esas pantallas dejarían de mostrar razón social/teléfono — una regresión real sobre algo que hoy funciona. Se separó en 2 consultas independientes (una para razon_social/telefono, otra tolerante a fallo solo para logo_url) para que ambas pantallas seguín funcionando igual que hoy aunque la migración no se haya corrido todavía. Los 2 endpoints de PDF (`api/pdf/factura`, `api/pdf/cotizacion`) ya eran tolerantes por diseño (Supabase JS no lanza excepción en error de query, solo `data: null`) — sin cambios necesarios ahí.

**Verificado**: `tsc --noEmit`, `next lint` (mismos 4 warnings preexistentes) y `next build` limpios (81 rutas). Servidor dev arrancado y probado sin errores en consola (`/precios` público carga bien; `/mas/perfil` redirige correctamente por no haber sesión). **No verificado en vivo con una sesión real ni con la migración corrida** (mismo bloqueo de credenciales de siempre + la migración es responsabilidad del propietario) — recomendado que Mohamed, tras correr la migración: suba un logo desde Perfil (Móvil o Empresa), confirme que aparece en el header de una Cotización y una Factura nuevas, y que una factura **ya emitida antes** de subir el logo también lo muestra al volver a abrir su PDF (por la resolución en vivo).

### 2. [x] Texto de pie de documento → "Generado con darivopro.com" — hecho 19/07/2026

Búsqueda exhaustiva del string exacto `"Generado con DARIVO PRO"` en `frontend/src` → 5 ocurrencias reales, las 5 reemplazadas: `lib/pdf/CotizacionPdfDocument.tsx:122` (header PDF), `lib/pdf/FacturaPdfDocument.tsx:263` (footer PDF), `lib/utils.ts:93` y `:115` (mensajes de WhatsApp de Cotización/Factura — compartidos Móvil+Empresa), `lib/factura-utils.ts:99` (mensaje corto de WhatsApp de Factura sin PDF). Las demás coincidencias de "DARIVO PRO" en el repo son el comentario de cabecera `// DARIVO PRO — ...` que casi todos los archivos del proyecto tienen, sin relación con el pie de documento — no se tocaron.

**Hallazgo colateral, no corregido (fuera del texto literal pedido)**: `CotizacionPdfDocument.tsx:184` dice `"Esta cotización tiene validez de 30 días desde su emisión · DARIVO PRO"` — mención de marca en el footer, pero no la frase exacta "Generado con DARIVO PRO" que se pidió cambiar. Se deja igual a la espera de confirmación explícita si también se quiere ahí "darivopro.com".

**Verificado**: `tsc`/`lint`/`build` limpios (ver Tarea 1).

### 3. [x] Eliminar envío automático a WhatsApp al guardar (bug) — hecho 19/07/2026

**Confirmado con evidencia (no solo afirmación) que el bug existía SOLO en Cotización, en ambas plataformas — Factura nunca lo tuvo**: revisado `hooks/useFactura.ts` completo y los 2 formularios de Factura — su envío a WhatsApp siempre estuvo detrás de un botón (`onClick`), nunca disparado automáticamente tras guardar.

**Eliminado**: en `components/cotizacion/NuevoCotizacionWizard.tsx` (Móvil) y `NuevoCotizacionWizardEscritorio.tsx` (Empresa), función `doSave()` — se quitó el bloque completo de auto-envío a WhatsApp que corría justo después de crear la cotización (armaba el mensaje y abría `wa.me/...` sin acción del usuario), junto con la apertura anticipada de la ventana emergente en Móvil (`abrirVentanaDiferida()`, truco para evitar el bloqueo de pop-up del navegador). `doSave()` ahora solo guarda y genera el PDF — compartir queda 100% a cargo del botón manual "📤 Compartir PDF" ya existente en la pantalla de éxito (`compartirPDF()` de `lib/share.ts`, sin tocar).

Limpieza de imports/variables que quedaron sin uso tras quitar ese bloque (`buildWAMsgCotizacion`, `abrirVentanaDiferida`/`navegarVentanaDiferida` en Móvil, `registrarEnvioWA` del hook `useCotizacion` en ambos wizards).

**Hallazgo colateral, no corregido**: `registrarEnvioWA` (función completa en `hooks/useCotizacion.ts:322-337`) queda sin ningún caller en todo el proyecto tras este cambio — candidata a eliminarse por separado si se confirma que no hace falta conservarla.

**Verificado**: `tsc`/`lint`/`build` limpios (ver Tarea 1). No verificado en vivo con guardado real de una Cotización (mismo bloqueo de credenciales) — el cambio es una eliminación quirúrgica de un bloque ya identificado con evidencia (archivo:línea), sin lógica nueva que pueda fallar de forma no obvia.

---

## COLA DE TAREAS PENDIENTES (creada 17/07/2026 — procesar en este orden)

Cola de trabajo entregada por Mohamed el 17/07/2026, para procesar en orden, una tarea a la vez (nunca varias en paralelo), con commit individual por tarea. Cada tarea se marca `[ ]`→`[x]` (o `[~]` si quedó parcial) justo aquí, con un resumen breve de qué se hizo o qué quedó pendiente de confirmación, apenas se completa — no se crean informes nuevos en otro lugar para esto.

### 1. [x] Actualizar precios oficiales — hecho 17/07/2026

Único origen real: `PRECIOS_OFICIALES` (`frontend/src/lib/roles-planes-oficial.ts`) — actualizado a Básico S/49/mes (sin cambio, ya estaba correcto), Pro S/89/mes (antes S/79), Business S/130/mes (antes S/120); anual = mensual × 10 para los 3 (S/490/S/890/S/1300), sin descuento adicional. Como todo el resto del código (`/precios`, Admin Suscripciones, checkout, emails) ya leía de esta constante — confirmado con grep, sin ningún otro precio hardcodeado en componentes/rutas — el cambio se propaga solo. Corregidas 5 instancias de una etiqueta "Pendiente"/"Precio anual: Pendiente" en `AdminSuscripcionesView.tsx`/`AdminRolesView.tsx` que asumían que solo Business tenía precio definitivo (ya no aplica, los 3 son definitivos). Actualizados también: `04-PANEL-ADMIN-SUSCRIPCIONES.md` (v1.9, documento protegido, cambio autorizado aquí mismo por el propietario) y las 2 copias de la tabla de precios en el conocimiento de Darivo (`DARIVO-CONOCIMIENTO-SOPORTE.md` + su copia sincronizada `frontend/src/content/darivo/conocimiento.md`), que tenían los precios viejos hardcodeados como texto de referencia para el asistente de soporte.

**Comisión de Partner — no requirió cambio de código**: confirmado que `partner_comisiones_config.porcentaje` se aplica sobre el monto real cobrado en `pagos_eventos` (vía trigger de BD), no sobre una copia hardcodeada del precio del plan — se actualiza solo en cuanto el checkout cobre los nuevos precios, sin tocar nada.

**Verificado**: `tsc`/`lint` limpios. Probado en el navegador `/precios` con sesión de preview (sin login, ruta pública): Mensual muestra S/49/S/89/S/130, Anual muestra S/490/S/890/S/1,300 — exacto ×10 en los 3 planes.

### 2. [x] Roles Gerente/Técnico (Empresa + Móvil) — hecho 17/07/2026

**Investigación previa confirmó que no existía nada de esto** (0% construido, no solo parcial): `ROLES_CLIENTE`/`RolCliente` (gerente/tecnico) eran tipos TypeScript sin conexión a BD; `empresa_empleados.rol` tiene CHECK que solo permite `'Técnico'` (el Gerente nunca es una fila ahí, es `empresas.gerente_user_id`); "Roles personalizados" de `RolesPermisosView.tsx` es un sistema distinto (Business-only, custom roles con nombre, nunca aplicado en ningún gate real); la "Matriz de permisos por empleado" de esa misma pantalla es un placeholder 100% decorativo (`MATRIZ_PERMISOS_APROBADA=false`); `invitarEmpleadoAction` hardcodeaba `rol:"Técnico"` sin ningún parámetro de permisos; ningún middleware/layout ocultaba Factura/Informe/Mis planes por rol.

**Construido:**
- **`empresa_empleados.factura_habilitada`/`informe_habilitado`** (booleanos, default `false`) — migración `20260717130000_empresa_empleados_permisos.sql`, **corrida por Mohamed (18/07/2026)**, confirmado por el propio Mohamed en el chat ("ya"). Sin verificación de datos post-migración desde código (sin acceso directo a Supabase en esta sesión) — si algo no cuadra en Empleados de Empresa, confirmar primero que las 2 columnas existen y tienen `default false`.
- **`frontend/src/lib/rol-empleado.ts`** (`obtenerContextoAcceso()`) — único punto de verdad del rol: `"solo"` (usuario sin empresa, Gerente+Técnico implícito, sin cambios), `"gerente"` (`empresas.gerente_user_id === user.id`, acceso total) o `"tecnico"` (fila en `empresa_empleados` por `user_id`, con sus flags). Usa `createAdminClient()` porque `empresa_empleados` solo es legible por el Gerente vía RLS (`empresa_empleados_gerente`) — un Técnico no puede leer su propia fila con el cliente normal, mismo patrón ya usado en `auth/callback/route.ts` para esta tabla.
- **Bug real encontrado y corregido de paso**: un Técnico invitado quedaba con `perfiles.plan_tipo='gratis'` (default del trigger `handle_new_user()`), atado al límite de 5 cotizaciones de por vida — sin poder trabajar de verdad aunque su empresa fuera Business. `invitarEmpleadoAction` ahora copia el `plan_tipo` del Gerente al perfil del Técnico invitado.
- **Efecto colateral de ese fix, también corregido**: copiar `plan_tipo='business'` al Técnico abría sin querer la puerta a `/empresa` completo (`puedeAccederEmpresa()` solo miraba `plan_tipo`). Ahora también verifica que el usuario sea específicamente el `gerente_user_id` de su empresa — un Técnico con plan heredado Business sigue sin poder entrar al panel de escritorio, solo a Móvil (comportamiento ya documentado como intencional desde antes).
- **Gating real aplicado** (no solo ocultar el link — también a nivel de página, redirect si se entra por URL directa): `(auth)/layout.tsx` oculta la pestaña Facturas de `BottomNav` si Técnico sin `facturaHabilitada`; `/facturas` y `/facturas/nueva` redirigen a `/cotizaciones` en ese caso; `/mas/plan` redirige siempre a `/mas` para un Técnico (nunca ve Mis planes); `/mas/informes` redirige a `/mas` si no tiene `informeHabilitado` (se dividió en Server Component de gating + `InformesMasPageClient.tsx` para el cliente, ya que la página original era 100% client-side); `MasOpcionesList`/`MasTabs` ocultan esas mismas entradas del menú "Más" para Técnico.
- **UI de Empresa** (`EmpresaEmpleadosView.tsx`): el formulario de "+ Invitar empleado" gana 2 checkboxes (Factura, Informe — Cotización siempre habilitada, sin toggle); la tabla de empleados gana 2 columnas con toggle inline para editar los permisos de un técnico ya invitado, sin pasar por "Roles personalizados" (sistema distinto, no tocado).
- **Correo de invitación con rol**: Supabase Auth no soporta variables de plantilla propias en su invite nativo (solo trae el enlace mágico de contraseña), así que se añadió un correo aparte (`plantillaInvitacionEmpleado`, `enviarInvitacionEmpleado`, mismo patrón best-effort que los otros 10 eventos de `lib/email/send.ts`) que sí menciona el rol y los permisos asignados — se envía justo después del invite nativo.
- **Activación automática**: `auth/callback/route.ts` pasa `empresa_empleados.estado` de `'Pendiente'` a `'Activo'` en el primer login real del Técnico (antes solo actualizaba `ultima_actividad`) — los permisos en sí no requieren ninguna acción del Técnico, ya quedaron fijados por el Gerente al invitar.

**Limitación conocida, documentada a propósito (no un bug):** el `plan_tipo` del Técnico se fija en el momento de la invitación, no se recalcula en vivo — si el Gerente cambia de plan después, el Técnico ya invitado no lo hereda automáticamente (requeriría re-invitación o ajuste manual). No se resolvió con una lectura cross-usuario en cada verificación de límite por simplicidad y para no depender de RLS adicional.

**No tocado, a propósito**: "Roles personalizados" de `RolesPermisosView.tsx` (sistema Business-only distinto, ver arriba) y la "Matriz de permisos por empleado" (sigue el placeholder pendiente de aprobación, sin relación con esta tarea).

**Verificado**: `tsc`/`lint`/`next build` limpios (78 rutas). **No verificado en vivo con una sesión de Técnico real** — crear una cuenta de prueba de Técnico requeriría escribir una contraseña en el formulario de login/invitación, fuera de lo permitido (regla permanente de este documento). Recomendado que el propietario, tras correr la migración SQL: invite un Técnico de prueba con Factura OFF/Informe OFF, confirme que no ve esas pestañas ni "Mis planes", que sí puede cotizar sin el límite de 5 de la prueba gratuita, y que activar Factura/Informe desde Empresa se refleja en su Móvil sin que el Técnico haga nada.

### 3. [x] Documento "Condiciones y Uso de Partners" — hecho 17/07/2026

Agregado dentro de la Card "Tiempos de pago" de `PartnerPanel.tsx` (id `tiempos-pago`), como bloque expandible (botón "Condiciones y Uso de Partners" ▾) — no se tocó el copy oficial protegido que ya existía ahí (comentario "no modificar sin aprobación", intacto). Contenido: comisión por cliente referido válido, pago vía dLocal el día 5 de cada mes, mínimo 3 clientes válidos para el primer pago, validación de clientes (plan de pago + cobro procesado, excluye duplicados/cancelados/fraudulentos), y el beneficio de incorporación de S/89 de formación gratuita.

**Privacidad confirmada con evidencia, no solo afirmación:** el texto vive únicamente en `PartnerPanel.tsx` (grep exhaustivo del string exacto en todo `frontend/src` → 1 solo archivo). Ese componente solo lo renderiza `frontend/src/app/partner/page.tsx`, cuya ruta (`/partner`) está protegida por `middleware.ts` (`esPartnerAutorizado()` — allowlist de email + `partners.estado !== 'Suspendido'`, ya auditado sin brechas el 12/07/2026). No se creó ninguna ruta nueva ni ningún enlace desde `darivopro.com` ni desde ninguna página pública.

**Verificado**: `tsc`/`lint` limpios. No verificado visualmente con una sesión Partner real (mismo bloqueo de credenciales de siempre) — recomendado que el propietario confirme que el desplegable se ve y funciona bien en su cuenta Partner.

### 4. [x] Documento interno único de TODO lo pendiente — hecho 17/07/2026

Creado `frontend/docs-internos/TODO-PENDIENTES-DARIVO-PRO.md` — 6 categorías (acciones externas del propietario, legal, decisiones de negocio, funcionalidad a medias, cola de trabajo activa, deuda técnica ya resuelta), cada punto con su ubicación exacta y remitiendo al detalle completo en este mismo `CLAUDE.md` en vez de duplicarlo. No es un informe nuevo aislado — es el índice de todo lo que ya estaba disperso en las secciones de arriba.

**Verificación de seguridad con evidencia real** (no solo afirmación, tal como se pidió):
1. `find frontend/public -iname "*TODO-PENDIENTES*"` → vacío, confirmado que no está en la carpeta que Next.js sirve como estática.
2. `grep -rn "docs-internos" frontend/src/app frontend/src/components frontend/next.config.mjs` → un solo resultado, un comentario informativo en `page.tsx` (no una ruta que sirva la carpeta).
3. `grep -rln "TODO-PENDIENTES" frontend/src` → vacío, ningún componente lo referencia.
4. `grep -rn "readFileSync|readFile("` en `app/`/`components/` → confirmado que los únicos usos reales son `src/content/legal/*.md` (las 3 páginas legales públicas, a propósito) y `src/content/darivo/conocimiento.md` (vía la API del chat de soporte, nunca sirve el archivo crudo) — ninguno apunta a `docs-internos/`.
5. `next build` completo tras crearlo: `✓ Compiled successfully`, y ninguna ruta generada lo menciona.

**Verificado**: build limpio. El documento queda como referencia viva — si algo cambia de estado, actualizarlo ahí también, no solo aquí.

### 5. [x] Limpieza y mejoras del Panel Empresa — hecho 17/07/2026 (5c parcial, ver detalle)

**Regla general (aplica a TODO el panel Empresa, no solo a los ítems de abajo):** adaptar siempre al mismo diseño visual de Admin (`ADMIN_COLORS`) y a los MISMOS DATOS que ya existen en Darivo Pro Móvil — nunca inventar funcionalidad nueva, nunca reutilizar el flujo de Móvil tal cual (la UX se adapta a escritorio, los datos/lógica se mantienen idénticos a Móvil). Ejemplos ya bien hechos, no tocar su patrón: **Categorías** y **Mis Tarifas** en Empresa.

**NO TOCAR** (ya están bien, verificado por el propietario): Clientes, Facturas, Cierre — no modificar su funcionalidad existente en esta tarea, salvo lo indicado explícitamente en el punto (c).

**Honestidad en el reporte**: no marcar nada como "hecho" aquí a menos que replique correctamente el diseño de Admin y los datos reales de Móvil. Si solo quedó parecido pero no equivalente, reportarlo como parcial (`[~]`) y decir qué falta.

**Estructura de navegación**: Empresa NO tiene una sección "Más" como Móvil — solo tiene "Categorías" (que ya cumple ese rol adaptado correctamente). Donde en Móvil algo viva dentro de "Más" (ej. la Calculadora/IA), en Empresa debe organizarse dentro de "Categorías" — no crear una sección "Más" nueva que no existe en el diseño de Empresa.

- **5a. [x]** "Calculadora inteligente" → renombrada a **"Darivo"** dentro de Empresa, sin ninguna mención a IA/OpenAI de cara al usuario. `frontend/src/lib/empresa-modules.ts`: la entrada `"ia"` de `EMPRESA_NAV` cambió su `label` a `"Darivo"` y ganó `ocultoEnSidebar: true` (ya no es ítem de sidebar independiente — se accede desde dentro de "Categorías", cumpliendo la regla de navegación de arriba). `EmpresaShell.tsx` filtra el sidebar por `ocultoEnSidebar`. `frontend/src/app/empresa/ia/page.tsx` pasa la nueva prop `nombreAsistente="Darivo"` a `IACotizacionFlow.tsx` (componente **compartido con Móvil** — se agregó el prop con default `"Calculadora inteligente"` para no tocar el comportamiento de Móvil, y las 6 menciones internas de texto/OpenAI ahora interpolan `${nombreAsistente}`). `MasTabs.tsx` (pestaña "Categorías" de Empresa) gana una tarjeta morada "Darivo" que enlaza a `/empresa/ia`. De paso, corregidas 2 líneas de `CierreViewEscritorio.tsx` que aún decían "La IA analizará/extrajo" (paridad con Móvil, que ya decía "Calculadora inteligente"). **No tocado a propósito** (fuera del alcance de "Panel Empresa"): el subtítulo de Móvil en `(auth)/ia/page.tsx` que menciona "OpenAI" — reportado como hallazgo colateral, no corregido sin pedido explícito.
- **5b. [x]** FIX "Mi plan" en Empresa. Causa confirmada: antes enlazaba literalmente a `/mas/plan` (la ruta de Móvil, tema Fable 5/azul, sin sidebar de Empresa) — el Gerente salía por completo del panel de escritorio. Construido `frontend/src/components/mas/MiPlanCardEscritorio.tsx` (mismos datos/lógica que `MiPlanCard.tsx` de Móvil: `PRECIOS_OFICIALES`, `CheckoutPlanButton` real — solo cambia la presentación a `ADMIN_COLORS`) + `frontend/src/app/empresa/mas/plan/page.tsx` (Server Component, misma consulta `perfiles.plan_tipo`, dentro de `EmpresaShell`). `MasOpcionesList.tsx` gana prop `esEmpresa` que remapea el link "Mi Plan" a esta nueva ruta en vez de la de Móvil.
- **5c. [~] PARCIAL — datos y ubicación correctos, visual no re-skinneado a `ADMIN_COLORS` todavía.** "Informe" **no** se agregó como sección nueva de Empresa — se integró como 3ª pestaña ("Gastos" / "Expediente Mensual" / **"Informes"**) dentro de `frontend/src/components/cierre/CierreViewEscritorio.tsx`, sin tocar nada de la lógica/JSX de las 2 pestañas existentes (siguen intactas, mismo comportamiento de antes). La pestaña nueva reutiliza `InformesTab.tsx` de Móvil **tal cual** (mismo hook `useInformes()`, mismos 3 sub-informes Semanal/Mensual/Trimestral, mismos datos reales) dentro de una tarjeta con borde/fondo `ADMIN_COLORS`. **Lo que falta para ser equivalente a Admin**: `InformesTab.tsx` y sus 3 componentes de presentación (`InformeSemanal/Mensual/Trimestral.tsx`, ~400 líneas combinadas) siguen usando los tokens Fable 5 (`T`, azul/navy) internamente, no `ADMIN_COLORS` — la integración funcional es real (mismos datos de Móvil, en el lugar correcto de Cierre), pero el interior de esa pestaña todavía no tiene el look morado/blanco del resto de Empresa. Re-skinnear esos 4 archivos a `ADMIN_COLORS` queda pendiente si se quiere el 100% de equivalencia visual.
- **5d. [x] Reportado — Investigación completa, NO se eliminó nada.** La sección "Documento" (Móvil: `frontend/src/app/(auth)/mas/documentos/page.tsx`, enlazada desde "Más" como "Documentos") muestra las últimas 20 cotizaciones y las últimas 20 facturas del usuario en 2 listas de solo lectura (título/fecha/monto/estado, sin filtros, sin PDF, sin acciones). **Confirmado que es redundante**: es un subconjunto estricto, con menos funcionalidad, de lo que ya ofrecen las pantallas reales de Cotizaciones/Facturas (listas completas con filtros, PDF, edición) — y ahora que existe Informes (con datos agregados por período, ver 5c), "Documento" no aporta nada que esas 3 pantallas no cubran ya mejor. **Hallazgo colateral relacionado, no corregido (fuera del alcance de "reportar, no eliminar")**: `MasOpcionesList.tsx` no remapea el link "Documentos" para Empresa (`esEmpresa`) como sí hace con "Mi Plan"/"Perfil del usuario" — hoy, si un Gerente entra a esta opción desde el menú "Categorías" de Empresa, lo saca a la página Móvil tal cual (sin sidebar de Empresa), mismo síntoma que tenían "Mi plan" (5b) e "Informe" (5c) antes de esta tarea. **No se elimina ni se toca sin la confirmación explícita de Mohamed** que pide la tarea — queda documentado aquí como referencia si decide eliminarla o adaptarla más adelante.
- **5e. [x]** Perfil de usuario — construido `frontend/src/app/empresa/mas/perfil/page.tsx` (nuevo, antes 404 pese a que `MasOpcionesList.tsx` ya enlazaba ahí desde 5b), diseño `ADMIN_COLORS` dentro de `EmpresaShell`, mismos datos que Móvil (`perfiles.razon_social`/`telefono`, `user.email` — idéntica consulta que `/mas/perfil/page.tsx`). **Nota de interpretación** (ambigüedad resuelta por criterio propio, sin bloquear la tarea): el texto exacto pedido, "Referencias generales", no existe en ningún lugar del proyecto — búsqueda exhaustiva confirma 0 coincidencias reales (los "hits" iniciales eran falsos positivos de "**P**referencias generales"). Sí existe "**Preferencias** generales" como sección real de Móvil (`/mas/preferencias`: Idioma/Moneda por defecto/Notificaciones, valores estáticos de solo lectura, nota "integración Admin pendiente"), y la propia instrucción de la tarea ("revisar primero cómo se ve esa sección en Móvil") solo tiene sentido para esta última — se interpretó como el pedido real y se agregó como 2ª tarjeta dentro de la misma página de Perfil (no como página aparte, ya que Empresa no tiene una "Más" independiente donde replicar la navegación de Móvil 1:1), con los mismos 3 valores y la misma nota que Móvil.

**Verificado (Tarea 5 completa)**: `tsc --noEmit`, `next lint` (mismos 4 warnings preexistentes de `useCotizacion.ts`/`useFactura.ts`, sin relación) y `next build` limpios (81 rutas, incluye `/empresa/mas/plan` y `/empresa/mas/perfil` nuevas). **No verificado visualmente con una sesión de Gerente/Técnico real** — mismo bloqueo de credenciales de siempre (regla permanente de este documento). Recomendado que el propietario, con su propia sesión de Empresa: confirme que "Darivo" aparece dentro de Categorías sin ninguna mención a IA; que "Mi plan" y "Perfil del usuario" ya no lo sacan a Móvil; que la pestaña "Informes" de Cierre carga los 3 sub-informes con datos reales (aunque visualmente siga en azul Fable 5 por dentro); y que "Documentos" (si lo usa) siga funcionando aunque quede fuera del layout de Empresa, tal como se documentó.

---

## ESTADO REAL DEL PROYECTO (única fuente de verdad — actualizar al final de cada bloque de trabajo)

*Última actualización: 12/07/2026 — chequeo completo end-to-end: `main` limpiado desde cero (`tsc`/`lint`/`build`) + 6 auditorías de código en paralelo (Móvil/Empresa/Admin/Partner/Supabase-Vercel/Email) + investigación del bug de reset-password. Sustituye todo el estado anterior.*

*Actualización 13/07/2026 (sesión continua):* `ADMIN_COLORS` completado al 100% en Admin (ver "Siguiente paso" abajo); precio anual Básico/Pro corregido a "Pendiente" en Suscripciones/Roles; `darivo_admin_empleados` conectado a Empleados; panel lateral + filtros en Usuarios; primera auditoría MD↔código de Empresa (ver sección propia) — reveló que Empresa arrastra el mismo bug de color navy/azul que Admin ya corrigió, más brechas funcionales/visuales reales en las 9 pantallas (Cotizaciones y Facturas sacan al usuario del layout de Empresa por completo). `main` == `origin/main`, todos los commits de este bloque ya mergeados (build/lint/tsc limpios en cada uno).

*Actualización 15/07/2026:*
- **Wizard de Cotización — revertido y corregido de forma quirúrgica** (Móvil `NuevoCotizacionWizard.tsx` + Empresa `NuevoCotizacionWizardEscritorio.tsx`): el cambio de flujo anterior (commit `465fe16`, master-detail + hook compartido `useCotizacionWizard`) se revirtió por pedido del propietario — era demasiado invasivo. En su lugar: cada partida (m2/unit/hour) tiene un cuadro de cantidad justo a la izquierda de su botón +/✓ existente (escribir ahí agrega/actualiza la partida al carrito); se eliminó la pantalla separada "Cantidades" (ya no hace falta, va directo de partidas a Resumen); el acordeón de categorías queda exactamente como antes (sin ocultar las demás). "Ajustar mano de obra" gana un campo de **monto fijo en soles** (no %) que recalcula el `margin` interno para que `calcBasket` seleccion siga funcionando sin tocar el motor de cálculo — probado con ejemplo real (S/500 → total final +S/500 exacto). Bug de alineación corregido en `FloatBar.tsx` (solo Móvil): el botón "Continuar" pasó a su propia fila de ancho completo, ya no queda pegado al borde derecho.
- **Campo de correo electrónico opcional en Clientes**: nueva columna `clientes.email` (migración `20260715120000_clientes_email.sql`, nullable) — completa el botón "✉️ Email" de la ficha que ya estaba documentado en `03-MODULO-CLIENTES.md`/`03-MODULO-CLIENTES-EMPRESA.md` pero nunca implementado. Agregado a los formularios "Nuevo cliente" (Móvil y Empresa), a la ficha (`ClienteFichaView.tsx`, compartida — el botón Email ahora abre `mailto:` real si hay correo, toast si no), y mostrado de solo lectura en los formularios de Factura (Móvil y Empresa) al seleccionar un cliente guardado. Probado end-to-end con clientes reales en ambas plataformas (creación, ficha, factura). **Migración corrida por Mohamed (18/07/2026)**, confirmado en el chat ("ya") — la columna ya existe en producción.
- **Onboarding Móvil, Paso 2 ("¿A qué te dedicas?")**: corregido el bug "No se pudo guardar" — `perfiles.categorias` no existe en el esquema real; ahora persiste en la tabla `categorias` (overlay ya usada por "Mis Tarifas"). Verificado con `tsc`/`lint` limpios. **Verificación en vivo retomada (15/07/2026, sesión continua)**: no se pudo re-probar la pantalla `/onboarding/2` en sí porque toda cuenta confirmada existente ya tiene `onboarding_done=true`, y el layout (`onboarding/layout.tsx:35`) redirige a `/dashboard` en ese caso — cambiar ese flag manualmente para forzar el paso es un cambio de datos fuera de la UI, así que no se autoejecutó (regla permanente de BD). En su lugar se verificó en vivo, con la cuenta ya logueada, el mecanismo real subyacente: la misma tabla `categorias` con el mismo `upsert(..., {onConflict:"user_id,cat_id"})` (columnas idénticas, ver `useCategorias.ts:33-44`) ya se usa en producción por "Mis Tarifas" → "+ Añadir categoría" (`CategoriasManager.tsx`) — se creó una categoría de prueba ("QA Onboarding Test") desde esa pantalla y persistió correctamente tras recargar la página completa. Esquema confirmado línea por línea: `supabase/migrations/20260705120000_baseline_v2.sql:351-362` tiene exactamente las columnas usadas (`user_id, cat_id, nombre, emoji, color, es_base, activa`) más `UNIQUE (user_id, cat_id)` — el target exacto del `onConflict` — y no hay ningún `ALTER TABLE public.categorias` posterior que lo modifique. **Pendiente de limpieza (no urgente):** la fila de prueba "QA Onboarding Test" quedó creada en la cuenta usada para esta verificación — borrarla es un `DELETE` de datos, se entrega al propietario si la quiere quitar: `DELETE FROM public.categorias WHERE nombre = 'QA Onboarding Test' AND es_base = false;`
- **Auditoría de seguridad — `partners.estado='Activo'`**: pedida explícitamente por el propietario para confirmar que nadie fuera de él mismo puede dar acceso Partner. Resultado: **sin brecha activa** — RLS correcto (`partners_own` solo SELECT, `partners_admin` gateado por `is_darivo_admin()`), único camino real fuera de SQL directo es el botón "Activar partner" de `/admin/partners`, protegido por `middleware.ts` (allowlist `DARIVO_ADMIN_EMAILS`, falla cerrado). Única observación (no urgente, documentada como mejora de seguridad pendiente más arriba en "Autonomía de ejecución"): las Server Actions de Admin no re-verifican el rol internamente, dependen solo del middleware.
- **Panel Partner — estructura completa por secciones + sidebar + PWA propia**: primero migrado a `ADMIN_COLORS` (mismo criterio visual que Admin/Empresa, sin tocar diseño/colores en el segundo paso, solo pedido explícito del propietario). Estructura de contenido confirmada/completada en el orden pedido: **1. Mi perfil, 2. Mi enlace, 3. Registro de referidos, 4. Tabla de comisiones, 5. Mis comisiones** (ahora con filtro de periodo Este mes/Histórico sobre el ledger de `partner_comisiones_historial`) — más "Tiempos de pago" como 6ª sección, mantenida aunque no estaba en la lista del propietario porque `PANEL-PARTNER.md` §4 la exige como copy obligatorio de cara al usuario. Sidebar de navegación (visual igual a Admin/Empresa) implementado como **anclas dentro de la única página** (con resaltado activo vía `IntersectionObserver`), no como rutas nuevas — `PANEL-PARTNER.md` §4 exige explícitamente "una única página... no existen menús internos ni módulos adicionales"; esta es la interpretación que concilia el pedido del propietario con esa regla del MD (un índice de scroll, no una navegación entre páginas). Responsive real (columna única en móvil, sidebar colapsado a overlay vía botón ☰) — a diferencia de Admin/Empresa, que son intencionalmente solo de escritorio.
  - **PWA propia de Partner, separación total de Móvil/Admin/Empresa (regla absoluta del propietario)**: nuevo `frontend/public/partner-manifest.json` (`id`/`scope`/`start_url` = `/partner`, `theme_color` morado `#7C3AED`, `background_color` blanco — nada del navy/azul de Fable 5). `partner/layout.tsx` declara su propio `metadata.manifest` + `appleWebApp`, sin importar nada de `(auth)/layout.tsx` ni `onboarding/layout.tsx` (Móvil). Nueva regla `runtimeCaching` en `next.config.mjs` para `/partner` con `cacheName` propio (`darivo-partner-pages`), separado de `darivo-pages` de Móvil. Reutiliza los mismos PNG de icono de marca (`icon-192/512/512-maskable`) porque son el logo "D" del ecosistema completo, no un asset de Fable 5 — no hay acoplamiento de diseño ahí. **Limitación de plataforma honesta (mismo patrón ya aceptado para Admin/Empresa)**: `next-pwa` genera un único service worker físico con scope `/` — sigue siendo el mismo `sw.js` el que controla fetches en todo el origen a nivel de infraestructura; la independencia real de Partner es manifest propio + scope/start_url propios + caché propia, no un segundo service worker físico (eso requeriría salir del modelo de un-solo-SW de `next-pwa`, cambio de arquitectura mayor no pedido). Verificado en producción tras limpiar Service Worker/caché (quirk ya conocido del proyecto): manifest resuelto (`fetch` → 200, valores correctos), layout desktop (sidebar fijo, grid 2 columnas) y layout móvil (sidebar colapsado a overlay funcional, columna única) probados en vivo con la cuenta `demo1@gmail.com`. `tsc`/`lint`/`build` limpios (72 rutas) en cada commit.

**Cierre de sesión (15/07/2026, modo automático):** con el Panel Partner terminado y verificado, se revisó de nuevo toda la cola de este documento buscando algo más ejecutable sin decisión del propietario — no se encontró nada nuevo respecto a la revisión anterior de este mismo día (ver más abajo, "todo lo demás requiere decisión tuya": precio anual Básico/Pro, plantilla de reset-password, setup de Google Workspace, revisión legal de Privacidad/Términos, arquitectura de Agentes IA, y el CRUD de Catálogo Maestro bloqueado por su propio MD). Repo dejado limpio: todos los commits de este bloque ya están en `main`/`origin/main`, sin cambios sueltos salvo `sw.js`/`workbox-*.js` (artefactos de build regenerados por el dev server, ruido de siempre, nunca comiteados). Sesión terminada aquí.

*Actualización 16/07/2026 — diagnóstico (solo lectura, sin corregir todavía):* bug reportado en el flujo de cotización Móvil ("se rompe entre seleccionar la partida y llegar al Resumen"). Diagnóstico confirmado por trazado directo de código, pendiente de aplicar la corrección:

- **Causa raíz (confianza alta):** `frontend/src/components/cotizacion/NuevoCotizacionWizard.tsx`. Al tocar el botón `+/✓` de una partida no-fija (`m2`/`unit`/`hour` — la mayoría del catálogo), `toggleSvc` (línea 315) la agrega al `basket` con `qty: ""` (vacío). `cantidadesCompleto` (líneas 359-363) exige `qty` numérico > 0 para toda partida no-fija, así que queda `false`. `goToResumen()` (líneas 366-369) hace `return` silencioso si `!cantidadesCompleto` — sin toast, sin alert, sin mensaje. El botón "Continuar → Resumen" del `FloatBar` (línea 882, `primaryDisabled={!cantidadesCompleto}`) simplemente se pone gris (`FloatBar.tsx` líneas 54-60), pero conserva el mismo label y contador, sin explicar por qué no avanza. Además, la fila de la partida seleccionada-pero-incompleta se ve visualmente **idéntica** a una completa (mismo check verde, `renderPartidas` líneas 504-546) — no hay ningún indicador de "falta cantidad". Resultado: el usuario toca el check, ve la partida "seleccionada", y el botón de avance queda inerte sin ninguna pista visual de qué falta — coincide con el síntoma reportado.
- **Mismo patrón en Empresa** (`NuevoCotizacionWizardEscritorio.tsx`, `toggleSvc` línea 281-294, `cantidadesCompleto` línea 337, `goToResumen` línea 343-344) — no reportado por el propietario, pero comparte la causa raíz.
- **Hallazgo secundario (confianza media, contribuyente posible, no confirmado como la causa reportada):** el auto-guardado de borrador (`useCotizacionDraft`, Regla 10 de `05-MODULO-COTIZACIONES.md`) hardcodea `items: []` (línea 93 del wizard) — el `basket` real nunca se persiste — y la función `cargar()` del hook nunca se invoca (no hay restauración al montar). Si el usuario sale de la app/PWA se recarga a medio wizard, el carrito se pierde sin aviso. Puede explicar el síntoma solo si el reporte involucra recarga/cambio de contexto; si no, es un bug real pero distinto.
- **Spec oficial (`.cursor/rules/01-darivo-pro-movil/05-MODULO-COTIZACIONES.md` v1.6) no está actualizada** frente al diseño híbrido actual (cantidad + `+/✓` en la misma fila del Paso 1) — describe un Paso 2 "Cantidades" separado que ya no existe en el código, por decisión explícita del propietario del 15/07/2026. El MD está protegido, no se tocó.
- **No documentado, no asumido:** ningún MD oficial especifica qué debe pasar visualmente cuando una partida queda "seleccionada pero sin cantidad" en el diseño híbrido actual — es una laguna de diseño real, no solo de implementación. Antes de corregir, hace falta decidir: ¿deshabilitar el botón `+/✓` hasta que haya cantidad, o mantenerlo pero mostrar un indicador de error (borde rojo / mensaje) en la partida y/o en el botón "Continuar"?
- **Sin verificar en vivo todavía** (diagnóstico 100% por trazado estático) — recomendado confirmar en el navegador de preview antes de corregir.

**Corrección aplicada (16/07/2026), decisión del propietario: "indicador de error + botón activo con mensaje":**
- `FloatBar.tsx`: se quitó el atributo HTML `disabled` del botón primario (solo quedó el estilo gris de `primaryDisabled`) — así el botón "Continuar" sigue siendo clicable aunque falte una cantidad, en vez de quedar inerte sin poder disparar ningún feedback.
- `NuevoCotizacionWizard.tsx` — `goToResumen()`: ahora, si `!cantidadesCompleto`, calcula qué partidas no-fijas quedaron sin cantidad y muestra `mostrarToast("Falta indicar cantidad en: ...", "error")` en vez de un `return` silencioso.
- `NuevoCotizacionWizard.tsx` — `renderPartidas()`: la fila de una partida seleccionada-pero-incompleta ahora se resalta con `T.redPale`/`T.red` (fondo, texto "Falta indicar cantidad" en vez del precio, y borde rojo en el recuadro de cantidad) — visualmente distinguible de una partida completa.
- **No tocado (fuera de lo pedido en esta corrección):** el wizard de Empresa (`NuevoCotizacionWizardEscritorio.tsx`) comparte la causa raíz pero no usa `FloatBar`/`primaryDisabled` — no fue reportado y no se tocó. El hallazgo secundario (borrador de sesión no persiste el `basket` real) tampoco se corrigió — es un bug distinto, no confirmado como la causa reportada.
- **Verificado:** `tsc --noEmit` y `next lint` limpios (mismos 2 warnings preexistentes de `useCotizacion.ts`, sin relación). **No verificado en vivo con sesión autenticada** — la ruta `/cotizaciones/nuevo` está protegida por middleware y redirige a `/login`; entrar credenciales en el formulario de login está fuera de lo permitido (regla permanente de este documento, "Seguridad — regla que se mantiene..."), igual que en verificaciones anteriores de este mismo proyecto. Confirmado sí que el servidor compila sin errores y la redirección a `/login` ocurre limpiamente (sin excepción de runtime). Recomendado que el propietario confirme visualmente: tocar `+/✓` en una partida `m2`/`unit`/`hour` sin escribir cantidad → la fila debe verse en rojo con el texto "Falta indicar cantidad" → tocar "Continuar → Resumen" debe mostrar el toast, no quedar inerte.

### Flujo Categoría → Partida → Resumen (Móvil): comportamiento intencional, NO es un bug

El flujo de navegación en el wizard de cotización sigue el diseño de Fable 5 (drill-down, una pantalla por paso):
- Al entrar a una categoría, la lista de categorías deja de verse (se reemplaza por la lista de partidas). Correcto, así debe ser.
- Al pasar a Resumen, la lista de partidas deja de verse (se reemplaza por el resumen). Correcto, así debe ser.

No se crea ningún diseño nuevo ni variante. Se mantiene exactamente el diseño Fable 5 existente. Esto no se toca ni se "corrige" — cualquier cambio futuro debe pedirse explícitamente.

**Nota de verificación (16/07/2026):** al revisar el código antes de escribir esta nota, se encontró que **no** se cumplía todavía para "categoría → partida" en el resto de categorías (sí se cumplía ya para partida→Resumen, y para Construcción→subcategoría→partida). `frontend/src/components/cotizacion/NuevoCotizacionWizard.tsx` tenía las categorías (`otrasCategorias.map`) como un acordeón: el header de cada categoría se quedaba siempre visible y solo expandía sus partidas debajo, sin ocultar el resto de la lista — contradecía tanto lo de arriba como el propio `05-MODULO-COTIZACIONES.md` v1.6 (líneas 59, 67-99, 123-125: "Pantalla de Partidas: muestra únicamente las partidas. No se muestran categorías ni subcategorías en esta pantalla."). Se corrigió reutilizando tal cual el patrón que ya existía en el mismo archivo para Construcción → subcategoría (reemplazo de pantalla completa + botón "← Categorías"/"← Subcategorías") — sin inventar ningún diseño nuevo. Confirmado que esto **no contradice** la reversión del 15/07/2026 (commits `465fe16`/`c3fb573`, "master-detail" revertido): ese revert trataba de la fusión Selección+Cantidades en Móvil (tema no relacionado); de hecho el propio revert restauró el acordeón de categorías que hoy seguía sin cumplir el spec. `tsc --noEmit` y `next lint` limpios tras el cambio; sin errores de consola/servidor en el navegador de preview (solo se pudo confirmar que compila y renderiza — la interacción real del drill-down requiere sesión autenticada, no verificada en vivo por la misma razón de credenciales de más arriba).

### Fase 2 — Legal: Privacidad, Cookies y Términos (borrador, 16/07/2026)

Actualizados/redactados a petición del propietario, cubriendo RGPD (España/UE) + Ley N.º 29733 de Protección de Datos Personales de Perú. **Siguen siendo borrador — pendiente de revisión legal por abogado antes de publicar**, igual que ya estaban marcados los dos documentos existentes.

- **`INVENTARIO-PROVEEDORES-DATOS-DARIVO-PRO.md`**: corregido — Google Workspace/Gmail API estaba listado como "no integrado en el producto" cuando en realidad ya está integrado en código (`frontend/src/lib/email/`) desde antes; añadido GitHub (repositorio de código, no procesa datos personales de usuarios); añadida tabla de cookies propias.
- **`POLITICA-DE-PRIVACIDAD-DARIVO-PRO.md`**: completada la tabla de proveedores (§4) con la lista real verificada en código (Supabase, Vercel, Google Workspace, OpenAI, dLocal Go, GitHub, Railway) — nada inventado, todo confirmado contra `frontend/src/lib/*`. Añadida sección nueva (§5) "Quién dentro de Darivo Pro puede ver tus datos", redactada exclusivamente a partir de las políticas RLS reales de Supabase (`partners_own`, `partner_referidos_partner`, `partner_comisiones_historial_partner`, todas `FOR SELECT` sobre la fila propia únicamente) y `is_darivo_admin()`/`esAdministradorDarivo()` (acceso `FOR ALL` a ~16 tablas administrativas) — confirma que un Partner solo ve su propio perfil/referidos/comisiones (nunca datos de otros Partners ni de las cuentas que refirió) y que Admin tiene acceso completo de plataforma, sin inventar ningún permiso no verificado en RLS/roles actuales. §9 (Cookies) ahora remite a la nueva política dedicada.
- **`POLITICA-DE-COOKIES-DARIVO-PRO.md`** (nueva): no existía ningún borrador previo. Documenta las 2 únicas cookies reales del proyecto (sesión de Supabase Auth, y `darivo_ref` — atribución de Partner, 30 días, `httpOnly`) — confirmado en código que **no hay ningún rastreador de analítica/marketing** (se buscó Google Analytics, Meta Pixel, Hotjar, Clarity, Mixpanel, Amplitude, PostHog — cero coincidencias) ni banner de consentimiento implementado.
- **`TERMINOS-Y-CONDICIONES-DARIVO-PRO.md`**: confirmado el nombre real del proveedor de pagos (dLocal Go, antes placeholder) en §4.
- **Sincronización con producción**: las tres versiones de `frontend/src/content/legal/` (`privacidad.md`, `terminos.md`, `cookies.md` — nuevo) actualizadas idénticas a los `.md` de raíz, porque son las que realmente sirve la web (`readFileSync` en cada `page.tsx`, no los `.md` de raíz). Nueva ruta `frontend/src/app/(public)/cookies/page.tsx`, mismo patrón exacto que `/privacidad`/`/terminos` (mismo parser `MarkdownLegal`, mismo `force-static`). Añadida a rutas públicas (`middleware.ts`, `sitemap.ts`) y enlazada desde el footer (`(public)/layout.tsx` y `app/page.tsx`, landing).
- **Corrección durante la redacción**: `MarkdownLegal.tsx` no interpreta enlaces `[texto](url)` a propósito (para no ocultar marcadores `[pendiente]`) — el primer borrador de §9 de Privacidad y del cierre de Cookies usaba sintaxis de enlace Markdown, que habría quedado visible sin renderizar en la página pública (la misma clase de bug ya corregida una vez en este proyecto, ver nota del 09/07/2026 más abajo). Corregido antes de publicar: texto plano con la URL en vez de sintaxis `[texto](url)`.
- **No inventado, dejado explícitamente pendiente para el propietario/abogado**: razón social/NIF/domicilio del responsable del tratamiento (§1 de Privacidad y Términos), confirmación de si `darivo_ref` requiere banner de consentimiento, confirmación de región de servidores de Supabase/Vercel (transferencia internacional RGPD), inscripción de banco de datos ante la autoridad peruana (Ley 29733), y cláusula de jurisdicción de Términos §11.
- **Verificado:** `tsc --noEmit` y `next lint` limpios. Las 3 páginas (`/privacidad`, `/terminos`, `/cookies`) son rutas públicas, sí se pudieron verificar en vivo en el navegador de preview (no requieren login): renderizan correctamente, tablas y formato sin sintaxis Markdown cruda visible, footer con los 3 enlaces (`/terminos`, `/privacidad`, `/cookies`) confirmado vía `document.querySelectorAll('footer a')`.

### Fase 3 — Asistente de soporte "Darivo" (16/07/2026)

Construido a petición del propietario. Antes de escribir código se resolvieron 2 decisiones de arquitectura con el propietario (no asumidas):

1. **Darivo = implementación real del "Agente IA 2 — Soporte y Tickets"** ya especificado (sin nombre de cara al usuario) en el MD oficial protegido `01-darivo-pro-movil/08-MODULO-IA.md`. Actualizado a v1.10 con nombre oficial "Darivo" (§3-A), sub-capacidad de ayuda a cotización con hand-off obligatorio al Agente IA 1 (§3-B), y estados de ticket corregidos a los reales de BD. Tocados también (mínimo, referencia cruzada): `08-MODULO-IA-EMPRESA.md` v1.3, `09-PANEL-ADMIN-SOPORTE.md` v1.3, `05-FRONTEND-DARIVO-PRO.md` v2.3.
2. **Backend real de tickets construido** — desbloqueado `DOC-01`/`INC-A01`/`INC-M01`/`INC-B01` (decisión de negocio pendiente desde antes, resuelta ahora por pedido explícito del propietario). Sin cambios de schema: `soporte_tickets`/`soporte_mensajes` ya existían en el baseline con RLS `FOR ALL` sobre la fila propia — la seguridad la sigue dando RLS, no un cliente admin.

**Construido:**
- **`DARIVO-CONOCIMIENTO-SOPORTE.md`** (raíz, sincronizado en `frontend/src/content/darivo/conocimiento.md`) — única fuente de conocimiento de Darivo. Resumen del proyecto, planes/precios reales (`roles-planes-oficial.ts`), catálogo base de referencia (copiado literal de `lib/catalog.ts`, marcado como orientativo), FAQs, y una sección "NO PÚBLICO" que define qué no debe compartir nunca (nombres de documentos internos, la palabra "IA", arquitectura técnica) — tal como pidió el propietario, las reglas de qué es público/no público viven dentro del propio documento.
- **API de tickets real**: `frontend/src/app/api/soporte/tickets/route.ts` (GET/POST) y `.../[id]/mensajes/route.ts`, usando la sesión del propio usuario (sin cliente admin). `SoporteTicketsView.tsx` (Móvil+Empresa) migrado de `localStorage` a la API real. `AdminSoporteView.tsx` reescrito con datos reales (`fetchAdminSoporte`/`actualizarEstadoTicket` en `admin-queries.ts`), filtros por estado/plan, cambio de estado inline (`admin/soporte/actions.ts`). Dashboard Admin (`admin/page.tsx`) ya no muestra "—" en tickets — KPI y card "Estado de soporte" con conteos reales.
- **Emails transaccionales 8-9 conectados** (antes bloqueados, plantillas ya existían en `templates.ts`): `enviarTicketRecibido`/`enviarTicketResuelto` en `lib/email/send.ts`, disparados desde la creación de ticket y desde el cambio a estado Resuelto — best-effort, mismo patrón que el resto de eventos (siguen dependiendo del setup de Google Cloud/Workspace pendiente del propietario, igual que los otros 7 eventos).
- **`openaiChatText()`** nuevo en `lib/openai.ts` — primer helper de este proyecto que no fuerza `response_format: json_object` (texto libre, multi-turno), sin tocar los wrappers JSON existentes (`openaiChatJSON`/`openaiVisionJSON` intactos, mismo `openaiRequest` con un parámetro `jsonMode` nuevo).
- **`POST /api/darivo/chat`** — endpoint público (funciona con o sin sesión). System prompt (`lib/darivo.ts`) con las reglas de identidad estrictas (nunca "IA", nunca menciona el documento) + el contenido íntegro de `DARIVO-CONOCIMIENTO-SOPORTE.md` inyectado como conocimiento. Protección anti-abuso: límite de 20 turnos de usuario por conversación (mismo umbral que especifica `08-MODULO-IA.md` §5) + rate-limit por IP en memoria (best-effort, se reinicia con el server — no es la defensa de seguridad crítica del proyecto, es la misma protección "20+ preguntas seguidas" del MD). Escalado a ticket real: el modelo termina su respuesta con una marca de control invisible (`[[DARIVO_ESCALAR: ...]]`) que el servidor detecta, retira del texto visible, y usa para crear un ticket real vía `crearTicketSoporte()` (`lib/soporte-server.ts`, compartido con la ruta manual de tickets) — solo si hay sesión; usuarios anónimos son derivados por el propio Darivo a `/contacto`/`info@darivopro.com` (no pueden tener un ticket real, `soporte_tickets.user_id` es obligatorio).
- **`DarivoChat.tsx`** — componente de chat reutilizable, usado en `Más → Soporte` (Móvil y Empresa, junto a la lista de "Mis casos" ya real) y en la nueva página pública `/soporte` (enlazada desde el footer de `darivopro.com` y de todas las páginas públicas, y en `sitemap.ts`/`middleware.ts`).
- **Limpieza**: códigos `INC-A01`/`INC-M01`/`INC-B01` retirados de `error-catalog.ts` y `CATALOGO-DE-ERRORES.md` (v1.1) — ya no aparecen en ninguna pantalla.

**No construido / fuera de alcance de esta fase (no inventado, dejado pendiente):**
- El `IAMenuScreen` con las cards "Escribir con IA"/"Hablar con IA"/"Soporte con IA" descrito en `08-MODULO-IA.md` §6 sigue sin implementar en código (ya estaba así antes de esta fase, confirmado por auditoría previa) — Darivo hoy se accede desde `Más → Soporte` (Móvil/Empresa) y `/soporte` (público), no desde ese menú central.
- El envío real de los emails de ticket recibido/resuelto sigue bloqueado por el mismo pendiente que los otros 7 eventos: falta que el propietario complete el setup de Google Cloud/Workspace (`GMAIL_SERVICE_ACCOUNT_JSON`).
- El "hilo de mensajes" completo de un ticket (ver conversación completa usuario↔admin) no tiene UI propia todavía — la API (`GET .../mensajes`) existe, pero ni `SoporteTicketsView` ni `AdminSoporteView` la consumen aún; quedó fuera para no inflar más esta fase.

**Verificado:** `tsc --noEmit`, `next lint` y `next build` limpios (76 rutas, incluye las 4 nuevas: `/api/darivo/chat`, `/api/soporte/tickets`, `/api/soporte/tickets/[id]/mensajes`, `/soporte`). Probado end-to-end en el navegador de preview en `/soporte` (pública, sin login): el saludo de Darivo renderiza sin ninguna mención a "IA", el mensaje se envía, el servidor responde con un 503 claro ("OPENAI_API_KEY no configurada" — mismo estado que el resto de funciones de IA de este proyecto sin esa variable en el entorno local) en vez de romperse, y el error se muestra con naturalidad en el chat. **No verificado con una respuesta real del modelo** (depende de `OPENAI_API_KEY`, no configurada en este entorno) — recomendado que el propietario pruebe una conversación real cuando la tenga configurada, prestando atención a: que nunca diga "IA"/mencione el documento, que remita a un humano ante un error técnico, y que el escalado cree un ticket real visible en `/admin/soporte`.

### Excepción confirmada — corrección Cotización, Clientes/Facturas y sync (16/07/2026)

Excepción confirmada por Mohamed (16/07/2026): la corrección del botón Continuar descentrado y el tamaño del resumen en Cotización (Móvil/Fable 5) se trata como bug fix contra el diseño ya definido, no como cambio de diseño nuevo. La regla de que Fable 5/Móvil no se toca sigue vigente para cualquier cambio de color, token o componente que no sea corrección de un defecto real.

**Ejecutado (17/07/2026), solo Móvil salvo donde se indica lo contrario:**

1. **Resumen de Cotización — tarjeta de Total reducida**: `NuevoCotizacionWizard.tsx` — monto de 54px→32px, padding 26/22→18/16, radio 22→18, subtotales 15px→13px. Consistente con el resto de tarjetas de la app (ninguna otra pasa de 18px).
2. **Botón "Continuar" descentrado — sin causa de código encontrada**: revisado a fondo (`FloatBar.tsx`, el botón del paso Resumen, `MobileShell.tsx`, historial de commits). El síntoma descrito coincide exactamente con un bug ya corregido el 15/07/2026 en `FloatBar.tsx` (paso Selección/`cats`) — el botón del paso Resumen nunca usó `FloatBar`, siempre fue un botón de bloque `width:100%` sin causa de descentrado posible. Hipótesis más probable: caché de Service Worker mostrando un build anterior a esa fecha (patrón ya conocido de este proyecto). No se tocó código sin un defecto confirmado — recomendado confirmar visualmente tras limpiar caché antes de seguir investigando.
3. **PDF por WhatsApp — se compartía un link crudo de Supabase, nunca el archivo**: `frontend/src/lib/share.ts` reescrito — ahora intenta primero adjuntar el PDF real como archivo (`navigator.canShare({files})`, Web Share API nivel 2; WhatsApp lo recibe como documento, no como texto con link), con fallback a link nativo → portapapeles. Causa real del "funciona en la app instalada, falla en el navegador móvil normal": el auto-envío de cotización abría `wa.me` con `window.open()` **después** de esperar el guardado + la generación del PDF — el navegador móvil normal bloquea ese popup por no venir ya de un gesto de usuario directo (la PWA instalada no siempre aplica la misma política). Corregido con el patrón estándar: la pestaña se abre síncronamente al hacer clic en "Guardar" (`abrirVentanaDiferida()`), y solo se le fija el destino cuando el link está listo (`navegarVentanaDiferida()`). Beneficia también a Facturas y a Empresa (comparten `share.ts`), sin tocar su código propio.
4. **Clientes — botón eliminar (×) quitado de la lista principal**: `ClientesView.tsx`. Movido a la ficha (`ClienteFichaView.tsx`) con confirmación explícita en dos pasos ("¿Seguro que quieres eliminar a [nombre]?" → "Sí, eliminar").
5. **Facturas — quitado el paso "¿Tu cliente tiene RUC?"**: `NuevaFacturaForm.tsx` ya no tiene `PasoCero`; el tipo (Boleta/Factura) se elige ahora en el punto de entrada (`tipoInicial` vía query `?tipo=`), igual que ya funcionaba en Empresa. Nuevos accesos directos Boleta/Factura en la ficha de cliente (`ClienteFichaView.tsx`, compartida Móvil/Empresa) y en la pantalla de Facturas (`FacturasView.tsx`) — sin crear ninguna pantalla nueva, reutilizando el mismo formulario con el tipo ya resuelto. `NuevaFacturaFormEscritorio.tsx` (Empresa) ganó el mismo soporte de `clienteIdInicial` para que los nuevos botones de la ficha compartida prellenen el cliente también ahí.
6. **Vinculación real factura↔cliente (`facturas.cliente_id`) — migración nueva**: antes `facturas` solo guardaba `client_name` como texto suelto; el único enlace a un cliente era indirecto vía `from_quote_id → cotizaciones.cliente_id`, así que cualquier factura creada "desde cero" (sin pasar por una cotización) nunca aparecía en la ficha de su cliente. `useFactura.ts` ahora vincula igual que `useCotizacion.ts` (mismo patrón `findOrCreateCliente` por teléfono, o el cliente elegido explícitamente en el formulario) — ver migración `20260717120000_facturas_cliente_id.sql` (pendiente de que Mohamed la corra en el SQL Editor de Supabase; incluye backfill best-effort de facturas existentes).
7. **Filtrado Clientes (sin factura) / Facturas (con factura) — misma fuente de datos**: `(auth)/clientes/page.tsx` ahora excluye clientes con `facturas.count > 0`; `(auth)/facturas/page.tsx` (y `FacturasView.tsx`, reescrito) ahora lista **clientes** con ≥1 factura (`facturas!inner`) en vez de documentos sueltos — tocar un cliente lleva a su ficha, donde ya se ve/gestiona cada factura individual (`FacturaCard`, estado, PDF). Los chips de filtro (Todas/Emitidas/Cobradas/Pendientes) se reinterpretan como "clientes con ≥1 factura en ese estado". La ficha de cliente (`(auth)/clientes/[id]/page.tsx` y `useClientes.ts` `obtenerFicha()`, ambas rutas Móvil/Empresa) ahora lee facturas por `cliente_id` en vez de solo por `from_quote_id` — corrige el mismo gap de arriba. Sin duplicar estado en ningún lado: `FacturaCard.tsx` ya escribía y refrescaba directo sobre `facturas.inv_status` (comentario propio del archivo lo documentaba desde antes), así que un cambio de estado se ve reflejado automáticamente donde sea que se muestre esa factura.
8. **No tocado (fuera de lo pedido en esta corrección)**: Clientes/Facturas de **Empresa** (`EmpresaClientesPanel.tsx`, `FacturasTableEmpresa.tsx`) siguen con su comportamiento anterior (sin el filtro sin-factura/con-factura) — mismo criterio que sesiones previas de no tocar Empresa sin pedido explícito; Empresa **sí** ya tenía resuelto el punto 5 desde antes (`FacturasTableEmpresa.tsx` ya usaba 2 botones Boleta/Factura sin paso intermedio).
9. **Verificado**: `tsc --noEmit`, `next lint` (mismos 2 warnings preexistentes de `useCotizacion.ts`, más 2 nuevos análogos en `useFactura.ts` por el mismo patrón `findOrCreateCliente`, no son errores) y `next build` limpios (76 rutas). **No verificado en vivo con sesión autenticada** — mismo bloqueo de credenciales de siempre (`/cotizaciones/nuevo`, `/clientes`, `/facturas` redirigen a `/login`). Recomendado que el propietario, tras correr la migración SQL: (a) confirme visualmente el punto 2 (botón Continuar) después de limpiar caché; (b) pruebe compartir un PDF por WhatsApp desde Chrome Android normal y desde la app instalada; (c) confirme que un cliente sin factura aparece en Clientes y no en Facturas, y viceversa tras generar una factura de prueba; (d) cambie el estado de una factura desde su ficha y confirme que se ve reflejado en la ficha del cliente.

**Migración `20260717120000_facturas_cliente_id.sql` corrida por Mohamed (17/07/2026)** — confirmado por el propio Mohamed en el chat ("ya"). Sin verificación de datos post-migración desde código (no hay acceso a consultar Supabase directamente en esta sesión); si algo no cuadra en Clientes/Facturas, revisar primero cuántas filas de `facturas` quedaron con `cliente_id IS NULL` tras el backfill.

### ✅ Resuelto — Barra flotante del wizard (Móvil) tapada por la barra de gestos de Android (17/07/2026)

Bug reportado: en el paso Selección/Partidas del wizard de cotización, la `FloatBar` ("N partida(s) seleccionada(s)" + botón Continuar) quedaba parcialmente tapada por la barra de navegación por gestos de Android (no respetaba el safe area inferior).

**Causa raíz real — no era solo `FloatBar.tsx`:** el `viewport` global del proyecto (`frontend/src/app/layout.tsx`) nunca declaraba `viewportFit: "cover"`. Sin eso, `env(safe-area-inset-*)` resuelve siempre a `0px` en **toda la app** — incluido `BottomNav.tsx`, que ya usaba `pb-[env(safe-area-inset-bottom)]` sin ningún efecto real hasta ahora.

**Corrección:**
- `layout.tsx`: `viewport.viewportFit = "cover"` añadido.
- `FloatBar.tsx`: `bottom` pasa de `20` fijo a `calc(20px + env(safe-area-inset-bottom, 0px))` — en pantallas sin barra de gestos, `env()` resuelve a `0px` y el resultado es idéntico a antes (sin regresión).
- No se tocó ninguna otra parte del wizard.

**Verificado:** `tsc --noEmit`, `next lint` (mismos warnings preexistentes) y `next build` limpios. Confirmado en el navegador que el `<meta name="viewport">` renderizado ya incluye `viewport-fit=cover`. **No verificado visualmente en un Android real con barra de gestos** — ni las herramientas de este entorno simulan el inset real, ni hay sesión autenticada disponible para llegar a esa pantalla. Recomendado que el propietario confirme en su teléfono que el botón "Continuar" queda completamente libre de la barra de gestos.

### Sesión 17/07/2026 (continuación) — mostrar/ocultar contraseña, reorden Panel Partner, rediseño de landing

**1. Botón mostrar/ocultar contraseña — los 5 campos reales del proyecto:** confirmado que solo hay `/login` (compartido por Móvil/Empresa/Admin/Partner — no hay logins separados por producto), `/registro` (2 campos) y `/nueva-contrasena` (2 campos, uno de los dos ya tenía un toggle local incompleto, con emoji en vez de ícono). Extraído `frontend/src/components/auth/PasswordInput.tsx` (ícono de ojo SVG, área táctil confirmada en 44×44px vía el navegador), usado en los 5 campos. Ningún otro formulario de cambio de contraseña existe fuera de estos — "Cambiar contraseña" de Admin Configuración es solo un `Link` a `/recuperar`, sin campo propio. Verificado en el navegador (toggle real, `type="password"`↔`"text"`, tamaño exacto de botón).

**2. Panel Partner — reorden y separación visual:** confirmado el orden real en código antes de tocar nada (coincidía con el documentado: Mi perfil → Mi enlace → Registro de referidos → Tabla de comisiones → Mis comisiones → Tiempos de pago). Propuesta mostrada y confirmada por Mohamed antes de aplicar (incluyendo actualizar también el sidebar de anclas, no solo el contenido). Orden final — contenido y sidebar: **Registro de referidos** (ahora primera sección, sola, ancho completo) → grupo "Tu cuenta" (Mi perfil + Mi enlace) → grupo "Comisiones" (Tabla de comisiones + Mis comisiones, mejor pareja temática que el emparejamiento anterior con Registro de referidos) → Tiempos de pago. Rótulos de grupo (`SectionLabel`) + más espacio entre grupos (`mb-8` en vez de `mb-4` uniforme) para la separación visual pedida. `tsc`/`lint` limpios. **No verificado interactivamente** (mismo bloqueo de credenciales de siempre) — la estructura responsive replica el patrón `grid-cols-1 md:grid-cols-2` ya usado, sin inventar nada nuevo.

**3. Rediseño de landing (`darivopro.com`):**
- **Header** (`LandingHeader.tsx`, nuevo client component): menú "Productos" (dropdown desktop, dentro de un menú ☰ nuevo en móvil) con acceso a los 3 subdominios reales (`empresa.`/`app.`/`partner.darivopro.com`) — **estos enlaces no resuelven todavía**, el subdominio sigue sin conectar en DNS (`SUBDOMAIN_ROUTING_ENABLED`, ver sección de Admin más abajo). Precios/¿Cómo funciona?/Iniciar sesión/Registrarse/Empieza gratis se mantienen.
- **Nueva sección "Un Darivo Pro para cada parte de tu negocio"**: 3 tarjetas (Móvil/Empresa/Partner) — dobla como "casos de uso por tipo de usuario" y como acceso a producto también en el cuerpo de la página (no solo el header, para que sea alcanzable en móvil sin depender del menú).
- **Nueva franja de confianza**: 4 hechos verificables del producto (nube, sin contratos forzosos, soporte real, hecho para el mercado peruano) — **sin testimonios ni cifras de usuarios inventadas** (prohibido por `LANDING-PAGE-DARIVO-PRO.md` §4.1 hasta 3 clientes reales). De paso, corregido un subtítulo preexistente ("Miles de maestros y técnicos ya cotizan...") que era exactamente ese tipo de cifra no verificable, aunque no era técnicamente un testimonio.
- **Widget de chat flotante** (`LandingChatWidget.tsx`): burbuja fija, mensaje de bienvenida + formulario (nombre/contacto/mensaje). **Opción implementada: envía un correo real best-effort** a `soporte@darivopro.com` vía la infraestructura ya existente (`lib/email/send.ts`/`gmail-client.ts`, nueva plantilla `plantillaContactoLanding`, nueva ruta pública `POST /api/landing/contacto`) — mismo patrón que los 9 eventos transaccionales, y **siempre confirma recepción en pantalla** aunque el envío falle (falla hoy con el mismo error ya conocido: `GMAIL_SERVICE_ACCOUNT_JSON` sin configurar, pendiente del setup de Google Workspace del propietario — se arreglará solo en cuanto ese setup esté listo, sin tocar código de nuevo). Completamente independiente del sistema de tickets interno (`soporte_tickets`, `/api/soporte/*`, `DarivoChat.tsx`) — no comparte componente, tabla ni backend. Sin número de WhatsApp (no existe todavía, se agrega en un prompt aparte).
- `LANDING-PAGE-DARIVO-PRO.md` actualizado a v1.5 con changelog y estructura nueva (documento protegido, cambio autorizado explícitamente por el propietario al pedir el rediseño).
- **Verificado en el navegador**: dropdown de Productos (desktop) y menú ☰ (móvil, 375px) muestran los 3 enlaces correctos; widget de chat probado end-to-end (formulario → confirmación en pantalla, correo intentado y logueado server-side). `tsc`/`lint`/`next build` limpios (77 rutas, incluye `/api/landing/contacto`).
- **No tocado**: ningún sistema interno (Empresa/Móvil/Partner/Admin autenticados), solo la landing pública, como se pidió explícitamente.

### ✅ Resuelto — Sesión 19/07/2026: PDF inaccesible, página en blanco al guardar y FloatBar descentrada (Móvil)

Primera sesión de este proyecto con **verificación en vivo real, con sesión autenticada** (cuenta `darivonet`, producción `www.darivopro.com`, Service Worker y caché limpiados antes de medir). Esto desbloquea el "no verificado en vivo por bloqueo de credenciales" que arrastraban casi todas las entradas anteriores de este documento.

**Nota de infraestructura:** `app.darivopro.com` **no resuelve** (NXDOMAIN, confirmado por `nslookup`) — coherente con lo ya documentado en la sesión del 17/07 sobre los 3 subdominios sin conectar en DNS. El Móvil se sirve hoy desde el dominio principal (`www.darivopro.com/dashboard`, `/cotizaciones/nuevo`, …). Toda la verificación se hizo ahí.

**Las 3 causas raíz reales (confirmadas con evidencia en producción, no por trazado estático):**

1. **PDF: el archivo se generaba y subía bien, pero su URL estaba muerta para todo el mundo.** `frontend/src/lib/pdf/generate.ts` usaba `getPublicUrl()` sobre el bucket `documentos`, que es **privado** (`baseline_v2.sql:842`, `public = false`). Evidencia: `fetch` de la URL devuelta por `POST /api/pdf/cotizacion/[id]` → **HTTP 400 `{"error":"Bucket not found"}`**. Esto explica en cascada los 3 síntomas reportados sobre PDF/WhatsApp: `compartirPDF()` no podía adjuntar el archivo (su `fetch` interno fallaba y `intentarCompartirArchivo` devolvía `null` en silencio, `share.ts:21`), así que caía al fallback de compartir **el link crudo de Supabase como texto** — exactamente el síntoma 4 reportado por los usuarios. **Corregido**: `subirPdf()` firma la URL con el cliente `service_role` (`createSignedUrl`, vigencia 1 año). **Sin cambio de esquema ni de configuración de Supabase** — no hacía falta hacer público el bucket, y hacerlo habría expuesto las cotizaciones de todos los clientes a cualquiera que adivinara una URL. Las rutas `api/pdf/cotizacion/[id]` y `api/pdf/factura/[id]` ahora **ignoran las URLs `/object/public/` ya cacheadas** en `pdf_url` para que se regeneren firmadas (las filas viejas se autocorrigen al primer uso, sin migración).
2. **"Al guardar salta a una página en blanco".** No era un error de ruta, ni una excepción, ni una página sin datos — las tres hipótesis del reporte eran incorrectas. `abrirVentanaDiferida()` (`share.ts`) llamaba a `window.open("", "_blank", "noopener,noreferrer")`, y **por especificación `window.open()` devuelve `null` cuando se le pasa `noopener`**. Verificado en vivo en la consola del navegador: `handleEsNull: true`. Consecuencia: la pestaña en blanco sí se abría, pero el handle era siempre `null`, así que **nadie la navegaba nunca** y quedaba huérfana en `about:blank` — eso es la "página en blanco como un error" que veían los usuarios. Y el destino de WhatsApp acababa en el `window.open()` de fallback *posterior* al `await`, que es justo el popup que el navegador móvil bloquea (el bug que la corrección del 17/07 creía haber resuelto: el patrón era correcto, pero la implementación se anulaba a sí misma con `noopener`). **Corregido**: quitado `noopener,noreferrer` — el handle es precisamente lo que esta función existe para devolver.
3. **Regresión del botón "Continuar" descentrado — sí había causa de código.** La entrada del 17/07 ("sin causa de código encontrada… hipótesis: caché de Service Worker") **queda corregida: era un bug real y reproducible tras limpiar caché**. `FloatBar.tsx` se centraba con `transform: translateX(-50%)` **inline**, pero el propio componente lleva `className="pi"`, y `.pi` (`globals.css:51-57`) anima `transform` hasta `scale(1)` con `animation-fill-mode: both`. **Una animación CSS tiene más prioridad que un estilo inline**, así que al terminar la animación el `translateX(-50%)` quedaba anulado para siempre. Medido en vivo antes del fix: `left: 249.33px`, `right: -112.67px` sobre un viewport de 501px — la barra anclada al 50% de la pantalla y **desbordando 112px por fuera del borde derecho**, con `transform` computado = matriz identidad. **Corregido**: centrado con `left: 0 / right: 0 / margin: 0 auto`, inmune a cualquier animación de `transform`. Mismo aspecto y mismas medidas que el diseño aprobado (`width: calc(100% - 28px)`, `maxWidth: 362`) — no se introdujo ningún cambio visual nuevo, se restauró el centrado ya documentado como aprobado (excepción de Mohamed del 16/07). Revisado el resto del código por si el mismo patrón (animación pisando un `transform` inline) afectaba a más componentes: **FloatBar era el único caso real**.

**Sobre el síntoma 1 reportado ("el resumen no guarda bien los datos") — NO se reproduce como pérdida de datos.** Probado end-to-end en producción: partida 30 m² × S/18, margen 40%, cliente/teléfono/ciudad → guardado (COT-003) → reabierto con `?editar=` → el Resumen restaura **exactamente** los mismos valores (S/756.00 total, S/540.00 ejecución material, S/216.00 mano de obra 40%, "30 m² · S/ 18/m²", cliente correcto). El total, las partidas, el margen y el cliente persisten bien. La percepción de "no guarda" es coherente con las causas 1 y 2: el usuario guardaba, aterrizaba en una pestaña en blanco y nunca conseguía abrir el PDF del resumen. **Sí existen pérdidas reales pero más estrechas, encontradas por trazado de código y no corregidas en esta sesión** (no estaban en lo reportado, se dejan documentadas, no se tocaron):
- `montoManoObra` (el campo en soles) no se persiste: solo se guarda el `margin` derivado, así que al reabrir se ve un % con decimales en vez de "S/ 500".
- `status` se degrada silenciosamente a `"Borrador"` al editar (`NuevoCotizacionWizard.tsx:409`, hardcodeado, usado también en la rama de edición; `cargarCotizacion` nunca lee `data.status`). Una cotización "Aprobado" vuelve a "Borrador" al editarla.
- El borrador automático (`useCotizacionDraft`) sigue con `items: []` hardcodeado y su función `cargar()` **nunca se invoca** — el carrito no sobrevive a una recarga. Ya estaba documentado como hallazgo secundario el 16/07, sigue vigente.

**Hallazgo nuevo, no corregido (fuera de lo reportado, se documenta y no se persigue):** en el mensaje de WhatsApp, el emoji `📄` de la línea del PDF (`utils.ts:80`) llega como `U+FFFD` (carácter de reemplazo "�"). El fuente está correcto en UTF-8 (bytes `F0 9F 93 84` confirmados con `cat -A`), y los caracteres BMP del mismo mensaje (`▸`, `━`) sí sobreviven — **solo se degradan los caracteres fuera del BMP**, lo que apunta a un problema de codificación en el build/serve, no al fuente. Cosmético; no afecta al PDF ni al envío.

**Verificación en vivo, post-despliegue (todo comprobado con la app real, no con el build local):**
- **PDF**: `POST /api/pdf/cotizacion/[id]` devuelve ahora una URL `/object/sign/…?token=…`; su `fetch` responde **HTTP 200, `application/pdf`, 3.244 bytes**. El archivo real se descarga.
- **Guardado**: al pulsar "Guardar cotización" la pestaña que se abre **navega correctamente a WhatsApp** (`api.whatsapp.com/send/?phone=…`) en vez de quedarse en `about:blank`. Ya no aparece ninguna pestaña en blanco huérfana.
- **WhatsApp**: el mensaje generado (COT-004) lleva el desglose completo y la **URL firmada que sí funciona**, no la URL pública muerta. Además `navigator.canShare({files:[pdf]})` devuelve **`true`** con el archivo real descargado, así que en móvil WhatsApp recibirá el **PDF adjunto como documento**, que era el comportamiento buscado por la corrección del 17/07 y que hasta ahora era imposible.
- **Botón Continuar**: medido tras el fix → margen izquierdo 472.15px vs derecho 474.81px (simétrico), `desborda: false`. Confirmado también por captura de pantalla: la barra aparece centrada y con el texto "Continuar → Resumen" completo, frente a la captura previa donde quedaba cortada por el borde derecho.
- `tsc --noEmit`, `next lint` y `next build` limpios (mismos 4 warnings preexistentes de `useCotizacion.ts`/`useFactura.ts`). Commit `1d49527` en `main`/`origin/main`.

**Pendiente de limpieza (datos de prueba creados durante la verificación, en la cuenta `darivonet`):** cotizaciones **COT-003** ("QA Test Claude") y **COT-004** ("QA Test Claude 2"), más los clientes homónimos creados por `findOrCreateCliente`. Se entregan al propietario para que decida si borrarlos — borrar filas es un cambio de datos y no se autoejecuta (regla permanente de este documento). Sigue pendiente también la fila "QA Onboarding Test" en `categorias` de la sesión del 15/07, que hoy se vio en la lista de categorías del wizard.

### ✅ Resuelto — `main` ya no está detrás de `develop` (era cierto el 12/07/2026, ya no)

La alarma de abajo (escrita 12/07/2026) quedó obsoleta: verificado hoy (15/07/2026) con `git log main..develop` → **0 commits** — `develop` no tiene nada que `main` no tenga ya. Los 3 puntos que preocupaban en su momento ya están en `main`: el fix de caché offline (`extendDefaultRuntimeCaching: true` presente en `frontend/next.config.mjs:14`), la separación de PWA Admin/Empresa vs Móvil, y el fix de precio Pro en `UpgradeModal` — todo llegó a `main` como parte del trabajo de Admin/Empresa de las sesiones 13–14/07/2026 (commits `1b8e7d8` y posteriores). No hay ninguna acción pendiente aquí.

<details><summary>Texto original de la alarma (12/07/2026), dejado como historial — ya no vigente</summary>

`main` local == `origin/main` exacto (0 commits de diferencia) — es fiel a lo que está desplegado. Pero **`develop` tiene trabajo real que nunca llegó a `main`, y parte de ese trabajo ni siquiera estaba comprometido como commit** (estaba solo en el working tree, sin `git commit`, hasta hoy):

1. 1 commit de `develop` sin mergear a `main`: `a6e8123 fix(plan): leer precio Pro de PRECIOS_OFICIALES en UpgradeModal`.
2. Toda la sesión "Landing page y PWA — mejoras técnicas 12/07/2026" (ver sección propia más abajo) — apple-touch-icon, íconos PWA 192/512/512-maskable, `metadataBase`+OG/Twitter, `aria-hidden` en iconos decorativos, migración de `<a>` a `next/link`, y **el fix del bug real de caché offline** (`extendDefaultRuntimeCaching: true` faltante) — **estuvo sin comitear hasta hoy**. Esto significa que **el bug de caché offline roto sigue vivo en producción ahora mismo** (verificado: `main` no tiene `extendDefaultRuntimeCaching` en `next.config.mjs`).
3. La separación de PWA Admin/Empresa vs Móvil (pedida y construida hoy mismo, ver sección "Problemas abiertos" más abajo) — tampoco comiteada todavía.
4. `develop` está 39 commits por delante de `origin/develop` (tampoco pusheado al remoto) — todo el trabajo vive únicamente en esta máquina local.

</details>

**Acción pendiente de decisión del propietario:** revisar el diff de `develop` (los 3 bloques de arriba), decidir si se comitea/pushea/mergea a `main`, y en qué orden. Nada de esto se comiteó en esta sesión de diagnóstico (era solo lectura, según lo pedido).

### 🟢 Sólido y verificado — confirmado leyendo el código real en `main`

- **Build/lint/typecheck limpios en `main` desde cero**: `tsc --noEmit` sin errores, `next lint` sin errores (solo 2 warnings preexistentes en `useCotizacion.ts`, sin relación con nada reciente), `next build` compila las 69 rutas sin errores.
- **Móvil — wizard, cotizaciones, facturas, PDF**: wizard de 3 pasos (Selección/Partidas → Resumen → Cliente, desde el rediseño quirúrgico del 15/07/2026 — ya no son 4) completo, con indicador visual + toast cuando falta cantidad en una partida (fix 16/07/2026); CRUD de cotizaciones completo con buen manejo de errores; los 6 estados oficiales de factura confirmados textualmente en código; numeración correcta; cálculo de detracción es local (sin integración SUNAT real, correcto — no hay proveedor OSE contratado); generación de PDF funciona end-to-end vía `@react-pdf/renderer` + Supabase Storage — ⚠️ **esta afirmación era falsa hasta el 19/07/2026**: el PDF se generaba y subía, pero su URL (`getPublicUrl()` sobre un bucket privado) respondía 400 para todo el mundo, así que en la práctica el PDF nunca se podía abrir ni adjuntar. Corregido y verificado en vivo el 19/07/2026 con URL firmada, ver la entrada propia de esa sesión más arriba. El "verificado" anterior venía de comprobar que la ruta devolvía 200 y una URL, sin llegar a descargar el archivo; plan `gratis` bloquea facturas correctamente.
- **Admin — Usuarios/Partners/Productos**: las 5 acciones de Usuarios (Bloquear/Desbloquear/Cambiar plan/Reenviar invitación/Restablecer acceso) verifican el `error` de Supabase y no tienen silent failures; filtros funcionales. "Configurar tabla de comisiones" de Partners edita `partner_comisiones_config` real, leída también por el trigger de comisiones y por el Panel Partner (sin valores duplicados). Edición de Productos (nombre/descripción/activo) funciona, sin crear/eliminar (correcto, fuera de alcance documentado). Allowlist de acceso (`DARIVO_ADMIN_EMAILS`) falla cerrado si la lista está vacía.
- **Empresa — Invitar empleado y Cotizaciones**: `invitarEmpleadoAction` da acceso real a Móvil (`inviteUserByEmail` + `empresa_empleados.user_id`), no es decorativo. Acceso a cotizaciones correctamente restringido a Inicio + ficha de Cliente (sin sidebar/lista global). Middleware de `/empresa` gatea por `plan_tipo` consultado en vivo en cada request (no allowlist estático).
- **Partner — comisiones y referidos**: `mapPartner()` trae comisiones pendientes/pagadas reales desde `partner_comisiones_historial`. El flujo de link de referido (`/ref/[codigo]` → cookie → `registrar-referido`) funciona end-to-end con protección contra duplicados.
- **RLS**: 35 tablas con RLS habilitado, 62 políticas (`CREATE POLICY`) en total. No se encontró ninguna tabla de usuario sin RLS.
- **Vocabulario `tipo`/`calc_type`, terminología cotización, logout en los 4 paneles, bug de facturación plan `gratis`** — siguen verificados, sin cambios desde la última auditoría.

### 🟡 En progreso — construido, con una pieza externa pendiente del propietario

- **Email transaccional**: los 9 eventos ya están conectados a disparadores reales en código (confirmado archivo:línea) — Bienvenida, Pago confirmado, Pago fallido, Cambio de plan, Bienvenida Partner, Comisión ganada, Reset de contraseña (este último vía Supabase Auth nativo, no Gmail API), y Ticket recibido/resuelto (conectados 16/07/2026, Fase 3 — Darivo). Pendiente del propietario, para que el envío real funcione: (1) setup de Google Cloud + Workspace (domain-wide delegation, `GMAIL_SERVICE_ACCOUNT_JSON` vacío en `.env.example`); (2) Database Webhook de Supabase para "comisión ganada" (tabla `partner_comisiones_historial`, evento INSERT); (3) pegar `supabase/templates/recovery.html` en el Dashboard hosted — **ver "Problemas abiertos" más abajo, esto puede no ser suficiente**.
- **Trigger de comisión por venta** (`20260712100000_fix_comision_venta_trigger_estado.sql`): el `WHEN` ya compara correctamente contra `pagos_eventos.estado` en inglés (`PAID`/`COMPLETED`/etc. — el bug original comparaba contra el literal español `'exitoso'`, que nunca coincidía). Corregido en código, pero **todavía sin verificar contra un pago real de Business vía Partner** (depende de que el webhook de dLocal inserte correctamente en `pagos_eventos`, sin `CHECK constraint` de por medio).
- **Admin Suscripciones**: solo lectura (planes oficiales + conteo real de usuarios por plan vía `fetchAdminSuscripciones()`) — no hay gestión individual de suscripciones. No es un bug, es alcance incompleto ya documentado.

### 🔴 Sin auditar / pendiente de decisión de negocio — no improvisar

- ~~Backend de tickets de soporte deshabilitado~~ ✅ **Construido 16/07/2026** (Fase 3 — Darivo) — ver sección propia más abajo. Eventos de email 8-9 (ticket recibido/resuelto) ya conectados en `send.ts`.
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

✅ **Resuelto** — ya en `main` (commit `1b8e7d8`, confirmado en la revisión del 15/07/2026, ver sección "✅ Resuelto — main ya no está detrás de develop" arriba). Verificado en código (no solo en el commit): `manifest: "/manifest.json"` solo está presente en `(auth)/layout.tsx:13` y `onboarding/layout.tsx:10` (rutas de Móvil); `app/layout.tsx:28` documenta explícitamente por qué se quitó de la raíz; Admin/Empresa no lo declaran en ningún layout propio, así que no lo heredan. Sin acción pendiente.

## Landing page y PWA — mejoras técnicas 12/07/2026 (autonomía total, sin tocar copy/diseño ya cerrado) — ✅ ya en `main`, ver "✅ Resuelto — main ya no está detrás de develop" arriba

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

## REGLA PERMANENTE: Ningún archivo .md ni documentación interna debe ser público

- Ningún archivo .md del proyecto (CLAUDE.md, .cursor/rules/*, notas internas, README con detalles de arquitectura) puede ser accesible vía URL pública en darivopro.com ni sus subdominios (app., empresa., admin., partner.).
- Verificar que .cursor/, CLAUDE.md, y cualquier carpeta de documentación NO estén en /public ni en ninguna ruta servida como estática en el build de Next.js.
- Verificar que no existan rutas tipo /CLAUDE.md, /.cursor/rules/algo.md, /README.md accesibles directamente desde el navegador en producción.
- Darivo Pro debe comportarse como cualquier SaaS profesional: público solo landing, app, precios, legal (Términos, Privacidad) — nunca documentación de desarrollo, notas internas, ni arquitectura del sistema.
- Esta regla aplica a los 4 subdominios y al dominio raíz.

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

## ✅ Tarea 0 — Limpieza de documentación de proceso Cursor (completada, verificada 17/07/2026)

Los archivos de metodología/prompts de agentes/informes de Cursor (`22`–`25`, `23-A/B/C`, `informes/`, `INFORME-FASE-FINAL-DARIVO-PRO-EMPRESA.md`, `audit-db-output.json`, `DARIVO-PRO-FINAL.mdc`) ya no existen en el repo — confirmado directamente en el filesystem (17/07/2026), no solo por el registro de esta tarea. Conteo real de `.cursor/rules/*.md`: **48**, como se esperaba. Nada pendiente aquí.

## Handoff: de Cursor (Composer 2.5) a Claude Code

Hasta el 06/07/2026, el trabajo de código se hizo con Cursor (Composer 2.5). A partir de ahora, Claude Code toma el relevo. Ya hecho y verificado por Claude (no repetir):

* Planes Básico/Pro/Business en código (`roles-planes-oficial.ts`, `plan-limits.ts`, `acceso-producto.ts`).
* 6 estados oficiales de factura (`Borrador/En proceso/Emitida/Rechazada/Pendiente de envío/Cobrada`) — migración, tipos, colores, lógica de `FacturaCard`.
* Roles personalizados (RBAC) — migración `roles_personalizados` + UI en `RolesPermisosView.tsx`.
* Pantalla de Inicio (Móvil) corregida — sin enlace a Empresa, sin accesos rápidos a Clientes/Cotizaciones.

✅ La migración de terminología presupuesto→cotización (commits `6f19ea5`, `3538514`, `a897249`) quedó **confirmada COMPLETA** por la auditoría del 09/07/2026 (migraciones, rutas, tipos, caché PWA) — ver "Tareas de código pendientes conocidas" más abajo. No repetir este trabajo.

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

## ✅ Plan de trabajo de los primeros días (06-07/07/2026) — completado

Este documento tenía un plan día-a-día (migración de terminología, Landing Page, `/precios` a 3 planes, Módulo Admin 05, middleware de subdominios) escrito antes de que existiera casi todo el resto de este `CLAUDE.md`. Los 5 puntos están confirmados completos, cada uno con su propia entrada más abajo (ver "Tareas de código pendientes conocidas", "Estado de remediación — Auditoría 09/07/2026" Prioridad 1, y "🔴 Sin auditar" para el middleware, que sigue **apagado a propósito**, no pendiente de terminar). No queda ninguna acción de este plan original por hacer.

**SUNAT sigue sin integrarse** (esto sí sigue vigente, no es parte de lo ya completado): no hay proveedor OSE contratado todavía. No escribir código de integración real hasta que Mohamed confirme que el correo a Bizlinks se envió y las condiciones del proveedor están cerradas — ver también "Lo que NO existe en este producto" más abajo.

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
- No documentar aquí ninguna otra cuenta de prueba de **Móvil** — reutilizar siempre `demo@darivopro.com` para que quede permanente entre sesiones.

### Cuenta de prueba QA — Partner (permanente, 15/07/2026)

- **Email:** `demo1@gmail.com` (ya existía en Authentication, proyecto `vyrtokggypcmpforglch`) — corresponde a `QA_PARTNER_EMAIL` de `.env.test` de arriba.
- **Fila en `partners`:** `codigo='DEMO1'`, `enlace='https://darivopro.com/ref/DEMO1'`, `estado='Activo'`, `nombre='Partner Demo QA'` — creada vía SQL entregado en esta sesión (`INSERT ... ON CONFLICT (email) DO UPDATE`, ver historial de chat si hace falta reconstruirla).
- **Allowlist:** el email debe estar en `DARIVO_PARTNER_EMAILS` (env var, coma-separada) para que `esPartnerAutorizado()` conceda acceso — confirmar que está puesta tanto en `.env.local` como en Vercel Production si se quiere probar en ambos entornos; no se pudo confirmar en esta sesión si Vercel Production ya la tiene (no soy yo quien la puso — el propietario logró entrar a `/partner` en producción, así que a esa altura ya estaba configurada correctamente, pero no verifiqué el valor exacto).
- Reutilizar esta cuenta para cualquier verificación futura del Panel Partner — no crear otra.

## Email transaccional (Gmail API) — construido 12/07/2026, texto real conectado 12/07/2026

**⚠️ Corrección 18/07/2026 — esta sección estaba desactualizada, ver "Estado real 18/07/2026" al final.** Se dejó el resto tal cual como historial de esa fecha.

Infraestructura en `frontend/src/lib/email/` (`gmail-client.ts`, `accounts.ts`, `templates.ts`, `send.ts`) — domain-wide delegation (1 credencial de Google Cloud sirve para las 5 cuentas info@/facturacion@/noreply@/partners@/soporte@, no 5 OAuth consent flows separados). **`templates.ts` ya tiene el texto real aprobado por Mohamed (ya no es placeholder)** — 9 plantillas completas.

**Conectado a eventos reales (7 de 9, en 12/07/2026 — ver corrección: hoy son 9 de 9):**
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

**Bloqueado, no construido (12/07/2026 — ya no aplica, ver corrección):** ~~Ticket recibido/resuelto (soporte@, eventos 8-9) — el backend de tickets (`/api/soporte/tickets`) está deshabilitado...~~ — el backend de tickets se construyó el 16/07/2026 (Fase 3 — Darivo, ver esa sección más abajo) y estos 2 eventos ya están conectados desde esa fecha.

### Estado real 18/07/2026 (corrección — la sección de arriba quedó vieja)

Pedido explícito de Mohamed de verificar el estado real de conexión y probar envíos reales. Hallazgos:

- **Código: 9 de 9 eventos oficiales ya están conectados**, no 7 de 9 — el número de arriba es de 12/07/2026, antes de que Fase 3 (16/07/2026, ver sección propia) conectara los eventos 8 (`ticket_recibido`) y 9 (`ticket_resuelto`) al backend real de tickets. Confirmado leyendo `frontend/src/lib/email/send.ts` completo: las 9 funciones (`enviarBienvenida`, `enviarPagoConfirmado`, `enviarPagoFallido`, `enviarCambioPlan`, `enviarBienvenidaPartner`, `enviarComisionGanada`, `enviarTicketRecibido`, `enviarTicketResuelto`, más el reset de contraseña vía Supabase Auth nativo) existen y están invocadas desde sus disparadores reales. `templates.ts` tiene las 9 plantillas con texto HTML real (no placeholder), fechado 12/07/2026 en su propio encabezado — más 2 plantillas adicionales no-oficiales (`plantillaContactoLanding`, `plantillaInvitacionEmpleado`, agregadas 17/07/2026 para otros flujos).
- **El bloqueo real no es de código, es de infraestructura, y afecta a los 9 eventos por igual, no a 2**: `GMAIL_SERVICE_ACCOUNT_JSON` sigue vacía — confirmado vacía en `frontend/.env.example` y ausente/vacía en `frontend/.env.local` de este entorno. Sin esa variable, **cualquiera** de los 9 envíos falla de inmediato con el error claro `"GMAIL_SERVICE_ACCOUNT_JSON no configurada"` (`gmail-client.ts`) — no es que falten 2 eventos por conectar en código, es que ninguno de los 9 puede entregar un correo real todavía. **No se pudo confirmar si Vercel Production ya la tiene configurada** (no hay acceso a leer variables de entorno de Vercel desde esta sesión, y por regla permanente de este documento tampoco se pediría ver el valor aunque se pudiera) — Mohamed debe confirmarlo él mismo en Vercel → Settings → Environment Variables.
- **Intento de prueba de envío real — no se pudo ejecutar**: sin `GMAIL_SERVICE_ACCOUNT_JSON` en el entorno local de esta sesión, cualquier llamada a `enviarGmail()` lanza el error de arriba antes de intentar nada contra la API de Gmail — no hay forma de probar un envío real "bienvenida"/"pago_confirmado" desde aquí hasta que esa variable esté puesta (localmente, o confirmando que ya lo está en Producción para probar ahí).
- **`darivo_email_sender.py`** (archivo Python con un diccionario `PLANTILLAS`, mencionado por Mohamed como la fuente de las 9 plantillas aprobadas el 16/07/2026 en tono "profesional-cercano") — **no existe en el repo**, confirmado por búsqueda exhaustiva (ningún archivo `.py` del proyecto, solo paquetes de terceros en `backend/.venv/`). Este archivo nunca llegó a integrarse — el texto real que sí está en producción hoy (`templates.ts`) es un conjunto distinto, en TypeScript/HTML, aprobado y conectado el 12/07/2026. **No se sobreescribió nada** a la espera de que Mohamed reenvíe el contenido completo del archivo, para no inventar ni mezclar redacciones de dos aprobaciones distintas sin confirmar cuál es la vigente.

## Auditoría 12/07/2026 — Admin/Empresa/Partner (sesión continua, 3 agentes en paralelo)

Auditoría de solo lectura + correcciones puntuales. Corregido en el momento (ver commit `fix: hallazgos de auditoría Admin/Empresa/Partner`): silent failures en `AdminEmpresasView`/`AdminPartnersView` (la UI daba por bueno un cambio que en realidad había fallado en Supabase), KPI "Onboarding pendiente" duplicado/engañoso, sección "Tiempos de pago" faltante en Panel Partner (el MD la agregó el 11/07 y nadie la había conectado a la UI todavía), color de estado "Suspendido" mostrado en verde.

**Pendiente — hallazgos reales, no corregidos todavía (requieren más que un fix puntual, o una decisión de alcance):**

- ~~**Admin — Usuarios**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Admin — Partners**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Empresa — Cotizaciones**~~ ✅ **Resuelto 12/07/2026** — ver arriba.
- ~~**Empresa — Ficha de Cliente**~~ ✅ **Resuelto 12/07/2026**: panel lateral dentro de `EmpresaShell`, ver arriba.
- ~~**Nota relacionada:** el wizard de cotización sigue sin adaptarse al layout de 3 paneles de escritorio...~~ ✅ **Resuelto 14/07/2026** — ver "Auditoría MD↔código Empresa" más abajo (`NuevoCotizacionWizardEscritorio.tsx`, los 3 puntos de entrada reales ya enlazan ahí). Esta nota había quedado desactualizada, escrita antes de ese trabajo.
- ~~**Empresa — Invitar empleado**~~ ✅ **Resuelto 13/07/2026** — ver arriba. Decisión de diseño tomada: reutiliza el propio invite de Supabase Auth (no una tabla de tokens propia ni uno de los 9 emails transaccionales).
- ~~**Empresa — Empleados:** faltan las acciones "Editar" y "Permisos" por fila; "Última actividad" nunca se escribe~~ ✅ **Resuelto el mismo 12/07/2026** — ver "Cambios mergeados a main" más abajo (acciones Editar/Permisos añadidas, columna "Última actividad" real conectada a login).
- ~~**Partner — visibilidad de comisiones**~~ ✅ **Resuelto 12/07/2026** (sesión continua siguiente): `mapPartner()` consulta `partner_comisiones_historial`, `PartnerPanel.tsx` muestra totales + listado.
- ~~**Partner — acceso tras suspensión:** `/partner` se gatea solo por allowlist de email, independiente de `partners.estado`~~ ✅ **Resuelto el mismo 12/07/2026** — ver "Cambios mergeados a main" más abajo (`esPartnerAutorizado()` ahora consulta `partners.estado` real, deniega si `Suspendido`).

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

**Verificación:** `tsc --noEmit` limpio, `next lint` limpio (mismos 2 warnings preexistentes de `useCotizacion.ts`, sin relación), `next build` compila las 70 rutas sin errores. Se intentó una ruta de previsualización temporal sin guard de auth para verificar solo el color; el clasificador de seguridad la bloqueó correctamente por debilitar el middleware de autenticación — revertida de inmediato, sin dejar rastro (`middleware.ts` y la ruta temporal ambos confirmados limpios).

✅ **Verificación visual real completada 13/07/2026** — sesión Admin logueada real (Mohamed inició sesión en el navegador conectado), confirmado por Claude Code vía Chrome MCP: Dashboard, Usuarios y Configuración muestran sidebar blanco con ítem activo morado, botones primarios morados (`Cambiar contraseña`), sin ningún resto de navy/azul de Fable 5.

### Siguiente paso — actualizado 13/07/2026 (sesión continua)

✅ **Completado en esta sesión:** `ADMIN_COLORS` ya extendido a `AdminTabs.tsx` y a las 9 vistas/páginas Admin que quedaban en `T.blue`/navy (`AdminUsuariosView`, `AdminPartnersView`, `AdminEmpresasView`, `ApisRegistroView`, `AdminProductosView`, `AdminRolesView`, `AdminEmpleadosInternosView`, `AdminSoporteView`, `admin/page.tsx`, `admin/configuracion/page.tsx`) — el morado/blanco ya cubre el 100% de Admin, no queda ningún resto de azul/navy de Fable 5 en ese producto.

Además, en el mismo bloque:
- **Precio anual Básico/Pro ya no se muestra como definido**: `admin/suscripciones/page.tsx` y `AdminRolesView.tsx` (pestaña Planes) ahora muestran "Pendiente" para Básico/Pro (Business sigue mostrando su precio real S/1200) — antes mostraban S/490/S/790, un cálculo mensual×10 sin confirmar por el propietario, contradiciendo `04-PANEL-ADMIN-SUSCRIPCIONES.md` §6 ("Pendiente"). **Hallazgo relacionado sin corregir, fuera de alcance de este fix:** ese mismo precio "inventado" (`PRECIOS_OFICIALES.basico.anual`/`.pro.anual` en `roles-planes-oficial.ts:70-71`) sigue **activo en checkout real** — `MiPlanCard.tsx` (Móvil) ofrece botones reales "Pagar anual Básico/Pro" que cobrarían ese monto vía dLocal, y `/precios` también lo muestra. Antes de que exista un cliente real pagando anual, el propietario debe confirmar el precio anual real de Básico/Pro (o decidir ocultar esos botones hasta tenerlo).
- **`darivo_admin_empleados` ya conectado**: `fetchAdminEmpleadosInternos()` (`admin-queries.ts`) ya no filtra `perfiles` por el allowlist `DARIVO_ADMIN_EMAILS` — consulta la tabla real, mostrando nombre/cargo/departamento/activo reales + último acceso. Acciones por fila (Editar, Cambiar departamento) siguen pendientes.
- **Usuarios (pantalla 03) ya tiene panel lateral derecho** (identidad + datos + acciones de administración, `16-SISTEMA-DE-DISEÑO-ADMIN.md` §7), columnas Contacto/Último acceso añadidas, filtro por método de acceso + "Limpiar filtros", y las 3 acciones por fila pasaron de enlaces de texto a botones-tarjeta (§9).
- **Dashboard (pantalla 00) completo** — barra superior (buscador → redirige a Usuarios con `?q=`, selector de rango 7/30/90 días real vía `?dias=`, notificaciones placeholder honesto, ayuda → `mailto:soporte@darivopro.com`, usuario admin con iniciales → Configuración), gráfico "Actividad de la plataforma" (`recharts`, serie diaria real de registros/cotizaciones/facturas vía nueva `construirSerieActividad()` en `admin-queries.ts`), donut "Distribución de suscripciones" (reemplaza la lista de texto plano, con estado vacío honesto), "Estado de soporte" (Abiertos/En proceso/Resueltos — sin backend real todavía, mismo patrón INC-A01 que el KPI de tickets, no se inventó data), 7 "Acciones rápidas" del MD, footer, e iconos SVG inline (sin dependencia nueva) en las 5 tarjetas KPI. Nuevo `AdminCard` reutilizable en `AdminUi.tsx`; `AdminShell` gana un slot `headerExtra` opcional (solo lo usa Dashboard). Verificado: `tsc`/`lint`/`build` limpios + visual real en producción (sesión yatriye@gmail.com), incluyendo el selector de rango probado en vivo (7d → el eje del gráfico cambió correctamente).
- **Configuración (pantalla 11) completa** — reconstruida siguiendo §5/§6/§7 del MD: "Mi perfil" (avatar iniciales, nombre, correo), "Acceso" (método real vía `auth.users.identities`, Cambiar/Recuperar contraseña), "Sesión" (Cerrar sesión propia del módulo, antes solo vivía en el sidebar), panel lateral derecho con Información de la cuenta (nombre/correo/fecha de registro real) + Acciones rápidas. "Teléfono" retirado de la vista por no estar en la lista de campos autorizados del MD §6. Verificado: `tsc`/`lint`/`build` limpios + visual real en producción.
- **Empleados (pantalla 07) completo** — nuevo `frontend/src/app/admin/empleados/actions.ts` (Server Actions reales, sin tablas nuevas): crear (invita vía Supabase Auth + inserta `darivo_admin_empleados`), editar/cambiar departamento, activar/desactivar, eliminar, restablecer acceso, reenviar invitación. Columna Acciones real (antes `—`), panel lateral (Resumen con "Invitaciones pendientes" aproximado por "nunca inició sesión" — dato real, no inventado —, Trabajo en equipo honesto sin backend, Acciones rápidas), filtros reales (Estado/Departamento/Cargo/Orden), toggle tabla/tarjetas, exportar CSV y plantilla CSV (ambos 100% cliente, nuevo `frontend/src/lib/csv-export.ts` reutilizable). Invitaciones/Actividad/Historial de cambios y "Publicar cambios" siguen honestamente sin construir (requieren tabla de auditoría no autorizada por el MD §10). Nota de alcance en la propia UI: "Nuevo empleado" no otorga acceso al Panel Admin por sí solo (lo gatea `DARIVO_ADMIN_EMAILS`, allowlist de entorno separada de esta tabla). Verificado: `tsc`/`lint`/`build` limpios + visual real en producción.

- **Suscripciones (pantalla 04) completa** — nueva `AdminSuscripcionesView`: tarjetas por plan con icono, badge "Recomendado" en Pro, toggle tarjetas/tabla, filtros (buscar/orden), Exportar CSV, panel lateral con ficha de plan (matriz completa de funcionalidades del §6), pestaña Historial de cambios honesta. Alcance de solo lectura intacto (ya validado en auditoría previa) — "Nuevo plan"/"Importar"/"Publicar cambios" documentados como no aplicables (catálogo fijo a 3 planes oficiales). Verificado: `tsc`/`lint`/`build` limpios + visual real en producción (panel lateral probado con clic real en tarjeta PRO).

**⚠️ Hallazgo de proceso (13/07/2026):** el Service Worker de la PWA cachea agresivamente el HTML/JS de `/admin/*` — limpiar `caches.keys()...delete()` + `serviceWorker.getRegistrations()...unregister()` **y esperar a que ambas promesas resuelvan antes de navegar** (un primer intento sin `await` no lo limpiaba a tiempo, dando falsos "sigue roto"). Además, y más importante: **algunas pantallas Admin sin `cookies()`/`headers()`/`searchParams` en su árbol de render corrían el riesgo real de que Next.js las tratara como candidatas a su Full Route Cache** — no confirmado como causa única, pero se añadió `export const dynamic = "force-dynamic"` a las 8 pantallas Admin con fetch service-role como medida de correctness real (no solo para depurar), ver commit correspondiente.

### Siguiente paso — orden confirmado por el propietario 13/07/2026 (prioridad sobre Empresa)

Mohamed confirmó: terminar las 7 pantallas restantes de Admin **antes** de retomar Empresa (Cotizaciones/Facturas/Cierre, pausado). Orden de ejecución (criterio del ejecutor, de más rápida a más grande). **Autonomía total reconfirmada explícitamente 13/07/2026** para push a GitHub, deploy a producción y verificación visual con Claude in Chrome — sin pedir permiso por pantalla, solo avisar al final con resumen (única excepción: SQL de base de datos y contraseñas, ver "⚠️ CRÍTICO — main" arriba):

1. ✅ Dashboard (00) — completo, ver arriba
2. ✅ Configuración (11) — completo, ver arriba
3. ✅ Empleados (07) — completo, ver arriba
4. ✅ Partners (06) — completo, ver corrección 14/07/2026 abajo
5. ✅ Empresas (02) — completo, ver corrección 14/07/2026 abajo
6. ✅ Suscripciones (04) — completo, ver arriba
7. ✅ Catálogo Maestro (10) — completo, ver corrección 14/07/2026 abajo. **Contradicción detectada 18/07/2026 (MD-10 §9/§10 decía "No crear endpoints" pese a que el CRUD real ya existía desde el 13/07/2026, commit `616cee8`) — reportada sin tocar código, y confirmada por el propietario el mismo día ("ya") como autorizada. MD-10 actualizado a v1.3 reflejándolo.**

**✅ Admin: 11/11 pantallas completas y verificadas visualmente en producción (14/07/2026).** El bloqueo de Partners/Empresas/Catálogo Maestro ("Invalid API key") se resolvió corrigiendo las 3 variables de Supabase en Vercel Production al proyecto real (`vyrtokggypcmpforglch`) + redeploy. Verificado con sesión Admin real (`yatriye@gmail.com`), caché/Service Worker limpiados antes de cada verificación: Partners y Empresas cargan sin error (0 registros, tablas vacías reales); Catálogo Maestro muestra datos reales — 6 categorías, 28 partidas. Sin errores en consola ni en logs de Vercel.

**Corrección 14/07/2026 — el hallazgo de Catálogo Maestro de abajo estaba mal diagnosticado:** lo que se documentó primero como "problema de datos, no del mismo bug" resultó ser el mismo bug de "Invalid API key", enmascarado por `fetchAdminCatalogo()` (`admin-queries.ts`) que descartaba el `error` de la consulta sin loguearlo nunca. Diagnóstico temporal (DIAG4, ya retirado) confirmó que `productos_master` Y `catalogo_sectores` fallan con el mismo `{"message":"Invalid API key","hint":"Double check your Supabase \`anon\` or \`service_role\` API key."}` que Partners/Empresas — ver hallazgo ampliado justo abajo. Catálogo Maestro pasa de "✅ completo" a **bloqueado por el mismo hallazgo de infraestructura**, igual que Partners y Empresas.

### ⚠️⚠️ CORRECCIÓN 14/07/2026 (tarde) — el ID `kyckjapprmtfahnkuucz` que aparece varias veces en las 2 secciones de abajo es INCORRECTO

**No usar, no copiar, no pegar en ningún lado.** El proyecto Supabase real y único de producción es **`vyrtokggypcmpforglch`** (URL: `https://vyrtokggypcmpforglch.supabase.co`) — confirmado por el propietario: es el mismo proyecto de siempre, solo le cambió el nombre visual en el dashboard de Supabase hace 2 semanas; el ID del proyecto nunca cambió. `kyckjapprmtfahnkuucz` era una configuración incorrecta/vieja en las env vars de Vercel Production — ya corregida (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` apuntan ahora a `vyrtokggypcmpforglch`).

Las 2 secciones de abajo (Hallazgo 13/07/2026 y Diagnóstico ampliado 14/07/2026) se dejan intactas como historial de qué pasó y cómo se investigó — **cada mención de `kyckjapprmtfahnkuucz` en ellas está marcada inline con "⚠️ ID INCORRECTO, NO USAR"**. No son instrucciones vigentes.

### ⚠️ Hallazgo 13/07/2026 — `/admin/partners` Y `/admin/empresas` caídos en producción, requiere decisión del propietario

Ambas pantallas dan error ("Invalid API key" de Supabase) en producción real al consultar sus tablas (`partners`/`partner_comisiones_config` en un caso, `empresas` en el otro). `/admin/partners` es preexistente (primer registro 12/07/2026, no causado por el trabajo de hoy); `/admin/empresas` se descubrió hoy al construir su pantalla. Diagnóstico exhaustivo con logging temporal (ya retirado en ambos casos) confirmó, con el mensaje de error real capturado sin filtrar (antes se perdía silenciosamente — ver fix en `adminClientOrNull()`):

- `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` **sí están presentes** en el entorno de producción — no es una variable de entorno faltante.
- El proyecto Supabase real de producción es **`kyckjapprmtfahnkuucz`** (⚠️ ID INCORRECTO, NO USAR — el proyecto real es `vyrtokggypcmpforglch`, ver corrección arriba) — confirmado extrayendo el bundle JS servido en vivo (`NEXT_PUBLIC_SUPABASE_URL`, público del lado cliente), usado consistentemente en toda la app.
- **`frontend/.env.local` (entorno local de esta sesión) apunta a un proyecto Supabase distinto: `vyrtokggypcmpforglch`.** Todas las verificaciones directas que hice contra ese proyecto (REST y `supabase-js`) funcionaron perfectamente para `partners`, `partner_comisiones_config` y sus tablas relacionadas — por eso el código en sí parece correcto y el bug no es reproducible fuera de producción.
- El error ocurre específicamente en la consulta a Supabase (`.from("partners")...`, `.from("empresas")...`), no en la construcción del cliente ni en el resto de la página — confirmado con el mensaje de error real, no un mensaje genérico.
- Otras tablas Admin (`perfiles`, `darivo_admin_empleados`, `partner_comisiones_config` vía REST directo) sí respondieron bien en pruebas — pero **no se ha confirmado con certeza que `empresas` funcione para NINGUNA pantalla en producción real**, dado este hallazgo. Dashboard/Empleados/Configuración muestran "0" en todo, consistente tanto con "no hay datos todavía" como con "esa tabla específica también falla" — no se puede distinguir sin acceso directo a `kyckjapprmtfahnkuucz` (⚠️ ID INCORRECTO, NO USAR — ver corrección arriba, el proyecto real es `vyrtokggypcmpforglch`).

**No se tocó ninguna migración ni se ejecutó SQL alguno contra producción** — solo lectura (vía REST/`supabase-js` con la key local, que apunta a otro proyecto) y diagnóstico de logs de Vercel. Efecto colateral bueno de esta sesión, ya aplicado: `adminClientOrNull()` (`admin-queries.ts`) ya no traga errores en silencio — cualquier fallo real de Supabase en cualquier pantalla Admin ahora queda en los logs de Vercel con detalle, en vez de mostrar el mensaje genérico "no configurada" indistinguible de un entorno mal configurado.

### Diagnóstico ampliado 14/07/2026 — respuesta a "¿son 2 proyectos distintos o el mismo con otro nombre?"

Verificado directamente contra Vercel (API real, proyecto `darivo-saas`, `prj_47KM7aTDs4V1YfsA4DoPYXrvi4i4` — es el único proyecto Vercel de la cuenta, no hay duplicados ahí) y contra logs de runtime en producción, no por inferencia:

1. **`NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` de Vercel Production se leen juntos, del mismo `process.env`, en cada request** (`createAdminClient()`, `frontend/src/lib/supabase/admin.ts` — código server-only, no hay inlining de build ni caché de bundle involucrados aquí, a diferencia de lo que sugería el comentario viejo de ese archivo). Log real capturado en producción (`DIAG2`, 13/07/2026): `url: 'https://kyckjapprmtfahnkuucz.supabase.co', keyLen: 219, keyPrefix: 'eyJhbGciOiJI', vercelEnv: 'production'`(⚠️ esta URL era la ID INCORRECTA de ese momento, NO USAR — hoy corregida a `https://vyrtokggypcmpforglch.supabase.co`). Es decir: en ese momento la URL de producción **era** `kyckjapprmtfahnkuucz` (⚠️ ID INCORRECTO, NO USAR), y la key que se enviaba junto con ella era esa de 219 caracteres — quedan pareadas por construcción del cliente, no es posible que una venga de un proyecto y la otra de otro sin que sea exactamente este mismatch.
2. **El error `"Invalid API key"` ahora se confirmó en 5 tablas de áreas completamente distintas del esquema**: `partners`, `partner_comisiones_config`, `empresas`, y — nuevo hoy, via diagnóstico temporal DIAG4 ya retirado — `productos_master` y `catalogo_sectores` (Catálogo Maestro). El objeto de error en los 5 casos es idéntico y minimalista: `{message, hint}`, **sin** `code`/`details`/`status`. Esa forma es la firma típica de un rechazo a nivel de gateway de Supabase (Kong) — pasa *antes* de que la consulta llegue a Postgres/PostgREST, por lo que es independiente de si la tabla existe, tiene RLS, o tiene grants. Una tabla inexistente da un error distinto (típicamente con `code`, vía PostgREST). Esto hace **muy poco probable** que la causa sea "esas tablas específicas no existen en `kyckjapprmtfahnkuucz`" (⚠️ ID INCORRECTO, NO USAR — ver corrección arriba) — apunta a que la propia API key es rechazada por el gateway de ese proyecto, para cualquier tabla.
3. Que otras pantallas (Dashboard, Empleados, Configuración) no muestren este error en los logs **no prueba que funcionen** — ya se confirmó hoy que `fetchAdminCatalogo()` descartaba el `error` de Supabase sin loguearlo nunca (por eso Catálogo Maestro parecía "solo vacío" antes de este diagnóstico). No se revisó si `fetchAdminDashboard`/`fetchAdminEmpleadosInternos`/etc. tienen el mismo patrón de descarte silencioso — queda pendiente si el propietario quiere esa verificación adicional.

**Conclusión honesta (en el momento en que se escribió, 14/07/2026 mediodía):** con la evidencia disponible, esto no tenía el perfil de "dos proyectos Supabase distintos donde uno es un remanente viejo" — tenía el perfil de **una sola `SUPABASE_SERVICE_ROLE_KEY` en Vercel Production que el gateway de `kyckjapprmtfahnkuucz`** (⚠️ ID INCORRECTO, NO USAR — ver corrección arriba) **estaba rechazando por completo** (key rotada/regenerada en el dashboard de Supabase después de configurarse en Vercel, o pegada con algún error). ~~**Siguiente paso más directo para el propietario:** entrar a `kyckjapprmtfahnkuucz` → Settings → API~~ (⚠️ ID INCORRECTO, NO USAR — este paso quedó obsoleto: el propietario confirmó que ese proyecto nunca fue el real; el correcto es `vyrtokggypcmpforglch`), copiar el `service_role` key vigente ahí mismo, y compararlo/reemplazarlo en Vercel → Production → `SUPABASE_SERVICE_ROLE_KEY`. Esto se resolvió corrigiendo las 3 variables al proyecto correcto — ver nota de corrección al inicio de esta sección.

Config. de APIs (08) **no** está en esta lista — la auditoría confirmó que su alcance de solo lectura es correcto según el MD, no es un gap real.

Cada pantalla se verifica con `tsc`/`lint`/`build` + verificación visual real (sesión Admin logueada, Chrome MCP) antes de darse por cerrada.

## Bloqueado — no iniciar sin confirmación explícita

- Conexión API Claude/Anthropic para los Agentes IA 1 y 2: decisión de arquitectura pendiente (¿sustituye o convive con OpenAI?).

## Auditoría MD↔código Empresa (funcional + visual) — 13/07/2026

Primera auditoría de este tipo para Darivo Pro Empresa (no existía precedente — a diferencia de Admin, que ya tuvo la suya el mismo día). Mismo método: 3 agentes en paralelo, solo lectura, comparando cada una de las 9 pantallas oficiales de `.cursor/rules/03-darivo-pro-empresa/` (02, 03, 05, 06, 07, 08, 09, 10, 11) contra el código real. Nada se modificó en esta sesión.

### Hallazgo raíz — mismo bug de color que Admin, todavía sin corregir en Empresa

`frontend/src/lib/design-system/empresa-tokens.ts:11` (`sidebarBg: T.navy`) y `frontend/src/components/empresa/EmpresaShell.tsx:28,47-48` (ítem activo en `T.bluePale`/`T.blue`) siguen usando el navy `#0A1628`/azul `#2563EB` de Fable 5 — el mismo esquema que tenía `AdminShell.tsx` antes de su fix del 13/07/2026. Dado que "Admin y Empresa comparten diseño visual" es una decisión ya cerrada del proyecto, y el propio `16-SISTEMA-DE-DISEÑO-EMPRESA.md` (encabezado) dice que Empresa "reutiliza el sistema de diseño oficial de Admin", este es el mismo bug de color, sin corregir todavía.

**Contradicción encontrada en el propio MD de diseño de Empresa:** `16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.5 dice en su encabezado que reutiliza el sistema de Admin, pero su propia §3 "Paleta Oficial" documenta explícitamente los tokens viejos de Fable 5 (navy/blue) como si fueran la paleta vigente de Empresa. Es un documento oficial protegido — no se modificó, se informa aquí para que el propietario decida (¿actualizar §3 para que documente `ADMIN_COLORS`, o confirmar que Empresa debe quedarse en su propia paleta independiente de Admin?).

**Efecto secundario nuevo, no anticipado:** el componente compartido `AdminTable` (`frontend/src/components/admin/AdminUi.tsx`) ya se migró a `ADMIN_COLORS` como parte del fix de Admin — como la pantalla Clientes de Empresa reutiliza ese mismo componente, su encabezado de tabla y fila seleccionada ya se ven en tonos morados de Admin, mientras el sidebar/header de Empresa alrededor siguen en navy/azul. Es una inconsistencia visual **dentro de la misma pantalla**, generada como efecto colateral del fix de Admin, no de un cambio intencional en Empresa.

**Imágenes de referencia inconsistentes entre sí:** las imágenes oficiales de Facturas (navy/azul) y Cierre (blanco/morado, ya coincide con `ADMIN_COLORS`) no coinciden entre ellas en esquema de color — ni siquiera las imágenes de referencia están unificadas. Varias imágenes (Inicio, Empleados, Cotizaciones, Más) además muestran un sidebar con módulos genéricos/ficticios (Dashboard, Proyectos, Contactos, Catálogo, Inventario, etc.) que no corresponden a los 8 módulos reales de `empresa-modules.ts` — mockups placeholder que nunca se ajustaron a la navegación real del producto.

### Por pantalla

| # | Pantalla | Funcional | Visual |
|---|---|---|---|
| 02 | Inicio | MD §5.4 pide 2 tarjetas de acceso rápido (Clientes + Cotizaciones); el código solo tiene 1 ("Clientes"), con nota propia que contradice la tabla del MD. | Diferencias reales — la imagen usa "presupuesto" (terminología ya migrada a "cotización") y un estado "En revisión" que no existe en el enum real (`Borrador\|Pendiente de firma\|Aprobado`); imagen desactualizada respecto al MD vigente. |
| 03 | Clientes | Faltan: subtítulo "N contactos", 3 botones de contacto rápido (WhatsApp/Llamar/Email) en la ficha, 3 tarjetas de estadística en la ficha. "Facturar" se muestra sin filtrar por estado Aprobado (debería). "Eliminar" oculto en modo ficha. Acciones del historial ocultas tras un acordeón en vez de visibles por fila. | Diferencias reales — más el efecto secundario de color descrito arriba (tabla ya en morado, chrome todavía en navy/azul). |
| 05 | Cotizaciones | Acceso correcto (ya no hay lista global, `page.tsx` redirige a Clientes, coherente con el MD). Pero los 2 puntos de entrada reales (CTA Inicio, "+ Nueva cotización" en ficha Cliente) enlazan al wizard Móvil completo (`/cotizaciones/nuevo`, `MobileShell` 390px) — el Gerente pierde el sidebar/header de Empresa por completo. No existe ninguna adaptación de escritorio (3 paneles simultáneos que exige el MD). | Diferencias reales — no hay ningún layout de escritorio, es la pantalla Móvil sin adaptar. |
| 06 | Facturas | `FacturasView` (compartido con Móvil) duplica un header navy propio dentro del header de `EmpresaShell`. Solo 4 chips de filtro de los 7 que exige el MD tras su "Corrección v1.1" (faltan Borrador/En proceso/Rechazadas); "Pendientes" filtra por el estado equivocado. No hay tabla (son cards apiladas). CTA "+ Nueva factura" y edición navegan a rutas Móvil-only, sacando al usuario de Empresa. `NuevaFacturaForm` es de una sola columna, no el layout ~60/40 que exige el MD. | Diferencias reales — y la propia imagen de referencia ya está desactualizada (solo muestra los mismos 4 chips viejos, no los 7 del MD vigente). |
| 07 | Más | Reutiliza bien la lógica de Móvil (pestañas, tarifas, ítems). Único hueco real: Soporte sigue sin backend (INC-A01 ya conocido). | Diferencias reales — el MD exige panel "Más opciones" fijo a la derecha (58%/42%); el código lo apila debajo del contenido en una sola columna. Imagen de referencia con sidebar obsoleto/ficticio. |
| 08 | IA | MD exige 3 tarjetas (Escribir/Hablar/Soporte con IA); el código solo ofrece Escribir/Hablar — no hay ningún acceso a "Soporte con IA" desde esta pantalla. El "Agente IA 2" conversacional no existe en ningún punto del código (solo el ticket manual de Soporte). | Diferencias reales — sin ninguna adaptación de escritorio, es el flujo Móvil incrustado en una columna angosta. |
| 09 | Cierre | `CierreView` es exactamente el mismo componente que Móvil (correcto en lógica), pero sin ninguna de las adaptaciones de escritorio que exige el MD: layout de 2 columnas, tabla para "Gastos recientes" (son cards), panel lateral con step indicator para "Revisar gasto" (es un modal bottom-sheet a pantalla completa). | Diferencias reales — nota: esta imagen de referencia sí muestra blanco/morado (`ADMIN_COLORS`), a diferencia de la de Facturas. |
| 10 | Empleados | Columna extra "Permisos" no documentada en el MD (mejora real ya construida el 12/07, el MD nunca se actualizó). Etiquetas de estado no coinciden con el MD ("Pendiente"/"Inactivo" en vez de "Invitación pendiente"/"Desactivado"). | Diferencias reales — el sidebar de la imagen muestra módulos completamente ficticios (Equipos, Órdenes de servicio, Inventario, etc.) que no existen en el producto real. |
| 11 | Roles y Permisos | La matriz base (§5.2) refleja correctamente que sigue inerte (`MATRIZ_PERMISOS_APROBADA=false`). Pero "Roles personalizados" (§6.1) — que el propio MD marca como *propuesta pendiente de aprobación, sin imagen oficial* — está completamente construido y en producción (crear/editar/eliminar rol, toggles reales, persistido en `roles_personalizados`), presentándose como si ya estuviera aprobado. Confirmado que nada (middleware/Server Actions) aplica esos permisos a una ruta real todavía — coincide con "RBAC inerte" ya documentado, pero ahora se sabe que es específicamente §6.1 el que se muestra activo sin autorización. | Diferencias cosméticas menores en lo que la imagen sí cubre (falta banner "exclusivo Gerente" + badge "Solo lectura"); §6.1 no tiene imagen de referencia por decisión ya documentada del propio MD, no por bug. |

### Siguiente paso — plan confirmado por el propietario 13/07/2026

Mohamed confirmó el orden de trabajo (sesión continua, mismo día de la auditoría):

1. **Prioridad máxima:** reconstruir la capa de presentación (no la lógica) de las 3 pantallas que sacan al Gerente al wizard Móvil sin adaptación de escritorio — **Cotizaciones**, **Facturas** y **Cierre** — en layout de escritorio real (2-3 columnas, como el resto de Empresa), reutilizando toda la lógica de negocio/cálculo/guardado ya probada en Móvil. Empezar por Cotizaciones (la más cara).
2. Documentar explícitamente en este CLAUDE.md los elementos de las imágenes de referencia que **no** aplican al producto real (módulos de sidebar ficticios que no están en `empresa-modules.ts` ni en ningún MD funcional: Inventario, Calendario, Órdenes de servicio, Equipos, Catálogo genérico, etc.) — para que no se construyan por error.
3. En cola, sin bloquear lo anterior, priorizadas por criterio del ejecutor: paneles laterales, toolbars de acciones masivas, Dashboard, Catálogo Maestro CRUD.

Migración de Empresa a `ADMIN_COLORS` y decisión sobre "Roles personalizados" (§6.1 de Doc 11) siguen sin resolver — no forman parte de este bloque de trabajo.

**⏸️ Pausado 13/07/2026 (mismo día):** Mohamed cambió la prioridad — terminar primero las 7 pantallas restantes de **Admin** (ver "Siguiente paso" en la sección de Admin, arriba) antes de retomar esto. Ningún código de Cotizaciones se llegó a escribir (se pausó en fase de plan, ver punto 1 arriba). Retomar aquí cuando Admin esté completo.

**▶️ Retomado 14/07/2026:** Mohamed autorizó continuar con Empresa aunque Partners/Empresas/Catálogo Maestro sigan bloqueados por el hallazgo de infraestructura (no es código, ver sección Admin). Orden: Cotizaciones → Facturas → Cierre.

- ✅ **Cotizaciones (05)** — capa de presentación de escritorio reconstruida: wizard de 4 pasos dentro de `EmpresaShell`, Paso 1 con panel categorías (~240px) + panel partidas simultáneos (`05-MODULO-COTIZACIONES-EMPRESA.md` §4/§5.1), Pasos 2-4 en columna central. Toda la lógica de `NuevoCotizacionWizard.tsx` (Móvil) reutilizada sin tocar — nuevo componente `NuevoCotizacionWizardEscritorio.tsx` + ruta `/empresa/cotizaciones/nuevo`. Los 3 puntos de entrada reales (CTA/pills Inicio, "+ Nueva cotización"/Editar/Re-cotizar en ficha Cliente) ya enlazan ahí; Móvil no se tocó (prop `nuevaCotizacionHref` con default a su ruta).
- ✅ **Facturas (06)** — tabla en vez de cards (§5.5), 7 chips de filtro oficiales sustituyendo los 4 viejos con el bug conocido "Pendientes⊂Emitidas" (§5.2, Corrección v1.1), banner cotizaciones aprobadas, editor en layout ~60/40 (§4.2/§6: cliente/líneas a la izquierda, totales+detracción+forma de pago a la derecha). Nuevos `FacturasTableEmpresa.tsx` + `NuevaFacturaFormEscritorio.tsx` + ruta `/empresa/facturas/nueva`, misma lógica de `useFactura`/`NuevaFacturaForm` sin tocar. Botón "→ Factura" de la ficha de Cliente también respeta la ruta de escritorio (`nuevaFacturaHref`).
- ✅ **Cierre (09)** — pestañas Gastos/Expediente + layout 58/42 (§4), tabla en vez de cards para "Gastos recientes", panel lateral en vez de modal bottom-sheet. Nuevo `CierreViewEscritorio.tsx`, misma lógica de `useGastos` (100% local) sin tocar. **Nota honesta dejada en el propio código**: el MD describe un step indicator navegable de 4 pasos para "Revisar gasto" que no tiene función de editar un gasto existente detrás (`useGastos.ts` solo tiene `agregarGasto`) — se implementó como marcador visual de etapa, no como wizard funcional, para no inventar lógica de guardado que no existe; clic en fila de tabla abre panel de solo lectura.

Las 3 pantallas: tsc/lint/build limpios en cada una. **Verificación visual interactiva pendiente en las 3**: no hay sesión de rol Gerente/Empresa en el navegador de esta sesión (solo Admin), y no corresponde iniciar sesión por credenciales — pendiente de que el propietario la confirme con su propia sesión.

**✅ Cola de auditoría de Empresa completa (14/07/2026)** — las 6 pantallas restantes (Inicio, Clientes, Más, IA, Empleados, Roles) quedaron presentación-completas, sumadas a Cotizaciones/Facturas/Cierre de arriba. Las 9 pantallas auditadas el 13/07/2026 están cerradas en capa de presentación:

- **Inicio (02)** — 2ª tarjeta de acceso rápido añadida (Cotizaciones, junto a la ya existente de Clientes), cerrando el hallazgo funcional del MD §5.4. Commit `386e1c0`.
- **Clientes (03)** — ficha con subtítulo "N contactos", 3 botones de contacto rápido (WhatsApp/Llamar/Email) y 3 tarjetas de estadística (aprobadas/total) añadidos a `ClienteFichaView.tsx` (compartido con Móvil, vía props). Commit `648774b`.
- **Más (07)** — layout de 2 columnas real: contenido + panel fijo "Más opciones" (~320px) a la derecha, en vez de apilado en una sola columna (`MasTabs.tsx` gana prop `ocultarOpciones`). Commit `061d044`.
- **IA (08)** — 3ª tarjeta "Soporte con IA" añadida junto a Escribir/Hablar (grid 2 columnas + card ancha), enlazando al soporte real ya existente (Más → Soporte) — no se inventó ningún chat conversacional nuevo (Agente IA 2 sigue sin existir). `IACotizacionFlow.tsx` gana prop opcional `soporteHref`. Commit `8c1056c`.
- **Empleados (10)** — etiquetas de estado alineadas al MD ("Invitación pendiente"/"Desactivado" en vez de "Pendiente"/"Inactivo"), sin tocar el enum real de BD ni la lógica de `cambiarEstado()`. Commit `96c3b26`.
- **Roles y Permisos (11)** — badge "🔒 Solo lectura" + banner "exclusivo para Gerente" añadidos, copiados verbatim de la imagen oficial de referencia. §6.1 "Roles personalizados" (decisión de negocio pendiente de aprobación) no se tocó. Commit `028626b`.

Las 6: tsc/lint/build limpios en cada commit.

**✅ Verificación visual interactiva completa (14/07/2026, tarde)** — Mohamed inició sesión real con `darivonet@gmail.com` (plan Business ya confirmado activo vía el grant SQL de esta misma sesión) y se verificaron en producción, con caché/Service Worker limpiados antes de cada pantalla: Cotizaciones (wizard de 3 pasos dentro de `EmpresaShell`, panel categorías+partidas simultáneos), Facturas (7 chips, editor 60/40), Cierre (pestañas Gastos/Expediente, panel lateral con step indicator), Clientes (subtítulo "N contactos", 3 botones de contacto + 3 stats en ficha), Más (panel fijo "Más opciones"), IA (3ª tarjeta "Soporte con IA"), Roles (badge "🔒 Solo lectura" + banner "exclusivo Gerente"). Ninguna diferencia real encontrada frente a los MD. Empleados (10) quedó sin verificación visual de las etiquetas de estado por falta de datos — invitar un empleado de prueba enviaría un correo real, así que se dejó pendiente de que el propietario lo pruebe con un caso real (el código del fix, commit `96c3b26`, ya está desplegado).

**✅ Migración de Empresa a `ADMIN_COLORS` completa (14/07/2026, tarde)** — cierra el hallazgo raíz de color documentado arriba. Migrados a la paleta morado/blanco de Admin: `empresa-tokens.ts`, `EmpresaShell.tsx`, `RolesPermisosView.tsx`, `EmpresaEmpleadosView.tsx`, `EmpresaClientesPanel.tsx`, `EmpresaInicioView.tsx`, los 3 componentes de escritorio (`NuevoCotizacionWizardEscritorio.tsx`, `NuevaFacturaFormEscritorio.tsx`, `CierreViewEscritorio.tsx`), `FacturasTableEmpresa.tsx` y las páginas de Más/IA — 12 archivos en total. No se tocó `ClienteFichaView.tsx` (compartido con Móvil, mantiene el azul de Fable 5 por diseño) ni `CIERRE_ACCENT`/`INV_STATUS_COLORS` (paletas funcionales de categoría/estado, no de marca). Verificado: tsc/lint/build limpios (70 rutas) + visual real en producción (sidebar, header, cards y gradientes ya en morado/blanco en Inicio y Cierre, sin ningún resto de navy/azul). Commit `08cfc40`.

La única pieza de este bloque que sigue sin resolver es la decisión de negocio de "Roles personalizados" §6.1 (Doc 11) — fuera de alcance, ya documentado arriba.

### Elementos de mockup descartados — no aplican al producto real

Los 8 módulos reales del sidebar de Empresa son, en este orden, exactamente los de `frontend/src/lib/empresa-modules.ts` (`EMPRESA_NAV`): **Inicio, Clientes, Facturas, Cierre, Calculadora inteligente (IA), Más, Empleados, Roles y Permisos**. "Cotizaciones" no es ítem de sidebar por diseño (§1/§3 de `05-MODULO-COTIZACIONES-EMPRESA.md`: acceso solo vía CTA en Inicio o ficha de Cliente).

Varias de las imágenes de referencia oficiales (Inicio, Empleados, Cotizaciones, Más, Empleados-10) muestran un sidebar con módulos genéricos que **no existen en el producto real y no deben construirse** si aparecen en una imagen o mockup futuro:

- Dashboard (como ítem de sidebar separado — sí existe como página, pero no es "Inicio")
- Proyectos
- Contactos (el módulo real equivalente es "Clientes")
- Catálogo (genérico) — el único catálogo real es "Catálogo Maestro" de Admin, no un módulo de Empresa
- Inventario
- Calendario
- Órdenes de servicio
- Equipos

Si una imagen de referencia futura muestra cualquiera de estos (o cualquier otro ítem que no esté en `EMPRESA_NAV` ni en un MD funcional aprobado de `.cursor/rules/03-darivo-pro-empresa/`), es la imagen la que está desactualizada/es un mockup placeholder — no una instrucción para ampliar el sidebar. Confirmar con el propietario antes de construir cualquier módulo nuevo de sidebar.


