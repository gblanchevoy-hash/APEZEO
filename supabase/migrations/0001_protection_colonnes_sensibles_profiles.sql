-- ============================================================
-- CORRECTIF DE SÉCURITÉ IMPORTANT
-- ============================================================
-- La policy RLS "Modifier son profil..." vérifie uniquement QUI a le
-- droit de toucher une ligne (auth.uid() = id), jamais QUELLES
-- COLONNES il a le droit d'y changer. Concrètement, aujourd'hui,
-- n'importe quel compte connecté peut s'auto-attribuer les droits
-- super-admin ou passer son propre plan en "structure" gratuitement,
-- en appelant directement l'API avec sa propre session :
--
--   supabase.from('profiles').update({ super_admin: true }).eq('id', monId)
--
-- Ce correctif ajoute un déclencheur qui neutralise silencieusement
-- toute tentative de modification de ces colonnes par la personne
-- elle-même, quoi que RLS autorise par ailleurs. Un super-admin garde
-- un accès total (aucune restriction). N'importe qui d'autre : ces
-- colonnes reviennent automatiquement à leur valeur d'avant si la
-- requête tente de les changer.
-- ============================================================

create or replace function public.protect_sensitive_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Le super-admin (vous) n'est jamais restreint.
  if public.is_super_admin(auth.uid()) then
    return new;
  end if;

  -- Empêche toute personne (y compris un admin de structure gérant
  -- son équipe) de changer ces 4 colonnes sur QUELQUE ligne que ce
  -- soit, sauf le super-admin. C'est délibérément strict : seul vous,
  -- depuis "Créer une structure" ou le SQL Editor, changez un rôle,
  -- un plan ou un rattachement de structure.
  new.super_admin := old.super_admin;
  new.plan := old.plan;
  new.role := old.role;
  new.structure_id := old.structure_id;

  return new;
end;
$$;

drop trigger if exists protect_sensitive_profile_fields_trigger on profiles;
create trigger protect_sensitive_profile_fields_trigger
  before update on profiles
  for each row execute procedure public.protect_sensitive_profile_fields();

-- ============================================================
-- Vérification : essayez, avec un compte non-super-admin (ou
-- directement via curl/l'anon key), de faire :
--   update profiles set super_admin = true where id = 'un-uuid';
-- Puis relisez la ligne : super_admin doit être resté false.
-- ============================================================
