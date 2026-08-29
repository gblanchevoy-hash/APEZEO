-- ============================================================
-- Redéfinit enregistrer_vue() (écriture) et vues_semaine_structure()
-- (lecture), sans aucune ligne de vérification risquée à la fin —
-- pour ne plus jamais annuler ce correctif par erreur si une requête
-- de contrôle échoue.
-- ============================================================

create or replace function public.enregistrer_vue(p_fiche_ref text)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_structure_id bigint;
begin
  select structure_id into v_structure_id from public.profiles where id = auth.uid();
  if v_structure_id is null then
    return;
  end if;
  insert into public.fiche_vues (fiche_ref, structure_id, mois, vues)
  values (p_fiche_ref, v_structure_id, to_char(now(), 'YYYY-MM'), 1)
  on conflict (fiche_ref, structure_id, mois) do update set vues = fiche_vues.vues + 1;

  insert into public.fiche_vues_semaine (fiche_ref, structure_id, semaine, vues)
  values (p_fiche_ref, v_structure_id, to_char(now(), 'IYYY-IW'), 1)
  on conflict (fiche_ref, structure_id, semaine) do update set vues = fiche_vues_semaine.vues + 1;
end;
$function$;

create or replace function public.vues_semaine_structure()
returns table(fiche_ref text, vues integer)
language sql
stable security definer
set search_path to 'public', 'pg_temp'
as $function$
  select fv.fiche_ref, fv.vues
  from public.fiche_vues_semaine fv
  where fv.structure_id = public.my_structure_id(auth.uid())
    and fv.semaine = to_char(now(), 'IYYY-IW')
  order by fv.vues desc
  limit 5;
$function$;

revoke execute on function public.vues_semaine_structure() from public, anon;
grant execute on function public.vues_semaine_structure() to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'fiche_vues_semaine' and c.contype = 'u'
  ) then
    alter table public.fiche_vues_semaine
      add constraint fiche_vues_semaine_unique unique (fiche_ref, structure_id, semaine);
  end if;
end $$;
