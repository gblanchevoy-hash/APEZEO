-- ============================================================
-- Détail des statistiques d'usage, structure par structure --
-- complète stats_usage_bibliotheque() (qui donne le total global),
-- réservé au super-admin.
-- ============================================================
create or replace function public.stats_usage_par_structure()
returns table(
  structure_id bigint,
  structure_nom text,
  vues_mois integer,
  vues_semaine integer,
  telechargements_mois integer
)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_mois text := to_char(now(), 'YYYY-MM');
  v_semaine text := to_char(now(), 'IYYY-IW');
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Accès réservé au super-admin';
  end if;

  return query
  select
    s.id,
    s.nom,
    coalesce((select sum(fv.vues) from fiche_vues fv where fv.structure_id = s.id and fv.mois = v_mois), 0)::int,
    coalesce((select sum(fvs.vues) from fiche_vues_semaine fvs where fvs.structure_id = s.id and fvs.semaine = v_semaine), 0)::int,
    coalesce((select sum(tp.vues) from telechargements_pdf tp where tp.structure_id = s.id and tp.mois = v_mois), 0)::int
  from structures s
  order by s.nom;
end;
$function$;

revoke execute on function public.stats_usage_par_structure() from public, anon;
grant execute on function public.stats_usage_par_structure() to authenticated;
