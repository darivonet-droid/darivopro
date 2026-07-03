-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración 015: tablas de referencia (lookup tables)
-- ----------------------------------------------------------------------------
-- OBJETIVO
--   Crear 3 tablas globales de sistema sin afectar ninguna tabla existente:
--     • productos_master       — ecosistema de productos Darivo
--     • configuracion_regional — zona horaria, moneda, IGV por país
--     • categorias_servicios   — qué categorías pertenecen a qué producto
--
-- SEGURIDAD
--   - No modifica ninguna tabla existente (ALTER 0).
--   - Usa CREATE TABLE IF NOT EXISTS + ON CONFLICT DO NOTHING → idempotente.
--   - RLS activado en las 3 tablas: solo lectura para usuarios autenticados.
--     El equipo Darivo gestiona los datos directamente desde Supabase.
--   - Sin user_id: son tablas de sistema, no de usuario.
--
-- EJECUCIÓN
--   Copiar y pegar en Supabase SQL Editor y ejecutar.
--   Puede ejecutarse varias veces sin error ni datos duplicados.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 1: productos_master
-- Define los productos activos del ecosistema Darivo.
-- Ejemplo actual: 'darivo-pro'. Preparado para futuros productos.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.productos_master (
  id          UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        TEXT         NOT NULL UNIQUE,
  nombre      TEXT         NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.productos_master ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "productos_master_select" ON public.productos_master;
CREATE POLICY "productos_master_select"
  ON public.productos_master FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Dato inicial: Darivo Pro
INSERT INTO public.productos_master (slug, nombre, descripcion)
VALUES (
  'darivo-pro',
  'Darivo Pro',
  'Gestión de cotizaciones y facturas para contratistas independientes en Perú'
)
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 2: configuracion_regional
-- Zona horaria, moneda, IGV y configuración por país.
-- Clave: pais_codigo ISO 3166-1 alpha-2 (PE, CL, CO…).
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.configuracion_regional (
  id              UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  pais_codigo     TEXT          NOT NULL UNIQUE,
  pais_nombre     TEXT          NOT NULL,
  moneda_codigo   TEXT          NOT NULL,
  moneda_simbolo  TEXT          NOT NULL,
  zona_horaria    TEXT          NOT NULL,
  idioma          TEXT          NOT NULL DEFAULT 'es',
  igv_porcentaje  NUMERIC(5,2)  NOT NULL DEFAULT 18.00,
  activo          BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   DEFAULT now()
);

ALTER TABLE public.configuracion_regional ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracion_regional_select" ON public.configuracion_regional;
CREATE POLICY "configuracion_regional_select"
  ON public.configuracion_regional FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Dato inicial: Perú
INSERT INTO public.configuracion_regional
  (pais_codigo, pais_nombre, moneda_codigo, moneda_simbolo, zona_horaria, igv_porcentaje)
VALUES
  ('PE', 'Perú', 'PEN', 'S/', 'America/Lima', 18.00)
ON CONFLICT (pais_codigo) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 3: categorias_servicios
-- Relaciona cada categoría (cat_id) con su producto_id.
-- cat_id coincide con los ids de catalog.ts y con categorias.cat_id.
-- No hay FK directa a la tabla categorias (Opción C — sin tocar tabla existente).
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categorias_servicios (
  id          UUID     DEFAULT uuid_generate_v4() PRIMARY KEY,
  producto_id UUID     NOT NULL REFERENCES public.productos_master(id) ON DELETE CASCADE,
  cat_id      TEXT     NOT NULL,
  nombre      TEXT     NOT NULL,
  activo      BOOLEAN  NOT NULL DEFAULT true,
  UNIQUE (producto_id, cat_id)
);

ALTER TABLE public.categorias_servicios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categorias_servicios_select" ON public.categorias_servicios;
CREATE POLICY "categorias_servicios_select"
  ON public.categorias_servicios FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Datos iniciales: 6 categorías base de Darivo Pro
INSERT INTO public.categorias_servicios (producto_id, cat_id, nombre)
SELECT p.id, v.cat_id, v.nombre
FROM public.productos_master p,
(VALUES
  ('albanileria',   'Albañilería'),
  ('fontaneria',    'Gasfitería'),
  ('electricidad',  'Electricidad'),
  ('pintura',       'Pintura'),
  ('carpinteria',   'Carpintería'),
  ('climatizacion', 'Climatización')
) AS v(cat_id, nombre)
WHERE p.slug = 'darivo-pro'
ON CONFLICT (producto_id, cat_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL (resultados visibles en SQL Editor)
-- ────────────────────────────────────────────────────────────────────────────
SELECT 'productos_master'        AS tabla, COUNT(*) AS filas FROM public.productos_master
UNION ALL
SELECT 'configuracion_regional'  AS tabla, COUNT(*) AS filas FROM public.configuracion_regional
UNION ALL
SELECT 'categorias_servicios'    AS tabla, COUNT(*) AS filas FROM public.categorias_servicios;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN — Si llegaste aquí sin errores deberías ver:
--   productos_master       → 1 fila  (darivo-pro)
--   configuracion_regional → 1 fila  (Perú)
--   categorias_servicios   → 6 filas (categorías base)
--   Sin cambios en ninguna tabla existente.
-- ════════════════════════════════════════════════════════════════════════════
