-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — Empresa: Técnico nuevo nace con Factura activa (Etapa 7, decisión 3)
-- Reemplaza el default de la Tarea 2 (17/07/2026: Factura OFF por defecto).
-- Ahora un Técnico invitado nace con Cotización + Cliente + Factura activas;
-- Informe sigue opcional (el Gerente lo activa aparte). No ejecutar aquí —
-- el propietario la corre en el SQL Editor de Supabase. El cambio de código
-- (default del formulario en EmpresaEmpleadosView.tsx, que es lo que
-- realmente decide el valor insertado en cada invitación) ya se aplicó y NO
-- depende de que esta migración se ejecute — esta migración solo alinea el
-- DEFAULT de la columna en BD por consistencia (afecta únicamente inserts
-- futuros que omitan el campo explícitamente, caso hoy inexistente).
--
-- Verificación de schema (regla 11/07/2026, CLAUDE.md): columna agregada en
-- 20260717130000_empresa_empleados_permisos.sql:12-13:
--   ALTER TABLE public.empresa_empleados
--     ADD COLUMN IF NOT EXISTS factura_habilitada boolean NOT NULL DEFAULT false,
--     ADD COLUMN IF NOT EXISTS informe_habilitado boolean NOT NULL DEFAULT false;
-- Sin ningún otro ALTER TABLE sobre esta columna en el resto del historial de
-- migraciones (búsqueda: "factura_habilitada" — único resultado fuera de este
-- archivo es la migración de creación citada arriba).
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.empresa_empleados
  ALTER COLUMN factura_habilitada SET DEFAULT true;

COMMENT ON COLUMN public.empresa_empleados.factura_habilitada IS
  'Permiso de Factura del Técnico — activable/desactivable en cualquier momento por el Gerente. Default true desde 21/07/2026 (Etapa 7): un Técnico nuevo nace con Cotización + Cliente + Factura activas; antes nacía en false (17/07/2026).';
