-- 009_categorias.sql
-- Categorías editables por usuario (modelo overlay sobre el catálogo base hardcodeado)
--   - Override de categorías base: es_base = true, cat_id = id base (ej. 'albanileria')
--   - Categorías nuevas del usuario: es_base = false, cat_id = slug generado
-- Las partidas siguen viviendo en partidas_propias (custom) y precios_usuario (override de precio base).
-- Realtime habilitado en las 3 tablas para sincronizar Config ↔ Nueva Cotización.

CREATE TABLE IF NOT EXISTS public.categorias (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cat_id      TEXT NOT NULL,
  nombre      TEXT NOT NULL,
  emoji       TEXT DEFAULT '🔧',
  color       TEXT DEFAULT '#2563EB',
  es_base     BOOLEAN NOT NULL DEFAULT false,
  activa      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, cat_id)
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario gestiona sus categorias" ON public.categorias;
CREATE POLICY "usuario gestiona sus categorias"
  ON public.categorias FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- REALTIME: añadir tablas del catálogo a la publicación (idempotente)
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categorias;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.precios_usuario;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partidas_propias;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
