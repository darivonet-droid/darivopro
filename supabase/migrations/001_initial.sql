-- DARIVO PRO — Migración inicial
-- Ejecutar en Supabase SQL Editor o con supabase db push

-- ════════════════════════════════════════════════════
-- EXTENSIONES
-- ════════════════════════════════════════════════════
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ════════════════════════════════════════════════════
-- TABLA: perfiles de usuario (extiende auth.users)
-- ════════════════════════════════════════════════════
create table if not exists public.perfiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  razon_social  text,
  ruc           text,
  direccion     text,
  telefono      text,
  moneda        text default 'PEN',
  simbolo       text default 'S/',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS
alter table public.perfiles enable row level security;
create policy "Usuario ve su propio perfil"
  on public.perfiles for all
  using (auth.uid() = id);

-- ════════════════════════════════════════════════════
-- TABLA: presupuestos
-- ════════════════════════════════════════════════════
create table if not exists public.presupuestos (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  client_name   text not null,
  phone         text,
  city          text,
  margin        numeric(5,2) default 40,
  total_base    numeric(12,2) default 0,
  total_labor   numeric(12,2) default 0,
  total_final   numeric(12,2) default 0,
  status        text default 'Borrador'
                check (status in ('Borrador','Pendiente de firma','Aprobado')),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS
alter table public.presupuestos enable row level security;
create policy "Usuario ve sus presupuestos"
  on public.presupuestos for all
  using (auth.uid() = user_id);

-- ════════════════════════════════════════════════════
-- TABLA: líneas de presupuesto
-- ════════════════════════════════════════════════════
create table if not exists public.presupuesto_items (
  id              uuid default uuid_generate_v4() primary key,
  presupuesto_id  uuid references public.presupuestos(id) on delete cascade not null,
  svc_id          text not null,
  cat_label       text,
  svc_label       text,
  calc_type       text,
  base_price      numeric(10,2),
  unit            text,
  qty             numeric(10,2),
  unit_price      numeric(10,2),
  subtotal        numeric(12,2),
  created_at      timestamptz default now()
);

alter table public.presupuesto_items enable row level security;
create policy "Usuario ve sus items"
  on public.presupuesto_items for all
  using (
    exists (
      select 1 from public.presupuestos p
      where p.id = presupuesto_id and p.user_id = auth.uid()
    )
  );

-- ════════════════════════════════════════════════════
-- TABLA: facturas
-- ════════════════════════════════════════════════════
create table if not exists public.facturas (
  inv_id          uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  inv_num         text not null,
  inv_date        date default current_date,
  inv_status      text default 'Emitida'
                  check (inv_status in ('Pendiente','Emitida','Cobrada')),
  client_name     text not null,
  client_ruc      text,
  client_dir      text,
  moneda          text default 'PEN',
  sym             text default 'S/',
  items           jsonb default '[]',
  subtotal_base   numeric(12,2) default 0,
  igv_amount      numeric(12,2) default 0,
  total_final     numeric(12,2) default 0,
  from_quote_id   uuid references public.presupuestos(id) on delete set null,
  biz_data        jsonb,
  pdf_url         text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.facturas enable row level security;
create policy "Usuario ve sus facturas"
  on public.facturas for all
  using (auth.uid() = user_id);

-- ════════════════════════════════════════════════════
-- TABLA: partidas propias del usuario
-- ════════════════════════════════════════════════════
create table if not exists public.partidas_propias (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  cap_id      text not null,
  nombre      text not null,
  tipo        text not null check (tipo in ('m2','unidad','hora','fijo')),
  precio      numeric(10,2) not null,
  unidad      text,
  activa      boolean default true,
  created_at  timestamptz default now()
);

alter table public.partidas_propias enable row level security;
create policy "Usuario ve sus partidas"
  on public.partidas_propias for all
  using (auth.uid() = user_id);

-- ════════════════════════════════════════════════════
-- TABLA: precios personalizados por usuario
-- ════════════════════════════════════════════════════
create table if not exists public.precios_usuario (
  id        uuid default uuid_generate_v4() primary key,
  user_id   uuid references auth.users(id) on delete cascade not null,
  svc_id    text not null,
  precio    numeric(10,2) not null,
  unique(user_id, svc_id)
);

alter table public.precios_usuario enable row level security;
create policy "Usuario ve sus precios"
  on public.precios_usuario for all
  using (auth.uid() = user_id);

-- ════════════════════════════════════════════════════
-- TRIGGER: updated_at automático
-- ════════════════════════════════════════════════════
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_presupuesto_update
  before update on public.presupuestos
  for each row execute procedure public.handle_updated_at();

create trigger on_factura_update
  before update on public.facturas
  for each row execute procedure public.handle_updated_at();

-- ════════════════════════════════════════════════════
-- TRIGGER: crear perfil automáticamente al registrarse
-- ════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════════════════════════════════
-- STORAGE: bucket para PDFs
-- ════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do nothing;

create policy "Usuarios suben sus PDFs"
  on storage.objects for insert
  with check (bucket_id = 'documentos' and auth.role() = 'authenticated');

create policy "PDFs públicos para leer"
  on storage.objects for select
  using (bucket_id = 'documentos');
