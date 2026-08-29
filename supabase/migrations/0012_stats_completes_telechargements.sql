-- ============================================================
-- 1) Table + fonction pour suivre les téléchargements PDF (nouveau,
--    n'existait pas du tout jusqu'ici).
-- ============================================================
create table if not exists telechargements_pdf (
  id bigint generated always as identity primary key,
  fiche_ref text not null,
  structure_id bigint references structures(id) on delete cascade,
  mois text not null,
  vues integer not null default 0,
  unique (fiche_ref, structure_id, mois)
);
alter table telechargements_pdf enable row level security;

create or replace function public.enregistrer_telechargement(p_fiche_ref text)
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
  insert into public.telechargements_pdf (fiche_ref, structure_id, mois, vues)
  values (p_fiche_ref, v_structure_id, to_char(now(), 'YYYY-MM'), 1)
  on conflict (fiche_ref, structure_id, mois) do update set vues = telechargements_pdf.vues + 1;
end;
$function$;

revoke execute on function public.enregistrer_telechargement(text) from public, anon;
grant execute on function public.enregistrer_telechargement(text) to authenticated;

-- ============================================================
-- 2) stats_usage_bibliotheque : ajoute les totaux hebdo et
--    téléchargements mensuels (jusqu'ici seul le total mensuel de
--    consultations existait).
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
    'total_fiches', (select count(*) from interventions)
  ) into result;

  return result;
end;
$function$;

