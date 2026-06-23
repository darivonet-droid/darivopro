-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración 013: alinear el esquema de Supabase con el código
-- ----------------------------------------------------------------------------
-- OBJETIVO
--   Recrear presupuestos, presupuesto_items, facturas y clientes EXACTAMENTE
--   como los espera el código actual (fuente de verdad), eliminando el drift
--   de esquema que impide guardar cotizaciones, facturas y clientes.
--
-- SEGURIDAD (esta migración se autoprotege y aborta sola si algo no encaja):
--   GUARD 1 → aborta si hay filas reales en presupuestos/facturas/clientes.
--   GUARD 2 → aborta si alguna tabla EXTERNA tiene una clave foránea apuntando
--             a presupuestos o facturas (módulos huérfanos: referidos,
--             leads_pdf, meses_gratis, users, etc.). Así un DROP CASCADE nunca
--             borrará en silencio una dependencia desconocida.
--
--   Todo corre dentro de una transacción: si algo falla, NO se aplica nada.
--   Es idempotente: puede ejecutarse varias veces sin error.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- GUARD 1 · No destruir datos reales
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  n_pres int := 0;
  n_fact int := 0;
  n_cli  int := 0;
BEGIN
  IF to_regclass('public.presupuestos') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.presupuestos' INTO n_pres;
  END IF;
  IF to_regclass('public.facturas') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.facturas' INTO n_fact;
  END IF;
  IF to_regclass('public.clientes') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM public.clientes' INTO n_cli;
  END IF;

  IF (n_pres + n_fact + n_cli) > 0 THEN
    RAISE EXCEPTION
      'ABORTADO (GUARD 1): existen datos reales (presupuestos=%, facturas=%, clientes=%). No se recrea nada para no perder datos.',
      n_pres, n_fact, n_cli;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- GUARD 2 · No romper dependencias externas desconocidas
--   Permitidas: las FK internas que esta misma migración recrea.
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  r   record;
  msg text := '';
BEGIN
  FOR r IN
    SELECT con.conname,
           src.relname AS source_table,
           tgt.relname AS target_table
    FROM pg_constraint con
    JOIN pg_class     src ON src.oid = con.conrelid
    JOIN pg_class     tgt ON tgt.oid = con.confrelid
    JOIN pg_namespace ns  ON ns.oid  = tgt.relnamespace
    WHERE con.contype = 'f'
      AND ns.nspname  = 'public'
      AND tgt.relname IN ('presupuestos', 'facturas', 'clientes')
      AND src.relname NOT IN ('presupuesto_items', 'calculos_log', 'facturas', 'presupuestos', 'clientes')
  LOOP
    msg := msg || format('  - %s  ->  %s   (constraint: %s)%s',
                         r.source_table, r.target_table, r.conname, chr(10));
  END LOOP;

  IF msg <> '' THEN
    RAISE EXCEPTION
      'ABORTADO (GUARD 2): hay claves foraneas EXTERNAS hacia presupuestos/facturas/clientes:%Revisa estos modulos antes de continuar.',
      chr(10) || msg;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- EXTENSIONES (por si el esquema viniera incompleto)
-- ────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────────
-- FUNCIONES (autocontenidas — no dependen de migraciones previas)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.asignar_cot_num()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  siguiente integer;
BEGIN
  IF NEW.cot_num IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.cotizacion_series (user_id, ultimo_num)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET ultimo_num = cotizacion_series.ultimo_num + 1
  RETURNING ultimo_num INTO siguiente;

  NEW.cot_num := 'COT-' || lpad(siguiente::text, 3, '0');
  RETURN NEW;
END;
$$;

-- Serie de numeración usada por asignar_cot_num (se crea si faltara)
CREATE TABLE IF NOT EXISTS public.cotizacion_series (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ultimo_num integer NOT NULL DEFAULT 0
);
ALTER TABLE public.cotizacion_series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usuario ve su serie cotizacion" ON public.cotizacion_series;
CREATE POLICY "usuario ve su serie cotizacion"
  ON public.cotizacion_series FOR ALL
  USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════════════
-- RECREACIÓN DE TABLAS (0 datos → seguro). Orden: hijas → padre.
-- ════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS public.facturas          CASCADE;
DROP TABLE IF EXISTS public.presupuesto_items CASCADE;
DROP TABLE IF EXISTS public.presupuestos      CASCADE;
DROP TABLE IF EXISTS public.clientes          CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA: presupuestos   (001 + 008 cot_num + 010 pdf_url/wa_enviado_at)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.presupuestos (
  id            uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cot_num       text,
  client_name   text          NOT NULL,
  phone         text,
  city          text,
  margin        numeric(5,2)  DEFAULT 40,
  total_base    numeric(12,2) DEFAULT 0,
  total_labor   numeric(12,2) DEFAULT 0,
  total_final   numeric(12,2) DEFAULT 0,
  status        text          DEFAULT 'Borrador'
                CHECK (status IN ('Borrador','Pendiente de firma','Aprobado')),
  notes         text,
  pdf_url       text,
  wa_enviado_at timestamptz,
  created_at    timestamptz   DEFAULT now(),
  updated_at    timestamptz   DEFAULT now()
);

ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve sus presupuestos"
  ON public.presupuestos FOR ALL
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA: presupuesto_items   (001)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.presupuesto_items (
  id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  presupuesto_id  uuid          NOT NULL REFERENCES public.presupuestos(id) ON DELETE CASCADE,
  svc_id          text          NOT NULL,
  cat_label       text,
  svc_label       text,
  calc_type       text,
  base_price      numeric(10,2),
  unit            text,
  qty             numeric(10,2),
  unit_price      numeric(10,2),
  subtotal        numeric(12,2),
  created_at      timestamptz   DEFAULT now()
);

ALTER TABLE public.presupuesto_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve sus items"
  ON public.presupuesto_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.presupuestos p
      WHERE p.id = presupuesto_id AND p.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA: facturas   (001 + 007 SUNAT)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.facturas (
  inv_id           uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inv_num          text          NOT NULL,
  inv_date         date          DEFAULT current_date,
  inv_status       text          DEFAULT 'Emitida'
                   CHECK (inv_status IN ('Pendiente','Emitida','Cobrada')),
  tipo_doc         text          DEFAULT 'factura'
                   CHECK (tipo_doc IN ('boleta','factura')),
  client_name      text          NOT NULL,
  client_ruc       text,
  client_dni       text,
  client_dir       text,
  moneda           text          DEFAULT 'PEN',
  sym              text          DEFAULT 'S/',
  items            jsonb         DEFAULT '[]',
  subtotal_base    numeric(12,2) DEFAULT 0,
  igv_amount       numeric(12,2) DEFAULT 0,
  total_final      numeric(12,2) DEFAULT 0,
  detraccion_tipo  text          CHECK (detraccion_tipo IN ('construccion','mantenimiento') OR detraccion_tipo IS NULL),
  detraccion_pct   numeric,
  detraccion_monto numeric,
  neto_cobrar      numeric,
  cta_detracciones text,
  from_quote_id    uuid          REFERENCES public.presupuestos(id) ON DELETE SET NULL,
  biz_data         jsonb,
  pdf_url          text,
  created_at       timestamptz   DEFAULT now(),
  updated_at       timestamptz   DEFAULT now()
);

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve sus facturas"
  ON public.facturas FOR ALL
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA: clientes   (002)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.clientes (
  id          uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      text        NOT NULL,
  telefono    text,
  ruc         text,
  direccion   text,
  ciudad      text,
  notas       text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve sus clientes"
  ON public.clientes FOR ALL
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- RECONECTAR calculos_log → presupuestos (la FK se perdió con el DROP CASCADE)
-- ────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.calculos_log') IS NOT NULL THEN
    ALTER TABLE public.calculos_log
      DROP CONSTRAINT IF EXISTS calculos_log_presupuesto_id_fkey;
    ALTER TABLE public.calculos_log
      ADD  CONSTRAINT calculos_log_presupuesto_id_fkey
      FOREIGN KEY (presupuesto_id)
      REFERENCES public.presupuestos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_presupuesto_update     ON public.presupuestos;
CREATE TRIGGER on_presupuesto_update
  BEFORE UPDATE ON public.presupuestos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_presupuesto_cot_num   ON public.presupuestos;
CREATE TRIGGER trg_presupuesto_cot_num
  BEFORE INSERT ON public.presupuestos
  FOR EACH ROW EXECUTE PROCEDURE public.asignar_cot_num();

DROP TRIGGER IF EXISTS on_factura_update          ON public.facturas;
CREATE TRIGGER on_factura_update
  BEFORE UPDATE ON public.facturas
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- ÍNDICES
-- ────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS presupuestos_user_cot_num_idx
  ON public.presupuestos (user_id, cot_num)
  WHERE cot_num IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_presupuestos_wa_enviado
  ON public.presupuestos (user_id, wa_enviado_at)
  WHERE wa_enviado_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_user
  ON public.clientes (user_id);

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — Si llegaste aquí sin errores, el esquema ya coincide con el código.
-- ════════════════════════════════════════════════════════════════════════════
