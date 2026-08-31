-- ============================================================
-- Le super-admin doit pouvoir supprimer N'IMPORTE QUEL compte,
-- même un compte gratuit jamais rattaché à une structure -- jusqu'ici,
-- la fonction refusait ce cas avant même de vérifier qui appelait.
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

  if not found then
    return query select false, 'Aucun compte trouvé avec cet identifiant.';
    return;
  end if;

  if v_member_role = 'admin' and not public.is_super_admin(auth.uid()) then
    return query select false, 'Impossible de supprimer un compte admin par ce biais.';
    return;
  end if;

  -- Le super-admin peut supprimer n'importe quel compte, rattaché ou
  -- non. Un admin de structure ne peut agir que sur un membre de SA
  -- propre structure -- il lui faut donc une structure_id qui
  -- correspond, condition qu'on ne vérifie plus que dans ce cas-là.
  if not public.is_super_admin(auth.uid()) then
    if v_member_structure_id is null or not public.is_admin_of(auth.uid(), v_member_structure_id) then
      return query select false, 'Vous n''êtes pas admin de la structure de ce membre.';
      return;
    end if;
  end if;

  delete from auth.users where id = p_member_id;

  return query select true, 'Compte supprimé définitivement.';
end;
$function$;
