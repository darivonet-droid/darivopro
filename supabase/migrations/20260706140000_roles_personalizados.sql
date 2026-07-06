-- Roles personalizados (RBAC) — solo plan Business
-- Fuente: 11-ROLES-PLANES-PERMISOS-EMPRESA.md §6.1 · 12-ROLES… ADMIN.md §7.2

BEGIN;

CREATE TABLE public.roles_personalizados (
  id           uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id   uuid         NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nombre       text         NOT NULL,
  descripcion  text,
  permisos     jsonb        NOT NULL DEFAULT '{}',
  activo       boolean      NOT NULL DEFAULT true,
  created_at   timestamptz  DEFAULT now(),
  updated_at   timestamptz  DEFAULT now(),
  UNIQUE (empresa_id, nombre),
  CHECK (lower(nombre) NOT IN ('gerente', 'técnico', 'tecnico'))
);

COMMENT ON TABLE public.roles_personalizados IS
  'Roles personalizados creados por el Gerente — solo plan Business (11-ROLES-PLANES-PERMISOS-EMPRESA.md §6.1).';

ALTER TABLE public.empresa_empleados
  ADD COLUMN rol_personalizado_id uuid NULL
  REFERENCES public.roles_personalizados(id) ON DELETE SET NULL;

ALTER TABLE public.suscripciones
  ADD COLUMN IF NOT EXISTS limite_roles_personalizados integer NULL,
  ADD COLUMN IF NOT EXISTS limite_tecnicos integer NULL DEFAULT 5;

CREATE INDEX idx_roles_personalizados_empresa ON public.roles_personalizados (empresa_id);
CREATE INDEX idx_empresa_empleados_rol_personalizado ON public.empresa_empleados (rol_personalizado_id);

CREATE TRIGGER on_roles_personalizado_update
  BEFORE UPDATE ON public.roles_personalizados
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.roles_personalizados ENABLE ROW LEVEL SECURITY;

-- Mismo patrón tenant que empresa_empleados (baseline §RLS empresas)
CREATE POLICY roles_personalizados_gerente ON public.roles_personalizados FOR ALL
  USING (EXISTS (SELECT 1 FROM public.empresas e WHERE e.id = empresa_id AND e.gerente_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.empresas e WHERE e.id = empresa_id AND e.gerente_user_id = auth.uid()));

CREATE POLICY roles_personalizados_admin ON public.roles_personalizados FOR ALL
  USING (public.is_darivo_admin());

COMMIT;
