-- ============================================================
-- CORRECTIF FONCTIONNEL : "vues cette semaine" n'a jamais marché
-- ============================================================
-- enregistrer_vue() n'écrivait que dans fiche_vues (mensuel), jamais
-- dans fiche_vues_semaine -- et la fonction pour la relire
-- (vues_semaine_structure) n'a jamais été créée. La table existait
-- mais restait toujours vide.

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

-- Nécessaire si la contrainte d'unicité (fiche_ref, structure_id,
-- semaine) n'existait pas encore -- sans ça, le "on conflict" ci-dessus
-- échouerait.
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

-- Vérification (0 ligne si personne n'a encore consulté de fiche
-- cette semaine depuis ce correctif -- normal, les données
-- commenceront à apparaître dès la prochaine consultation).
select * from fiche_vues_semaine order by id desc limit 5;
