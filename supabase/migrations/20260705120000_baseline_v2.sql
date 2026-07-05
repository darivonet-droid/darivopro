-- ════════════════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración oficial baseline (inicio producto)
-- Archivo: 20260705120000_baseline_v2.sql
-- Esquema: 32 tablas · 6 funciones · 11 triggers · RLS · Storage · Realtime
-- Aplicación: supabase db reset (local) · supabase db push (remoto)
-- Datos iniciales: supabase/seed.sql (no incluidos aquí)
-- REFERENCIA: 02-BASE-DATOS.md · DARIVO-PRO-ARQUITECTURA-MAESTRA.md §7
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- EXTENSIONES
-- ────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────────
-- FUNCIONES SQL — independientes de tablas (3)
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_updated_at() IS
  'Actualiza updated_at automáticamente en tablas con columna updated_at.';

CREATE OR REPLACE FUNCTION public.asignar_cot_num()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  siguiente integer;
BEGIN
  IF NEW.cot_num IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.cotizacion_series (user_id, ultimo_num)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET ultimo_num = cotizacion_series.ultimo_num + 1
  RETURNING ultimo_num INTO siguiente;

  NEW.cot_num := 'COT-' || lpad(siguiente::text, 3, '0');
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.asignar_cot_num() IS
  'Asigna numeración atómica COT-NNN por usuario vía cotizacion_series.';

CREATE OR REPLACE FUNCTION public.asignar_inv_num()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefijo   text;
  serie     text;
  siguiente integer;
BEGIN
  IF NEW.inv_num IS NOT NULL AND btrim(NEW.inv_num) <> '' THEN
    RETURN NEW;
  END IF;

  prefijo := CASE WHEN NEW.tipo_doc = 'boleta' THEN 'B001' ELSE 'F001' END;
  serie := prefijo;

  INSERT INTO public.comprobante_series (serie, ultimo_num)
  VALUES (serie, 1)
  ON CONFLICT (serie) DO UPDATE
    SET ultimo_num = comprobante_series.ultimo_num + 1
  RETURNING ultimo_num INTO siguiente;

  NEW.inv_num := serie || '-' || lpad(siguiente::text, 8, '0');
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.asignar_inv_num() IS
  'Asigna numeración atómica B001/F001 vía comprobante_series (SECURITY DEFINER).';

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 01–05: Lookup / sistema global
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.productos_master (
  id          uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        text         NOT NULL UNIQUE,
  nombre      text         NOT NULL,
  descripcion text,
  activo      boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.productos_master IS
  'Productos del ecosistema Darivo (lookup Admin).';

CREATE TABLE public.configuracion_regional (
  id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  pais_codigo     text          NOT NULL UNIQUE,
  pais_nombre     text          NOT NULL,
  moneda_codigo   text          NOT NULL,
  moneda_simbolo  text          NOT NULL,
  zona_horaria    text          NOT NULL,
  idioma          text          NOT NULL DEFAULT 'es',
  igv_porcentaje  numeric(5,2)  NOT NULL DEFAULT 18.00,
  activo          boolean       NOT NULL DEFAULT true,
  created_at      timestamptz   DEFAULT now()
);

COMMENT ON TABLE public.configuracion_regional IS
  'Configuración regional por país (moneda, IGV, zona horaria).';

CREATE TABLE public.planes_catalogo (
  id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug            text          NOT NULL UNIQUE,
  nombre          text          NOT NULL,
  precio_mensual  numeric(10,2) NOT NULL,
  precio_anual    numeric(10,2) NOT NULL,
  activo          boolean       NOT NULL DEFAULT true,
  limites         jsonb         NOT NULL DEFAULT '{}',
  created_at      timestamptz   DEFAULT now()
);

COMMENT ON TABLE public.planes_catalogo IS
  'Planes oficiales Básico/Pro — metadata comercial (Admin Suscripciones).';

CREATE TABLE public.comprobante_series (
  serie      text    PRIMARY KEY,
  ultimo_num integer NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.comprobante_series IS
  'Correlativo global B001/F001 — acceso solo vía asignar_inv_num().';

CREATE TABLE public.partner_comisiones (
  id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  rango_desde     integer       NOT NULL,
  rango_hasta     integer,
  descripcion     text          NOT NULL,
  comision_texto  text          NOT NULL,
  orden           integer       NOT NULL DEFAULT 0,
  activo          boolean       NOT NULL DEFAULT true,
  created_at      timestamptz   DEFAULT now()
);

COMMENT ON TABLE public.partner_comisiones IS
  'Tabla oficial de comisiones del programa Partners.';

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 06–09: Catálogo Maestro (Doc 21)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.catalogo_sectores (
  id          uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug        text         NOT NULL UNIQUE,
  nombre      text         NOT NULL,
  emoji       text,
  orden       integer      NOT NULL DEFAULT 0,
  activo      boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  DEFAULT now()
);

CREATE TABLE public.catalogo_plantillas (
  id          uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  sector_id   uuid         NOT NULL REFERENCES public.catalogo_sectores(id) ON DELETE CASCADE,
  nombre      text         NOT NULL,
  descripcion text,
  activo      boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  DEFAULT now()
);

CREATE TABLE public.catalogo_categorias_maestro (
  id           uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  plantilla_id uuid         REFERENCES public.catalogo_plantillas(id) ON DELETE SET NULL,
  sector_id    uuid         NOT NULL REFERENCES public.catalogo_sectores(id) ON DELETE CASCADE,
  producto_id  uuid         NOT NULL REFERENCES public.productos_master(id) ON DELETE CASCADE,
  cat_id       text         NOT NULL,
  nombre       text         NOT NULL,
  emoji        text         DEFAULT '🔧',
  color        text         DEFAULT '#2563EB',
  activo       boolean      NOT NULL DEFAULT true,
  created_at   timestamptz  DEFAULT now(),
  UNIQUE (producto_id, cat_id)
);

COMMENT ON TABLE public.catalogo_categorias_maestro IS
  'Categorías oficiales Admin — sustituye categorias_servicios (V1).';

CREATE TABLE public.catalogo_partidas_maestro (
  id                   uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  categoria_maestro_id uuid          NOT NULL REFERENCES public.catalogo_categorias_maestro(id) ON DELETE CASCADE,
  svc_id               text          NOT NULL UNIQUE,
  nombre               text          NOT NULL,
  calc_type            text          NOT NULL CHECK (calc_type IN ('m2', 'unit', 'hour', 'fixed')),
  tipo_precio          text          NOT NULL DEFAULT 'tarifa_pro',
  precio_tarifa_pro    numeric(10,2) NOT NULL,
  unidad               text,
  activo               boolean       NOT NULL DEFAULT true,
  created_at           timestamptz   DEFAULT now()
);

COMMENT ON TABLE public.catalogo_partidas_maestro IS
  'Partidas oficiales + Tarifa Pro — sustituye catalog.ts hardcodeado.';

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 10–11: Perfiles y empresas
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.perfiles (
  id                      uuid         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  empresa_id              uuid,
  razon_social            text,
  ruc                     text,
  direccion               text,
  telefono                text,
  moneda                  text         DEFAULT 'PEN',
  simbolo                 text         DEFAULT 'S/',
  onboarding_done         boolean      NOT NULL DEFAULT false,
  plan_tipo               text         NOT NULL DEFAULT 'gratis'
                            CHECK (plan_tipo IN ('gratis', 'basico', 'pro', 'empresa')),
  cta_detracciones        text,
  idioma                  text         NOT NULL DEFAULT 'es',
  notificaciones_activas  boolean      NOT NULL DEFAULT true,
  created_at              timestamptz  DEFAULT now(),
  updated_at              timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.perfiles IS
  'Perfil 1:1 con auth.users — tenant operativo = user_id del gerente.';

CREATE TABLE public.empresas (
  id               uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  gerente_user_id  uuid         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  razon_social     text         NOT NULL,
  ruc              text,
  direccion        text,
  telefono         text,
  created_at       timestamptz  DEFAULT now(),
  updated_at       timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.empresas IS
  'Entidad empresa cliente — Admin Empresas / Darivo Pro Empresa.';

ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_empresa_id_fkey
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 12–22: Núcleo operativo (Móvil / Empresa)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.clientes (
  id          uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      text         NOT NULL,
  telefono    text,
  ruc         text,
  direccion   text,
  ciudad      text,
  notas       text,
  created_at  timestamptz  DEFAULT now(),
  updated_at  timestamptz  DEFAULT now()
);

CREATE TABLE public.cotizacion_series (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ultimo_num integer NOT NULL DEFAULT 0
);

CREATE TABLE public.presupuestos (
  id            uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id    uuid          REFERENCES public.clientes(id) ON DELETE SET NULL,
  cot_num       text,
  client_name   text          NOT NULL,
  phone         text,
  city          text,
  margin        numeric(5,2)  DEFAULT 40,
  total_base    numeric(12,2) DEFAULT 0,
  total_labor   numeric(12,2) DEFAULT 0,
  total_final   numeric(12,2) DEFAULT 0,
  status        text          DEFAULT 'Borrador'
                CHECK (status IN ('Borrador', 'Pendiente de firma', 'Aprobado')),
  notes         text,
  pdf_url       text,
  wa_enviado_at timestamptz,
  created_at    timestamptz   DEFAULT now(),
  updated_at    timestamptz   DEFAULT now()
);

CREATE TABLE public.presupuesto_items (
  id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  presupuesto_id  uuid          NOT NULL REFERENCES public.presupuestos(id) ON DELETE CASCADE,
  svc_id          text          NOT NULL,
  cat_label       text,
  svc_label       text,
  calc_type       text,
  base_price      numeric(10,2),
  unit            text,
  qty             numeric(10,2),
  unit_price      numeric(10,2),
  subtotal        numeric(12,2),
  created_at      timestamptz   DEFAULT now()
);

CREATE TABLE public.facturas (
  inv_id           uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inv_num          text          NOT NULL,
  inv_date         date          DEFAULT current_date,
  inv_status       text          DEFAULT 'Emitida'
                   CHECK (inv_status IN ('Pendiente', 'Emitida', 'Cobrada')),
  tipo_doc         text          DEFAULT 'factura'
                   CHECK (tipo_doc IN ('boleta', 'factura')),
  client_name      text          NOT NULL,
  client_ruc       text,
  client_dni       text,
  client_dir       text,
  moneda           text          DEFAULT 'PEN',
  sym              text          DEFAULT 'S/',
  items            jsonb         DEFAULT '[]',
  subtotal_base    numeric(12,2) DEFAULT 0,
  igv_amount       numeric(12,2) DEFAULT 0,
  total_final      numeric(12,2) DEFAULT 0,
  detraccion_tipo  text          CHECK (detraccion_tipo IN ('construccion', 'mantenimiento') OR detraccion_tipo IS NULL),
  detraccion_pct   numeric,
  detraccion_monto numeric,
  neto_cobrar      numeric,
  cta_detracciones text,
  from_quote_id    uuid          REFERENCES public.presupuestos(id) ON DELETE SET NULL,
  biz_data         jsonb,
  pdf_url          text,
  created_at       timestamptz   DEFAULT now(),
  updated_at       timestamptz   DEFAULT now()
);

CREATE TABLE public.categorias (
  id          uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cat_id      text         NOT NULL,
  nombre      text         NOT NULL,
  emoji       text         DEFAULT '🔧',
  color       text         DEFAULT '#2563EB',
  es_base     boolean      NOT NULL DEFAULT false,
  activa      boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  DEFAULT now(),
  UNIQUE (user_id, cat_id)
);

COMMENT ON TABLE public.categorias IS
  'Overlay Mis Tarifas por usuario — no modifica Catálogo Maestro.';

CREATE TABLE public.partidas_propias (
  id          uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cap_id      text          NOT NULL,
  nombre      text          NOT NULL,
  tipo        text          NOT NULL CHECK (tipo IN ('m2', 'unidad', 'hora', 'fijo')),
  precio      numeric(10,2) NOT NULL,
  unidad      text,
  activa      boolean       DEFAULT true,
  created_at  timestamptz   DEFAULT now()
);

CREATE TABLE public.precios_usuario (
  id        uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id   uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  svc_id    text          NOT NULL,
  precio    numeric(10,2) NOT NULL,
  UNIQUE (user_id, svc_id)
);

CREATE TABLE public.precios_historial (
  id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  svc_id          text          NOT NULL,
  es_propia       boolean       NOT NULL DEFAULT false,
  precio_anterior numeric(10,2),
  precio_nuevo    numeric(10,2) NOT NULL,
  changed_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE public.ia_uso_diario (
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha     date NOT NULL DEFAULT current_date,
  llamadas  int  NOT NULL DEFAULT 0 CHECK (llamadas >= 0),
  PRIMARY KEY (user_id, fecha)
);

CREATE TABLE public.calculos_log (
  id                uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  presupuesto_id    uuid          REFERENCES public.presupuestos(id) ON DELETE SET NULL,
  total_materiales  numeric(12,2) NOT NULL DEFAULT 0,
  total_mano_obra   numeric(12,2) NOT NULL DEFAULT 0,
  total_base        numeric(12,2) NOT NULL DEFAULT 0,
  total_margen      numeric(12,2) NOT NULL DEFAULT 0,
  margin_pct        numeric(5,2)  NOT NULL DEFAULT 0,
  total_final       numeric(12,2) NOT NULL DEFAULT 0,
  items_count       integer       NOT NULL DEFAULT 0,
  recorded_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE TABLE public.usuario_sectores (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sector_id  uuid NOT NULL REFERENCES public.catalogo_sectores(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, sector_id)
);

COMMENT ON TABLE public.usuario_sectores IS
  'Sectores habilitados en registro — filtro permanente Doc 21 §7.';

-- ────────────────────────────────────────────────────────────────────────────
-- TABLA 23–32: Ecosistema multi-producto
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.empresa_empleados (
  id               uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  empresa_id       uuid         NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nombre           text         NOT NULL,
  email            text         NOT NULL,
  telefono         text,
  rol              text         NOT NULL DEFAULT 'Técnico' CHECK (rol IN ('Técnico')),
  estado           text         NOT NULL DEFAULT 'Activo'
                   CHECK (estado IN ('Activo', 'Inactivo', 'Pendiente')),
  ultima_actividad timestamptz,
  created_at       timestamptz  DEFAULT now(),
  updated_at       timestamptz  DEFAULT now()
);

CREATE TABLE public.darivo_admin_empleados (
  id           uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      uuid         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text         NOT NULL,
  nombre       text,
  cargo        text,
  departamento text,
  activo       boolean      NOT NULL DEFAULT true,
  created_at   timestamptz  DEFAULT now()
);

CREATE TABLE public.partners (
  id          uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre      text         NOT NULL,
  email       text         NOT NULL UNIQUE,
  telefono    text,
  codigo      text         NOT NULL UNIQUE,
  enlace      text         NOT NULL,
  estado      text         NOT NULL DEFAULT 'Pendiente'
              CHECK (estado IN ('Activo', 'Pendiente', 'Suspendido')),
  created_at  timestamptz  DEFAULT now(),
  updated_at  timestamptz  DEFAULT now()
);

CREATE TABLE public.partner_referidos (
  id               uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  partner_id       uuid         NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  email            text         NOT NULL,
  fecha            timestamptz  NOT NULL DEFAULT now(),
  referred_user_id uuid         REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE public.soporte_tickets (
  id                  uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email          text,
  user_nombre         text,
  plan_snapshot       text,
  asunto              text         NOT NULL,
  descripcion         text         NOT NULL,
  estado              text         NOT NULL DEFAULT 'Abierto'
                      CHECK (estado IN ('Abierto', 'En progreso', 'Resuelto', 'Cerrado')),
  created_at          timestamptz  DEFAULT now(),
  ultima_respuesta_at timestamptz
);

CREATE TABLE public.soporte_mensajes (
  id            uuid         DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id     uuid         NOT NULL REFERENCES public.soporte_tickets(id) ON DELETE CASCADE,
  autor_tipo    text         NOT NULL CHECK (autor_tipo IN ('usuario', 'admin')),
  autor_user_id uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  mensaje       text         NOT NULL,
  created_at    timestamptz  DEFAULT now()
);

CREATE TABLE public.gastos (
  id                     uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proveedor              text          NOT NULL,
  categoria              text          NOT NULL,
  fecha                  date          NOT NULL DEFAULT current_date,
  total                  numeric(12,2) NOT NULL,
  metodo_pago            text,
  descripcion            text,
  estado                 text          NOT NULL DEFAULT 'Registrado'
                         CHECK (estado IN ('Registrado', 'Verificado', 'Anulado')),
  documento_storage_path text,
  created_at             timestamptz   DEFAULT now()
);

CREATE TABLE public.suscripciones (
  id                     uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                uuid          NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tipo              text          NOT NULL DEFAULT 'gratis'
                         CHECK (plan_tipo IN ('gratis', 'basico', 'pro', 'empresa')),
  estado                 text          NOT NULL DEFAULT 'activa'
                         CHECK (estado IN ('activa', 'cancelada', 'pausada', 'expirada')),
  monto_mensual          numeric(10,2),
  moneda                 text          DEFAULT 'PEN',
  inicio                 timestamptz   DEFAULT now(),
  fin                    timestamptz,
  dlocal_subscription_id text,
  created_at             timestamptz   DEFAULT now(),
  updated_at             timestamptz   DEFAULT now()
);

CREATE TABLE public.pagos_eventos (
  id              uuid          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  suscripcion_id  uuid          REFERENCES public.suscripciones(id) ON DELETE SET NULL,
  evento_tipo     text          NOT NULL,
  monto           numeric(12,2),
  moneda          text          DEFAULT 'PEN',
  estado          text,
  dlocal_order_id text,
  payload         jsonb,
  created_at      timestamptz   DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- FUNCIONES SQL — dependientes de tablas (3)
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, razon_social)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_empresa', NULL)
  )
  ON CONFLICT (id) DO UPDATE
    SET razon_social = COALESCE(EXCLUDED.razon_social, public.perfiles.razon_social);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Crea perfil automáticamente al registrarse en auth.users.';

CREATE OR REPLACE FUNCTION public.incrementar_ia_uso(p_user_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO ia_uso_diario (user_id, fecha, llamadas)
  VALUES (p_user_id, current_date, 1)
  ON CONFLICT (user_id, fecha)
  DO UPDATE SET llamadas = ia_uso_diario.llamadas + 1
  RETURNING llamadas INTO v_count;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.incrementar_ia_uso(uuid) IS
  'Incremento atómico del contador IA diario por plan.';

CREATE OR REPLACE FUNCTION public.is_darivo_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.darivo_admin_empleados d
    WHERE d.user_id = auth.uid()
      AND d.activo = true
  );
$$;

COMMENT ON FUNCTION public.is_darivo_admin() IS
  'Helper RLS — true si el usuario es empleado interno Darivo activo.';

GRANT EXECUTE ON FUNCTION public.incrementar_ia_uso(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_darivo_admin() TO authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- ÍNDICES
-- ────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_perfiles_onboarding ON public.perfiles (onboarding_done) WHERE onboarding_done = false;
CREATE INDEX idx_perfiles_empresa ON public.perfiles (empresa_id);

CREATE INDEX idx_clientes_user ON public.clientes (user_id);
CREATE INDEX idx_clientes_nombre ON public.clientes (user_id, nombre);
CREATE UNIQUE INDEX clientes_user_telefono_idx ON public.clientes (user_id, telefono) WHERE telefono IS NOT NULL;

CREATE UNIQUE INDEX presupuestos_user_cot_num_idx ON public.presupuestos (user_id, cot_num) WHERE cot_num IS NOT NULL;
CREATE INDEX idx_presupuestos_cliente ON public.presupuestos (cliente_id);
CREATE INDEX idx_presupuestos_wa_enviado ON public.presupuestos (user_id, wa_enviado_at) WHERE wa_enviado_at IS NOT NULL;

CREATE INDEX idx_precios_historial_user_tiempo ON public.precios_historial (user_id, changed_at DESC);
CREATE INDEX idx_precios_historial_svc ON public.precios_historial (user_id, svc_id, changed_at DESC);

CREATE INDEX idx_calculos_log_user_tiempo ON public.calculos_log (user_id, recorded_at DESC);
CREATE INDEX idx_calculos_log_presupuesto ON public.calculos_log (presupuesto_id) WHERE presupuesto_id IS NOT NULL;

CREATE INDEX idx_empresas_gerente ON public.empresas (gerente_user_id);
CREATE INDEX idx_empresa_empleados_empresa ON public.empresa_empleados (empresa_id);
CREATE INDEX idx_partner_referidos_partner ON public.partner_referidos (partner_id);
CREATE INDEX idx_soporte_tickets_user_estado ON public.soporte_tickets (user_id, estado);
CREATE INDEX idx_soporte_mensajes_ticket ON public.soporte_mensajes (ticket_id, created_at);
CREATE INDEX idx_gastos_user_fecha ON public.gastos (user_id, fecha DESC);
CREATE INDEX idx_pagos_eventos_user_fecha ON public.pagos_eventos (user_id, created_at DESC);
CREATE INDEX idx_catalogo_categorias_sector ON public.catalogo_categorias_maestro (sector_id);
CREATE INDEX idx_catalogo_partidas_categoria ON public.catalogo_partidas_maestro (categoria_maestro_id);

-- ────────────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER on_perfil_update
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_cliente_update
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_presupuesto_update
  BEFORE UPDATE ON public.presupuestos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_factura_update
  BEFORE UPDATE ON public.facturas
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER trg_presupuesto_cot_num
  BEFORE INSERT ON public.presupuestos
  FOR EACH ROW EXECUTE PROCEDURE public.asignar_cot_num();

CREATE TRIGGER trg_factura_inv_num
  BEFORE INSERT ON public.facturas
  FOR EACH ROW EXECUTE PROCEDURE public.asignar_inv_num();

CREATE TRIGGER on_empresa_update
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_empresa_empleado_update
  BEFORE UPDATE ON public.empresa_empleados
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_partner_update
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_suscripcion_update
  BEFORE UPDATE ON public.suscripciones
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — tenant usuario
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY perfiles_select ON public.perfiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY perfiles_insert ON public.perfiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY perfiles_update ON public.perfiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY clientes_select ON public.clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY clientes_insert ON public.clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY clientes_update ON public.clientes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY clientes_delete ON public.clientes FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY presupuestos_all ON public.presupuestos FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.presupuesto_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY presupuesto_items_all ON public.presupuesto_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.presupuestos p WHERE p.id = presupuesto_id AND p.user_id = auth.uid()));

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY facturas_all ON public.facturas FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY categorias_all ON public.categorias FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.partidas_propias ENABLE ROW LEVEL SECURITY;
CREATE POLICY partidas_propias_all ON public.partidas_propias FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.precios_usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY precios_usuario_all ON public.precios_usuario FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.precios_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY precios_historial_all ON public.precios_historial FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.ia_uso_diario ENABLE ROW LEVEL SECURITY;
CREATE POLICY ia_uso_select ON public.ia_uso_diario FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY ia_uso_insert ON public.ia_uso_diario FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY ia_uso_update ON public.ia_uso_diario FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.calculos_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY calculos_log_all ON public.calculos_log FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.cotizacion_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY cotizacion_series_all ON public.cotizacion_series FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.comprobante_series ENABLE ROW LEVEL SECURITY;
-- Sin políticas públicas: acceso exclusivo vía asignar_inv_num() SECURITY DEFINER

ALTER TABLE public.usuario_sectores ENABLE ROW LEVEL SECURITY;
CREATE POLICY usuario_sectores_all ON public.usuario_sectores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
CREATE POLICY gastos_all ON public.gastos FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY suscripciones_select ON public.suscripciones FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.pagos_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY pagos_eventos_select ON public.pagos_eventos FOR SELECT USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — soporte, empresas, partners, admin
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.soporte_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY soporte_tickets_user ON public.soporte_tickets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY soporte_tickets_admin ON public.soporte_tickets FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.soporte_mensajes ENABLE ROW LEVEL SECURITY;
CREATE POLICY soporte_mensajes_user ON public.soporte_mensajes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.soporte_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY soporte_mensajes_admin ON public.soporte_mensajes FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY empresas_gerente ON public.empresas FOR ALL USING (auth.uid() = gerente_user_id) WITH CHECK (auth.uid() = gerente_user_id);
CREATE POLICY empresas_admin ON public.empresas FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.empresa_empleados ENABLE ROW LEVEL SECURITY;
CREATE POLICY empresa_empleados_gerente ON public.empresa_empleados FOR ALL
  USING (EXISTS (SELECT 1 FROM public.empresas e WHERE e.id = empresa_id AND e.gerente_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.empresas e WHERE e.id = empresa_id AND e.gerente_user_id = auth.uid()));
CREATE POLICY empresa_empleados_admin ON public.empresa_empleados FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY partners_own ON public.partners FOR SELECT USING (user_id = auth.uid() OR email = (auth.jwt()->>'email'));
CREATE POLICY partners_admin ON public.partners FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.partner_referidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_referidos_partner ON public.partner_referidos FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND (p.user_id = auth.uid() OR p.email = (auth.jwt()->>'email'))));
CREATE POLICY partner_referidos_admin ON public.partner_referidos FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.darivo_admin_empleados ENABLE ROW LEVEL SECURITY;
CREATE POLICY darivo_admin_empleados_admin ON public.darivo_admin_empleados FOR ALL USING (public.is_darivo_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — lookup y catálogo maestro (lectura autenticados)
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.productos_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY productos_master_select ON public.productos_master FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY productos_master_admin ON public.productos_master FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.configuracion_regional ENABLE ROW LEVEL SECURITY;
CREATE POLICY configuracion_regional_select ON public.configuracion_regional FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY configuracion_regional_admin ON public.configuracion_regional FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.planes_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY planes_catalogo_select ON public.planes_catalogo FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY planes_catalogo_admin ON public.planes_catalogo FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.partner_comisiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_comisiones_select ON public.partner_comisiones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY partner_comisiones_admin ON public.partner_comisiones FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.catalogo_sectores ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalogo_sectores_select ON public.catalogo_sectores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY catalogo_sectores_admin ON public.catalogo_sectores FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.catalogo_plantillas ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalogo_plantillas_select ON public.catalogo_plantillas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY catalogo_plantillas_admin ON public.catalogo_plantillas FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.catalogo_categorias_maestro ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalogo_categorias_select ON public.catalogo_categorias_maestro FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY catalogo_categorias_admin ON public.catalogo_categorias_maestro FOR ALL USING (public.is_darivo_admin());

ALTER TABLE public.catalogo_partidas_maestro ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalogo_partidas_select ON public.catalogo_partidas_maestro FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY catalogo_partidas_admin ON public.catalogo_partidas_maestro FOR ALL USING (public.is_darivo_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- REALTIME — sincronización Mis Tarifas (Móvil / Empresa)
-- ────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.categorias; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.precios_usuario; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.partidas_propias; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- STORAGE — buckets privados por tenant (path: {user_id}/...)
-- Nota: registro de bucket vía storage.buckets es configuración de infraestructura,
--       no datos seed de negocio (requerido por API Storage de Supabase).
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false),
       ('gastos-adjuntos', 'gastos-adjuntos', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY storage_documentos_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_documentos_select ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_gastos_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gastos-adjuntos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_gastos_select ON storage.objects FOR SELECT
  USING (bucket_id = 'gastos-adjuntos' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- FIN baseline_v2 — 32 tablas · esquema oficial Darivo Pro
-- ════════════════════════════════════════════════════════════════════════════
