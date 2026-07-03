-- ════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración 016: restaurar clientes tras regresión 013
-- La migración 013 recreó clientes sin updated_at ni RLS granular de 003.
-- Idempotente. No modifica lógica de negocio.
-- ════════════════════════════════════════════════════════════════

-- ── 1. Columna updated_at ───────────────────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ── 2. Trigger updated_at ───────────────────────────────────────
DROP TRIGGER IF EXISTS on_cliente_update ON public.clientes;

CREATE TRIGGER on_cliente_update
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ── 3. RLS granular (reemplaza política genérica de 013) ────────
DROP POLICY IF EXISTS "Usuario ve sus clientes" ON public.clientes;

DROP POLICY IF EXISTS "clientes_select" ON public.clientes;
CREATE POLICY "clientes_select"
  ON public.clientes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "clientes_insert" ON public.clientes;
CREATE POLICY "clientes_insert"
  ON public.clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "clientes_update" ON public.clientes;
CREATE POLICY "clientes_update"
  ON public.clientes FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "clientes_delete" ON public.clientes;
CREATE POLICY "clientes_delete"
  ON public.clientes FOR DELETE
  USING (auth.uid() = user_id);

-- ── 4. Índice búsqueda por nombre (perdido en 013) ──────────────
CREATE INDEX IF NOT EXISTS idx_clientes_nombre
  ON public.clientes (user_id, nombre);
