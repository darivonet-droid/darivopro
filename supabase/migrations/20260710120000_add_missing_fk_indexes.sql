-- Añade índices faltantes en columnas FK que no tenían índice explícito
-- (Postgres no crea índice automático en columnas FK, solo en la PK del lado referenciado).
-- Hallazgo de auditoría BD 10/07/2026 — ver informe de auditoría de esa fecha.
--
-- Prioridad alta (tablas de alto tráfico, tenant por user_id / relación 1:N muy consultada):
--   - cotizacion_items.cotizacion_id  → se consulta en cada apertura de una cotización.
--   - facturas.user_id                → filtro RLS de cada listado de facturas (facturas_all).
--
-- Prioridad media/baja (tablas de menor volumen o consulta ocasional, incluidas por
-- coherencia — "toda FK tiene su índice correspondiente"):
--   - facturas.from_quote_id, partidas_propias.user_id, catalogo_plantillas.sector_id,
--     catalogo_categorias_maestro.plantilla_id / producto_id, partners.user_id,
--     pagos_eventos.suscripcion_id, soporte_mensajes.autor_user_id,
--     partner_referidos.referred_user_id.
--
-- Todos los CREATE INDEX usan IF NOT EXISTS y CONCURRENTLY no se usa aquí porque
-- las tablas de negocio son pequeñas en este estadio del producto; si en el futuro
-- alguna tabla crece mucho antes de aplicar esta migración, evaluar CONCURRENTLY
-- (fuera de bloque transaccional) en su lugar.

BEGIN;

-- Alta prioridad
CREATE INDEX IF NOT EXISTS idx_cotizacion_items_cotizacion ON public.cotizacion_items (cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_facturas_user ON public.facturas (user_id);

-- Media/baja prioridad
CREATE INDEX IF NOT EXISTS idx_facturas_from_quote ON public.facturas (from_quote_id) WHERE from_quote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partidas_propias_user ON public.partidas_propias (user_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_plantillas_sector ON public.catalogo_plantillas (sector_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_categorias_plantilla ON public.catalogo_categorias_maestro (plantilla_id) WHERE plantilla_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_categorias_producto ON public.catalogo_categorias_maestro (producto_id);
CREATE INDEX IF NOT EXISTS idx_partners_user ON public.partners (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pagos_eventos_suscripcion ON public.pagos_eventos (suscripcion_id) WHERE suscripcion_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_soporte_mensajes_autor ON public.soporte_mensajes (autor_user_id) WHERE autor_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partner_referidos_referred_user ON public.partner_referidos (referred_user_id) WHERE referred_user_id IS NOT NULL;

COMMIT;
