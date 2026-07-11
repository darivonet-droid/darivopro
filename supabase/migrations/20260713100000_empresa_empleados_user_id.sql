-- Añade el vínculo real de acceso a Móvil para empleados invitados desde
-- Darivo Pro Empresa (10-MODULO-EMPLEADOS-EMPRESA.md §6: "Invitar empleado:
-- ... envío invitación acceso Móvil"). Antes, "Invitar empleado" solo creaba
-- una fila en empresa_empleados sin ningún user_id ni mecanismo de auth --
-- el Técnico nunca podía iniciar sesión de verdad. Corregido en código
-- (invitarEmpleadoAction usa auth.admin.inviteUserByEmail + vincula el
-- user_id resultante); esta migración añade la columna que ese código
-- necesita para persistir el vínculo.
--
-- VERIFICACION DE SCHEMA (regla permanente CLAUDE.md 11/07/2026):
-- CREATE TABLE public.empresa_empleados real (20260705120000_baseline_v2.sql,
-- lineas 432-444):
--   id uuid PK, empresa_id uuid FK CASCADE, nombre text NOT NULL,
--   email text NOT NULL, telefono text, rol text DEFAULT 'Técnico' CHECK,
--   estado text DEFAULT 'Activo' CHECK, ultima_actividad timestamptz,
--   created_at timestamptz, updated_at timestamptz.
-- ALTER TABLE posterior conocido: 20260706140000_roles_personalizados.sql
-- añadió `rol_personalizado_id` -- no toca nada que esta migración modifique.
-- Ningún otro ALTER TABLE sobre esta tabla en las migraciones existentes.

BEGIN;

ALTER TABLE public.empresa_empleados
  ADD COLUMN user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.empresa_empleados.user_id IS
  'Cuenta real de auth.users vinculada tras aceptar la invitación (10-MODULO-EMPLEADOS-EMPRESA.md §6). NULL = invitación nunca completada o empleado pre-existente antes de esta migración.';

-- Un mismo usuario no puede ser Técnico de dos empresas a la vez (evita
-- ambigüedad de a qué empresa pertenece perfiles.empresa_id).
CREATE UNIQUE INDEX idx_empresa_empleados_user_id
  ON public.empresa_empleados (user_id)
  WHERE user_id IS NOT NULL;

COMMIT;
