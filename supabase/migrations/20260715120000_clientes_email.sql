-- DARIVO PRO — Añade campo opcional de correo electrónico al cliente
-- (03-MODULO-CLIENTES.md / 03-MODULO-CLIENTES-EMPRESA.md ya documentan el
-- botón "✉️ Email" en la ficha; el campo de datos nunca se creó — código
-- real dejaba el toast informativo como único comportamiento posible).
--
-- Verificación de schema (regla CLAUDE.md 11/07/2026): public.clientes se
-- crea en supabase/migrations/20260705120000_baseline_v2.sql:266-277, sin
-- ningún ALTER TABLE public.clientes posterior (confirmado por búsqueda en
-- todas las migraciones existentes antes de esta). Columna nueva, nullable,
-- no afecta filas existentes ni ninguna política RLS ya definida sobre
-- clientes (siguen aplicando igual, no referencian columnas por nombre).

ALTER TABLE public.clientes
  ADD COLUMN email text;

COMMENT ON COLUMN public.clientes.email IS
  'Correo electrónico opcional del cliente — habilita el botón Email de la ficha (03-MODULO-CLIENTES.md §4, 03-MODULO-CLIENTES-EMPRESA.md §6.2).';
