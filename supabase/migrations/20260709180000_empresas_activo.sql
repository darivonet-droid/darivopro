-- Añade columna dedicada `activo` a `empresas` (02-PANEL-ADMIN-EMPRESAS.md §12:
-- "La activación y desactivación de empresas se realiza desde este módulo").
-- Sustituye el proxy provisional `perfiles.onboarding_done` usado en el commit 8d2f76b.

BEGIN;

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;

COMMIT;
