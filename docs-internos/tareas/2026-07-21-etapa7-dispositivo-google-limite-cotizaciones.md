# Etapa 7 — Restricción por dispositivo, fix registro Google y límite plan Gratis (continuación) (21/07/2026)

Pedido nuevo del propietario, 3 tareas: (1) restricción de acceso por dispositivo con BLOQUEO TOTAL, (2) investigar/corregir bug reportado "registro nuevo con Google aterriza en Empresa", (3) confirmar/corregir el límite de 5 cotizaciones de por vida en plan Gratis (Móvil). Commits en `develop`, no en `main`, sin push, sin ejecutar SQL. `frontend/public/sw.js` (cambio ajeno) fuera de todos los commits.

### Tarea 1 — Restricción de acceso por dispositivo (BLOQUEO TOTAL) — ⚠️ REVERTIDA el mismo día (21/07/2026, ver "Reversión de bloqueo total por dispositivo → banner informativo" en ESTADO REAL DEL PROYECTO)

**Esta sección queda como historial de lo que se construyó originalmente — YA NO ES EL COMPORTAMIENTO VIGENTE.** El bloqueo total descrito abajo fue eliminado el mismo día por decisión de Mohamed: ningún usuario debe quedar impedido de navegar por tipo de dispositivo. Lo vigente hoy es un aviso informativo no bloqueante — ver la entrada de reversión más abajo para la implementación real actual.

Tabla exacta (Admin/Gerente solo ordenador; Técnico/Móvil-independiente solo Móvil; Partner sin restricción — único rol así) implementada en `frontend/src/middleware.ts:84-99` (bloque nuevo, se ejecuta justo después de resolver sesión, antes de los checks de `/admin`/`/partner`/`/empresa`, y antes de dejar pasar la request a cualquier ruta protegida). Lógica centralizada: `frontend/src/lib/restriccion-dispositivo.ts` (funciones puras: `esUserAgentMovil()` — regex `Android|iPhone|iPad|iPod` sobre el header `user-agent`, sin librería nueva; `dispositivoPermitido(rol, esMobile)`; `mensajeDispositivoCorrecto(rol)`) + `frontend/src/lib/restriccion-dispositivo-server.ts` (`resolverRolDispositivo()`, depende de Supabase/`acceso-producto.ts`). **Separado en 2 archivos a propósito**: la pantalla de bloqueo (`(public)/dispositivo-no-disponible/page.tsx`) es un client component que necesita los mensajes/tabla, pero `resolverRolDispositivo()` importa `acceso-producto.ts` → `lib/supabase/server.ts` → `next/headers` (server-only) — si todo viviera en un solo archivo, el build fallaba (`next/headers` no soportado en un client component, confirmado con `next build` real antes de separar).

**Resolución de rol reutiliza el mismo criterio ya usado por `destino-post-login.ts`/`rol-empleado.ts`, sin consulta extra**: Admin vía `esAdministradorDarivo()`, Partner vía `esPartnerAutorizado()`, Gerente vía `perfiles.empresa_id` + `empresas.gerente_user_id === user.id` (mismo patrón que `esGerenteDeEmpresa()`). Técnico y Móvil-independiente **comparten exactamente la misma restricción** (Solo Móvil), así que no hace falta distinguirlos con una consulta a `empresa_empleados` (que además un Técnico no puede leer con el cliente de sesión, solo el Gerente vía RLS) — ambos colapsan a la categoría `"movil"`.

Nueva pantalla `/dispositivo-no-disponible` (`(public)/dispositivo-no-disponible/page.tsx`) — bloqueo real, no solo aviso: el middleware redirige ahí en vez de dejar pasar la request a la ruta protegida real, con `?rol=` indicando qué mensaje mostrar ("Usa un ordenador"/"Usa tu teléfono", según el rol real detectado); incluye botón "Cerrar sesión". No aplica a rutas públicas ni a "/" (excluidas explícitamente en el middleware) ni a sí misma (evita loop de redirect).

**Verificado**: `tsc --noEmit`, `next lint` (mismos 3 warnings preexistentes) y `next build` limpios (82 rutas, incluye `/dispositivo-no-disponible` nueva). No verificado en vivo con sesión real de cada rol (mismo bloqueo de credenciales de siempre) — recomendado que el propietario confirme con su cuenta Admin desde el celular (debe bloquear) y con una cuenta Técnico desde PC (debe bloquear).

### Tarea 2 — Bug "registro nuevo con Google aterriza en Empresa": NO reproducido en el código actual

Trazado completo del flujo real: **no existe ningún botón "Continuar con Google" en `/registro`** (`frontend/src/app/(public)/registro/page.tsx`, confirmado leyendo el archivo completo — solo tiene formulario de correo/contraseña) — el único botón de Google del proyecto vive en `/login` (`login/page.tsx:143`, `entrarConGoogle()`), y ese mismo flujo sirve tanto para login recurrente como para el primer registro real (Supabase crea la cuenta automáticamente en el primer `signInWithOAuth` exitoso). Se corrige aquí el enunciado de la tarea: el botón está en `/login`, no en `/registro`.

Trazado del flujo real desde ahí: `entrarConGoogle()` → `signInWithOAuth({provider:"google"})` sin `next` → `auth/callback/route.ts:52` intercambia el código → como no viene `next` (línea 27, solo lo manda `registro/page.tsx` en el flujo de confirmación por correo, siempre `/onboarding/1`) → `resolverDestinoPostLogin(supabase, data.user)` (`destino-post-login.ts:51-65`). Para un usuario genuinamente nuevo: `esAdministradorDarivo()`→false, `esPartnerAutorizado()`→false, `esGerenteDeEmpresa()` (`destino-post-login.ts:27-41`) lee `perfiles.empresa_id` — **`handle_new_user()` (`baseline_v2.sql:550-566`) nunca asigna `empresa_id` ni `plan_tipo` distinto de `'gratis'`** a un usuario nuevo (confirmado leyendo la función completa) — así que `perfil.empresa_id` es `null`, la función retorna `false` de inmediato (línea 33, sin necesidad de consultar `empresas`), y `resolverDestinoPostLogin()` cae al último `return` (línea 64): `{tipo:"ruta", ruta:"/dashboard"}` — Móvil, nunca Empresa ni el selector.

Además, aunque aterrizara en `/dashboard`, `(auth)/layout.tsx:33` (`if (!perfil?.onboarding_done) redirect("/onboarding/1")`) intercepta de inmediato porque `onboarding_done` nace `false` — el usuario nuevo nunca ve el panel de Móvil sin pasar antes por onboarding.

**Conclusión: el bug descrito no se reproduce en el código actual, con evidencia de trazado archivo:línea.** Coincide con que este exacto síntoma (destino resuelto por hostname de entrada en vez de por rol real) ya fue diagnosticado y corregido el 20/07/2026 ("PARTE 1 — Redirección post-login por producto+rol real", ver más abajo) — antes de ese fix, el destino se resolvía por el subdominio desde el que se entraba a `/login`, no por el rol real; ese código viejo (`destinoPostLogin(hostname)`) fue además eliminado por completo en la Etapa 1 de la auditoría de seguridad (commit `fa7355f`), así que no puede estar causando el síntoma hoy. Sin cambios de código en esta tarea — no había nada que corregir con la evidencia disponible.

**Pregunta abierta real (no resuelta por trazado de código)**: no existe ningún MD oficial dedicado a "Autenticación"/flujo de registro (confirmado contra la tabla de "Documentos de referencia por ámbito funcional" de `01-VISION-DEL-PRODUCTO.md` §12 — no hay fila de Autenticación/Onboarding) — si el propietario sigue viendo el síntoma en producción real, la causa más probable no es el código fuente sino: (a) caché de Service Worker mostrando un build anterior al fix del 20/07/2026 (patrón ya documentado varias veces en este proyecto), o (b) una sesión de navegador que ya tenía cookies de un login previo al fix. Recomendado limpiar Service Worker/caché y repetir el registro con una cuenta de Google nueva antes de asumir que el bug persiste.

### Tensión Tarea 1 × Tarea 2 — confirmada y documentada, no es un bug nuevo

Un usuario Móvil-independiente (nuevo, sin empresa, rol resuelto como `"movil"` en la tabla de dispositivo) que se registra con Google **desde su ordenador** aterriza correctamente en `/dashboard`/`/onboarding/1` (Tarea 2, sin cambios) — pero con la Tarea 1 ya activa, el siguiente request a cualquier ruta protegida de Móvil (`/onboarding/1`, `/dashboard`, etc.) se bloquea de inmediato con `/dispositivo-no-disponible` ("Usa tu teléfono"), porque la tabla de dispositivo exige Solo Móvil para ese rol sin excepción para el registro. **Esta es una consecuencia esperada de aplicar la tabla tal cual, no un bug introducido por ninguna de las 2 tareas** — ambas quedan implementadas exactamente según lo pedido, y su combinación produce este efecto real: hoy, un usuario Móvil-independiente no puede completar el registro/onboarding desde una computadora una vez la Tarea 1 esté activa. Reportado aquí explícitamente para que el propietario decida si es el comportamiento deseado o si el registro/onboarding inicial debe quedar exento de la restricción de dispositivo — no se resolvió por cuenta propia (afecta directamente el flujo de alta de usuarios nuevos, es una decisión de negocio).

### Tarea 3 — Límite plan Gratis: 5 cotizaciones de por vida — YA IMPLEMENTADO del lado cliente, confirmado y reforzado con enforcement real en BD

**Investigación previa confirmó que el enforcement de aplicación ya existía y ya era correcto (de por vida, no mensual)** — no se dedujo de texto/copy, se confirmó en código real: `verificarLimiteCotizacion()` (`frontend/src/lib/plan-limits.ts:62-92`) para `plan==='gratis'` hace `COUNT(*) FROM cotizaciones WHERE user_id=X` (sin filtro de fecha) contra `LIMITES_PLAN.gratis.cotizacionesTotal` (`roles-planes-oficial.ts:39`, valor `5`) — es decir, ya es un conteo de por vida, no mensual (el límite mensual de 20 solo aplica al plan `basico`, rama separada líneas 82-91). Ya está conectado al flujo real: `useCotizacion.ts` `crear()` (línea 138) llama `verificarLimiteCotizacion()` antes de insertar, y si falla dispara `onUpgrade(razon)` → `mostrarUpgrade` (store global) → `UpgradeModal` con el mensaje ya definido en `UPGRADE_MENSAJES.cotizaciones_gratis` (`plan-limits.ts:19-21`, "Ya usaste tus 5 cotizaciones. Pásate a Pro para seguir trabajando."). Aplica solo a `plan_tipo==='gratis'` — un Técnico hereda el `plan_tipo` de su Gerente al ser invitado (Tarea 2, 17/07/2026), así que Empresa nunca cae en esta rama salvo que el Gerente mismo esté en Gratis (caso borde ya existente, no tocado). Ver/editar cotizaciones ya creadas no pasa por `verificarLimiteCotizacion()` (solo se llama en `crear()`, nunca en `listar()`/`actualizar()`/`eliminar()`) — confirmado que no se restringe. Al subir de plan, el chequeo siguiente a `crear()` relee `perfiles.plan_tipo` en vivo (`obtenerPlanTipo()`) — se levanta de inmediato, sin ningún paso manual, confirmado por lectura de código (no hay caché de plan en este chequeo).

**Gap real encontrado y corregido en esta tarea: no había ningún enforcement del lado de base de datos** — el límite vivía únicamente en la capa de aplicación (`useCotizacion.crear()`), y la policy real de `cotizaciones` (`cotizaciones_all`, `baseline_v2.sql:708`, renombrada de `presupuestos_all` en `20260708120000_rename_presupuestos_to_cotizaciones.sql:28`) es `FOR ALL USING (auth.uid() = user_id)` — sin ningún chequeo de conteo. Un usuario con su propio JWT podía saltarse el límite llamando `supabase.from("cotizaciones").insert(...)` directo (vía REST o consola del navegador) sin pasar por `useCotizacion.crear()`. Corregido con un trigger `BEFORE INSERT` (`20260721230000_cotizaciones_limite_gratis_trigger.sql`, **SIN ejecutar**, ver SQL completo abajo): rechaza el INSERT si el `user_id` de la fila (siempre igual a `auth.uid()` por la policy existente) tiene `plan_tipo='gratis'` y ya tiene 5+ filas en `cotizaciones` — mismo umbral (`LIMITES_PLAN.gratis.cotizacionesTotal`) hardcodeado como `5` en SQL (constante duplicada a propósito, no hay forma de compartir una constante TS con un trigger SQL). `service_role` (usado por Server Actions/admin, ninguna hoy inserta cotizaciones en nombre de otro usuario) queda exento vía `auth.uid() IS NOT NULL` — mismo patrón ya usado en el GAP 1 de la Etapa 2 (`perfiles`) para no romper ningún flujo de servidor legítimo.

```sql
-- 20260721230000_cotizaciones_limite_gratis_trigger.sql
-- Enforcement real en BD del límite de 5 cotizaciones de por vida en plan
-- Gratis (Tarea 3, Etapa 7 continuación, 21/07/2026) — hasta ahora el límite
-- solo vivía en la capa de aplicación (frontend/src/lib/plan-limits.ts
-- verificarLimiteCotizacion(), ya correcto: conteo de por vida, no mensual),
-- así que un usuario podía saltárselo insertando directo contra
-- PostgREST/Supabase-js con su propio JWT. La policy real de `cotizaciones`
-- (cotizaciones_all, FOR ALL USING (auth.uid() = user_id) — baseline_v2.sql:708,
-- renombrada de presupuestos_all en
-- 20260708120000_rename_presupuestos_to_cotizaciones.sql:28) no tiene ningún
-- chequeo de conteo. Este trigger cierra ese gap sin tocar la policy.
--
-- Schema verificado (extracto literal, sin ALTER posterior que lo modifique):
--   cotizaciones.user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
--     (baseline_v2.sql, tabla creada como `presupuestos`, renombrada en
--      20260708120000_rename_presupuestos_to_cotizaciones.sql sin tocar columnas)
--   perfiles.plan_tipo text NOT NULL DEFAULT 'gratis'
--     CHECK (plan_tipo IN ('gratis','basico','pro','business'))
--     (baseline_v2.sql:232-233, valor 'business' vigente desde
--      20260706123000_plan_tipo_business.sql — sin ALTER posterior sobre esta
--      columna)
--
-- auth.uid() IS NULL (contexto service_role/admin, sin sesión de usuario)
-- queda exento — mismo patrón que el trigger de perfiles de la Etapa 2
-- (20260721160000_rls_etapa2_correcciones.sql, GAP 1) para no bloquear
-- ningún flujo de servidor legítimo. Ningún Server Action hoy inserta
-- cotizaciones en nombre de otro usuario (confirmado por grep de
-- `.from("cotizaciones").insert` en frontend/src — el único caller real es
-- useCotizacion.ts `crear()`, con el cliente de sesión del propio usuario).

CREATE OR REPLACE FUNCTION public.verificar_limite_cotizaciones_gratis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_count integer;
BEGIN
  -- Sin sesión de usuario (service_role/admin) → sin restricción.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT plan_tipo INTO v_plan
  FROM public.perfiles
  WHERE id = NEW.user_id;

  IF v_plan IS DISTINCT FROM 'gratis' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.cotizaciones
  WHERE user_id = NEW.user_id;

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Límite de 5 cotizaciones alcanzado en el plan Gratis. Actualiza tu plan para seguir cotizando.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verificar_limite_cotizaciones_gratis ON public.cotizaciones;
CREATE TRIGGER trg_verificar_limite_cotizaciones_gratis
  BEFORE INSERT ON public.cotizaciones
  FOR EACH ROW EXECUTE PROCEDURE public.verificar_limite_cotizaciones_gratis();
```

**Por qué trigger y no una policy `WITH CHECK` con subconsulta de conteo**: Postgres RLS evalúa `WITH CHECK` por fila sin garantía de un snapshot consistente entre filas insertadas en el mismo statement, y además una policy no puede lanzar un mensaje de error legible (`RAISE EXCEPTION` con texto propio) — el trigger da control total sobre el mensaje que llega al cliente (`error.message` en `useCotizacion.crear()` ya lo captura y lo muestra, aunque hoy el flujo normal nunca llega a disparar el trigger porque `verificarLimiteCotizacion()` ya bloquea antes en el cliente).

**Verificado**: `tsc --noEmit`, `next lint` (mismos 3 warnings preexistentes) y `next build` limpios — sin cambios de código TS en esta tarea (el enforcement de aplicación ya existía correcto), solo la migración SQL nueva, sin ejecutar.

