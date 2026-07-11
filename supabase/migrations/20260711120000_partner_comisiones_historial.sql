-- Registro histórico y auditable de comisiones Partner
-- Fuente: 02-darivo-pro-admin/06-PANEL-ADMIN-PARTNERS.md §5.2 (decisión de negocio 11/07/2026)
--
-- Cada comisión generada (venta o bono de hito) se persiste como evento
-- inmutable, con el conteo de referidos y el porcentaje vigentes en el
-- momento exacto de generarla. Evita que subir de tramo recalcule
-- retroactivamente comisiones ya generadas en un tramo anterior.
--
-- tipo='venta'  → automático, vía trigger en pagos_eventos (este archivo).
-- tipo='hito'   → manual (acción de Admin) por ahora — NO se crea aquí
--                 ninguna función/UI para 'hito'; tarea aparte.

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.partner_comisiones_historial (
  id                    uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  partner_id            uuid          NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  tipo                  text          NOT NULL CHECK (tipo IN ('venta', 'hito')),
  referido_id           uuid          REFERENCES public.partner_referidos(id) ON DELETE SET NULL,
  pago_evento_id        uuid          REFERENCES public.pagos_eventos(id) ON DELETE SET NULL,
  referidos_en_momento  integer       NOT NULL CHECK (referidos_en_momento >= 0),
  porcentaje_aplicado   numeric(5,2)  NOT NULL CHECK (porcentaje_aplicado > 0),
  monto                 numeric(12,2) NOT NULL CHECK (monto >= 0),
  moneda                text          NOT NULL DEFAULT 'PEN',
  estado                text          NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada')),
  pagada_at             timestamptz,
  created_at            timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.partner_comisiones_historial IS
  'Registro histórico e inmutable de cada comisión generada por Partner — 06-PANEL-ADMIN-PARTNERS.md §5.2. No es la tabla de tarifas (esa es partner_comisiones).';

COMMENT ON COLUMN public.partner_comisiones_historial.referidos_en_momento IS
  'Snapshot: conteo de partner_referidos del partner en el momento exacto de generar esta comisión — no recalcular a partir del conteo actual.';

COMMENT ON COLUMN public.partner_comisiones_historial.porcentaje_aplicado IS
  'Porcentaje vigente en el momento de generar la comisión (20.00 fijo para tipo=venta; según tramo de §5.1 para tipo=hito).';

-- ────────────────────────────────────────────────────────────────────────────
-- ÍNDICES
-- ────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_partner_comisiones_historial_partner
  ON public.partner_comisiones_historial (partner_id);

CREATE INDEX idx_partner_comisiones_historial_estado
  ON public.partner_comisiones_historial (estado);

-- Idempotencia: un mismo evento de pago no puede generar dos comisiones de venta
-- (protege contra reprocesar el mismo webhook dos veces).
CREATE UNIQUE INDEX idx_partner_comisiones_historial_pago_evento_venta
  ON public.partner_comisiones_historial (pago_evento_id)
  WHERE tipo = 'venta';

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.partner_comisiones_historial ENABLE ROW LEVEL SECURITY;

-- Partner: solo lectura de sus propias comisiones. Nunca inserta/edita directo
-- (mismo patrón que partners_own / partner_referidos_partner).
CREATE POLICY partner_comisiones_historial_partner ON public.partner_comisiones_historial
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_id
        AND (p.user_id = auth.uid() OR p.email = (auth.jwt()->>'email'))
    )
  );

-- Admin: control total.
CREATE POLICY partner_comisiones_historial_admin ON public.partner_comisiones_historial
  FOR ALL
  USING (public.is_darivo_admin());

-- Nota: no existe policy de INSERT/UPDATE para el rol Partner ni para
-- "authenticated" en general — los registros nacen únicamente vía la función
-- SECURITY DEFINER de más abajo (o, para tipo='hito', vía la acción manual de
-- Admin que se implementará en una tarea aparte).

-- ────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN + TRIGGER — genera automáticamente tipo='venta'
-- ────────────────────────────────────────────────────────────────────────────
--
-- ⚠️ CONFIRMAR ANTES DE EJECUTAR: el WHEN de más abajo asume que un pago
-- exitoso se marca con pagos_eventos.estado = 'exitoso'. Esa columna no tiene
-- CHECK constraint en el schema (texto libre) y no encontré en el código
-- ninguna integración de dLocal todavía que fije el valor real que usará el
-- webhook. Ajustar el literal 'exitoso' aquí abajo al valor real antes de
-- correr esta migración, o confirmarme que 'exitoso' es correcto.

CREATE OR REPLACE FUNCTION public.generar_comision_venta_partner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referido        public.partner_referidos%ROWTYPE;
  v_partner_id      uuid;
  v_referidos_count integer;
  v_pct             CONSTANT numeric(5,2) := 20.00; -- fijo, no tramado — 06-PANEL-ADMIN-PARTNERS.md §5.1
BEGIN
  -- Solo interesa el usuario que pagó, y solo si llegó vía un enlace de Partner.
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- pagos_eventos.monto no tiene NOT NULL en el schema real — sin esta
  -- comprobación, un evento con monto nulo rompería el INSERT de abajo
  -- (partner_comisiones_historial.monto sí es NOT NULL) y, al ser trigger
  -- AFTER en la misma transacción, revertiría también el propio pago.
  IF NEW.monto IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_referido
  FROM public.partner_referidos
  WHERE referred_user_id = NEW.user_id
  ORDER BY fecha ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW; -- el usuario no fue referido por ningún Partner
  END IF;

  v_partner_id := v_referido.partner_id;

  -- "Pago único — no es recurrente" (§5.1): si este referido ya generó una
  -- comisión de venta antes (con cualquier pago_evento), no generar otra.
  IF EXISTS (
    SELECT 1 FROM public.partner_comisiones_historial
    WHERE tipo = 'venta' AND referido_id = v_referido.id
  ) THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_referidos_count
  FROM public.partner_referidos
  WHERE partner_id = v_partner_id;

  INSERT INTO public.partner_comisiones_historial (
    partner_id, tipo, referido_id, pago_evento_id,
    referidos_en_momento, porcentaje_aplicado, monto, moneda
  ) VALUES (
    v_partner_id, 'venta', v_referido.id, NEW.id,
    v_referidos_count, v_pct, round(NEW.monto * v_pct / 100, 2),
    coalesce(NEW.moneda, 'PEN')
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.generar_comision_venta_partner() IS
  'Genera automáticamente partner_comisiones_historial (tipo=venta) cuando un pago referido pasa a estado exitoso — 06-PANEL-ADMIN-PARTNERS.md §5.2.';

-- ⚠️⚠️⚠️ VALOR PLACEHOLDER — VERIFICAR ANTES DE USAR EN PRODUCCIÓN ⚠️⚠️⚠️
-- 'exitoso' es un placeholder. pagos_eventos.estado es texto libre (sin CHECK
-- constraint en el schema) y, a fecha de esta migración, no existe todavía
-- ninguna integración real del webhook de dLocal en el código del proyecto
-- que fije el valor real usado para "pago exitoso". Cuando se construya esa
-- integración, confirmar el valor exacto que escribe el webhook en esta
-- columna y actualizar el literal de abajo (y esta migración, o una nueva
-- migración de ajuste) antes de dar el trigger por operativo.
CREATE TRIGGER on_pago_evento_generar_comision_venta
  AFTER INSERT OR UPDATE OF estado ON public.pagos_eventos
  FOR EACH ROW
  WHEN (NEW.estado = 'exitoso')  -- ⚠️ PLACEHOLDER — ver nota arriba, confirmar valor real de dLocal
  EXECUTE PROCEDURE public.generar_comision_venta_partner();

COMMIT;
