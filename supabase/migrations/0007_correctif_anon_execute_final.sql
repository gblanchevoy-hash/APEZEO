-- ============================================================
-- CORRECTIF DÉFINITIF : retrait du droit d'exécution "anon"
-- ============================================================
-- Découverte en vérifiant : Supabase accorde automatiquement EXECUTE
-- à "anon" ET "authenticated" sur toute nouvelle fonction du schéma
-- public, par un réglage de base du projet (indépendant de mes
-- propres "grant"). Le retrait de PUBLIC de tout à l'heure était donc
-- la mauvaise cible — la vraie fuite potentielle, c'était "anon"
-- (visiteur sans compte), toujours présent malgré tout.
--
-- a_acces_complet n'est PAS touchée ici : elle a légitimement besoin
-- d'anon (RLS sur interventions, pour les visiteurs sans compte).
-- ============================================================

do $$
begin
  begin revoke execute on function public.check_invitation_code(text) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.attach_existing_account(text) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.set_structure_suspended(bigint, boolean) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.delete_structure(bigint) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.delete_own_account() from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.enregistrer_vue(text) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.top_fiches_structure() from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.vues_semaine_structure() from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.verifier_essai(bigint) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.stats_usage_bibliotheque() from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.is_admin_of(uuid, bigint) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.my_structure_id(uuid) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.is_super_admin(uuid) from anon; exception when undefined_function then null; end;
  begin revoke execute on function public.protect_sensitive_profile_fields() from anon; exception when undefined_function then null; end;
end $$;

-- Pour qu'une future fonction n'hérite plus jamais automatiquement de
-- ce droit "anon" par défaut à sa création — il faudra alors l'ajouter
-- explicitement au cas par cas (comme pour a_acces_complet), plutôt
-- que de devoir penser à le retirer à chaque fois.
alter default privileges in schema public revoke execute on functions from anon;

-- ============================================================
-- Vérification : ne doit plus montrer "anon" pour ces 4-là.
-- ============================================================
select p.proname, p.proacl::text
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('delete_structure','attach_existing_account','is_super_admin','delete_own_account');
