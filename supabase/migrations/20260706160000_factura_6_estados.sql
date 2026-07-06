-- 6 estados oficiales de factura (Visión §18 · Móvil §06 · Empresa §06)
-- Mapeo: inv_status 'Pendiente' (modelo antiguo) → 'Emitida'

BEGIN;

DO $$
DECLARE
  cnt_pendiente bigint;
  cnt_emitida   bigint;
  cnt_cobrada   bigint;
  cnt_otros     bigint;
BEGIN
  SELECT COUNT(*) INTO cnt_pendiente FROM public.facturas WHERE inv_status = 'Pendiente';
  SELECT COUNT(*) INTO cnt_emitida   FROM public.facturas WHERE inv_status = 'Emitida';
  SELECT COUNT(*) INTO cnt_cobrada   FROM public.facturas WHERE inv_status = 'Cobrada';
  SELECT COUNT(*) INTO cnt_otros     FROM public.facturas
    WHERE inv_status NOT IN ('Pendiente', 'Emitida', 'Cobrada');

  RAISE NOTICE 'facturas inv_status ANTES — Pendiente: %, Emitida: %, Cobrada: %, otros: %',
    cnt_pendiente, cnt_emitida, cnt_cobrada, cnt_otros;
  RAISE NOTICE 'Filas que se remapearán Pendiente→Emitida: %', cnt_pendiente;
END $$;

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
      AND t.relname = 'facturas'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%inv_status%'
  LOOP
    EXECUTE format('ALTER TABLE public.facturas DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint % on public.facturas', r.conname;
  END LOOP;
END $$;

UPDATE public.facturas
SET inv_status = 'Emitida'
WHERE inv_status = 'Pendiente';

DO $$
DECLARE
  cnt_emitida bigint;
  cnt_cobrada bigint;
BEGIN
  SELECT COUNT(*) INTO cnt_emitida FROM public.facturas WHERE inv_status = 'Emitida';
  SELECT COUNT(*) INTO cnt_cobrada FROM public.facturas WHERE inv_status = 'Cobrada';
  RAISE NOTICE 'facturas inv_status DESPUÉS — Emitida: %, Cobrada: %', cnt_emitida, cnt_cobrada;
END $$;

ALTER TABLE public.facturas
  ADD CONSTRAINT facturas_inv_status_check
  CHECK (inv_status IN (
    'Borrador',
    'En proceso',
    'Emitida',
    'Rechazada',
    'Pendiente de envío',
    'Cobrada'
  ));

ALTER TABLE public.facturas
  ALTER COLUMN inv_status SET DEFAULT 'Borrador';

COMMIT;
