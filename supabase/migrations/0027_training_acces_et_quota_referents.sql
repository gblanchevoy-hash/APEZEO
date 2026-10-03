-- ============================================================
-- APÉZEO TRAINING : ACCÈS PAR STRUCTURE + QUOTA DE COMPTES RÉFÉRENTS
-- ============================================================
-- Le module Apézeo Training (simulateur d'entretiens) a un coût réel
-- par utilisation (appels API). Il est donc verrouillé à deux niveaux,
-- tous deux pilotés exclusivement par le super-admin :
--
--  1. structures.training_access : la structure a-t-elle accès au
--     module du tout ? 'disabled' (par défaut) / 'trial' / 'full'.
--  2. structures.training_seats (quota numérique) + profiles.training_referent :
--     parmi les comptes de la structure, combien (et lesquels)
--     voient effectivement le bouton. Le nombre de comptes référents
--     actifs est bloqué au niveau base de données (trigger), pas
--     seulement côté interface — comme le quota de comptes existant.
--
-- Le bouton ne s'affiche que si LES DEUX conditions sont réunies :
-- structure en 'trial' ou 'full' ET compte marqué training_referent.
-- ============================================================

alter table structures add column if not exists training_access text not null default 'disabled'
  check (training_access in ('disabled', 'trial', 'full'));
alter table structures add column if not exists training_seats int not null default 0
  check (training_seats >= 0);

alter table profiles add column if not exists training_referent boolean not null default false;

-- ------------------------------------------------------------
-- Étend la protection existante (0001) : training_referent ne peut
-- être changé que par le super-admin, jamais par la personne
-- elle-même ni par un admin de structure gérant son équipe.
-- ------------------------------------------------------------
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

  new.super_admin := old.super_admin;
  new.plan := old.plan;
  new.role := old.role;
  new.structure_id := old.structure_id;
  new.training_referent := old.training_referent;

  return new;
end;
$$;

-- ------------------------------------------------------------
-- Verrou réel du quota de référents : lève une exception si on tente
-- de passer un compte à training_referent = true alors que le quota
-- (training_seats) de sa structure est déjà atteint. S'applique quel
-- que soit le chemin emprunté (RPC ci-dessous ou édition directe en
-- tant que super-admin), donc infranchissable même en contournant
-- l'interface.
-- ------------------------------------------------------------
create or replace function public.verifier_quota_training_referent()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_seats int;
  v_count int;
begin
  -- Rien à vérifier si le compte n'est pas (ou plus) référent.
  if new.training_referent is distinct from true then
    return new;
  end if;
  -- Déjà référent avant cette écriture : aucune nouvelle place consommée.
  if tg_op = 'UPDATE' and old.training_referent = true then
    return new;
  end if;

  if new.structure_id is null then
    raise exception 'Un compte référent formation doit être rattaché à une structure.';
  end if;

  select training_seats into v_seats from public.structures where id = new.structure_id;
  select count(*) into v_count from public.profiles
    where structure_id = new.structure_id and training_referent = true and id <> new.id;

  if v_count >= coalesce(v_seats, 0) then
    raise exception 'Quota de comptes référents formation atteint pour cette structure (% place(s)).', coalesce(v_seats, 0);
  end if;

  return new;
end;
$$;

drop trigger if exists verrou_quota_training_referent on profiles;
create trigger verrou_quota_training_referent
  before insert or update of training_referent on profiles
  for each row execute function public.verifier_quota_training_referent();

-- ------------------------------------------------------------
-- RPC super-admin : désigne (ou retire) le compte référent formation
-- d'un utilisateur. Renvoie un message lisible côté interface plutôt
-- que l'exception brute du trigger ci-dessus (même style que
-- set_structure_suspended).
-- ------------------------------------------------------------
create or replace function public.set_training_referent(p_user_id uuid, p_value boolean)
returns table(success boolean, message text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_structure_id bigint;
  v_seats int;
  v_count int;
begin
  if not public.is_super_admin(auth.uid()) then
    return query select false, 'Action réservée au super-administrateur.';
    return;
  end if;

  select structure_id into v_structure_id from public.profiles where id = p_user_id;
  if v_structure_id is null then
    return query select false, 'Ce compte n''est rattaché à aucune structure.';
    return;
  end if;

  if p_value then
    select training_seats into v_seats from public.structures where id = v_structure_id;
    select count(*) into v_count from public.profiles
      where structure_id = v_structure_id and training_referent = true and id <> p_user_id;
    if v_count >= coalesce(v_seats, 0) then
      return query select false, format('Quota atteint (%s place(s) pour cette structure). Retirez un autre référent d''abord, ou augmentez le quota.', coalesce(v_seats, 0));
      return;
    end if;
  end if;

  update public.profiles set training_referent = p_value where id = p_user_id;
  return query select true, case when p_value then 'Compte désigné référent formation.' else 'Compte retiré des référents formation.' end;
end;
$$;

grant execute on function public.set_training_referent(uuid, boolean) to authenticated;

-- ------------------------------------------------------------
-- Fonction appelée par chaque utilisateur connecté (security definer,
-- stable) : répond juste "le bouton Apézeo Training doit-il
-- s'afficher pour moi ?", sans avoir besoin d'exposer la table
-- structures en lecture directe à tout le monde (même principe que
-- verifier_essai).
-- ------------------------------------------------------------
create or replace function public.mon_acces_training()
returns boolean
language sql security definer stable
set search_path = public, pg_temp
as $$
  select coalesce(
    (
      select s.training_access <> 'disabled' and p.training_referent
      from public.profiles p
      join public.structures s on s.id = p.structure_id
      where p.id = auth.uid()
    ),
    false
  );
$$;

grant execute on function public.mon_acces_training() to authenticated;

-- ============================================================
-- Vérification :
--   select mon_acces_training();  -- false par défaut pour tout le monde
--   update structures set training_access = 'trial', training_seats = 1 where id = ...;
--   select set_training_referent('<uuid du compte>', true);
--   -- reconnecté avec ce compte : mon_acces_training() doit renvoyer true
--   select set_training_referent('<uuid d''un 2e compte même structure>', true);
--   -- doit échouer avec "Quota atteint (1 place(s)...)"
-- ============================================================
