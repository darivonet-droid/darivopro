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
