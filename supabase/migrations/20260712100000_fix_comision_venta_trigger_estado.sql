-- Corrige el placeholder 'exitoso' del trigger de comisiones Partner
-- (documentado como bloqueante en 20260711120000_partner_comisiones_historial.sql,
-- lineas 91-96 y 164-176).
--
-- VERIFICACION DE SCHEMA (regla permanente CLAUDE.md 11/07/2026):
-- CREATE TABLE public.pagos_eventos real (20260705120000_baseline_v2.sql, lineas 533-544):
--   id uuid PK, user_id uuid FK SET NULL, suscripcion_id uuid FK SET NULL,
--   evento_tipo text NOT NULL, monto numeric(12,2) [sin NOT NULL],
--   moneda text DEFAULT 'PEN', estado text [sin CHECK constraint],
--   dlocal_order_id text, payload jsonb, created_at timestamptz DEFAULT now().
-- Ningun ALTER TABLE posterior (20260706123000, 20260706140000, 20260706160000,
-- 20260708120000, 20260709180000, 20260710120000, 20260710130000, 20260711130000)
-- toca pagos_eventos ni el trigger on_pago_evento_generar_comision_venta —
-- verificado leyendo las 10 migraciones existentes antes de escribir esta.
--
-- QUE CAMBIA Y POR QUE:
-- El webhook real de dLocal (frontend/src/app/api/pagos/webhook/route.ts) ya
-- normaliza el status a mayusculas y lo compara contra ESTADOS_PAGO_EXITOSO
-- (frontend/src/lib/pagos-suscripcion.ts): 'PAID', 'COMPLETED', 'CONFIRMED',
-- 'ACTIVE', 'APPROVED'. El trigger comparaba contra el literal español
-- 'exitoso', que nunca coincide con ninguno de esos valores reales — por lo
-- que el trigger nunca disparaba, independientemente del placeholder.
-- Ademas, hasta esta sesion el webhook nunca insertaba en pagos_eventos
-- (ver commit que anade registrarPagoEvento en route.ts) — sin esa fila,
-- el trigger tampoco tenia sobre que disparar. Ambos problemas juntos
-- explican por que las comisiones de venta nunca se generaron.
--
-- Postgres no permite ALTER TRIGGER ... WHEN — hay que DROP + CREATE.

BEGIN;

DROP TRIGGER IF EXISTS on_pago_evento_generar_comision_venta ON public.pagos_eventos;

-- Nota: esta lista debe mantenerse sincronizada manualmente con
-- ESTADOS_PAGO_EXITOSO en frontend/src/lib/pagos-suscripcion.ts — no hay
-- forma de compartir una constante TS con un CHECK/WHEN de SQL. Si esa
-- constante cambia, actualizar tambien este trigger con una migracion nueva.
CREATE TRIGGER on_pago_evento_generar_comision_venta
  AFTER INSERT OR UPDATE OF estado ON public.pagos_eventos
  FOR EACH ROW
  WHEN (UPPER(NEW.estado) = ANY (ARRAY['PAID', 'COMPLETED', 'CONFIRMED', 'ACTIVE', 'APPROVED']))
  EXECUTE PROCEDURE public.generar_comision_venta_partner();

COMMIT;
