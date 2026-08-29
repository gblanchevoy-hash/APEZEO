-- ============================================================
-- Permet à un admin de supprimer DÉFINITIVEMENT le compte d'un
-- membre de sa propre équipe (pas juste le détacher). Irréversible :
-- libère l'e-mail pour une réinscription, mais efface tout
-- (favoris, historique, fiches personnelles de cette personne).
-- ============================================================
create or replace function public.delete_member_account(p_member_id uuid)
returns table(success boolean, message text)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_member_structure_id bigint;
  v_member_role text;
begin
  select structure_id, role into v_member_structure_id, v_member_role
  from public.profiles where id = p_member_id;

  if v_member_structure_id is null then
    return query select false, 'Ce compte n''appartient à aucune structure.';
    return;
  end if;

  if v_member_role = 'admin' then
    return query select false, 'Impossible de supprimer un compte admin par ce biais.';
    return;
  end if;

  if not public.is_admin_of(auth.uid(), v_member_structure_id) and not public.is_super_admin(auth.uid()) then
    return query select false, 'Vous n''êtes pas admin de la structure de ce membre.';
    return;
  end if;

  delete from auth.users where id = p_member_id;

  return query select true, 'Compte supprimé définitivement.';
end;
$function$;

revoke execute on function public.delete_member_account(uuid) from public, anon;
grant execute on function public.delete_member_account(uuid) to authenticated;
