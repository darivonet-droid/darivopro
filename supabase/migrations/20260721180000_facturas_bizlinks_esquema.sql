-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — ETAPA 3 auditoría de esquema (21/07/2026): factura lista para
-- Bizlinks (proveedor OSE ya contratado — esta migración NO implementa el envío,
-- solo cierra los gaps del esquema de datos que la integración necesitará).
-- ⚠️ ENTREGADA SIN EJECUTAR (regla permanente de BD): Mohamed la corre en el
--    SQL Editor de Supabase, en TERCER lugar, DESPUÉS de
--    20260721120000_pago_fallido_solo_lectura.sql y
--    20260721160000_rls_etapa2_correcciones.sql (orden cronológico de timestamp;
--    esta no depende técnicamente de las otras dos, pero mantener el orden de
--    los nombres de archivo evita divergencia entre el historial del repo y la
--    BD real).
--
-- ── VERIFICACIÓN DE SCHEMA (regla permanente CLAUDE.md 11/07/2026) ──────────
-- 1. public.facturas — CREATE TABLE en 20260705120000_baseline_v2.sql:320-349:
--      inv_id uuid PK, user_id uuid NOT NULL → auth.users, inv_num text NOT NULL,
--      inv_date date DEFAULT current_date, inv_status text (CHECK reescrito por
--      20260706160000 a los 6 estados: Borrador/En proceso/Emitida/Rechazada/
--      Pendiente de envío/Cobrada, DEFAULT 'Borrador'), tipo_doc text DEFAULT
--      'factura' CHECK IN ('boleta','factura') — SIN NOT NULL, client_name text
--      NOT NULL, client_ruc text, client_dni text, client_dir text, moneda text,
--      sym text, items jsonb DEFAULT '[]', subtotal_base/igv_amount/total_final
--      numeric(12,2), detraccion_* , neto_cobrar, cta_detracciones,
--      from_quote_id uuid REFERENCES presupuestos(id) ON DELETE SET NULL
--      (la tabla referenciada se renombró a cotizaciones en 20260708120000; la
--      FK la siguió automáticamente, el nombre del constraint no cambió),
--      biz_data jsonb, pdf_url text, created_at, updated_at.
--    ALTER posteriores (búsqueda exhaustiva 21/07/2026, únicos que la tocan):
--      20260706160000 (inv_status: drop CHECK viejo + remap Pendiente→Emitida +
--      CHECK de 6 estados + DEFAULT 'Borrador');
--      20260717120000 (+ cliente_id uuid → clientes, con backfill).
--    SIN ningún índice UNIQUE sobre inv_num en ninguna migración (verificado).
-- 2. public.comprobante_series — CREATE TABLE en baseline_v2.sql:140-143:
--      serie text PRIMARY KEY, ultimo_num integer NOT NULL DEFAULT 0.
--    RLS habilitado sin políticas (baseline:740-741, intencional). Sin ningún
--    ALTER posterior. ÚNICO escritor: asignar_inv_num() (baseline:62-89,
--    SECURITY DEFINER), que solo actúa si el INSERT llega sin inv_num.
-- 3. public.cotizaciones — CREATE TABLE (como presupuestos) baseline:284-303,
--    renombrada en 20260708120000. Numeración: asignar_cot_num() por usuario vía
--    cotizacion_series (user_id PK) + índice único parcial
--    cotizaciones_user_cot_num_idx (user_id, cot_num) — CORRECTA, no se toca.
--
-- ── HALLAZGOS QUE ESTA MIGRACIÓN CORRIGE (evidencia en el reporte de Etapa 3) ──
-- GAP A (numeración): el flujo real de la app NUNCA usa comprobante_series — los
--   formularios calculan inv_num EN EL CLIENTE (nextNumeroComprobante(),
--   factura-utils.ts:78-89, max+1 sobre las facturas propias) y lo mandan en el
--   INSERT, con lo que el trigger asignar_inv_num() se salta (baseline:73-75).
--   Consecuencias: (1) NINGUNA unicidad en BD → dos pestañas/dispositivos
--   simultáneos pueden guardar el mismo inv_num (condición de carrera real,
--   duplicado silencioso); (2) el fallback del trigger usa un contador GLOBAL
--   cross-tenant (serie PK sin user_id) — si algún día se usara, mezclaría el
--   correlativo de TODAS las empresas emisoras en una sola secuencia,
--   inaceptable para comprobantes SUNAT (cada emisor tiene su propia serie).
-- GAP B (inmutabilidad): la política facturas_all (FOR ALL, auth.uid()=user_id)
--   permite a la sesión del usuario editar inv_num/inv_date/tipo_doc de una
--   factura ya emitida. Ningún flujo legítimo lo hace (únicos UPDATE por sesión:
--   inv_status en useFactura.ts:184-191 y pdf_url en api/pdf/factura) — se
--   bloquea a nivel de BD.
-- GAP C (estado OSE): no existe NINGUNA columna para el estado de envío a
--   Bizlinks ni para el código/CDR de respuesta. Se agregan, solo escribibles
--   del lado servidor (la futura integración), nunca por la sesión del usuario.
-- GAP D (trazabilidad): from_quote_id era ON DELETE SET NULL — borrar la
--   cotización origen (flujo real: useCotizacion.eliminar) dejaba la factura sin
--   su origen. El checklist exige la FK "sin perderla" → RESTRICT (borrar una
--   cotización ya facturada ahora da error; la factura conserva su origen).
-- GAP E (identidad del comprador): client_ruc/client_dni sin ninguna validación
--   en BD. Los DOS formularios ya la exigen idéntica (factura: RUC 11 dígitos
--   empezando en 10/20; boleta: DNI 8 dígitos — NuevaFacturaForm.tsx:163-183 y
--   NuevaFacturaFormEscritorio.tsx:137-153) → CHECK NOT VALID (solo filas
--   nuevas, no rompe datos históricos). tipo_doc además pasa a NOT NULL
--   (backfill NULL→'factura', el mismo fallback que ya aplica la app en
--   useFactura.ts:42).
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- GAP A.1 — Unicidad real del correlativo: índice único (user_id, inv_num).
-- Aborta con mensaje claro si ya existen duplicados (resolverlos a mano antes;
-- deduplicar automáticamente inventaría numeración fiscal, no se hace).
-- ────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  dup_count bigint;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT user_id, inv_num
    FROM public.facturas
    GROUP BY user_id, inv_num
    HAVING count(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION
      'facturas tiene % pares (user_id, inv_num) duplicados. Revisar con: SELECT user_id, inv_num, count(*) FROM public.facturas GROUP BY 1,2 HAVING count(*) > 1; y corregir a mano antes de re-ejecutar esta migración.',
      dup_count;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS facturas_user_inv_num_key
  ON public.facturas (user_id, inv_num);

COMMENT ON INDEX public.facturas_user_inv_num_key IS
  'Correlativo único por emisor (tenant): un mismo usuario no puede reutilizar un serie-correlativo. Etapa 3 (21/07/2026).';

-- ────────────────────────────────────────────────────────────────────────────
-- GAP A.2 — comprobante_series pasa de contador GLOBAL a contador POR EMISOR.
-- Las filas globales existentes (si las hay) son solo contadores sin dueño,
-- generados por un fallback que el flujo real nunca usó — se eliminan y el
-- estado real se re-siembra por usuario desde las facturas existentes.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.comprobante_series
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DELETE FROM public.comprobante_series WHERE user_id IS NULL;

ALTER TABLE public.comprobante_series
  DROP CONSTRAINT IF EXISTS comprobante_series_pkey;

ALTER TABLE public.comprobante_series
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.comprobante_series
  ADD PRIMARY KEY (user_id, serie);

-- Siembra por usuario: el mayor correlativo ya emitido en cada serie
-- (patrón real: 'B001-00000001' / 'F001-00000001'; se ignoran formatos ajenos).
INSERT INTO public.comprobante_series (user_id, serie, ultimo_num)
SELECT f.user_id,
       split_part(f.inv_num, '-', 1)                    AS serie,
       max((split_part(f.inv_num, '-', 2))::integer)    AS ultimo_num
FROM public.facturas f
WHERE f.inv_num ~ '^[A-Z]\d{3}-\d{1,9}$'
GROUP BY f.user_id, split_part(f.inv_num, '-', 1)
ON CONFLICT (user_id, serie) DO UPDATE
  SET ultimo_num = GREATEST(public.comprobante_series.ultimo_num, EXCLUDED.ultimo_num);

COMMENT ON TABLE public.comprobante_series IS
  'Correlativo B001/F001 POR EMISOR (user_id) — acceso solo vía asignar_inv_num(). Antes era global cross-tenant (Etapa 3, 21/07/2026).';

-- ────────────────────────────────────────────────────────────────────────────
-- GAP A.3 — asignar_inv_num() por emisor + sincronización del contador.
-- El flujo actual (inv_num calculado en el cliente) SE RESPETA — la unicidad la
-- garantiza ya el índice de GAP A.1 — pero el contador del usuario se sincroniza
-- (GREATEST) para que el camino de fallback nunca pueda re-emitir un correlativo
-- ya usado. Si el INSERT llega sin inv_num, se asigna atómicamente por usuario.
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.asignar_inv_num()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  serie               text;
  siguiente           integer;
  correlativo_cliente integer;
BEGIN
  serie := CASE WHEN NEW.tipo_doc = 'boleta' THEN 'B001' ELSE 'F001' END;

  IF NEW.inv_num IS NOT NULL AND btrim(NEW.inv_num) <> '' THEN
    -- Número calculado por el formulario (flujo vigente). Sincroniza el
    -- contador del emisor para que el fallback nunca colisione con él.
    IF NEW.inv_num ~ ('^' || serie || '-\d{1,9}$') THEN
      correlativo_cliente := split_part(NEW.inv_num, '-', 2)::integer;
      INSERT INTO public.comprobante_series (user_id, serie, ultimo_num)
      VALUES (NEW.user_id, serie, correlativo_cliente)
      ON CONFLICT (user_id, serie) DO UPDATE
        SET ultimo_num = GREATEST(comprobante_series.ultimo_num, EXCLUDED.ultimo_num);
    END IF;
    RETURN NEW;
  END IF;

  INSERT INTO public.comprobante_series (user_id, serie, ultimo_num)
  VALUES (NEW.user_id, serie, 1)
  ON CONFLICT (user_id, serie) DO UPDATE
    SET ultimo_num = comprobante_series.ultimo_num + 1
  RETURNING ultimo_num INTO siguiente;

  NEW.inv_num := serie || '-' || lpad(siguiente::text, 8, '0');
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.asignar_inv_num() IS
  'Numeración B001/F001 POR EMISOR vía comprobante_series (SECURITY DEFINER). Etapa 3 (21/07/2026): antes el fallback era un contador global cross-tenant; ahora es por user_id y se sincroniza también cuando el número viene del formulario.';

-- ────────────────────────────────────────────────────────────────────────────
-- Punto 3 del checklist — tipo_doc obligatorio (Bizlinks necesita saber siempre
-- si es factura o boleta). Backfill idéntico al fallback que ya aplica la app
-- (useFactura.ts:42 — row.tipo_doc ?? "factura").
-- ────────────────────────────────────────────────────────────────────────────

UPDATE public.facturas SET tipo_doc = 'factura' WHERE tipo_doc IS NULL;

ALTER TABLE public.facturas
  ALTER COLUMN tipo_doc SET NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- GAP C — Estado de envío al OSE (Bizlinks) + código/CDR de respuesta.
-- Columnas de datos ÚNICAMENTE — el envío real NO se implementa aquí.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.facturas
  ADD COLUMN IF NOT EXISTS ose_estado text NOT NULL DEFAULT 'pendiente'
    CHECK (ose_estado IN ('pendiente', 'enviado', 'aceptado', 'rechazado')),
  ADD COLUMN IF NOT EXISTS ose_codigo_respuesta text,
  ADD COLUMN IF NOT EXISTS ose_cdr jsonb;

COMMENT ON COLUMN public.facturas.ose_estado IS
  'Estado del comprobante frente al OSE (Bizlinks): pendiente (aún no enviado) / enviado / aceptado / rechazado. Solo lo escribe el servidor (futura integración) — nunca la sesión del usuario.';
COMMENT ON COLUMN public.facturas.ose_codigo_respuesta IS
  'Código de respuesta devuelto por Bizlinks/SUNAT (cuando exista). Formato exacto lo define la integración — aquí solo se persiste.';
COMMENT ON COLUMN public.facturas.ose_cdr IS
  'Respuesta/CDR cruda devuelta por Bizlinks (cuando exista), guardada tal cual (jsonb). La estructura la define la API de Bizlinks al construirse la integración.';

-- ────────────────────────────────────────────────────────────────────────────
-- GAP B + protección de columnas OSE — trigger de campos fiscales.
-- · Sesión de usuario (auth.uid() no nulo) NUNCA escribe ose_* (ni en INSERT ni
--   en UPDATE) — esos campos reflejan la respuesta real del OSE.
-- · Una vez emitida (inv_status fuera de Borrador/En proceso), inv_num,
--   inv_date y tipo_doc quedan inmutables para la sesión de usuario.
-- · service_role (auth.uid() NULL — webhooks/integración/admin server-side)
--   pasa sin restricción, mismo patrón que Etapa 2 (perfiles).
-- Flujos legítimos verificados que NO se rompen: INSERT de crear()
-- (useFactura.ts:149-177, ose_* quedan en default), UPDATE de inv_status
-- (useFactura.ts:184-191) y UPDATE de pdf_url (api/pdf/factura/[id]/route.ts:74-75)
-- — ninguno toca columnas bloqueadas.
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.facturas_proteger_campos_fiscales()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW; -- service_role / integración server-side
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.ose_estado IS DISTINCT FROM 'pendiente'
       OR NEW.ose_codigo_respuesta IS NOT NULL
       OR NEW.ose_cdr IS NOT NULL THEN
      RAISE EXCEPTION 'No autorizado: ose_estado/ose_codigo_respuesta/ose_cdr solo se fijan del lado servidor.';
    END IF;
    RETURN NEW;
  END IF;

  -- TG_OP = 'UPDATE'
  IF NEW.ose_estado IS DISTINCT FROM OLD.ose_estado
     OR NEW.ose_codigo_respuesta IS DISTINCT FROM OLD.ose_codigo_respuesta
     OR NEW.ose_cdr IS DISTINCT FROM OLD.ose_cdr THEN
    RAISE EXCEPTION 'No autorizado: ose_estado/ose_codigo_respuesta/ose_cdr solo se cambian del lado servidor.';
  END IF;

  IF OLD.inv_status NOT IN ('Borrador', 'En proceso') THEN
    IF NEW.inv_num  IS DISTINCT FROM OLD.inv_num
       OR NEW.inv_date IS DISTINCT FROM OLD.inv_date
       OR NEW.tipo_doc IS DISTINCT FROM OLD.tipo_doc THEN
      RAISE EXCEPTION 'No autorizado: inv_num/inv_date/tipo_doc son inmutables después de la emisión.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.facturas_proteger_campos_fiscales() IS
  'Bloquea, para la sesión del usuario final: escritura de columnas OSE (siempre) y edición de inv_num/inv_date/tipo_doc en facturas ya emitidas. service_role pasa. Etapa 3 auditoría de esquema, 21/07/2026.';

DROP TRIGGER IF EXISTS trg_facturas_proteger_campos_fiscales ON public.facturas;
CREATE TRIGGER trg_facturas_proteger_campos_fiscales
  BEFORE INSERT OR UPDATE ON public.facturas
  FOR EACH ROW EXECUTE PROCEDURE public.facturas_proteger_campos_fiscales();

-- ────────────────────────────────────────────────────────────────────────────
-- GAP D — Trazabilidad factura → cotización origen: SET NULL → RESTRICT.
-- Consecuencia funcional (documentada, no un bug): eliminar una cotización que
-- ya fue convertida a factura ahora falla con error de FK — la app muestra el
-- mensaje de Supabase (useCotizacion.eliminar ya propaga error.message).
-- ────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'facturas'
      AND c.contype = 'f'
      AND pg_get_constraintdef(c.oid) ILIKE '%from_quote_id%'
  LOOP
    EXECUTE format('ALTER TABLE public.facturas DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.facturas
  ADD CONSTRAINT facturas_from_quote_id_fkey
  FOREIGN KEY (from_quote_id) REFERENCES public.cotizaciones(id) ON DELETE RESTRICT;

-- ────────────────────────────────────────────────────────────────────────────
-- GAP E — Identidad del comprador exigida en BD para comprobantes NUEVOS.
-- NOT VALID: las filas históricas no se re-validan (pueden tener RUC/DNI
-- faltante de antes de que los formularios lo exigieran); toda fila nueva o
-- modificada debe cumplir. Misma regla que ya aplican ambos formularios.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.facturas
  ADD CONSTRAINT facturas_comprador_doc_check
  CHECK (
    (tipo_doc = 'factura' AND client_ruc ~ '^(10|20)\d{9}$')
    OR
    (tipo_doc = 'boleta'  AND client_dni ~ '^\d{8}$')
  ) NOT VALID;

COMMENT ON CONSTRAINT facturas_comprador_doc_check ON public.facturas IS
  'Factura exige RUC de comprador válido (11 dígitos, 10/20); boleta exige DNI (8 dígitos). NOT VALID: solo filas nuevas — espejo de la validación ya vigente en los formularios. Etapa 3, 21/07/2026.';

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN Etapa 3 — esquema de factura listo para capturar lo que Bizlinks necesita
-- recibir. NO implementa envío/XML/API (eso es la integración, fuera de alcance).
-- Quedan documentados como preguntas abiertas (ver CLAUDE.md, cierre 21/07/2026):
-- serie fija F001/B001 vs. series asignadas por emisor, items en jsonb sin
-- unidad de medida por línea, y RUC emisor solo validado en el formulario.
-- ════════════════════════════════════════════════════════════════════════════
