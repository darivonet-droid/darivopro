-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — planes_catalogo: puebla/corrige los 3 planes oficiales (Etapa 7, decisión 7)
--
-- Investigado antes de crear nada nuevo: la tabla `public.planes_catalogo`
-- YA EXISTE desde el baseline (no se crea una tabla redundante). Tiene
-- exactamente las columnas que esta decisión necesita (nombre, precio
-- mensual/anual, límites en jsonb, activo) — no hace falta ALTER TABLE.
-- No ejecutar aquí — el propietario la corre en el SQL Editor de Supabase.
--
-- Verificación de schema (regla 11/07/2026, CLAUDE.md): CREATE TABLE literal
-- en 20260705120000_baseline_v2.sql:126-135:
--   CREATE TABLE public.planes_catalogo (
--     id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
--     slug            text          NOT NULL UNIQUE,
--     nombre          text          NOT NULL,
--     precio_mensual  numeric(10,2) NOT NULL,
--     precio_anual    numeric(10,2) NOT NULL,
--     activo          boolean       NOT NULL DEFAULT true,
--     limites         jsonb         NOT NULL DEFAULT '{}',
--     created_at      timestamptz   DEFAULT now()
--   );
-- RLS ya habilitada en el mismo archivo (líneas 802-804): SELECT para
-- cualquier usuario autenticado, escritura (FOR ALL) solo is_darivo_admin() —
-- no hace falta ninguna migración de RLS nueva.
-- Sin ningún ALTER TABLE posterior sobre planes_catalogo en el resto del
-- historial de migraciones (búsqueda: "planes_catalogo" — único hit de DDL
-- es el CREATE TABLE citado arriba; el resto son la política de RLS del
-- mismo archivo y su INSERT en supabase/seed.sql).
--
-- Por qué esta migración es necesaria de todos modos: `supabase/seed.sql`
-- solo se ejecuta en `supabase db reset` (entorno local), nunca contra la
-- base de datos real de producción — y además tiene datos DESACTUALIZADOS
-- (Básico S/39/S/390, Pro S/79/S/790, sin fila de Business) frente a los
-- precios oficiales reales confirmados por el propietario el 17/07/2026
-- (Básico S/49, Pro S/89, Business S/130; anual = mensual × 10). Este UPSERT
-- dispara sobre `slug` (columna UNIQUE) así que es seguro re-ejecutar y
-- también corrige el entorno si alguien ya corrió el seed viejo en local.
--
-- ⚠️ ALCANCE REAL — leer antes de ejecutar: esta tabla queda editable desde
-- Admin → Suscripciones después de esta migración, pero HOY NINGÚN consumidor
-- real (checkout, /precios, lib/plan-limits.ts, emails) lee de esta tabla —
-- todos siguen leyendo PRECIOS_OFICIALES/LIMITES_PLAN (constantes TS en
-- lib/roles-planes-oficial.ts). Editar un plan desde Admin después de esta
-- migración actualiza SOLO esta tabla — es un cambio administrativo/visual
-- sin efecto todavía en el precio real cobrado ni en los límites aplicados.
-- Recablear los consumidores reales a esta tabla es una fase 2 NO incluida
-- aquí (ver CLAUDE.md, Etapa 7, decisión 7).
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO public.planes_catalogo (slug, nombre, precio_mensual, precio_anual, activo, limites)
VALUES
  (
    'basico',
    'BÁSICO',
    49.00,
    490.00,
    true,
    '{"cotizacionesMes": 20, "facturasHabilitado": false, "iaCotizacionesDia": 5, "iaFacturasHabilitado": false}'::jsonb
  ),
  (
    'pro',
    'PRO',
    89.00,
    890.00,
    true,
    '{"cotizacionesMes": null, "facturasHabilitado": true, "iaCotizacionesDia": null, "iaFacturasHabilitado": true}'::jsonb
  ),
  (
    'business',
    'BUSINESS',
    130.00,
    1300.00,
    true,
    '{"cotizacionesMes": null, "facturasHabilitado": true, "iaCotizacionesDia": null, "iaFacturasHabilitado": true, "tecnicosIncluidos": 5, "rolesPersonalizados": true}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  nombre         = EXCLUDED.nombre,
  precio_mensual = EXCLUDED.precio_mensual,
  precio_anual   = EXCLUDED.precio_anual,
  activo         = EXCLUDED.activo,
  limites        = EXCLUDED.limites;
