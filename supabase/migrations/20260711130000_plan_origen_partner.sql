-- Distingue Plan Business "regalado por ser Partner activo" de uno pagado
-- directamente por el mismo usuario — necesario para revocar el plan al
-- suspender un Partner sin arriesgar bajarle el plan a alguien que sí pagó.
-- Fuente: 06-PANEL-ADMIN-PARTNERS.md §5.1 "Plan regalado" (revocación).

BEGIN;

ALTER TABLE public.perfiles
  ADD COLUMN plan_origen_partner_id uuid NULL
  REFERENCES public.partners(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.perfiles.plan_origen_partner_id IS
  'No nulo únicamente cuando plan_tipo=business fue otorgado por ser Partner activo (06-PANEL-ADMIN-PARTNERS.md §5.1). Se limpia automáticamente si el usuario paga Business directamente, o al revocarse por suspensión del Partner.';

CREATE INDEX idx_perfiles_plan_origen_partner
  ON public.perfiles (plan_origen_partner_id)
  WHERE plan_origen_partner_id IS NOT NULL;

COMMIT;
