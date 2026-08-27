-- ============================================================
-- CORRECTIF DE SÉCURITÉ : vue suivi_essais en SECURITY DEFINER
-- ============================================================
-- Une vue Postgres, par défaut, s'exécute avec les droits de la
-- personne qui l'a CRÉÉE (souvent un rôle qui contourne complètement
-- les policies RLS), pas ceux de la personne qui l'INTERROGE. Concrè-
-- tement, n'importe quel compte connecté pouvait potentiellement
-- interroger cette vue et voir les données d'essai de TOUTES les
-- structures (y compris celles d'autres clients), en contournant la
-- protection RLS déjà en place sur la table `structures`.
--
-- Le correctif : `security_invoker = true` fait en sorte que la vue
-- respecte désormais les droits de la personne qui la consulte
-- (donc les mêmes règles RLS que si elle interrogeait `structures`
-- directement) plutôt que ceux du créateur de la vue.
-- ============================================================

drop view if exists public.suivi_essais;

create view public.suivi_essais
with (security_invoker = true)
as
select
  id,
  nom,
  code_invitation,
  created_at::date as debut_essai,
  essai_duree_semaines,
  (created_at + (essai_duree_semaines || ' weeks')::interval)::date as fin_essai,
  floor(extract(epoch from now() - created_at) / 604800)::int as semaines_ecoulees,
  greatest(essai_duree_semaines - floor(extract(epoch from now() - created_at) / 604800)::int, 0) as semaines_restantes,
  case
    when essai_duree_semaines is null then 'pas d''essai'
    when now() > created_at + (essai_duree_semaines || ' weeks')::interval then 'essai terminé'
    else 'en cours'
  end as statut
from public.structures
where essai_duree_semaines is not null
order by fin_essai asc;

-- ============================================================
-- Vérification : depuis un compte NON super-admin (ou directement
-- via l'anon key), interroger cette vue ne doit plus renvoyer que ce
-- que la policy RLS de `structures` autorise pour ce compte — pour
-- toi (super-admin), rien ne change, tu vois toujours tout.
-- ============================================================
