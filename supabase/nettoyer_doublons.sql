-- ============================================================
-- APÉZEO — Nettoyage des doublons d'import AVANT garde-fou
-- ============================================================
-- À exécuter UNE SEULE FOIS, avant la partie "GARDE-FOU CONTRE LES
-- DOUBLONS D'IMPORT" de schema.sql. Repère les fiches expertes
-- partageant le même technique_id et ne garde que la plus récente
-- (la plus grand id = la dernière importée), supprime les autres.

-- Étape 1 — Vérifier s'il y a des doublons (à lancer d'abord, sans
-- rien supprimer, juste pour voir l'ampleur du problème) :
select technique_id, count(*) as nb_exemplaires
from interventions
where niveau_detail = 'expert' and technique_id is not null
group by technique_id
having count(*) > 1
order by technique_id;

-- Étape 2 — Si la requête ci-dessus renvoie des lignes, nettoyez avec
-- ceci (garde le doublon le plus récent, supprime les plus anciens) :
delete from interventions
where id in (
  select id from (
    select id, row_number() over (partition by technique_id order by id desc) as rn
    from interventions
    where niveau_detail = 'expert' and technique_id is not null
  ) t
  where rn > 1
);

-- Étape 3 — Vérification finale (doit renvoyer 0 ligne) :
select technique_id, count(*) as nb_exemplaires
from interventions
where niveau_detail = 'expert' and technique_id is not null
group by technique_id
having count(*) > 1;
