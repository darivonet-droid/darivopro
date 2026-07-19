-- DARIVO PRO — Logo de empresa (Tarea 1, CLAUDE.md 19/07/2026)
--
-- Fuente única: perfiles.logo_url. Verificado que tanto Móvil como Empresa
-- leen HOY los mismos datos de emisor (razon_social/ruc/direccion/telefono)
-- desde `public.perfiles` del usuario logueado, nunca desde `public.empresas`
-- (esa tabla solo se usa en Admin/gating, ver CREATE TABLE en
-- 20260705120000_baseline_v2.sql:244-253 y su único INSERT real en
-- admin/empresas/actions.ts). Como un mismo Gerente usa la MISMA fila de
-- perfiles sin importar si entra por Móvil o por Empresa, agregar el logo ahí
-- garantiza una sola fuente de verdad sin duplicar el campo por plataforma.
--
-- Verificación de schema (regla CLAUDE.md 11/07/2026): CREATE TABLE de
-- perfiles en 20260705120000_baseline_v2.sql:222-239; único ALTER TABLE
-- posterior sobre perfiles es 20260706123000_plan_tipo_business.sql (CHECK de
-- plan_tipo) y 20260711130000_plan_origen_partner.sql (columna plan_origen) —
-- ninguno afecta ni colisiona con la columna nueva `logo_url`.

BEGIN;

ALTER TABLE public.perfiles
  ADD COLUMN logo_url text;

COMMENT ON COLUMN public.perfiles.logo_url IS
  'URL pública del logo de la empresa (bucket Storage "logos"), mostrado en el header de Cotización y Factura — Móvil y Empresa comparten esta misma columna, no hay logo por plataforma.';

-- Bucket público (a diferencia de "documentos"/"gastos-adjuntos", privados):
-- el logo se referencia repetidamente al generar PDFs vía @react-pdf/renderer,
-- que descarga la imagen server-side sin credenciales — necesita URL pública
-- estable, no una URL firmada con expiración.
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY storage_logos_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_logos_update ON storage.objects FOR UPDATE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_logos_select ON storage.objects FOR SELECT
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_logos_delete ON storage.objects FOR DELETE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

COMMIT;
