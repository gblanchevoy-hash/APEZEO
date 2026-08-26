-- ============================================================
-- 1) SIGNALEMENTS — visibles uniquement par le super-admin, aucun
--    envoi d'e-mail, juste un onglet de suivi dans l'app.
-- ============================================================
create table if not exists signalements (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  technique_id text,
  fiche_titre text not null,
  message text not null,
  resolu boolean not null default false,
  created_at timestamptz default now()
);
alter table signalements enable row level security;

drop policy if exists "Un utilisateur crée un signalement" on signalements;
create policy "Un utilisateur crée un signalement"
  on signalements for insert
  with check (auth.uid() = user_id);

drop policy if exists "Seul le super-admin lit et gère les signalements" on signalements;
create policy "Seul le super-admin lit et gère les signalements"
  on signalements for select
  using (public.is_super_admin(auth.uid()));

drop policy if exists "Seul le super-admin met à jour les signalements" on signalements;
create policy "Seul le super-admin met à jour les signalements"
  on signalements for update
  using (public.is_super_admin(auth.uid()));

-- ============================================================
-- 2) FAVORIS D'ÉQUIPE — un admin de structure épingle des fiches
--    recommandées, visibles par toute son équipe (pas juste lui).
-- ============================================================
create table if not exists favoris_equipe (
  id bigint generated always as identity primary key,
  structure_id bigint references structures(id) on delete cascade not null,
  fiche_id text not null,
  fiche_titre text not null,
  ajoute_par uuid references auth.users on delete set null,
  created_at timestamptz default now(),
  unique (structure_id, fiche_id)
);
alter table favoris_equipe enable row level security;

drop policy if exists "Toute l'équipe voit les favoris de sa structure" on favoris_equipe;
create policy "Toute l'équipe voit les favoris de sa structure"
  on favoris_equipe for select
  using (structure_id = public.my_structure_id(auth.uid()) or public.is_super_admin(auth.uid()));

drop policy if exists "Un admin gère les favoris de sa structure" on favoris_equipe;
create policy "Un admin gère les favoris de sa structure"
  on favoris_equipe for all
  using (
    structure_id = public.my_structure_id(auth.uid())
    or public.is_super_admin(auth.uid())
  )
  with check (
    structure_id = public.my_structure_id(auth.uid())
    or public.is_super_admin(auth.uid())
  );

-- ============================================================
-- 3) RATTACHEMENT AUTOMATIQUE À L'INSCRIPTION — un admin
--    pré-enregistre un e-mail, le rattachement se fait tout seul
--    dès que la personne crée son compte (aucun e-mail envoyé,
--    il faut toujours prévenir la personne par vos propres moyens).
-- ============================================================
create table if not exists invitations_structure (
  id bigint generated always as identity primary key,
  email text not null,
  structure_id bigint references structures(id) on delete cascade not null,
  invite_par uuid references auth.users on delete set null,
  utilisee boolean not null default false,
  created_at timestamptz default now(),
  unique (email, structure_id)
);
alter table invitations_structure enable row level security;

drop policy if exists "Un admin gère les invitations de sa structure" on invitations_structure;
create policy "Un admin gère les invitations de sa structure"
  on invitations_structure for all
  using (
    structure_id = public.my_structure_id(auth.uid())
    or public.is_super_admin(auth.uid())
  )
  with check (
    structure_id = public.my_structure_id(auth.uid())
    or public.is_super_admin(auth.uid())
  );

-- Le trigger d'inscription vérifie désormais s'il existe une
-- invitation en attente pour cet e-mail, et rattache automatiquement
-- si oui — sinon, comportement inchangé (plan gratuit).
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_invitation invitations_structure;
begin
  select * into v_invitation
  from public.invitations_structure
  where lower(email) = lower(new.email) and not utilisee
  order by created_at asc
  limit 1;

  if v_invitation.id is not null then
    insert into public.profiles (id, email, profession, plan, structure_id, role)
    values (new.id, new.email, new.raw_user_meta_data->>'profession', 'structure', v_invitation.structure_id, 'membre');
    update public.invitations_structure set utilisee = true where id = v_invitation.id;
  else
    insert into public.profiles (id, email, profession, plan)
    values (new.id, new.email, new.raw_user_meta_data->>'profession', 'gratuit');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- ============================================================
-- Vérification
-- ============================================================
select 'signalements' as table_creee, count(*) from signalements
union all select 'favoris_equipe', count(*) from favoris_equipe
union all select 'invitations_structure', count(*) from invitations_structure;
