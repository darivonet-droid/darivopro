-- DARIVO PRO — Permisos por técnico individual (Tarea 2, CLAUDE.md 17/07/2026)
-- Verificación de schema (regla permanente del proyecto, 11/07/2026):
-- CREATE TABLE real de empresa_empleados — supabase/migrations/20260705120000_baseline_v2.sql:432-444
--   id, empresa_id, nombre, email, telefono, rol('Técnico' fijo por CHECK),
--   estado(Activo|Inactivo|Pendiente), ultima_actividad, created_at, updated_at
-- ALTER TABLE posteriores confirmados (únicos 2 que la tocan):
--   20260706140000_roles_personalizados.sql:22-24 -> + rol_personalizado_id
--   20260713100000_empresa_empleados_user_id.sql:24-25 -> + user_id
-- Ninguno de los dos define factura_habilitada/informe_habilitado todavía.

ALTER TABLE public.empresa_empleados
  ADD COLUMN IF NOT EXISTS factura_habilitada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS informe_habilitado boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.empresa_empleados.factura_habilitada IS
  'Técnico: OFF por defecto, el Gerente la activa manualmente por técnico individual (Tarea 2, 17/07/2026).';
COMMENT ON COLUMN public.empresa_empleados.informe_habilitado IS
  'Técnico: opcional, el Gerente decide si ve el Informe de su propio trabajo (Tarea 2, 17/07/2026).';
