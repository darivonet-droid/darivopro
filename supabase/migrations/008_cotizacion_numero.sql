-- 008_cotizacion_numero.sql
-- Numeración automática COT-001, COT-002… por usuario (nunca se reutiliza)

ALTER TABLE presupuestos
  ADD COLUMN IF NOT EXISTS cot_num TEXT;

CREATE TABLE IF NOT EXISTS cotizacion_series (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ultimo_num INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE cotizacion_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario ve su serie cotizacion" ON cotizacion_series;
CREATE POLICY "usuario ve su serie cotizacion"
  ON cotizacion_series FOR ALL
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.asignar_cot_num()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  siguiente INTEGER;
BEGIN
  IF NEW.cot_num IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO cotizacion_series (user_id, ultimo_num)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET ultimo_num = cotizacion_series.ultimo_num + 1
  RETURNING ultimo_num INTO siguiente;

  NEW.cot_num := 'COT-' || lpad(siguiente::text, 3, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_presupuesto_cot_num ON presupuestos;
CREATE TRIGGER trg_presupuesto_cot_num
  BEFORE INSERT ON presupuestos
  FOR EACH ROW
  EXECUTE PROCEDURE public.asignar_cot_num();

CREATE UNIQUE INDEX IF NOT EXISTS presupuestos_user_cot_num_idx
  ON presupuestos (user_id, cot_num)
  WHERE cot_num IS NOT NULL;
