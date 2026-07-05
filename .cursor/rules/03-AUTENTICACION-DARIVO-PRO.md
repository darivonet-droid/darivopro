# 03 – AUTENTICACIÓN – DARIVO PRO

**Versión:** 1.0

**Fecha:** 03/07/2026

**Estado:** Documento técnico oficial — implementación Darivo Pro Móvil

**Referencias:** `01-VISION-DEL-PRODUCTO.md` v2.6 §14 · `DARIVO-PRO-ARQUITECTURA-MAESTRA.md` §10.4 · `02-BASE-DATOS.md` §4.1 (`perfiles`) · `08-PANEL-ADMIN-CONFIGURACION-DE-APIS.md` §5.1 (Supabase Auth)

**API oficial:** Supabase Auth — única proveedora de autenticación del ecosistema.

---

# 1. Objetivo

Documentar el **sistema de autenticación implementado** en Darivo Pro Móvil: flujos, rutas, sesiones, integración con `perfiles` y medidas de seguridad.

No define roles, planes ni permisos — ver `04-ROLES-PLANES-PERMISOS-DARIVO-PRO.md` v1.0 (Tarea 04).

---

# 2. Principios (Visión §14 · AM §10.4)

* Autenticación **centralizada** vía Supabase Auth.
* Tenant = `auth.users.id` = `perfiles.id`.
* Sesión en **cookies HTTP** gestionadas por `@supabase/ssr`.
* Route Handlers y Server Components validan con `getUser()` — nunca confiar solo en middleware.
* Credenciales solo en variables de entorno (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` server-only).

---

# 3. Clientes Supabase

| Cliente | Archivo | Uso |
|---------|---------|-----|
| Browser | `frontend/src/lib/supabase/client.ts` | Client Components — login, registro, hooks |
| Server | `frontend/src/lib/supabase/server.ts` | Server Components, Route Handlers |
| Admin (service role) | `frontend/src/lib/supabase/admin.ts` | Operaciones privilegiadas server-only (Storage) |

**Regla:** `createBrowserClient` en `"use client"` · `createServerClient` en server/route.

---

# 4. Flujos oficiales

## 4.1 Registro

| Paso | Implementación |
|------|----------------|
| Pantalla | `/registro` — `(public)/registro/page.tsx` |
| Método | `supabase.auth.signUp({ email, password, options })` |
| Metadatos | `nombre_empresa` → trigger `handle_new_user` → `perfiles.razon_social` |
| Confirmación email | `emailRedirectTo` → `/auth/callback?next=/onboarding/1` |
| Sesión inmediata | Si Supabase devuelve `session`, upsert `perfiles` + redirect onboarding |
| Validación | Contraseña mínimo **8** caracteres · confirmación coincidente |

## 4.2 Inicio de sesión

| Paso | Implementación |
|------|----------------|
| Pantalla | `/login` — `(public)/login/page.tsx` |
| Método | `supabase.auth.signInWithPassword({ email, password })` |
| Éxito | Redirect `/dashboard` |
| Errores | Mensajes en español peruano (mapa `ERRORES`) |

## 4.3 Recuperación de contraseña

| Paso | Implementación |
|------|----------------|
| Solicitud | `/recuperar` — `resetPasswordForEmail` → redirect `/nueva-contrasena` |
| Nueva contraseña | `/nueva-contrasena` — `updateUser({ password })` tras sesión recovery |
| Post-cambio | `signOut()` + redirect `/login` |
| Validación | Contraseña mínimo **8** caracteres (alineado con registro) |

## 4.4 Callback OAuth / confirmación email

| Paso | Implementación |
|------|----------------|
| Ruta | `/auth/callback` — `auth/callback/route.ts` |
| Método | `exchangeCodeForSession(code)` |
| Destino | Query `next` (default `/onboarding/1`) |
| Error | Redirect `/login?error=confirmacion` |

## 4.5 Onboarding post-registro

| Paso | Ruta | Acción |
|------|------|--------|
| 1 | `/onboarding/1` | Datos empresa → upsert `perfiles` |
| 2 | `/onboarding/2` | Categorías → `perfiles.categorias` |
| 3 | `/onboarding/3` | `onboarding_done: true` → `/dashboard` |

**Layout:** `onboarding/layout.tsx` — requiere sesión; redirige si `onboarding_done`.

## 4.6 Cierre de sesión

| Ubicación | Método |
|-----------|--------|
| Módulo Más → Empresa | `AjustesForm.tsx` — `signOut()` → `/login` |

---

# 5. Protección de rutas

## 5.1 Middleware

**Archivo:** `frontend/src/middleware.ts`

* Refresca sesión Supabase en cada request.
* Rutas públicas: `/login`, `/registro`, `/recuperar`, `/nueva-contrasena`, `/precios`, `/auth/callback`.
* Sin sesión → redirect `/login` (excepto `/` y públicas).
* Con sesión en rutas invitado → redirect `/dashboard`.
* **Matcher excluye `/api/`** — cada Route Handler autentica por separado.

## 5.2 Layout autenticado

**Archivo:** `frontend/src/app/(auth)/layout.tsx`

* `getUser()` — sin usuario → `/login`.
* `onboarding_done` — si false/null → `/onboarding/1`.

## 5.3 Route Handlers

Todos verifican `getUser()` antes de procesar:

* `/api/pdf/presupuesto/[id]`
* `/api/pdf/factura/[id]`
* `/api/ia/presupuesto`
* `/api/whatsapp/enviar`

Respuesta sin sesión: **401**.

---

# 6. Tabla `perfiles` y autenticación

| Aspecto | Detalle |
|---------|---------|
| Relación | `perfiles.id` PK = FK → `auth.users(id)` ON DELETE CASCADE |
| Creación | Trigger `handle_new_user` (006) al insert en `auth.users` |
| RLS | `auth.uid() = id` — políticas SELECT/INSERT/UPDATE (001, 006) |
| Campos auth-related | `onboarding_done`, `plan_tipo`, `razon_social` (registro) |

Ver columnas completas: `02-BASE-DATOS.md` §4.1.

---

# 7. Backend legacy (FastAPI)

**Estado:** deprecado para producto Móvil.

`backend/core/auth.py` valida JWT Supabase (`Bearer`) para API legacy. No extender. Producto oficial usa Route Handlers Next.js.

---

# 8. Seguridad

| Control | Estado |
|---------|--------|
| JWT en cookies httpOnly (SSR) | ✅ `@supabase/ssr` |
| Service role solo server | ✅ `admin.ts` |
| RLS en `perfiles` | ✅ |
| Rate limit errores Supabase | ✅ mensajes UX |
| Password recovery invalida sesión previa | ✅ signOut post-update |
| API routes sin auth | ✅ 401 |

---

# 9. Deuda técnica (otras tareas)

| ID | Descripción | Tarea |
|----|-------------|-------|
| DT-03-01 | Auth Admin / Empresa / Partner | ✅ Guards Tarea 11 (`DARIVO_*_EMAILS`) |
| DT-03-02 | Roles y permisos post-auth | Tarea 04 |
| DT-03-03 | OAuth social (Google, etc.) no documentado | Decisión propietario |

---

# 10. Mapa de archivos

```
frontend/src/
├── middleware.ts
├── lib/supabase/client.ts | server.ts | admin.ts
├── app/
│   ├── page.tsx                    → redirect login/dashboard
│   ├── auth/callback/route.ts
│   ├── (public)/login|registro|recuperar|nueva-contrasena/
│   ├── (auth)/layout.tsx           → sesión + onboarding
│   ├── onboarding/1|2|3/
│   └── api/*/route.ts              → getUser() obligatorio
supabase/migrations/
└── 20260705120000_baseline_v2.sql   → 32 tablas, perfiles, triggers auth, RLS
```

---

# 11. Estado del documento

**Versión:** 1.0 · **Estado:** Documento Oficial (03/07/2026).

**Fin del documento.**
