-- ============================================================
-- Autorise un admin à retirer un membre de SA PROPRE équipe
-- (structure_id -> NULL, role -> 'membre', plan -> 'gratuit'), sans
-- rouvrir la faille corrigée précédemment (auto-promotion, changement
-- de plan pour soi-même, ou déplacement vers une AUTRE structure).
-- ============================================================
create or replace function public.protect_sensitive_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_super_admin(auth.uid()) then
    return new;
  end if;

  -- Cas légitime et strictement limité : un admin retire un membre
  -- (pas un autre admin) de sa propre équipe.
  if public.is_admin_of(auth.uid(), old.structure_id)
     and old.role <> 'admin'
     and new.structure_id is null then
    new.role := 'membre';
    new.plan := 'gratuit';
    return new;
  end if;

  new.super_admin := old.super_admin;
  new.plan := old.plan;
  new.role := old.role;
  new.structure_id := old.structure_id;

  return new;
end;
$$;
