-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — ETAPA 4 (21/07/2026), pregunta abierta #6 (fase 0 de 4):
-- tabla hija `factura_items` PREPARADA E INERTE — espejo de `cotizacion_items`
-- con unidad de medida (`unit`) y código (`svc_id`) por línea, que es lo que
-- Bizlinks/UBL 2.1 necesita por ítem y que `facturas.items` (jsonb libre) hoy
-- no garantiza.
--
-- ⚠️ INERTE A PROPÓSITO: NINGÚN código de la app lee ni escribe esta tabla
--    todavía. `facturas.items` (jsonb) sigue siendo la única fuente real de
--    líneas de factura. El plan completo de migración (doble escritura →
--    backfill → corte de lectura → retiro del jsonb) está documentado en
--    frontend/docs-internos/TODO-PENDIENTES-DARIVO-PRO.md y NO se ejecuta en
--    esta etapa — el riesgo de romper facturación sin BD de prueba es alto y
--    además depende de la pregunta #7 (series/códigos según Bizlinks).
--
-- ⚠️ ENTREGADA SIN EJECUTAR (regla permanente de BD): Mohamed la corre en el
--    SQL Editor, en QUINTO lugar, DESPUÉS de 20260721120000, 20260721160000,
--    20260721180000 y 20260721190000 (orden cronológico de timestamp).
--
-- ── VERIFICACIÓN DE SCHEMA (regla permanente CLAUDE.md 11/07/2026) ──────────
-- 1. Espejo de public.cotizacion_items — CREATE TABLE (como presupuesto_items)
--    en 20260705120000_baseline_v2.sql:305-318, renombrada por
--    20260708120000_rename_presupuestos_to_cotizaciones.sql:
--
--      CREATE TABLE public.presupuesto_items (
--        id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
--        presupuesto_id  uuid          NOT NULL REFERENCES public.presupuestos(id) ON DELETE CASCADE,
--        svc_id          text          NOT NULL,
--        cat_label       text,
--        svc_label       text,
--        calc_type       text,
--        base_price      numeric(10,2),
--        unit            text,
--        qty             numeric(10,2),
--        unit_price      numeric(10,2),
--        subtotal        numeric(12,2),
--        created_at      timestamptz   DEFAULT now()
--      );
--
--    y su RLS (baseline_v2.sql:710-712):
--      ALTER TABLE public.presupuesto_items ENABLE ROW LEVEL SECURITY;
--      CREATE POLICY presupuesto_items_all ON public.presupuesto_items FOR ALL
--        USING (EXISTS (SELECT 1 FROM public.presupuestos p WHERE p.id = presupuesto_id AND p.user_id = auth.uid()));
--
-- 2. Tabla padre public.facturas — CREATE TABLE baseline_v2.sql:320-349:
--    PK es `inv_id uuid` (no `id`), tenant es `user_id uuid NOT NULL`.
--    ALTER posteriores que la tocan: 20260706160000 (inv_status),
--    20260717120000 (+cliente_id), 20260721180000 (tipo_doc NOT NULL, ose_*,
--    FK from_quote_id RESTRICT, índice único (user_id, inv_num), CHECK
--    comprador) — ninguno afecta a esta migración.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE public.factura_items (
  id           uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  factura_id   uuid          NOT NULL REFERENCES public.facturas(inv_id) ON DELETE CASCADE,
  svc_id       text          NOT NULL,   -- código por línea (slug de partida, o 'manual' — pendiente #7: formato que exija Bizlinks)
  cat_label    text,
  svc_label    text,                     -- descripción visible de la línea
  calc_type    text,
  base_price   numeric(10,2),
  unit         text,                     -- unidad de medida por línea (m², und, h…)
  qty          numeric(10,2),
  unit_price   numeric(10,2),
  subtotal     numeric(12,2),
  created_at   timestamptz   DEFAULT now()
);

COMMENT ON TABLE public.factura_items IS
  'Líneas de factura estructuradas (espejo de cotizacion_items, con unit y svc_id por línea para Bizlinks/UBL). INERTE desde Etapa 4 (21/07/2026): ningún código la usa aún — facturas.items (jsonb) sigue siendo la fuente real hasta ejecutar el plan de migración documentado en TODO-PENDIENTES-DARIVO-PRO.md.';

-- Índice para el join hijo→padre (mismo criterio que 20260710120000, que tuvo
-- que añadir a posteriori los índices de FK que faltaban en otras tablas).
CREATE INDEX factura_items_factura_id_idx ON public.factura_items (factura_id);

-- RLS desde el día 0 (aunque la tabla esté inerte): mismo patrón exacto que
-- cotizacion_items — acceso solo si la factura padre es del usuario.
ALTER TABLE public.factura_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY factura_items_all ON public.factura_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.facturas f
      WHERE f.inv_id = factura_id
        AND f.user_id = auth.uid()
    )
  );

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN Etapa 4 #6 (fase 0). Las fases 1-4 (doble escritura, backfill del jsonb,
-- corte de lectura de PDF/fichas, retiro de facturas.items) NO van aquí —
-- requieren cambios de código coordinados y prueba contra BD real; ver el plan
-- en frontend/docs-internos/TODO-PENDIENTES-DARIVO-PRO.md.
-- ════════════════════════════════════════════════════════════════════════════
