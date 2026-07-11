-- Elimina el índice duplicado idx_empresas_gerente: gerente_user_id ya tiene
-- UNIQUE (índice único implícito), por lo que este índice adicional es redundante.
-- Hallazgo de auditoría BD 10/07/2026, aprobado explícitamente por el propietario.

BEGIN;

DROP INDEX IF EXISTS public.idx_empresas_gerente;

COMMIT;
