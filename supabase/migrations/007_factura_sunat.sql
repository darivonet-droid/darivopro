-- 007_factura_sunat.sql
-- Añade campos SUNAT a la tabla facturas:
--   tipo_doc: 'boleta' | 'factura'
--   client_dni: DNI del cliente en boletas > S/700
--   detraccion_tipo: 'construccion' | 'mantenimiento' | null
--   detraccion_pct: porcentaje aplicado (4 o 12)
--   detraccion_monto: importe en soles
--   neto_cobrar: total_final - detraccion_monto
--   cta_detracciones: número de cuenta del usuario en Banco de la Nación

ALTER TABLE facturas
  ADD COLUMN IF NOT EXISTS tipo_doc        TEXT    DEFAULT 'factura'  CHECK (tipo_doc IN ('boleta','factura')),
  ADD COLUMN IF NOT EXISTS client_dni      TEXT,
  ADD COLUMN IF NOT EXISTS detraccion_tipo TEXT                       CHECK (detraccion_tipo IN ('construccion','mantenimiento') OR detraccion_tipo IS NULL),
  ADD COLUMN IF NOT EXISTS detraccion_pct  NUMERIC,
  ADD COLUMN IF NOT EXISTS detraccion_monto NUMERIC,
  ADD COLUMN IF NOT EXISTS neto_cobrar     NUMERIC,
  ADD COLUMN IF NOT EXISTS cta_detracciones TEXT;

-- Correlativo de comprobantes para garantizar 8 dígitos sin gaps por serie
CREATE TABLE IF NOT EXISTS comprobante_series (
  serie        TEXT    PRIMARY KEY,     -- 'B001', 'F001'
  ultimo_num   INTEGER NOT NULL DEFAULT 0
);

-- Valores iniciales si la tabla acaba de crearse
INSERT INTO comprobante_series (serie, ultimo_num)
VALUES ('B001', 0), ('F001', 0)
ON CONFLICT (serie) DO NOTHING;

-- RLS: solo el propietario de la fila puede modificar
ALTER TABLE comprobante_series ENABLE ROW LEVEL SECURITY;

-- La tabla es de lectura/escritura libre para usuarios autenticados
-- (el incremento se hace con SELECT...FOR UPDATE desde el backend si se necesita)
-- Por ahora permitimos lectura pública y escritura autenticada
DROP POLICY IF EXISTS "autenticado puede leer series" ON comprobante_series;
CREATE POLICY "autenticado puede leer series"
  ON comprobante_series FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Columna cuenta detracciones en perfiles (número de cuenta BN del contratista)
ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS cta_detracciones TEXT;
