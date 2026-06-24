-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración 014: Cliente como centro del flujo
-- ────────────────────────────────────────────────────────────────────────────
-- Objetivo:
--   A) Relacionar cotizaciones (presupuestos) con un cliente concreto.
--   B) Evitar clientes duplicados por teléfono (un cliente por teléfono/usuario).
--   D) Rellenar (backfill) las cotizaciones existentes vinculándolas a un
--      cliente: si existe por teléfono se asocia, si no, se crea.
--
-- Criterio de teléfono: SOLO DÍGITOS (sin espacios, sin +, sin guiones),
-- tanto al guardar como al comparar duplicados.
--
-- Seguridad:
--   - NO borra ni recrea tablas. Solo añade columna + índices + backfill.
--   - cliente_id es OPCIONAL (nullable) y usa ON DELETE SET NULL: borrar un
--     cliente NO borra sus cotizaciones, solo las desvincula.
--   - RLS existente de presupuestos/clientes ya cubre la nueva columna.
--   - ruc en clientes ya es opcional (nullable) — sin cambios.
--   - Tabla facturas: intacta.
--   - Idempotente: se puede ejecutar más de una vez sin duplicar.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- CAMBIO A — Relación cotización ↔ cliente
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.presupuestos
  ADD COLUMN IF NOT EXISTS cliente_id uuid
  REFERENCES public.clientes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_presupuestos_cliente
  ON public.presupuestos (cliente_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Normalizar teléfonos ya existentes en clientes → solo dígitos
-- (cadena vacía pasa a NULL para no chocar en el índice único)
-- ────────────────────────────────────────────────────────────────────────────
UPDATE public.clientes
   SET telefono = NULLIF(regexp_replace(telefono, '\D', '', 'g'), '')
 WHERE telefono IS NOT NULL
   AND telefono <> regexp_replace(telefono, '\D', '', 'g');

-- ────────────────────────────────────────────────────────────────────────────
-- CAMBIO B — Un cliente por teléfono y por usuario (sin duplicados)
-- Parcial: los clientes sin teléfono no compiten entre sí.
-- ────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS clientes_user_telefono_idx
  ON public.clientes (user_id, telefono)
  WHERE telefono IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- CAMBIO D — Backfill: vincular cotizaciones existentes a un cliente
-- Solo afecta filas con cliente_id NULL. Re-ejecutable sin efectos colaterales.
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  r     record;
  v_tel text;
  v_cli uuid;
BEGIN
  FOR r IN
    SELECT id, user_id, client_name, phone
      FROM public.presupuestos
     WHERE cliente_id IS NULL
  LOOP
    -- Teléfono normalizado a solo dígitos
    v_tel := NULLIF(regexp_replace(coalesce(r.phone, ''), '\D', '', 'g'), '');

    -- Sin teléfono no se puede deduplicar de forma fiable → se omite
    IF v_tel IS NULL THEN
      CONTINUE;
    END IF;

    -- ¿Existe ya un cliente con ese teléfono para este usuario?
    SELECT id INTO v_cli
      FROM public.clientes
     WHERE user_id = r.user_id
       AND telefono = v_tel
     LIMIT 1;

    -- Si no existe, se crea con nombre + teléfono
    IF v_cli IS NULL THEN
      INSERT INTO public.clientes (user_id, nombre, telefono)
      VALUES (
        r.user_id,
        coalesce(NULLIF(btrim(r.client_name), ''), 'Cliente'),
        v_tel
      )
      RETURNING id INTO v_cli;
    END IF;

    -- Vincular la cotización al cliente
    UPDATE public.presupuestos
       SET cliente_id = v_cli
     WHERE id = r.id;
  END LOOP;
END $$;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — Si llegaste aquí sin errores:
--   • presupuestos.cliente_id existe y apunta a clientes.
--   • no hay clientes duplicados por teléfono.
--   • tus cotizaciones existentes ya quedaron vinculadas a un cliente.
-- ════════════════════════════════════════════════════════════════════════════
