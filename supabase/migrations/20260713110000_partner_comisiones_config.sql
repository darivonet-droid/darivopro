-- Tabla real y editable para el plan de comisiones Partner, reemplazando la
-- constante hardcodeada en frontend/src/lib/partners-types.ts.
-- 06-PANEL-ADMIN-PARTNERS.md §5/§8/§4 (Acciones principales, Acciones
-- disponibles, Acciones rápidas): "Configurar tabla de comisiones" es una
-- acción oficial de Admin que hoy no existe -- el plan solo se mostraba de
-- solo lectura porque vivía como constante en código, no en BD.
--
-- ⚠️ NO reutiliza `partner_comisiones` -- esa tabla está derogada oficialmente
-- por decisión de negocio ("Sustituye y deroga por completo... queda
-- oficialmente eliminada — no debe volver a documentarse ni configurarse en
-- el sistema", §5.1, 07/07/2026) y sigue existiendo físicamente en el schema
-- solo por herencia del baseline, sin uso.
--
-- Los VALORES sembrados son exactamente los ya aprobados por el propietario
-- (§5.1, 07/07/2026) -- 20% venta única + 10/10/15/20% por hito. No se
-- inventa ningún número de negocio nuevo, solo se persiste en BD lo que ya
-- vivía hardcodeado, para que Admin pueda editarlo de verdad de ahora en
-- adelante.
--
-- Los umbrales de hito (5/20/50/100 clientes propios) NO son editables desde
-- esta tabla a propósito: `calcularProgresoHitos` (partners-types.ts) tiene
-- lógica estructural específica para el último tramo ("techo permanente cada
-- 50 desde 100") que asume esos umbrales exactos. Cambiar los umbrales
-- requeriría rediseñar esa función, fuera de alcance de "hacer editables los
-- porcentajes". Solo `porcentaje` es editable desde Admin.
--
-- VERIFICACION DE SCHEMA (regla permanente CLAUDE.md 11/07/2026):
-- Tabla nueva, no depende de ninguna existente salvo funciones ya
-- verificadas (`handle_updated_at()`, `is_darivo_admin()` -- ambas
-- definidas en 20260705120000_baseline_v2.sql, líneas 22-33 y 592-608,
-- sin ALTER posterior). `generar_comision_venta_partner()` SÍ se
-- reemplaza aquí (CREATE OR REPLACE) -- definición actual verificada en
-- 20260711120000_partner_comisiones_historial.sql líneas 98-159, sin
-- ALTER FUNCTION posterior en ninguna migración existente.

BEGIN;

CREATE TABLE public.partner_comisiones_config (
  id          uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipo        text          NOT NULL CHECK (tipo IN ('venta', 'hito')),
  hito        integer       NULL,
  porcentaje  numeric(5,2)  NOT NULL CHECK (porcentaje > 0),
  orden       integer       NOT NULL DEFAULT 0,
  updated_at  timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (tipo, hito)
);

COMMENT ON TABLE public.partner_comisiones_config IS
  'Plan de comisiones Partner editable desde Admin (06-PANEL-ADMIN-PARTNERS.md §5.1/§5). Reemplaza la constante hardcodeada en partners-types.ts. No confundir con partner_comisiones (derogada) ni con partner_comisiones_historial (registro histórico de comisiones ya generadas).';

-- Seed: valores ya aprobados 07/07/2026, sin cambios.
INSERT INTO public.partner_comisiones_config (tipo, hito, porcentaje, orden) VALUES
  ('venta', NULL, 20.00, 0),
  ('hito',  5,    10.00, 1),
  ('hito',  20,   10.00, 2),
  ('hito',  50,   15.00, 3),
  ('hito',  100,  20.00, 4);

ALTER TABLE public.partner_comisiones_config ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier autenticado (el propio Partner necesita ver su plan de
-- comisiones en su panel, igual que ya podía leer la constante hardcodeada).
CREATE POLICY partner_comisiones_config_select ON public.partner_comisiones_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Escritura: solo Admin.
CREATE POLICY partner_comisiones_config_admin ON public.partner_comisiones_config
  FOR ALL USING (public.is_darivo_admin());

CREATE TRIGGER on_partner_comisiones_config_update
  BEFORE UPDATE ON public.partner_comisiones_config
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Actualiza el trigger de comisión por venta para leer el porcentaje desde
-- esta tabla en vez del literal hardcodeado 20.00 -- así una edición de
-- Admin sí tiene efecto real en las comisiones que se generan.
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
  v_pct             numeric(5,2);
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.monto IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_referido
  FROM public.partner_referidos
  WHERE referred_user_id = NEW.user_id
  ORDER BY fecha ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  v_partner_id := v_referido.partner_id;

  IF EXISTS (
    SELECT 1 FROM public.partner_comisiones_historial
    WHERE tipo = 'venta' AND referido_id = v_referido.id
  ) THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_referidos_count
  FROM public.partner_referidos
  WHERE partner_id = v_partner_id;

  SELECT porcentaje INTO v_pct
  FROM public.partner_comisiones_config
  WHERE tipo = 'venta'
  LIMIT 1;
  -- Salvaguarda: si por error la config queda sin fila 'venta', no rompe el
  -- pago -- usa el último valor aprobado conocido en vez de fallar.
  IF v_pct IS NULL THEN
    v_pct := 20.00;
  END IF;

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

COMMIT;
