-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — Partner: toggle de acceso a Darivo Pro Móvil (Etapa 7, decisión 2)
-- Pedido: Partner SÍ puede usar Móvil, pero activado explícitamente desde
-- Admin (nunca automático). No ejecutar aquí — el propietario la corre en el
-- SQL Editor de Supabase.
--
-- Verificación de schema (regla 11/07/2026, CLAUDE.md): CREATE TABLE
-- public.partners literal en 20260705120000_baseline_v2.sql:457-469:
--   CREATE TABLE public.partners (
--     id          uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
--     user_id     uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
--     nombre      text         NOT NULL,
--     email       text         NOT NULL UNIQUE,
--     telefono    text,
--     codigo      text         NOT NULL UNIQUE,
--     enlace      text         NOT NULL,
--     estado      text         NOT NULL DEFAULT 'Pendiente'
--                 CHECK (estado IN ('Activo', 'Pendiente', 'Suspendido')),
--     created_at  timestamptz  DEFAULT now(),
--     updated_at  timestamptz  DEFAULT now()
--   );
-- Sin ningún ALTER TABLE posterior sobre public.partners en el resto del
-- historial de migraciones (búsqueda: "ALTER TABLE public.partners" — 0
-- resultados fuera de este archivo).
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS acceso_movil boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.partners.acceso_movil IS
  'Acceso a Darivo Pro Móvil habilitado manualmente desde Admin → Partners (Etapa 7, 21/07/2026). Nunca se activa automáticamente al pasar el partner a Activo.';
