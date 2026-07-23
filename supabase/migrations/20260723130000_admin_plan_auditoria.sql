-- 20260723130000_admin_plan_auditoria.sql
-- Tarea 3 FASE A (23/07/2026) — el cambio de plan de una cuenta concreta se
-- mueve de Admin → Usuarios a Admin → Suscripciones, y pasa a quedar
-- REGISTRADO. Estándar banco/fintech: toda mutación de un metadato de
-- facturación hecha por un operador debe ser auditable (quién, qué cuenta,
-- plan anterior → nuevo, cuándo, por qué).
--
-- ADITIVA: crea una tabla nueva. No modifica ni reutiliza ninguna existente,
-- no toca RLS de datos de cliente, no toca la conexión Empresa↔Móvil.
--
-- SCHEMA VERIFICADO de la tabla referenciada (extracto literal):
--   CREATE TABLE public.perfiles (
--     ...
--     plan_tipo text NOT NULL DEFAULT 'gratis'
--       CHECK (plan_tipo IN ('gratis', 'basico', 'pro', 'empresa')),
--     ...
--   );                                          (baseline_v2.sql:232-233)
--   Único ALTER posterior sobre esa columna: 20260706123000_plan_tipo_business.sql:31-32
--     ALTER TABLE public.perfiles ADD CONSTRAINT perfiles_plan_tipo_check
--       CHECK (plan_tipo IN ('gratis', 'basico', 'pro', 'business'));
--   → los 4 valores vigentes son 'gratis','basico','pro','business'. Búsqueda
--   realizada: `grep -rn "plan_tipo" supabase/migrations/*.sql | grep -i "alter\|check"`
--   — el resto de coincidencias son sobre `suscripciones.plan_tipo` (otra
--   tabla) o comentarios de migraciones que solo verifican el schema.
--   `perfiles.id` es `uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`.

CREATE TABLE public.admin_plan_auditoria (
  id              uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Quién hizo el cambio. SET NULL si el empleado Darivo se da de baja: el
  -- registro de auditoría debe sobrevivir a la baja de su autor, por eso el
  -- email queda además copiado en texto (snapshot inmutable).
  admin_user_id   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email     text        NOT NULL,

  -- Sobre qué cuenta. Mismo criterio: si la cuenta se borra, el registro
  -- permanece con el email copiado.
  cuenta_user_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  cuenta_email    text        NOT NULL,

  plan_anterior   text        CHECK (plan_anterior IN ('gratis', 'basico', 'pro', 'business')),
  plan_nuevo      text        NOT NULL
                    CHECK (plan_nuevo IN ('gratis', 'basico', 'pro', 'business')),
  motivo          text        NOT NULL CHECK (btrim(motivo) <> ''),

  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_plan_auditoria IS
  'Log append-only de cambios de plan de una cuenta hechos por un Administrador Darivo desde Admin > Suscripciones. Estandar banco/fintech: quien, que cuenta, plan anterior -> nuevo, cuando, por que.';

CREATE INDEX idx_admin_plan_auditoria_created  ON public.admin_plan_auditoria (created_at DESC);
CREATE INDEX idx_admin_plan_auditoria_cuenta   ON public.admin_plan_auditoria (cuenta_user_id);

-- RLS habilitada SIN ninguna policy: ningún usuario autenticado puede leerla
-- ni escribirla por PostgREST. El único acceso es el Panel Admin vía
-- `service_role`, que salta RLS por diseño. Es un log de operación interna de
-- Darivo, no un dato de cuenta de cliente — coherente con el estándar de
-- aislamiento (`01-VISION-DEL-PRODUCTO.md` §4.1: Admin administra metadatos de
-- suscripción, nunca datos operativos de cliente).
ALTER TABLE public.admin_plan_auditoria ENABLE ROW LEVEL SECURITY;

-- Append-only real, no solo por convención: ni siquiera el Panel Admin puede
-- reescribir o borrar el historial. Un log de auditoría que su propio operador
-- puede editar no vale como auditoría.
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.admin_plan_auditoria FROM service_role;

-- Verificación (después de correr esto):
--   -- 1) La tabla existe y está en RLS sin policies:
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'admin_plan_auditoria';        -- true
--   SELECT count(*) FROM pg_policies WHERE tablename = 'admin_plan_auditoria';         -- 0
--   -- 2) service_role puede insertar y leer, pero no modificar ni borrar:
--   SELECT privilege_type FROM information_schema.role_table_grants
--   WHERE table_name = 'admin_plan_auditoria' AND grantee = 'service_role';
--   -- debe listar INSERT y SELECT, y NO listar UPDATE ni DELETE.
