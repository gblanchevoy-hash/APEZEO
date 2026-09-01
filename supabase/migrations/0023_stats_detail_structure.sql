-- ============================================================
-- Détail exhaustif d'une structure (pour l'export PDF) : ajoute le
-- top 10 des fiches consultées à ce qu'on avait déjà (vues, téléchargements).
-- ============================================================
create or replace function public.stats_detail_structure(p_structure_id bigint)
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
    'top_fiches_mois', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select fiche_ref as titre, sum(vues) as vues
        from fiche_vues
        where structure_id = p_structure_id and mois = v_mois
        group by fiche_ref
        order by sum(vues) desc
        limit 10
      ) t
    ),
    'nb_comptes', (select count(*) from profiles where structure_id = p_structure_id),
    'nb_comptes_actifs', (select count(*) from profiles where structure_id = p_structure_id and actif = true)
  ) into result;

  return result;
end;
$function$;

revoke execute on function public.stats_detail_structure(bigint) from public, anon;
grant execute on function public.stats_detail_structure(bigint) to authenticated;
