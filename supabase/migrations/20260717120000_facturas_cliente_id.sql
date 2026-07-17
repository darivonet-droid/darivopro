-- DARIVO PRO — facturas.cliente_id (FK real a clientes)
-- Antes: facturas solo guardaba client_name como texto suelto (sin FK), y el
-- único enlace indirecto a un cliente era facturas.from_quote_id -> cotizaciones.cliente_id
-- (se perdía en cualquier factura creada "desde cero" sin pasar por una cotización).
-- Ahora: misma fuente de verdad que cotizaciones.cliente_id, vinculada por el
-- frontend (useFactura.ts) al elegir un cliente guardado o por deduplicación
-- automática por teléfono (mismo patrón que useCotizacion.findOrCreateCliente).
-- Necesaria para que "Clientes" (sin factura) / "Facturas" (con factura) filtren
-- sobre la misma lista base de clientes.

ALTER TABLE public.facturas
  ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS facturas_cliente_id_idx ON public.facturas(cliente_id);

-- Backfill 1: facturas creadas desde una cotización aprobada — copiar el
-- cliente_id que ya tenía esa cotización.
UPDATE public.facturas f
SET cliente_id = c.cliente_id
FROM public.cotizaciones c
WHERE f.from_quote_id = c.id
  AND f.cliente_id IS NULL
  AND c.cliente_id IS NOT NULL;

-- Backfill 2: resto de facturas — enlazar por nombre exacto (mismo user_id),
-- solo cuando el nombre identifica a un único cliente sin ambigüedad.
UPDATE public.facturas f
SET cliente_id = cl.id
FROM public.clientes cl
WHERE f.cliente_id IS NULL
  AND f.user_id = cl.user_id
  AND lower(trim(f.client_name)) = lower(trim(cl.nombre))
  AND (
    SELECT count(*) FROM public.clientes cl2
    WHERE cl2.user_id = f.user_id AND lower(trim(cl2.nombre)) = lower(trim(f.client_name))
  ) = 1;

-- Nota: las facturas que no logren enlazarse (nombre no coincide con ningún
-- cliente guardado, o coincide con más de uno) quedan con cliente_id = NULL.
-- No aparecerán en "Facturas" (que ahora lista clientes, no documentos sueltos)
-- hasta que se re-vinculen a mano editando esa factura o creando el cliente
-- correspondiente. No se inventa ningún dato — es la misma limitación que ya
-- existía (client_name era texto libre desde el principio).
