-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — Seed oficial (datos iniciales — sin DDL)
-- Ejecutado automáticamente por: supabase db reset
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- PRODUCTOS ECOSISTEMA
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.productos_master (slug, nombre, descripcion)
VALUES (
  'darivo-pro',
  'Darivo Pro',
  'Gestión de cotizaciones y facturas para contratistas independientes en Perú'
)
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- CONFIGURACIÓN REGIONAL
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.configuracion_regional
  (pais_codigo, pais_nombre, moneda_codigo, moneda_simbolo, zona_horaria, igv_porcentaje)
VALUES
  ('PE', 'Perú', 'PEN', 'S/', 'America/Lima', 18.00)
ON CONFLICT (pais_codigo) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- PLANES OFICIALES (04-PANEL-ADMIN-SUSCRIPCIONES.md §6)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.planes_catalogo (slug, nombre, precio_mensual, precio_anual, limites)
VALUES
  (
    'basico',
    'BÁSICO',
    39.00,
    390.00,
    '{"cotizacionesMes": 20, "facturasMes": 10, "iaDia": 3}'::jsonb
  ),
  (
    'pro',
    'PRO',
    79.00,
    790.00,
    '{"cotizacionesMes": null, "facturasMes": null, "iaDia": null}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- SERIES INICIALES COMPROBANTES
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.comprobante_series (serie, ultimo_num)
VALUES ('B001', 0), ('F001', 0)
ON CONFLICT (serie) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- COMISIONES PARTNERS (estructura oficial — valores pendientes propietario)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_comisiones (rango_desde, rango_hasta, descripcion, comision_texto, orden)
SELECT v.rango_desde, v.rango_hasta, v.descripcion, v.comision_texto, v.orden
FROM (VALUES
  (1, 10, '1–10 registros', 'Pendiente definición propietario', 1),
  (11, 50, '11–50 registros', 'Pendiente definición propietario', 2),
  (51, NULL::integer, '51+ registros', 'Pendiente definición propietario', 3)
) AS v(rango_desde, rango_hasta, descripcion, comision_texto, orden)
WHERE NOT EXISTS (SELECT 1 FROM public.partner_comisiones pc WHERE pc.orden = v.orden);

-- ────────────────────────────────────────────────────────────────────────────
-- CATÁLOGO MAESTRO — Sectores (desde catalog.ts)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.catalogo_sectores (slug, nombre, emoji, orden)
VALUES
  ('albanileria',   'Albañilería',    '🧱', 1),
  ('fontaneria',    'Gasfitería',     '🚿', 2),
  ('electricidad',  'Electricidad',   '⚡', 3),
  ('pintura',       'Pintura',        '🎨', 4),
  ('carpinteria',   'Carpintería',    '🪚', 5),
  ('climatizacion', 'Climatización',  '❄️', 6)
ON CONFLICT (slug) DO NOTHING;

-- Plantillas (1 por sector — plantilla estándar Darivo Pro)
INSERT INTO public.catalogo_plantillas (sector_id, nombre, descripcion)
SELECT s.id, 'Plantilla estándar ' || s.nombre, 'Plantilla oficial Darivo Pro para ' || s.nombre
FROM public.catalogo_sectores s
WHERE NOT EXISTS (
  SELECT 1 FROM public.catalogo_plantillas pl WHERE pl.sector_id = s.id
);

-- Categorías maestro (reemplazo categorias_servicios + catalog.ts)
INSERT INTO public.catalogo_categorias_maestro (plantilla_id, sector_id, producto_id, cat_id, nombre, emoji, color)
SELECT
  pl.id,
  s.id,
  pm.id,
  s.slug,
  s.nombre,
  s.emoji,
  CASE s.slug
    WHEN 'albanileria'   THEN '#F59E0B'
    WHEN 'fontaneria'    THEN '#0D9488'
    WHEN 'electricidad'  THEN '#D97706'
    WHEN 'pintura'       THEN '#2563EB'
    WHEN 'carpinteria'   THEN '#92400E'
    WHEN 'climatizacion' THEN '#7C3AED'
    ELSE '#2563EB'
  END
FROM public.catalogo_sectores s
JOIN public.catalogo_plantillas pl ON pl.sector_id = s.id
CROSS JOIN public.productos_master pm
WHERE pm.slug = 'darivo-pro'
ON CONFLICT (producto_id, cat_id) DO NOTHING;

-- Partidas maestro (desde catalog.ts — Tarifa Pro)
INSERT INTO public.catalogo_partidas_maestro (categoria_maestro_id, svc_id, nombre, calc_type, precio_tarifa_pro, unidad)
SELECT c.id, v.svc_id, v.nombre, v.calc_type, v.precio, v.unidad
FROM public.catalogo_categorias_maestro c
JOIN (
  VALUES
    ('albanileria',   'alb-muro',          'Muro de ladrillo',              'm2',   85,  'm²'),
    ('albanileria',   'alb-tarrajeo',      'Tarrajeo de paredes',           'm2',   35,  'm²'),
    ('albanileria',   'alb-piso-ceramico', 'Piso cerámico instalado',       'm2',   55,  'm²'),
    ('albanileria',   'alb-contrapiso',    'Contrapiso',                    'm2',   45,  'm²'),
    ('albanileria',   'alb-demolicion',    'Demolición de muro',            'm2',   30,  'm²'),
    ('fontaneria',    'fon-punto-agua',    'Punto de agua',                 'unit', 120, 'pto'),
    ('fontaneria',    'fon-punto-desague', 'Punto de desagüe',              'unit', 140, 'pto'),
    ('fontaneria',    'fon-inodoro',       'Instalación de inodoro',        'unit', 150, 'und'),
    ('fontaneria',    'fon-lavadero',      'Instalación de lavadero',       'unit', 130, 'und'),
    ('fontaneria',    'fon-ducha',         'Instalación de ducha',          'unit', 180, 'und'),
    ('fontaneria',    'fon-reparacion',    'Reparación de fuga',            'hour', 60,  'h'),
    ('electricidad',  'ele-punto-luz',     'Punto de luz',                  'unit', 90,  'pto'),
    ('electricidad',  'ele-tomacorriente', 'Tomacorriente',                 'unit', 75,  'pto'),
    ('electricidad',  'ele-tablero',       'Tablero eléctrico',             'unit', 350, 'und'),
    ('electricidad',  'ele-cableado',      'Cableado',                      'm2',   25,  'm²'),
    ('electricidad',  'ele-luminaria',     'Instalación de luminaria',      'unit', 45,  'und'),
    ('pintura',       'pin-interior',      'Pintura interior (2 manos)',    'm2',   18,  'm²'),
    ('pintura',       'pin-exterior',      'Pintura exterior',              'm2',   22,  'm²'),
    ('pintura',       'pin-empaste',       'Empaste de paredes',            'm2',   15,  'm²'),
    ('pintura',       'pin-puerta',        'Pintado de puerta',             'unit', 80,  'und'),
    ('carpinteria',   'car-puerta',        'Puerta contraplacada instalada','unit', 380, 'und'),
    ('carpinteria',   'car-closet',        'Closet de melamina',            'm2',   320, 'm²'),
    ('carpinteria',   'car-zocalo',        'Zócalo / contrazócalo',        'm2',   12,  'ml'),
    ('carpinteria',   'car-reparacion',    'Reparación de carpintería',     'hour', 70,  'h'),
    ('climatizacion', 'cli-split',         'Instalación A/C split',         'unit', 450, 'und'),
    ('climatizacion', 'cli-mantenimiento', 'Mantenimiento A/C',             'unit', 120, 'und'),
    ('climatizacion', 'cli-ducto',         'Ductería',                      'm2',   95,  'ml'),
    ('climatizacion', 'cli-extractor',     'Extractor de aire',             'unit', 160, 'und')
) AS v(cat_slug, svc_id, nombre, calc_type, precio, unidad)
  ON c.cat_id = v.cat_slug
ON CONFLICT (svc_id) DO NOTHING;

COMMIT;
