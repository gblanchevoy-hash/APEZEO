-- ============================================================
-- 1) Journal des comptes (activation/désactivation), sur le même
--    principe que structures_evenements -- pour pouvoir un jour
--    calculer une vraie rétention dans le temps.
-- ============================================================
create table if not exists profiles_evenements (
  id bigint generated always as identity primary key,
  profile_id uuid references auth.users(id) on delete cascade,
  structure_id bigint references structures(id) on delete set null,
  type_evenement text not null check (type_evenement in ('creation', 'desactivation', 'reactivation')),
  created_at timestamptz default now()
);
alter table profiles_evenements enable row level security;

drop policy if exists "Super-admin lit le journal des comptes" on profiles_evenements;
create policy "Super-admin lit le journal des comptes"
  on profiles_evenements for select
  using (public.is_super_admin(auth.uid()));

create or replace function public.log_evenement_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.profiles_evenements (profile_id, structure_id, type_evenement)
    values (new.id, new.structure_id, 'creation');
    return new;
  end if;

  if tg_op = 'UPDATE' and old.actif is distinct from new.actif then
    insert into public.profiles_evenements (profile_id, structure_id, type_evenement)
    values (new.id, new.structure_id, case when new.actif then 'reactivation' else 'desactivation' end);
  end if;

  return new;
end;
$$;

drop trigger if exists log_evenement_profile_trigger on profiles;
create trigger log_evenement_profile_trigger
  after insert or update on profiles
  for each row execute procedure public.log_evenement_profile();

-- Rattrapage : marque les comptes déjà existants comme "créés" à leur
-- date réelle de création, pour partir d'un état cohérent.
insert into profiles_evenements (profile_id, structure_id, type_evenement, created_at)
select id, structure_id, 'creation', created_at from profiles
where not exists (select 1 from profiles_evenements pe where pe.profile_id = profiles.id);

-- ============================================================
-- 2) Répartition par métier + signal de qualité (taux de fiches
--    consultées mises en favori), ajoutés à la fonction de stats
--    globales existante.
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
    'total_vues_semaine', coalesce((select sum(vues) from fiche_vues_semaine where semaine = v_semaine), 0),
    'total_telechargements_mois', coalesce((select sum(vues) from telechargements_pdf where mois = v_mois), 0),
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
    'total_fiches', (select count(*) from interventions),
    'par_profession', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select coalesce(profession, 'Non renseigné') as profession, count(*) as nb
        from profiles
        where structure_id is not null
        group by profession
        order by count(*) desc
      ) t
    ),
    'taux_favoris', (
      select case when count(distinct fv.fiche_ref) = 0 then 0
        else round((select count(*) from favoris)::numeric / count(distinct fv.fiche_ref) * 100, 1)
        end
      from fiche_vues fv
    )
  ) into result;

  return result;
end;
$function$;
