-- DARIVO PRO — 3 días de gracia tras fallo de cobro + modo SOLO LECTURA en RLS
-- Etapa 1 de la auditoría de seguridad/roles (21/07/2026).
-- Regla de negocio YA CERRADA (no nueva): cuentas Empresa y Móvil tienen 3 días
-- de gracia tras un fallo de cobro real; después la cuenta pasa a modo solo
-- lectura, reforzado en RLS (no solo en UI). Admin y Partner quedan EXCLUIDOS.
--
-- ⚠️ ENTREGADA SIN EJECUTAR (regla permanente de BD): Mohamed la corre en el
-- SQL Editor de Supabase.
--
-- ── VERIFICACIÓN DE SCHEMA (regla permanente CLAUDE.md 11/07/2026) ──────────
-- CREATE TABLE public.perfiles real (20260705120000_baseline_v2.sql:222-239):
--   id uuid PK → auth.users, empresa_id uuid, razon_social text, ruc text,
--   direccion text, telefono text, moneda text DEFAULT 'PEN', simbolo text,
--   onboarding_done boolean NOT NULL DEFAULT false, plan_tipo text NOT NULL
--   DEFAULT 'gratis' CHECK, cta_detracciones text, idioma text,
--   notificaciones_activas boolean, created_at, updated_at.
-- ALTER TABLE public.perfiles posteriores (búsqueda exhaustiva en
-- supabase/migrations, 21/07/2026 — únicos 4 resultados):
--   * baseline_v2.sql:258-260  → FK empresa_id → empresas (no afecta).
--   * 20260706123000_plan_tipo_business.sql → CHECK plan_tipo
--     ('gratis','basico','pro','business') — valores usados abajo.
--   * 20260711130000_plan_origen_partner.sql → + plan_origen_partner_id uuid.
--   * 20260719140000_perfiles_logo.sql → + logo_url text.
--   Ninguno define pago_fallido_desde.
-- Políticas permisivas existentes en las tablas afectadas (baseline_v2.sql:
-- 697-753 y 773-776; 20260706140000_roles_personalizados.sql:40-45; renombres
-- en 20260708120000_rename_presupuestos_to_cotizaciones.sql:28-29). Las
-- políticas nuevas de abajo son AS RESTRICTIVE: se AND-ean con las permisivas
-- existentes — nunca amplían acceso, solo lo restringen; SELECT no se toca
-- (eso es exactamente "solo lectura").
-- public.is_darivo_admin() ya existe (baseline_v2.sql:592-605, SECURITY
-- DEFINER sobre darivo_admin_empleados). public.partners tiene columnas
-- user_id y email (política partners_own, baseline_v2.sql:779).

BEGIN;

-- 1. Marca de mora: la escribe el webhook de dLocal (fallo de cobro real de un
--    plan pagado) y la limpia el siguiente pago exitoso — ver
--    frontend/src/lib/mora-pagos.ts.
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS pago_fallido_desde timestamptz NULL;

COMMENT ON COLUMN public.perfiles.pago_fallido_desde IS
  'Inicio de la mora: primer webhook de cobro fallido (dLocal) de un plan pagado, sin pago exitoso posterior. NULL = al día. A los 3 días la cuenta pasa a solo lectura (es_cuenta_solo_lectura()).';

-- 2. ¿La cuenta del usuario autenticado está en modo solo lectura?
--    Resuelve en el orden del estándar RBAC: primero la cuenta/tenant (el
--    pagador real: el propio usuario, o el Gerente de su empresa si es
--    Técnico), después el estado de esa cuenta. Nunca por subdominio.
CREATE OR REPLACE FUNCTION public.es_cuenta_solo_lectura()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_empresa_id uuid;
  v_pagador    uuid;
  v_desde      timestamptz;
  v_plan       text;
BEGIN
  -- Sin sesión de usuario (p. ej. service_role, que además ya ignora RLS).
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Admin interno Darivo: excluido por regla de negocio.
  IF public.is_darivo_admin() THEN
    RETURN false;
  END IF;

  -- Partner: excluido por regla de negocio (mismo criterio de identificación
  -- que la política partners_own del baseline).
  IF EXISTS (
    SELECT 1 FROM public.partners pa
    WHERE pa.user_id = v_uid OR pa.email = (auth.jwt()->>'email')
  ) THEN
    RETURN false;
  END IF;

  -- Pagador real de la cuenta: el propio usuario, o el Gerente si el usuario
  -- es un Técnico de una empresa (la mora es de la CUENTA Empresa, no del
  -- empleado individual).
  SELECT p.empresa_id INTO v_empresa_id FROM public.perfiles p WHERE p.id = v_uid;
  v_pagador := v_uid;
  IF v_empresa_id IS NOT NULL THEN
    SELECT e.gerente_user_id INTO v_pagador FROM public.empresas e WHERE e.id = v_empresa_id;
    IF v_pagador IS NULL THEN
      v_pagador := v_uid;
    END IF;
  END IF;

  SELECT p.pago_fallido_desde, p.plan_tipo
    INTO v_desde, v_plan
  FROM public.perfiles p
  WHERE p.id = v_pagador;

  -- Sin mora registrada, o cuenta gratis (a un gratis nunca se le cobra; un
  -- checkout abandonado no debe dejarlo en solo lectura): no aplica.
  IF v_desde IS NULL OR v_plan IS NULL OR v_plan = 'gratis' THEN
    RETURN false;
  END IF;

  -- 3 días de gracia exactos desde el fallo de cobro.
  RETURN now() >= v_desde + interval '3 days';
END;
$$;

COMMENT ON FUNCTION public.es_cuenta_solo_lectura() IS
  'Helper RLS — true si la cuenta (Móvil o Empresa, vía su pagador real) lleva más de 3 días de gracia tras un fallo de cobro. Admin y Partner siempre false.';

GRANT EXECUTE ON FUNCTION public.es_cuenta_solo_lectura() TO authenticated;

-- 3. Políticas RESTRICTIVE de escritura sobre las tablas de datos de negocio
--    de Móvil/Empresa. SELECT queda intacto (la cuenta puede seguir viendo
--    todo: "solo lectura", no "sin acceso"). No se tocan: perfiles (login/
--    onboarding deben seguir funcionando), soporte_tickets/soporte_mensajes
--    (un usuario en mora debe poder contactar soporte), tablas de Partner y
--    tablas administrativas (Admin opera vía service_role, que ignora RLS).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'cotizaciones',
    'cotizacion_items',
    'clientes',
    'facturas',
    'categorias',
    'gastos',
    'partidas_propias',
    'precios_usuario',
    'precios_historial',
    'empresa_empleados',
    'roles_personalizados'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR INSERT WITH CHECK (NOT public.es_cuenta_solo_lectura())',
      'solo_lectura_mora_ins_' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR UPDATE USING (NOT public.es_cuenta_solo_lectura())',
      'solo_lectura_mora_upd_' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR DELETE USING (NOT public.es_cuenta_solo_lectura())',
      'solo_lectura_mora_del_' || t, t);
  END LOOP;
END;
$$;

COMMIT;
