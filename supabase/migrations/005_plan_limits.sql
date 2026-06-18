-- ════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración 005: planes, límites e IA diaria
-- ════════════════════════════════════════════════════════════════

alter table public.perfiles
  add column if not exists plan_tipo text not null default 'gratis'
    check (plan_tipo in ('gratis', 'basico', 'pro', 'empresa'));

-- Contador de llamadas IA por día
create table if not exists public.ia_uso_diario (
  user_id   uuid not null references auth.users(id) on delete cascade,
  fecha     date not null default current_date,
  llamadas  int  not null default 0 check (llamadas >= 0),
  primary key (user_id, fecha)
);

alter table public.ia_uso_diario enable row level security;

create policy "Usuario ve su uso IA"
  on public.ia_uso_diario for select
  using (auth.uid() = user_id);

create policy "Usuario inserta su uso IA"
  on public.ia_uso_diario for insert
  with check (auth.uid() = user_id);

create policy "Usuario actualiza su uso IA"
  on public.ia_uso_diario for update
  using (auth.uid() = user_id);

-- RPC atómico para incrementar IA
create or replace function public.incrementar_ia_uso(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into ia_uso_diario (user_id, fecha, llamadas)
  values (p_user_id, current_date, 1)
  on conflict (user_id, fecha)
  do update set llamadas = ia_uso_diario.llamadas + 1
  returning llamadas into v_count;
  return v_count;
end;
$$;

grant execute on function public.incrementar_ia_uso(uuid) to authenticated;
