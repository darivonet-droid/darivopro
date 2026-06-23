-- DARIVO PRO — Migración 011: historial de cambios de precios por empresa

-- ════════════════════════════════════════════════════
-- TABLA: precios_historial
-- Registra cada cambio de precio hecho por una empresa.
-- Permite auditar quién cambió qué precio y cuándo.
-- ════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.precios_historial (
  id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- ID de la partida: svc_id del catálogo base o UUID de partidas_propias
  svc_id          text NOT NULL,

  -- Indica si el cambio es sobre una partida propia del usuario
  es_propia       boolean NOT NULL DEFAULT false,

  -- Precio antes del cambio (NULL si es el primer override desde el precio base)
  precio_anterior numeric(10,2),

  -- Precio nuevo registrado
  precio_nuevo    numeric(10,2) NOT NULL,

  -- Cuándo se hizo el cambio
  changed_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: cada empresa solo ve su propio historial
ALTER TABLE public.precios_historial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve su historial de precios"
  ON public.precios_historial FOR ALL
  USING (auth.uid() = user_id);

-- Índice para consultas de auditoría (todos los cambios de una empresa, más recientes primero)
CREATE INDEX IF NOT EXISTS idx_precios_historial_user_tiempo
  ON public.precios_historial (user_id, changed_at DESC);

-- Índice para consultar el historial de un servicio concreto
CREATE INDEX IF NOT EXISTS idx_precios_historial_svc
  ON public.precios_historial (user_id, svc_id, changed_at DESC);
