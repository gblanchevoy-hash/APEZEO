-- ============================================================
-- CORRECTIF DE FOND (v2) : retrait du droit d'exécution "PUBLIC"
-- ============================================================
-- Chaque REVOKE est encapsulé pour ne jamais bloquer les suivants si
-- une fonction n'existe pas réellement chez toi (comme
-- vues_semaine_structure, qui a fait échouer tout le lot précédent).
-- ============================================================

do $$
begin
  begin revoke execute on function public.check_invitation_code(text) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.attach_existing_account(text) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.set_structure_suspended(bigint, boolean) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.delete_structure(bigint) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.delete_own_account() from public; exception when undefined_function then null; end;
  begin revoke execute on function public.enregistrer_vue(text) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.top_fiches_structure() from public; exception when undefined_function then null; end;
  begin revoke execute on function public.vues_semaine_structure() from public; exception when undefined_function then null; end;
  begin revoke execute on function public.verifier_essai(bigint) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.stats_usage_bibliotheque() from public; exception when undefined_function then null; end;
  begin revoke execute on function public.is_admin_of(uuid, bigint) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.my_structure_id(uuid) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.is_super_admin(uuid) from public; exception when undefined_function then null; end;
  begin revoke execute on function public.protect_sensitive_profile_fields() from public; exception when undefined_function then null; end;
end $$;

-- a_acces_complet doit rester exécutable par anon ET authenticated
-- (appelée pour chaque lecture de la table interventions, y compris
-- par un visiteur sans compte) — on retire juste PUBLIC, sans toucher
-- aux deux autres, et on fixe le search_path au passage.
create or replace function public.a_acces_complet(uid uuid)
returns boolean
language sql security definer stable
set search_path = public, pg_temp
as $$
  select coalesce((
    select
      p.super_admin
      or p.plan = 'payant_manuel'
      or (
        p.plan = 'structure' and p.actif
        and (
          s.essai_duree_semaines is null
          or now() <= s.created_at + (s.essai_duree_semaines || ' weeks')::interval
        )
      )
    from public.profiles p
    left join public.structures s on s.id = p.structure_id
    where p.id = uid
  ), false);
$$;
revoke execute on function public.a_acces_complet(uuid) from public;
grant execute on function public.a_acces_complet(uuid) to anon, authenticated;

-- ============================================================
-- Correctif "Function Search Path Mutable" : fix_mojibake /
-- fix_mojibake_arr, recréées à l'identique (même contenu, juste le
-- search_path fixé en plus).
-- ============================================================
create or replace function public.fix_mojibake(t text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $function$
declare
  pairs text[][] := array[
    ['Ã©','é'], ['Ã¨','è'], ['Ãª','ê'], ['Ã«','ë'], ['Ã ','à'],
    ['Ã¢','â'], ['Ã®','î'], ['Ã¯','ï'], ['Ã´','ô'], ['Ã¶','ö'],
    ['Ã¹','ù'], ['Ã»','û'], ['Ã¼','ü'], ['Ã§','ç'], ['Ã‰','É'],
    ['Ãˆ','È'], ['ÃŠ','Ê'], ['Ã‹','Ë'], ['Ã€','À'], ['Ã‚','Â'],
    ['ÃŽ','Î'], ['Ã”','Ô'], ['Ã–','Ö'], ['Ã™','Ù'], ['Ã›','Û'],
    ['Ãœ','Ü'], ['Ã‡','Ç'], ['Ã','Ï']
  ];
  i int;
  result text := t;
begin
  if t is null then
    return null;
  end if;
  for i in 1..array_length(pairs,1) loop
    result := replace(result, pairs[i][1], pairs[i][2]);
  end loop;
  return result;
end;
$function$;

create or replace function public.fix_mojibake_arr(arr text[])
returns text[]
language sql
immutable
set search_path = public, pg_temp
as $function$
  select case when arr is null then null
    else array(select fix_mojibake(x) from unnest(arr) as x)
  end;
$function$;

-- ============================================================
-- Vérification
-- ============================================================
select p.proname, p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('fix_mojibake', 'fix_mojibake_arr', 'a_acces_complet');
