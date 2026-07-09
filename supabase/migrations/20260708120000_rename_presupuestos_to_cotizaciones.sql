-- Renombra presupuestos → cotizaciones (terminología oficial unificada, CLAUDE.md).
-- Preserva TODOS los datos: usa ALTER ... RENAME, nunca DROP/CREATE.
-- Las FK de facturas.from_quote_id y calculos_log.presupuesto_id siguen a la tabla
-- automáticamente; las expresiones internas de las políticas RLS que referencian
-- la columna presupuesto_id se actualizan solas al renombrar la columna.

BEGIN;

-- Tablas
ALTER TABLE public.presupuestos      RENAME TO cotizaciones;
ALTER TABLE public.presupuesto_items RENAME TO cotizacion_items;

-- Columnas FK
ALTER TABLE public.cotizacion_items  RENAME COLUMN presupuesto_id TO cotizacion_id;
ALTER TABLE public.calculos_log      RENAME COLUMN presupuesto_id TO cotizacion_id;

-- Índices
ALTER INDEX presupuestos_user_cot_num_idx RENAME TO cotizaciones_user_cot_num_idx;
ALTER INDEX idx_presupuestos_cliente      RENAME TO idx_cotizaciones_cliente;
ALTER INDEX idx_presupuestos_wa_enviado   RENAME TO idx_cotizaciones_wa_enviado;
ALTER INDEX idx_calculos_log_presupuesto  RENAME TO idx_calculos_log_cotizacion;

-- Triggers
ALTER TRIGGER on_presupuesto_update   ON public.cotizaciones RENAME TO on_cotizacion_update;
ALTER TRIGGER trg_presupuesto_cot_num ON public.cotizaciones RENAME TO trg_cotizacion_cot_num;

-- Políticas RLS
ALTER POLICY presupuestos_all      ON public.cotizaciones     RENAME TO cotizaciones_all;
ALTER POLICY presupuesto_items_all ON public.cotizacion_items RENAME TO cotizacion_items_all;

COMMIT;
