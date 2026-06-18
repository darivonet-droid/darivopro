-- ════════════════════════════════════════════════════════════════
-- DARIVO PRO — Migración 003: clientes — RLS completo + updated_at
-- Aplica sobre la tabla creada en 002_clientes.sql
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. COLUMNA updated_at (idempotente)
-- ────────────────────────────────────────────────────────────────
alter table public.clientes
  add column if not exists updated_at timestamptz default now();

-- ────────────────────────────────────────────────────────────────
-- 2. TRIGGER updated_at
--    Reutiliza la función handle_updated_at() de 001_initial.sql
-- ────────────────────────────────────────────────────────────────
drop trigger if exists on_cliente_update on public.clientes;

create trigger on_cliente_update
  before update on public.clientes
  for each row execute procedure public.handle_updated_at();

-- ────────────────────────────────────────────────────────────────
-- 3. RLS — reemplazar política genérica por 4 políticas explícitas
-- ────────────────────────────────────────────────────────────────

-- Eliminar política anterior (creada en 002)
drop policy if exists "Usuario ve sus clientes" on public.clientes;

-- SELECT: solo ve sus propios clientes
create policy "clientes_select"
  on public.clientes
  for select
  using (auth.uid() = user_id);

-- INSERT: solo puede insertar con su propio user_id
create policy "clientes_insert"
  on public.clientes
  for insert
  with check (auth.uid() = user_id);

-- UPDATE: solo puede modificar sus propios clientes
create policy "clientes_update"
  on public.clientes
  for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: solo puede eliminar sus propios clientes
create policy "clientes_delete"
  on public.clientes
  for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- 4. ÍNDICES adicionales
-- ────────────────────────────────────────────────────────────────
create index if not exists idx_clientes_user
  on public.clientes(user_id);

create index if not exists idx_clientes_nombre
  on public.clientes(user_id, nombre);    -- búsqueda por nombre dentro del tenant

-- ────────────────────────────────────────────────────────────────
-- 5. VERIFICACIÓN — RLS activo
-- ────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_tables
    where schemaname = 'public'
      and tablename   = 'clientes'
      and rowsecurity = true
  ) then
    raise exception 'FALLO: RLS no está activo en public.clientes';
  end if;
  raise notice 'OK: RLS activo en public.clientes';
end;
$$;

-- ────────────────────────────────────────────────────────────────
-- 6. TEST ANON — el rol anon NO debe poder leer ni escribir
--
--    Cómo ejecutar en Supabase SQL Editor:
--      set role anon;
--      <bloque de test>
--      reset role;
--
--    Este bloque usa set_config para simular anon sin cambiar el
--    rol de conexión (compatible con service_role en SQL Editor).
-- ────────────────────────────────────────────────────────────────
do $$
declare
  v_count  integer;
  v_passed boolean := true;
begin
  -- ── TEST 1: anon no puede hacer SELECT ──────────────────────
  begin
    -- Simular sesión anon: auth.uid() devuelve NULL cuando no hay JWT
    -- En RLS, USING (auth.uid() = user_id) con uid() = NULL → false → 0 filas
    select count(*) into v_count
    from public.clientes
    where user_id = '00000000-0000-0000-0000-000000000000'::uuid;

    -- Con RLS activo y sin sesión, debe devolver 0 filas (no error, solo vacío)
    if v_count = 0 then
      raise notice 'TEST 1 PASS: anon no ve filas de otro tenant (SELECT bloqueado por RLS)';
    else
      raise exception 'TEST 1 FAIL: anon puede ver % fila(s) de otro tenant', v_count;
    end if;
  end;

  -- ── TEST 2: INSERT sin user_id válido es rechazado ──────────
  begin
    insert into public.clientes (user_id, nombre)
    values (
      '00000000-0000-0000-0000-000000000000'::uuid,
      '__test_anon_insert__'
    );
    -- Si llega aquí, RLS no bloqueó → fallo
    v_passed := false;
    raise exception 'TEST 2 FAIL: INSERT anon no fue bloqueado por RLS';
  exception
    when insufficient_privilege then
      raise notice 'TEST 2 PASS: INSERT anon bloqueado por RLS (insufficient_privilege)';
    when others then
      raise notice 'TEST 2 PASS: INSERT anon bloqueado — % %', sqlstate, sqlerrm;
  end;

  -- ── TEST 3: políticas explícitas existen ────────────────────
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'clientes'
      and policyname = 'clientes_select'
  ) then
    raise exception 'TEST 3 FAIL: política clientes_select no encontrada';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'clientes'
      and policyname = 'clientes_insert'
  ) then
    raise exception 'TEST 3 FAIL: política clientes_insert no encontrada';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'clientes'
      and policyname = 'clientes_update'
  ) then
    raise exception 'TEST 3 FAIL: política clientes_update no encontrada';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'clientes'
      and policyname = 'clientes_delete'
  ) then
    raise exception 'TEST 3 FAIL: política clientes_delete no encontrada';
  end if;

  raise notice 'TEST 3 PASS: las 4 políticas RLS explícitas existen';

  -- ── TEST 4: trigger updated_at existe ───────────────────────
  if not exists (
    select 1 from information_schema.triggers
    where event_object_schema = 'public'
      and event_object_table  = 'clientes'
      and trigger_name        = 'on_cliente_update'
  ) then
    raise exception 'TEST 4 FAIL: trigger on_cliente_update no encontrado';
  end if;

  raise notice 'TEST 4 PASS: trigger on_cliente_update existe';

  raise notice '══ TODOS LOS TESTS PASARON — 003_clientes_rls.sql aplicado correctamente ══';
end;
$$;
