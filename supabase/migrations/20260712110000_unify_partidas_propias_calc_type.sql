-- Unifica el vocabulario tipo (español)/calc_type (ingles) en una sola columna.
-- Decision (11/07/2026, autorizado por el propietario): dos tablas documentan el
-- mismo concepto (como se calcula el precio de una partida) con dos vocabularios
-- distintos -- catalogo_partidas_maestro.calc_type y cotizacion_items.calc_type ya
-- usan 'm2'|'unit'|'hour'|'fixed' (ingles, arquitectura oficial Doc 21); solo
-- partidas_propias.tipo seguia en español ('m2'|'unidad'|'hora'|'fijo'). Se unifica
-- hacia el vocabulario ingles ya oficial, no al reves.
--
-- Riesgo acotado: 'tipo' no se muestra nunca como texto crudo al usuario (las
-- pantallas de Móvil/Empresa que lo usan calculan una etiqueta aparte, p.ej.
-- "S/ 120/und" o "Precio cerrado" -- ver frontend/src/components/ajustes/
-- CategoriasManager.tsx, ConfigTabs.tsx, mas/MasTabs.tsx), asi que renombrar el
-- valor interno no cambia ningun texto visible. Codigo ya actualizado en esta
-- misma sesion (10 archivos frontend) para leer/escribir `calc_type` en vez de
-- `tipo` -- esta migracion debe aplicarse ANTES de desplegar ese codigo, o el
-- codigo nuevo intentara leer una columna `calc_type` que todavia no existe.
--
-- VERIFICACION DE SCHEMA (regla permanente CLAUDE.md 11/07/2026):
-- CREATE TABLE public.partidas_propias real (20260705120000_baseline_v2.sql,
-- lineas 367-377):
--   id uuid PK, user_id uuid FK CASCADE, cap_id text NOT NULL, nombre text NOT NULL,
--   tipo text NOT NULL CHECK (tipo IN ('m2','unidad','hora','fijo')),
--   precio numeric(10,2) NOT NULL, unidad text, activa boolean DEFAULT true,
--   created_at timestamptz DEFAULT now().
-- Ningun ALTER TABLE posterior toca esta tabla -- verificado leyendo las 10
-- migraciones existentes (20260706123000, 20260706140000, 20260706160000,
-- 20260708120000, 20260709180000, 20260710120000, 20260710130000, 20260711120000,
-- 20260711130000) antes de escribir esta.
--
-- Preserva TODOS los datos: UPDATE de valores + RENAME COLUMN, nunca DROP/CREATE.

BEGIN;

-- 1. Quitar el CHECK viejo (nombre real desconocido de antemano — mismo patron
--    de busqueda dinamica que 20260706160000_factura_6_estados.sql).
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
      AND t.relname = 'partidas_propias'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%tipo%'
  LOOP
    EXECUTE format('ALTER TABLE public.partidas_propias DROP CONSTRAINT %I', r.conname);
    RAISE NOTICE 'Dropped constraint % on public.partidas_propias', r.conname;
  END LOOP;
END $$;

-- 2. Traducir valores existentes (con la columna todavia sin CHECK, para no
--    chocar contra el constraint viejo a mitad de la traduccion).
UPDATE public.partidas_propias
SET tipo = CASE tipo
  WHEN 'unidad' THEN 'unit'
  WHEN 'hora'   THEN 'hour'
  WHEN 'fijo'   THEN 'fixed'
  ELSE tipo -- 'm2' ya coincide en ambos vocabularios
END;

-- 3. Renombrar la columna (dato preservado, solo cambia el nombre y los valores).
ALTER TABLE public.partidas_propias RENAME COLUMN tipo TO calc_type;

-- 4. CHECK nuevo con el vocabulario ingles ya oficial (mismo que
--    catalogo_partidas_maestro.calc_type y cotizacion_items.calc_type).
ALTER TABLE public.partidas_propias
  ADD CONSTRAINT partidas_propias_calc_type_check
  CHECK (calc_type IN ('m2', 'unit', 'hour', 'fixed'));

COMMIT;
