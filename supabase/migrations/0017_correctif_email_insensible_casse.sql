-- ============================================================
-- Corrige la comparaison d'e-mail sensible à la casse dans
-- attach_existing_account -- si l'admin tape l'e-mail avec une
-- casse différente de celle utilisée à l'inscription, le compte
-- n'était jamais trouvé, sans erreur visible. Identique à l'original,
-- seule la ligne de comparaison change.
-- ============================================================
create or replace function public.attach_existing_account(p_email text)
returns table(success boolean, message text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_structure_id bigint;
  v_structure public.structures;
  v_target public.profiles;
  v_count int;
begin
  select structure_id into v_caller_structure_id
  from public.profiles where id = auth.uid() and role = 'admin';

  if v_caller_structure_id is null then
    return query select false, 'Seul un administrateur de structure peut rattacher un compte.';
    return;
  end if;

  select * into v_structure from public.structures where id = v_caller_structure_id;

  select * into v_target from public.profiles where lower(email) = lower(p_email);
  if not found then
    return query select false, 'Aucun compte trouvé avec cet e-mail. La personne doit d''abord créer son compte dans l''app.';
    return;
  end if;

  if v_target.structure_id is not null then
    return query select false, 'Ce compte est déjà rattaché à une structure. Détachez-le d''abord si besoin.';
    return;
  end if;

  select count(*) into v_count from public.profiles
    where structure_id = v_structure.id and actif = true;
  if v_count >= v_structure.quota then
    return query select false, 'Quota de comptes atteint pour votre structure.';
    return;
  end if;

  update public.profiles
    set structure_id = v_structure.id, role = 'membre', plan = 'structure'
    where id = v_target.id;

  return query select true, 'Compte rattaché avec succès.';
end;
$$;
