-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — ETAPA 4 (21/07/2026), pregunta abierta #8: RUC del EMISOR
-- (`perfiles.ruc`) exigido válido también en BD, no solo en el formulario.
-- ⚠️ ENTREGADA SIN EJECUTAR (regla permanente de BD): Mohamed la corre en el
--    SQL Editor de Supabase, en CUARTO lugar, DESPUÉS de
--    20260721120000_pago_fallido_solo_lectura.sql,
--    20260721160000_rls_etapa2_correcciones.sql y
--    20260721180000_facturas_bizlinks_esquema.sql (orden cronológico de
--    timestamp; no depende técnicamente de las anteriores).
--
-- ── VERIFICACIÓN DE SCHEMA (regla permanente CLAUDE.md 11/07/2026) ──────────
-- public.perfiles — CREATE TABLE en 20260705120000_baseline_v2.sql:222-239:
--
--   CREATE TABLE public.perfiles (
--     id                      uuid         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
--     empresa_id              uuid,
--     razon_social            text,
--     ruc                     text,                    -- ← línea 226, SIN CHECK
--     direccion               text,
--     telefono                text,
--     ...
--   );
--
-- ALTER TABLE public.perfiles posteriores (búsqueda exhaustiva 21/07/2026 en
-- las 21 migraciones — NINGUNO toca la columna `ruc`):
--   · baseline_v2.sql:258        → FK empresa_id
--   · 20260706123000:21,30       → CHECK de plan_tipo (drop + recreate)
--   · 20260711130000:8           → + plan_origen_partner_id
--   · 20260719140000:20          → + logo_url
--   · 20260721120000:40          → + pago_fallido_desde
--
-- ── DECISIÓN (default confirmado por el propietario) ────────────────────────
-- Mismo patrón que facturas_comprador_doc_check (Etapa 3, 20260721180000):
-- CHECK NOT VALID — solo filas nuevas/modificadas, no re-valida datos
-- históricos. La columna SIGUE SIENDO NULLABLE a propósito: no todo perfil
-- tiene RUC (un usuario Móvil-independiente puede no tenerlo); lo que se
-- exige es que, SI hay RUC, tenga formato SUNAT válido (11 dígitos empezando
-- en 10 o 20) — espejo exacto de la validación que ambos formularios de
-- factura ya aplican al emisor antes de emitir.
-- Cadena vacía también se rechaza (un '' no matchea la regex y no es NULL):
-- si un flujo quiere "sin RUC", debe guardar NULL, no ''.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_ruc_emisor_check
  CHECK (ruc IS NULL OR ruc ~ '^(10|20)\d{9}$') NOT VALID;

COMMENT ON CONSTRAINT perfiles_ruc_emisor_check ON public.perfiles IS
  'RUC del emisor: si existe, 11 dígitos empezando en 10/20 (formato SUNAT). Nullable a propósito (Móvil-independiente puede no tener RUC). NOT VALID: solo filas nuevas/modificadas — espejo de la validación ya vigente en los formularios de factura. Etapa 4, 21/07/2026.';

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN Etapa 4 #8. Nota: NO se ejecuta VALIDATE CONSTRAINT a propósito — si el
-- propietario quiere sanear los RUC históricos, primero revisar con:
--   SELECT id, ruc FROM public.perfiles
--   WHERE ruc IS NOT NULL AND ruc !~ '^(10|20)\d{9}$';
-- y solo después (opcional):
--   ALTER TABLE public.perfiles VALIDATE CONSTRAINT perfiles_ruc_emisor_check;
-- ════════════════════════════════════════════════════════════════════════════
