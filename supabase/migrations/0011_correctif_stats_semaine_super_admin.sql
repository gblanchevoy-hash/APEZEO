-- ============================================================
-- Ajoute la répartition hebdomadaire à la vue super-admin globale
-- (jusqu'ici, elle ne lisait jamais fiche_vues_semaine).
-- ============================================================
create or replace function public.stats_usage_bibliotheque()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_mois text := to_char(now(), 'YYYY-MM');
  v_semaine text := to_char(now(), 'IYYY-IW');
  result jsonb;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Accès réservé au super-admin';
  end if;

  select jsonb_build_object(
    'total_vues_mois', coalesce((select sum(vues) from fiche_vues where mois = v_mois), 0),
    'top_fiches', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select fiche_ref as titre, sum(vues) as vues
        from fiche_vues
        where mois = v_mois
        group by fiche_ref
        order by sum(vues) desc
        limit 10
      ) t
    ),
    'top_fiches_semaine', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select fiche_ref as titre, sum(vues) as vues
        from fiche_vues_semaine
        where semaine = v_semaine
        group by fiche_ref
        order by sum(vues) desc
        limit 10
      ) t
    ),
    'fiches_jamais_consultees', (
      select count(*) from interventions i
      where not exists (select 1 from fiche_vues fv where fv.fiche_ref = i.titre)
    ),
    'total_fiches', (select count(*) from interventions)
  ) into result;

  return result;
end;
$function$;
