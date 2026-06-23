-- DARIVO PRO — Migración 012: registro de cálculos de cotización
-- Guarda un snapshot por cotización guardada con el desglose materiales/MO.

CREATE TABLE IF NOT EXISTS public.calculos_log (
  id                uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Referencia a la cotización (NULL si se elimina)
  presupuesto_id    uuid        REFERENCES public.presupuestos(id) ON DELETE SET NULL,

  -- Desglose del cálculo en el momento del guardado
  total_materiales  numeric(12,2) NOT NULL DEFAULT 0,
  total_mano_obra   numeric(12,2) NOT NULL DEFAULT 0,
  total_base        numeric(12,2) NOT NULL DEFAULT 0,
  total_margen      numeric(12,2) NOT NULL DEFAULT 0,
  margin_pct        numeric(5,2)  NOT NULL DEFAULT 0,
  total_final       numeric(12,2) NOT NULL DEFAULT 0,

  -- Contexto adicional
  items_count       integer       NOT NULL DEFAULT 0,

  recorded_at       timestamptz   NOT NULL DEFAULT now()
);

-- RLS: cada empresa solo ve su propio registro
ALTER TABLE public.calculos_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve su log de calculos"
  ON public.calculos_log FOR ALL
  USING (auth.uid() = user_id);

-- Índice para consultas de auditoría
CREATE INDEX IF NOT EXISTS idx_calculos_log_user_tiempo
  ON public.calculos_log (user_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_calculos_log_presupuesto
  ON public.calculos_log (presupuesto_id)
  WHERE presupuesto_id IS NOT NULL;
