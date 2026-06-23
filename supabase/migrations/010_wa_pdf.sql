-- DARIVO PRO — Migración 010: PDF URL y registro de envío WhatsApp

-- Añadir columna para URL del PDF generado
ALTER TABLE public.presupuestos
  ADD COLUMN IF NOT EXISTS pdf_url text;

-- Añadir columna para registrar cuándo se abrió el enlace de WhatsApp
ALTER TABLE public.presupuestos
  ADD COLUMN IF NOT EXISTS wa_enviado_at timestamptz;

-- Índice para consultas de reportes (envíos recientes)
CREATE INDEX IF NOT EXISTS idx_presupuestos_wa_enviado
  ON public.presupuestos (user_id, wa_enviado_at)
  WHERE wa_enviado_at IS NOT NULL;
