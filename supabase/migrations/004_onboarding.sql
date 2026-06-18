-- ════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración 004: campos de onboarding en perfiles
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════

-- ── 1. Columnas nuevas ───────────────────────────────────────────
alter table public.perfiles
  add column if not exists categorias     text[]  default '{}',
  add column if not exists onboarding_done boolean default false;

-- ── 2. Índice para filtrar usuarios pendientes de onboarding ────
create index if not exists idx_perfiles_onboarding
  on public.perfiles(onboarding_done)
  where onboarding_done = false;

-- ── 3. Verificación ─────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'perfiles'
      and column_name  = 'categorias'
  ) then
    raise exception 'FALLO: columna categorias no existe en perfiles';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'perfiles'
      and column_name  = 'onboarding_done'
  ) then
    raise exception 'FALLO: columna onboarding_done no existe en perfiles';
  end if;

  raise notice 'OK: 004_onboarding.sql aplicado correctamente';
end;
$$;
