-- DARIVO PRO — Migración 006: trigger de registro más robusto
-- Ejecutar en Supabase SQL Editor si el registro falla al crear perfil

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, razon_social)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre_empresa', null)
  )
  on conflict (id) do update
    set razon_social = coalesce(excluded.razon_social, public.perfiles.razon_social);
  return new;
end;
$$;

-- Políticas explícitas por si RLS bloqueaba upsert desde el cliente
drop policy if exists "Usuario inserta su propio perfil" on public.perfiles;
create policy "Usuario inserta su propio perfil"
  on public.perfiles for insert
  with check (auth.uid() = id);

drop policy if exists "Usuario actualiza su propio perfil" on public.perfiles;
create policy "Usuario actualiza su propio perfil"
  on public.perfiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
