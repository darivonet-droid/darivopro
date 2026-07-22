# Cambios 20/07/2026 (sesión aparte, la más reciente del día) — Redirección post-login por rol + timestamp Perú en Clientes

Pedido por Mohamed el 20/07/2026, en dos partes. Modo de trabajo indicado explícitamente: "sobre main, autónomo, sin preguntas" — interpretado como equivalente a **"producción autónomo"** para esta tarea (mismo efecto: main directo, sin pausas de Deploy), aunque no usó la frase literal exacta; se documenta aquí esa interpretación en vez de asumirla en silencio.

### PARTE 1 — Redirección post-login por producto+rol real

**Investigación previa (Regla de oro) cambió el diagnóstico real de "el problema" reportado:** el callback (`auth/callback/route.ts`) **nunca dejaba un `?code=` sin procesar** — siempre lo intercambia por sesión o redirige a `/login?error=confirmacion`; y la redirección post-login (fix del 19/07/2026) ya no hardcodeaba `/dashboard`. Lo que sí seguía sin resolver, y es lo que esta tarea pedía en realidad: **el destino se decidía por el subdominio desde el que se entraba a `/login`, no por el rol real del usuario en BD** — un Partner que entrara por error desde `darivopro.com/login` (en vez de `partners.darivopro.com`) seguía cayendo en `/dashboard`. Además, como red de seguridad adicional (no reproducida en esta sesión, pero posible si el Site URL/Redirect URLs de Supabase Auth Dashboard no coinciden exactos con `redirectTo`): se blindó también la raíz pública para que un `?code=` que por config de Supabase cayera ahí en vez de en `/auth/callback` nunca quede expuesto sin procesar.

**Construido:**
- **`frontend/src/lib/destino-post-login.ts`** (nuevo) — `resolverDestinoPostLogin(supabase, user)`, única fuente de verdad del destino real: Admin (allowlist `DARIVO_ADMIN_EMAILS`) → `admin.darivopro.com/admin`; Partner (allowlist + `partners.estado`) → `partners.darivopro.com/partner`; Empresa + Gerente (dueño real, `empresas.gerente_user_id === user.id`) → pantalla selector; cualquier otro caso (Empresa + Técnico, o "solo" sin empresa) → `/dashboard` (Móvil). Reemplaza `destinoPostLogin(hostname)` (`subdominios.ts`, fix 19/07/2026) como criterio de enrutado — esa función y `baseDeSubdominio` **no se tocaron ni se eliminaron** (siguen siendo la fuente del rewrite de `/` cuando `SUBDOMAIN_ROUTING_ENABLED==="1"`), simplemente dejaron de llamarse desde login/middleware/callback.
- **`auth/callback/route.ts`** (Google OAuth): ya no recibe `next` con el destino calculado por hostname — si `next` viene explícito (solo lo manda `registro/page.tsx`, siempre `/onboarding/1` para confirmación por correo) se respeta literal; si no viene (login por Google), resuelve por rol real vía la función de arriba.
- **`login/page.tsx`**: `entrarConGoogle()` ya no arma `next` por hostname. `entrar()` (contraseña) pide el destino a una API nueva (`GET /api/auth/destino-post-login`, ver abajo) y navega según el tipo devuelto (`ruta` → `router.push`; `externo` → `window.location.href`, cruza de dominio; `selector` → `/elige-panel`).
- **`frontend/src/app/api/auth/destino-post-login/route.ts`** (nuevo): la única forma de que el flujo de contraseña (100% cliente) resuelva el rol sin exponer allowlists de servidor — lee la sesión ya autenticada por cookie y llama a la misma función de resolución.
- **`middleware.ts`**: el bloque "usuario ya logueado que reabre /login/registro/recuperar" ahora también resuelve por rol real (antes `destinoPostLogin(hostname)`), incluyendo el caso `externo` (redirect cruzando de dominio) y `selector`.
- **`frontend/src/app/(public)/elige-panel/page.tsx`** (nuevo) — pantalla de selección simple para Empresa + Gerente: dos opciones, "Darivo Pro Móvil" (`/dashboard`) y "Darivo Pro Empresa" (`/empresa`), sin nada más inventado. Un Técnico nunca la ve (va directo a Móvil).
- **`app/page.tsx`** (landing pública): red de seguridad — si llega `?code=` a la raíz (ej. por un Redirect URL de Supabase que no matchea exacto), se reenvía server-side a `/auth/callback?code=...` en vez de quedar visible sin procesar. Esto vuelve la ruta dinámica (antes estática) — tradeoff aceptado por cerrar un riesgo real de exposición.

**Hallazgo de infraestructura, no de código — 2 de los 5 destinos del pedido original no se pueden usar tal cual:**
- **`app.darivopro.com` sigue sin resolver DNS/Vercel** (confirmado de nuevo hoy, mismo estado que documenta `subdominios.ts` desde el 19/07/2026) — Móvil no tiene destino "externo" propio; se usa `/dashboard` (ruta relativa en el dominio que atendió el login), igual que el resto de la app hoy. Redirigir literalmente a `app.darivopro.com` habría producido un error de DNS para todo usuario de Móvil/Técnico/"solo".
- **`partner.darivopro.com` (sin "s") tampoco resuelve** — el dominio real conectado es `partners.darivopro.com` (con "s", ya documentado en `subdominios.ts` desde el 19/07/2026). Se usó el real.
- Ninguna de las 2 sustituciones es una decisión de negocio inventada — es la misma corrección ya aplicada una vez en la landing pública el 19/07/2026 (enlaces de "Productos" a estos mismos subdominios), mismo criterio.

**"Elige tu plan" para usuario sin producto (punto 4 del pedido) — investigado, no construido:** no existe ni existía una pantalla así, pero tampoco corresponde construir una nueva — el trigger `handle_new_user()` asigna `plan_tipo='gratis'` automáticamente a todo usuario nuevo (Móvil, siempre con producto desde el registro), así que el estado "sin ningún producto asociado" no ocurre en la arquitectura real hoy. El onboarding existente (`/onboarding/1-3`) y `/precios` (upgrade) ya cubren lo que existiría de ese flujo — no se inventó una pantalla nueva para un estado que no se puede alcanzar.

**Recomendación de instalación PWA (iOS/Android) — ya existía para Android, faltaba iOS:** `PwaShell.tsx` ya mostraba el banner de instalación en Android/Chrome vía `beforeinstallprompt` (nunca se dispara en iOS/Safari, limitación de la plataforma, no un bug). Agregada detección de iOS/iPadOS (`esIOS()`, incluye iPad que reporta `MacIntel`) y un banner alternativo con instrucciones ("Toca Compartir → Agregar a pantalla de inicio"), sin botón de instalar (no existe API programática en Safari). No se tocó el flujo Android existente.

**Verificado**: `tsc --noEmit`, `next lint` (mismos 3 warnings preexistentes de `useCotizacion.ts`/`useFactura.ts`, sin relación) y `next build` limpios (83 rutas, incluye `/elige-panel` y `/api/auth/destino-post-login` nuevas). **Pendiente verificar en vivo** (ver checklist más abajo, esta misma sesión): login de cada caso (Móvil solo, Empresa+Gerente, Empresa+Técnico, Partner, Admin), y que ningún `?code=` quede visible sin procesar. **El login por Google en sí sigue bloqueado por el mismo hallazgo ya documentado el 20/07/2026 (sesión anterior, más abajo): el proveedor Google seguía sin activar en Supabase Dashboard** — si Mohamed no lo activó todavía, la verificación de Google específicamente no se puede completar (login por contraseña sí se puede probar igual, mismo mecanismo de resolución de destino).

### PARTE 2 — Timestamp real de cotización + filtros Hoy/Semanal/Mensual en hora de Perú

**Investigación previa confirmó que el timestamp ya era correcto — no hacía falta ninguna migración:** `cotizaciones.created_at timestamptz DEFAULT now()` (`baseline_v2.sql:284-303`) ya existía desde el baseline, y `useCotizacion.ts` `crear()` nunca envía un `created_at` propio desde el frontend — el `DEFAULT now()` del servidor de Postgres/Supabase ya resuelve la fecha/hora real al guardar. Nada que migrar ni corregir aquí.

**Lo que sí faltaba: los filtros Hoy/Semanal/Mensual de `/clientes` no fijaban zona horaria** — `cumpleFiltroFecha()` (`lib/utils.ts`, construida el 20/07/2026 en una sesión anterior el mismo día) comparaba con `new Date().toDateString()`, que resuelve en la zona horaria **del navegador del usuario**, no en la de Perú. Corregido: nueva `diaEnLima()` usa `Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", ... })` para comparar el día calendario de la última cotización de cada cliente contra "hoy" **siempre en hora de Perú (UTC-5 fijo, sin horario de verano)**, sin importar en qué zona horaria esté el dispositivo del usuario. Semanal/Mensual no se tocaron — son ventana rolling de 7/30 días en tiempo absoluto (`fecha >= ahora - N*86400000`), no dependen de zona horaria porque no comparan "mismo día calendario".

**Facturas — explícitamente NO tocado, queda pendiente hasta integración SUNAT:** el mismo tratamiento de timestamp/zona horaria para Facturas no se aplicó (pedido explícito de dejarlo fuera de esta tarea). `facturas` ya vive el mismo patrón (`created_at DEFAULT now()`), y sus propios filtros Hoy/Semanal/Mensual (`FacturasView.tsx`, construidos el 20/07/2026) comparten la misma `cumpleFiltroFecha()` — cuando se integre SUNAT/BizLinks (Vision §18, sigue en 0%, sin proveedor OSE contratado) y se retome Facturas, aplicar el mismo criterio de hora de Perú ahí también.

**Verificado**: incluido en el mismo `tsc`/`lint`/`build` de arriba (ambas partes se verificaron juntas, un solo build).

### Checklist de verificación en vivo (pendiente al cierre de esta sesión, ver más abajo si ya se ejecutó)

- [ ] Login Móvil solo → aterriza en `/dashboard`, sin selector.
- [ ] Login Empresa + Gerente → aterriza en `/elige-panel`, ambas opciones navegan bien.
- [ ] Login Empresa + Técnico → aterriza directo en `/dashboard`, nunca ve el selector.
- [ ] Login Partner → aterriza en `partners.darivopro.com/partner`.
- [ ] Login Admin → aterriza en `admin.darivopro.com/admin`.
- [ ] Ninguna URL final contiene `?code=` sin procesar.
- [ ] Guardar una cotización nueva → `created_at` real de Perú (confirmar con el valor guardado, no solo que no dio error).
- [ ] Filtro "Hoy" en `/clientes` refleja el día calendario de Perú, no el del dispositivo de prueba.
- [ ] Facturas — confirmar que no cambió nada (mismo comportamiento de antes).

