-- ============================================================
-- Retrait du parcours d'inscription par code d'invitation.
-- ============================================================
-- Le code pouvait fuiter (capture d'écran, transfert) et donner un
-- accès en libre-service à une structure. Désormais, toute nouvelle
-- inscription reste en plan "gratuit" par défaut ; c'est
-- l'administrateur qui rattache ensuite le compte à sa structure
-- (fonctionnalité déjà existante "Rattacher un compte", ou la
-- promotion du premier admin depuis "Créer une structure" —
-- aucune des deux ne dépend du code, rien n'est cassé).
--
-- Défense en profondeur : même si quelqu'un contournait l'interface
-- et appelait l'inscription directement avec un code_invitation dans
-- les métadonnées, ce trigger l'ignore désormais complètement.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, profession, plan)
  values (new.id, new.email, new.raw_user_meta_data->>'profession', 'gratuit');
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- La fonction de vérification de code n'est plus appelée par l'app —
-- on retire son accès public plutôt que de la laisser accessible
-- sans raison (elle permettait à quiconque de sonder l'existence
-- d'un code, même sans pouvoir l'utiliser).
revoke execute on function public.check_invitation_code(text) from anon, authenticated;

-- ============================================================
-- Vérification : une inscription sans admin_email doit toujours
-- donner un compte "gratuit" — testez la création d'un compte, elle
-- ne doit plus proposer de champ code, et le compte créé doit
-- apparaître avec plan = 'gratuit' :
--   select email, plan, structure_id from profiles order by created_at desc limit 3;
-- ============================================================
