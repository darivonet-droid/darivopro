-- Renombra plan_tipo legacy 'empresa' → 'business' (Visión v2.13 · Suscripciones v1.6)
-- Constraints detectados en baseline: inline CHECK → nombres típicos perfiles_plan_tipo_check / suscripciones_plan_tipo_check

BEGIN;

-- ── perfiles.plan_tipo ──
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'perfiles'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%plan_tipo%'
  LOOP
    EXECUTE format('ALTER TABLE public.perfiles DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint % on public.perfiles', r.conname;
  END LOOP;
END $$;

UPDATE public.perfiles
SET plan_tipo = 'business'
WHERE plan_tipo = 'empresa';

ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_plan_tipo_check
  CHECK (plan_tipo IN ('gratis', 'basico', 'pro', 'business'));

-- ── suscripciones.plan_tipo ──
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'suscripciones'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%plan_tipo%'
  LOOP
    EXECUTE format('ALTER TABLE public.suscripciones DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint % on public.suscripciones', r.conname;
  END LOOP;
END $$;

UPDATE public.suscripciones
SET plan_tipo = 'business'
WHERE plan_tipo = 'empresa';

ALTER TABLE public.suscripciones
  ADD CONSTRAINT suscripciones_plan_tipo_check
  CHECK (plan_tipo IN ('gratis', 'basico', 'pro', 'business'));

COMMIT;
