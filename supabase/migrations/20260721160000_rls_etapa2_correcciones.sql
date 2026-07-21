-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — ETAPA 2 auditoría RLS (21/07/2026): corrección de 3 gaps reales
-- ⚠️ ENTREGADA SIN EJECUTAR (regla permanente de BD): Mohamed la corre en el
--    SQL Editor de Supabase, DESPUÉS de 20260721120000_pago_fallido_solo_lectura.sql
--    (el GAP 1 protege perfiles.pago_fallido_desde, columna creada por esa migración;
--    si esta corre antes, el trigger simplemente no ve esa columna todavía y no la
--    protege — no falla, pero conviene el orden para cerrar el vector de mora).
--
-- Auditadas las 35 tablas reales de public (32 baseline + roles_personalizados +
-- partner_comisiones_historial + partner_comisiones_config; 0 DROP TABLE,
-- 0 DISABLE ROW LEVEL SECURITY, 0 USING(true) en las 19 migraciones).
-- El AISLAMIENTO POR TENANT a nivel de FILA (quién ve/escribe qué fila) está
-- correcto en TODAS las tablas: auth.uid() = user_id, o subconsulta EXISTS contra
-- la tabla de membresía real (empresas.gerente_user_id, partners propio, ticket
-- propio). Ninguna política confía en un valor de fila del cliente sin re-verificar
-- contra auth.uid(). Los gaps de abajo NO son fuga de filas entre cuentas — son
-- ESCALADA DE PRIVILEGIOS DENTRO DE LA PROPIA SESIÓN (una columna privilegiada de
-- la propia fila, y una función SECURITY DEFINER que confía en un parámetro del
-- cliente), que el punto 2 del pedido cubre explícitamente: "columna editable por
-- el usuario mismo sin re-verificar" y "valor que venga directo del cliente".
--
-- ── VERIFICACIÓN DE SCHEMA (regla permanente CLAUDE.md 11/07/2026) ──────────
-- 1. public.perfiles — CREATE TABLE en 20260705120000_baseline_v2.sql:222-239:
--      id uuid PK → auth.users, empresa_id uuid, razon_social text, ruc text,
--      direccion text, telefono text, moneda text DEFAULT 'PEN', simbolo text,
--      onboarding_done boolean NOT NULL DEFAULT false, plan_tipo text NOT NULL
--      DEFAULT 'gratis' CHECK, cta_detracciones text, idioma text,
--      notificaciones_activas boolean, created_at, updated_at.
--    ALTER posteriores (búsqueda exhaustiva 21/07/2026, únicos que la tocan):
--      baseline:258-260 FK empresa_id → empresas;
--      20260706123000 CHECK plan_tipo ('gratis','basico','pro','business');
--      20260711130000 + plan_origen_partner_id uuid;
--      20260719140000 + logo_url text;
--      20260721120000 + pago_fallido_desde timestamptz (PENDIENTE de ejecutar).
--    Políticas vigentes (baseline:697-699): perfiles_select/insert/update, las 3
--      auth.uid() = id — correctas para tenant (fila), pero SIN restricción de
--      qué columnas puede tocar el usuario en su propia fila.
-- 2. public.ia_uso_diario — CREATE TABLE en baseline_v2.sql:397-402:
--      user_id uuid NOT NULL → auth.users, fecha date, llamadas int,
--      PRIMARY KEY (user_id, fecha). Sin ningún ALTER posterior.
--    Función public.incrementar_ia_uso(p_user_id uuid) — baseline_v2.sql:571-587,
--      SECURITY DEFINER, GRANT EXECUTE ... TO authenticated (baseline:610).
--      NO verifica que p_user_id = auth.uid().
-- 3. public.soporte_mensajes — CREATE TABLE en baseline_v2.sql:493-500:
--      id uuid PK, ticket_id uuid NOT NULL → soporte_tickets, autor_tipo text
--      NOT NULL CHECK ('usuario','admin'), autor_user_id uuid → auth.users,
--      mensaje text NOT NULL, created_at. Sin ningún ALTER posterior.
--    public.soporte_tickets — baseline_v2.sql:479-491, sin ALTER posterior.
--    Políticas vigentes (baseline:764-766): soporte_mensajes_user FOR ALL (USING
--      = ticket propio, SIN WITH CHECK propio → hereda el USING para INSERT);
--      soporte_mensajes_admin FOR ALL USING (is_darivo_admin()).
--
-- Interacción con 20260721120000 (solo-lectura por mora): aquella añade políticas
-- AS RESTRICTIVE de escritura en 11 tablas de negocio; ninguna de las 3 piezas de
-- aquí colisiona (perfiles / ia_uso_diario / soporte_mensajes NO están en su lista
-- de 11, y aquí no se crea ninguna política RESTRICTIVE ni se toca esa migración).
--
-- GAP 2 CONSIDERADO Y NO INCLUIDO (defensa-en-profundidad, no exploit real): la
-- política empresas_gerente es FOR ALL, así que un usuario podría INSERT/UPDATE/
-- DELETE su PROPIA fila de empresas por sesión (gerente_user_id = auth.uid()).
-- No hay ningún flujo legítimo de escritura a empresas por sesión (todos usan
-- service_role: activar-plan.ts, admin/empresas/actions.ts). Pero por sí solo no
-- escala privilegios: puedeAccederEmpresa (acceso-producto.ts:64-85) exige
-- plan_tipo='business' Y ser el gerente de la empresa apuntada por perfiles.empresa_id;
-- con GAP 1 cerrado, el usuario no puede autoasignarse plan_tipo ni empresa_id, así
-- que una fila de empresas autoinsertada queda inerte. Se documenta y NO se corrige
-- para no inventar un gap: cerrar GAP 1 ya lo neutraliza.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- GAP 1 (CRÍTICO) — perfiles: el propio usuario puede escribirse plan_tipo,
-- empresa_id, plan_origen_partner_id y pago_fallido_desde en su PROPIA fila.
--
-- Escenario de ataque (usuario A, cuenta 1, sesión legítima con su propio JWT):
--   PATCH /rest/v1/perfiles?id=eq.<uid_de_A>   body {"plan_tipo":"business"}
-- La política perfiles_update (USING/WITH CHECK auth.uid() = id) lo PERMITE: solo
-- verifica que la fila sea la suya, nunca qué columna cambia. Con eso A obtiene:
--   · acceso al panel Darivo Pro Empresa (puedeAccederEmpresa lee perfiles.plan_tipo),
--   · límites ilimitados de cotizaciones/IA (plan-limits.ts),
--   · y, tras correr la migración de mora, puede limpiarse pago_fallido_desde para
--     salir del modo solo-lectura sin pagar.
-- Todas las escrituras LEGÍTIMAS de estas 4 columnas usan service_role
-- (activar-plan.ts, mora-pagos.ts, admin/usuarios/actions.ts:61,
-- admin/empresas/actions.ts:32, empresa/empleados/actions.ts:82) — NUNCA la
-- sesión del usuario final. Los flujos cliente reales sobre perfiles
-- (registro/onboarding upsert de razon_social/ruc, onboarding_done, AjustesForm,
-- LogoEmpresaUploader.logo_url) no tocan ninguna de las 4 columnas protegidas.
--
-- Corrección: trigger BEFORE que rechaza cambiar esas 4 columnas cuando la
-- escritura viene de una sesión de usuario final (auth.uid() IS NOT NULL).
-- service_role y el auth admin de Supabase (handle_new_user, durante el signup)
-- no llevan claim sub → auth.uid() = NULL → pasan sin restricción. Se usa trigger
-- y no GRANT por columnas porque los flujos de registro/onboarding usan
-- INSERT ... ON CONFLICT DO UPDATE (upsert), que exige privilegio de columna
-- completo, y porque el error explícito es preferible a un fallo silencioso.
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.perfiles_bloquear_columnas_privilegiadas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sin sesión de usuario final (service_role, o el auth admin durante el
  -- signup): son los únicos caminos legítimos que fijan estas columnas.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Un INSERT legítimo por sesión (registro/onboarding) solo trae id +
    -- razon_social (+ ruc): las 4 columnas quedan en su valor por defecto.
    IF NEW.plan_tipo IS DISTINCT FROM 'gratis'
       OR NEW.empresa_id IS NOT NULL
       OR NEW.plan_origen_partner_id IS NOT NULL
       OR NEW.pago_fallido_desde IS NOT NULL THEN
      RAISE EXCEPTION 'No autorizado: plan_tipo/empresa_id/plan_origen_partner_id/pago_fallido_desde solo se fijan del lado servidor.';
    END IF;
    RETURN NEW;
  END IF;

  -- TG_OP = 'UPDATE': ninguna de las 4 columnas puede cambiar por sesión.
  IF NEW.plan_tipo             IS DISTINCT FROM OLD.plan_tipo
     OR NEW.empresa_id             IS DISTINCT FROM OLD.empresa_id
     OR NEW.plan_origen_partner_id IS DISTINCT FROM OLD.plan_origen_partner_id
     OR NEW.pago_fallido_desde     IS DISTINCT FROM OLD.pago_fallido_desde THEN
    RAISE EXCEPTION 'No autorizado: plan_tipo/empresa_id/plan_origen_partner_id/pago_fallido_desde solo se cambian del lado servidor.';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.perfiles_bloquear_columnas_privilegiadas() IS
  'Impide que una sesión de usuario final (auth.uid() no nulo) fije/cambie columnas privilegiadas de su propia fila de perfiles (plan_tipo, empresa_id, plan_origen_partner_id, pago_fallido_desde). service_role y el auth admin (auth.uid() NULL) pasan. Etapa 2 auditoría RLS 21/07/2026.';

DROP TRIGGER IF EXISTS trg_perfiles_bloquear_columnas_privilegiadas ON public.perfiles;
CREATE TRIGGER trg_perfiles_bloquear_columnas_privilegiadas
  BEFORE INSERT OR UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE PROCEDURE public.perfiles_bloquear_columnas_privilegiadas();

-- ────────────────────────────────────────────────────────────────────────────
-- GAP 3 (CROSS-TENANT, integridad/DoS) — incrementar_ia_uso(p_user_id) confía en
-- un parámetro del cliente.
--
-- Escenario de ataque (usuario A autenticado ataca a la víctima B):
--   supabase.rpc('incrementar_ia_uso', { p_user_id: '<uid_de_B>' })
-- La función es SECURITY DEFINER (ignora RLS) y GRANT a authenticated, y NO
-- comprueba que p_user_id sea el propio auth.uid(). A puede así inflar el contador
-- diario de IA de B hasta agotar su cuota (denegación de servicio cross-tenant).
-- Las policies RLS de ia_uso_diario (auth.uid() = user_id) no protegen porque la
-- función corre como su owner y salta RLS. Único caller legítimo (plan-limits.ts:175)
-- ya pasa siempre user.id propio, así que el guard no rompe nada.
--
-- Corrección: la función se auto-verifica. Si hay sesión de usuario (auth.uid()
-- no nulo) y p_user_id no es el propio, aborta. service_role (auth.uid() NULL)
-- conserva la posibilidad de incrementar por cualquier user_id.
-- Definición base verificada en baseline_v2.sql:571-587 (sin ALTER FUNCTION posterior).
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.incrementar_ia_uso(p_user_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Guard cross-tenant: una sesión de usuario final solo puede incrementar su
  -- propio contador. service_role (auth.uid() NULL) no se ve afectado.
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'No autorizado: solo puedes incrementar tu propio uso de IA.';
  END IF;

  INSERT INTO ia_uso_diario (user_id, fecha, llamadas)
  VALUES (p_user_id, current_date, 1)
  ON CONFLICT (user_id, fecha)
  DO UPDATE SET llamadas = ia_uso_diario.llamadas + 1
  RETURNING llamadas INTO v_count;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.incrementar_ia_uso(uuid) IS
  'Incremento atómico del contador IA diario por plan. Etapa 2 (21/07/2026): añade guard cross-tenant — una sesión de usuario solo incrementa su propio contador; service_role sigue pudiendo por cualquier uid.';

-- El GRANT existente a authenticated se conserva (no se revoca) — el guard
-- interno es ahora la barrera, no la ausencia de permiso de ejecución.

-- ────────────────────────────────────────────────────────────────────────────
-- GAP 4 (integridad, baja severidad) — soporte_mensajes: un usuario puede insertar
-- en SU PROPIO ticket un mensaje con autor_tipo='admin' y/o autor_user_id ajeno.
--
-- La policy soporte_mensajes_user es FOR ALL sin WITH CHECK propio → hereda el
-- USING (ticket propio) también para INSERT, que solo comprueba la pertenencia
-- del ticket, no los campos de autor. No es cross-tenant (solo su propio ticket),
-- pero permite falsificar una "respuesta de admin" en el hilo de su propio caso.
-- Escenario: usuario dueño del ticket T hace INSERT {ticket_id:T,
-- autor_tipo:'admin', mensaje:'...'} — la vista de su ticket muestra un mensaje
-- que parece del soporte oficial.
--
-- Corrección: recrear la policy con WITH CHECK explícito que exige, en el INSERT
-- por sesión de usuario, autor_tipo='usuario' y autor_user_id = auth.uid(), sobre
-- un ticket propio. El único INSERT legítimo por sesión (api/soporte/tickets/[id]/
-- mensajes/route.ts:55-64) ya usa exactamente autor_tipo='usuario' y
-- autor_user_id=user.id → no se rompe. Las respuestas de admin siguen entrando por
-- la policy PERMISSIVE soporte_mensajes_admin (is_darivo_admin()), que no se toca.
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS soporte_mensajes_user ON public.soporte_mensajes;
CREATE POLICY soporte_mensajes_user ON public.soporte_mensajes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.soporte_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    autor_tipo = 'usuario'
    AND autor_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.soporte_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — 3 correcciones RLS Etapa 2. Sin cambios de aislamiento por fila (ya
-- correcto en las 35 tablas); solo escalada de privilegios intra-sesión + un
-- vector cross-tenant vía RPC. GAP 2 (empresas) documentado y neutralizado por GAP 1.
-- ════════════════════════════════════════════════════════════════════════════
