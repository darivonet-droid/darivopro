-- DARIVO PRO — Migración 002: tabla de clientes

create table if not exists public.clientes (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  nombre      text not null,
  telefono    text,
  ruc         text,
  direccion   text,
  ciudad      text,
  notas       text,
  created_at  timestamptz default now()
);

alter table public.clientes enable row level security;
create policy "Usuario ve sus clientes"
  on public.clientes for all
  using (auth.uid() = user_id);

create index if not exists idx_clientes_user on public.clientes(user_id);
