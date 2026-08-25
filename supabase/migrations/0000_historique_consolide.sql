-- ============================================================
-- APÉZEO — schéma Supabase
-- À exécuter une fois dans : Supabase > SQL Editor > New query
-- ============================================================

create table if not exists interventions (
  id bigint generated always as identity primary key,
  titre text not null,
  categorie text,
  sous_categorie text,
  description text,
  objectifs text,
  troubles text[] default '{}',
  stades text[] default '{}',
  contextes text[] default '{}',
  duree text,
  duree_minutes int default 0,
  materiel text[] default '{}',
  protocole text,
  etapes text[] default '{}',
  conseils text[] default '{}',
  erreurs text[] default '{}',
  contre_indications text[] default '{}',
  niveau_preuve int default 3,
  difficulte text default 'Facile',
  sources text[] default '{}',
  mots_cles text[] default '{}',
  date_maj text,
  created_at timestamptz default now()
);

-- Sécurité : lecture publique (tout le monde, y compris les visiteurs non
-- connectés, via la clé "anon"), mais AUCUNE policy d'écriture pour cette
-- clé. Résultat : l'app peut afficher les fiches à tout le monde, mais
-- seul vous (connecté au tableau de bord Supabase, qui contourne les
-- policies RLS) pouvez ajouter, modifier ou supprimer des lignes.
alter table interventions enable row level security;

drop policy if exists "Lecture publique des interventions" on interventions;
create policy "Lecture publique des interventions"
  on interventions for select
  using (true);

-- ============================================================
-- COMPTES UTILISATEURS (Version Pro)
-- Table de profil liée à l'authentification Supabase (auth.users),
-- avec la profession déclarée à l'inscription. Chaque utilisateur ne
-- voit et ne modifie que sa propre ligne.
-- ============================================================

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  profession text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Un utilisateur voit son propre profil" on profiles;
create policy "Un utilisateur voit son propre profil"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Un utilisateur modifie son propre profil" on profiles;
create policy "Un utilisateur modifie son propre profil"
  on profiles for update
  using (auth.uid() = id);

-- Crée automatiquement la ligne de profil à chaque inscription, en
-- récupérant la profession envoyée par l'app au moment du signUp.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, profession)
  values (new.id, new.email, new.raw_user_meta_data->>'profession');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DONNÉES PERSONNELLES LIÉES AU COMPTE
-- Favoris, historique d'utilisation et fiches personnelles : chaque
-- utilisateur ne voit et ne modifie que ses propres lignes (RLS sur
-- auth.uid()). Résultat : ces données suivent le professionnel d'un
-- appareil à l'autre dès qu'il se reconnecte, sans jamais être visibles
-- par les autres utilisateurs.
-- ============================================================

create table if not exists favoris (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  fiche_id text not null,
  type text not null check (type in ('liked', 'disliked')),
  created_at timestamptz default now(),
  unique (user_id, fiche_id)
);
alter table favoris enable row level security;
drop policy if exists "Un utilisateur gère ses favoris" on favoris;
create policy "Un utilisateur gère ses favoris"
  on favoris for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists historique (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  fiche_id text not null,
  avant int,
  apres int,
  commentaire text,
  created_at timestamptz default now()
);
alter table historique enable row level security;
drop policy if exists "Un utilisateur gère son historique" on historique;
create policy "Un utilisateur gère son historique"
  on historique for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists fiches_personnelles (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  titre text not null,
  categorie text,
  sous_categorie text,
  description text,
  objectifs text,
  quand_utiliser text,
  troubles text[] default '{}',
  stades text[] default '{}',
  contextes text[] default '{}',
  duree text,
  duree_minutes int default 0,
  materiel text[] default '{}',
  etapes text[] default '{}',
  conseils text[] default '{}',
  erreurs text[] default '{}',
  contre_indications text[] default '{}',
  niveau_preuve int default 3,
  difficulte text default 'Facile',
  sources text[] default '{}',
  mots_cles text[] default '{}',
  date_maj text,
  created_at timestamptz default now()
);
alter table fiches_personnelles enable row level security;
drop policy if exists "Un utilisateur gère ses fiches personnelles" on fiches_personnelles;
create policy "Un utilisateur gère ses fiches personnelles"
  on fiches_personnelles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- IMPORT EN LOT
-- Chaque fois que vous recevez un lot de fiches au format JSON
-- (ex. généré par ChatGPT), collez-le à la place de PASTE_JSON_HERE
-- ci-dessous et exécutez la requête dans le SQL Editor. Les nouvelles
-- fiches apparaissent instantanément pour tous les utilisateurs de
-- l'app, sans redéploiement.
--
-- Champs acceptés par fiche (tous optionnels sauf "titre") :
-- titre, categorie, sous_categorie, description, objectifs,
-- troubles (tableau), stades (tableau), contextes (tableau),
-- duree (texte libre, ex "10 min"), materiel (tableau),
-- protocole (texte, ou etapes en tableau), erreurs (tableau),
-- contre_indications (tableau), niveau_preuve (1 à 5),
-- sources (tableau), mots_cles (tableau), date_maj (texte)
-- ============================================================

-- Modèle réutilisable (mis en commentaire — ne s'exécute PAS avec le
-- reste du schéma). Copiez ce bloc à part dans une nouvelle requête
-- SQL Editor, remplacez PASTE_JSON_HERE par le JSON reçu, puis exécutez.
--
-- insert into interventions
--   (titre, categorie, sous_categorie, description, objectifs, troubles, stades,
--    contextes, duree, materiel, protocole, etapes, erreurs, contre_indications,
--    niveau_preuve, sources, mots_cles, date_maj)
-- select
--   titre, categorie, sous_categorie, description, objectifs, troubles, stades,
--   contextes, duree, materiel, protocole, etapes, erreurs, contre_indications,
--   niveau_preuve, sources, mots_cles, date_maj
-- from json_to_recordset($$
-- PASTE_JSON_HERE
-- $$::json)
-- as x(
--   titre text, categorie text, sous_categorie text, description text, objectifs text,
--   troubles text[], stades text[], contextes text[], duree text, materiel text[],
--   protocole text, etapes text[], erreurs text[], contre_indications text[],
--   niveau_preuve int, sources text[], mots_cles text[], date_maj text
-- );

-- Exemple concret à tester en premier (remplace PASTE_JSON_HERE) :
--
-- [
--   {
--     "titre": "Massage des mains",
--     "categorie": "Toucher / Massage",
--     "description": "Massage doux des mains et avant-bras avec une crème hydratante.",
--     "troubles": ["Agitation", "Anxiété"],
--     "stades": ["Léger", "Modéré", "Sévère"],
--     "duree": "8 min",
--     "materiel": ["Crème hydratante"],
--     "etapes": ["Observer le consentement", "S'installer au calme", "Masser doucement", "Arrêter si inconfort"],
--     "niveau_preuve": 5,
--     "sources": ["HAS"]
--   }
-- ]

-- ============================================================
-- NIVEAU 1 — STRUCTURES, QUOTAS DE COMPTES, ADMIN D'ÉQUIPE
-- ============================================================
-- Chaque compte (profiles) peut être rattaché à une structure via un
-- code d'invitation transmis à l'inscription. Le quota est vérifié et
-- bloqué au niveau de la base de données (pas juste côté app), donc
-- infranchissable même en contournant l'interface.
--
-- Sans code d'invitation valide : le compte reste "gratuit" (plan =
-- 'gratuit'), sans structure, et l'app ne lui donne accès qu'à un
-- échantillon de la bibliothèque.
-- ============================================================

create table if not exists structures (
  id bigint generated always as identity primary key,
  nom text not null,
  code_invitation text not null unique,
  quota int not null default 10,
  created_at timestamptz default now()
);
alter table structures enable row level security;

-- Ajout des colonnes de rattachement sur profiles (idempotent)
alter table profiles add column if not exists structure_id bigint references structures(id);
alter table profiles add column if not exists role text default 'membre' check (role in ('admin','membre'));
alter table profiles add column if not exists actif boolean default true;
alter table profiles add column if not exists plan text default 'gratuit' check (plan in ('gratuit','payant_manuel','structure'));
-- super_admin = vous (l'éditeur d'Apézeo) : peut créer des structures et
-- promouvoir n'importe quel compte, depuis l'écran "Créer une structure".
alter table profiles add column if not exists super_admin boolean default false;

-- Fonctions "security definer" : elles contournent volontairement la RLS
-- UNIQUEMENT pour cette vérification précise, ce qui évite le piège classique
-- des policies sur `profiles` qui s'auto-référencent (boucle infinie /
-- "infinite recursion detected in policy" — une erreur Postgres bien connue
-- quand une policy sur une table interroge cette même table directement).
create or replace function public.is_admin_of(uid uuid, sid bigint)
returns boolean language sql security definer stable
set search_path = public, pg_temp as $$
  select exists (select 1 from public.profiles where id = uid and role = 'admin' and structure_id = sid);
$$;

create or replace function public.my_structure_id(uid uuid)
returns bigint language sql security definer stable
set search_path = public, pg_temp as $$
  select structure_id from public.profiles where id = uid and role = 'admin';
$$;

create or replace function public.is_super_admin(uid uuid)
returns boolean language sql security definer stable
set search_path = public, pg_temp as $$
  select coalesce((select super_admin from public.profiles where id = uid), false);
$$;

-- STRUCTURES : un admin voit sa structure, un super-admin voit et crée tout.
drop policy if exists "Admin voit sa structure, super-admin voit tout" on structures;
create policy "Admin voit sa structure, super-admin voit tout"
  on structures for select
  using (id = public.my_structure_id(auth.uid()) or public.is_super_admin(auth.uid()));

drop policy if exists "Super-admin crée des structures" on structures;
create policy "Super-admin crée des structures"
  on structures for insert
  with check (public.is_super_admin(auth.uid()));

drop policy if exists "Super-admin modifie les structures" on structures;
create policy "Super-admin modifie les structures"
  on structures for update
  using (public.is_super_admin(auth.uid()));

-- PROFILES : chacun voit/modifie le sien ; un admin voit/gère son équipe ;
-- un super-admin voit et modifie tous les comptes (pour les rattacher à
-- une structure et promouvoir un premier admin).
drop policy if exists "Un utilisateur voit son propre profil" on profiles;
drop policy if exists "Un utilisateur modifie son propre profil" on profiles;
drop policy if exists "Voir son profil ou ceux de son équipe si admin" on profiles;
drop policy if exists "Modifier son profil ou ceux de son équipe si admin" on profiles;

drop policy if exists "Voir son profil, son équipe si admin, ou tout si super-admin" on profiles;
create policy "Voir son profil, son équipe si admin, ou tout si super-admin"
  on profiles for select
  using (
    auth.uid() = id
    or structure_id = public.my_structure_id(auth.uid())
    or public.is_super_admin(auth.uid())
  );

drop policy if exists "Modifier son profil, son équipe si admin, ou tout si super-admin" on profiles;
create policy "Modifier son profil, son équipe si admin, ou tout si super-admin"
  on profiles for update
  using (
    auth.uid() = id
    or (structure_id = public.my_structure_id(auth.uid()) and role <> 'admin')
    or public.is_super_admin(auth.uid())
  );

-- Fonction publique (sans exposer la table structures) permettant à
-- l'écran d'inscription de vérifier un code AVANT de créer le compte,
-- pour un message d'erreur immédiat côté utilisateur.
create or replace function public.check_invitation_code(p_code text)
returns table(valid boolean, structure_nom text, places_restantes int)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_structure public.structures;
  v_count int;
begin
  select * into v_structure from public.structures where code_invitation = p_code;
  if not found then
    return query select false, null::text, null::int;
    return;
  end if;
  select count(*) into v_count from public.profiles where structure_id = v_structure.id and actif = true;
  return query select true, v_structure.nom, greatest(v_structure.quota - v_count, 0);
end;
$$;
grant execute on function public.check_invitation_code(text) to anon, authenticated;

-- Le vrai verrou : ce trigger remplace la création automatique du profil.
-- S'il y a un code d'invitation invalide ou un quota dépassé, il lève une
-- exception qui annule TOUTE la création de compte (y compris côté auth) —
-- c'est le blocage réel, pas une simple vérification d'interface.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_code text;
  v_structure public.structures;
  v_count int;
begin
  v_code := nullif(trim(new.raw_user_meta_data->>'code_invitation'), '');

  if v_code is not null then
    select * into v_structure from public.structures where code_invitation = v_code;
    if not found then
      raise exception 'Code d''invitation invalide.';
    end if;

    select count(*) into v_count from public.profiles where structure_id = v_structure.id and actif = true;
    if v_count >= v_structure.quota then
      raise exception 'Cette structure a atteint son quota de comptes. Contactez votre administrateur.';
    end if;

    insert into public.profiles (id, email, profession, structure_id, role, plan)
    values (new.id, new.email, new.raw_user_meta_data->>'profession', v_structure.id, 'membre', 'structure');
  else
    insert into public.profiles (id, email, profession, plan)
    values (new.id, new.email, new.raw_user_meta_data->>'profession', 'gratuit');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- ============================================================
-- CRÉER UNE STRUCTURE + PROMOUVOIR SON PREMIER COMPTE ADMIN
-- Modèle à copier/adapter à chaque nouveau client B2B.
-- ============================================================
--
-- insert into structures (nom, code_invitation, quota)
--   values ('EHPAD Les Tilleuls', 'TILLEULS-4X9K', 30);
--
-- update profiles set role = 'admin', plan = 'structure',
--   structure_id = (select id from structures where code_invitation = 'TILLEULS-4X9K')
--   where email = 'directeur@example.com';

-- ============================================================
-- VOUS PROMOUVOIR SUPER-ADMIN (à exécuter une seule fois, sur votre
-- propre compte, une fois inscrit dans l'app)
-- ============================================================
--
-- update profiles set super_admin = true where email = 'votre@email.fr';
--
-- Une fois fait, l'écran "Créer une structure" apparaît dans l'app pour
-- votre compte, et remplace le besoin de taper le bloc SQL ci-dessus à
-- chaque nouveau client.

-- ============================================================
-- RATTACHER UN COMPTE EXISTANT À UNE STRUCTURE (auto-service admin)
-- ============================================================
-- Permet à l'admin d'une structure de rattacher, depuis l'app, un
-- compte déjà créé (inscrit sans code d'invitation) — sans repasser
-- par le SQL Editor. Le vrai verrou (quota, appartenance déjà
-- existante à une autre structure) est fait ICI, côté base de
-- données, pas seulement côté interface.

create or replace function public.attach_existing_account(p_email text)
returns table(success boolean, message text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_structure_id bigint;
  v_structure public.structures;
  v_target public.profiles;
  v_count int;
begin
  -- Le compte qui appelle doit être admin d'une structure
  select structure_id into v_caller_structure_id
  from public.profiles where id = auth.uid() and role = 'admin';

  if v_caller_structure_id is null then
    return query select false, 'Seul un administrateur de structure peut rattacher un compte.';
    return;
  end if;

  select * into v_structure from public.structures where id = v_caller_structure_id;

  select * into v_target from public.profiles where email = p_email;
  if not found then
    return query select false, 'Aucun compte trouvé avec cet e-mail. La personne doit d''abord créer son compte dans l''app.';
    return;
  end if;

  if v_target.structure_id is not null then
    return query select false, 'Ce compte est déjà rattaché à une structure. Détachez-le d''abord si besoin.';
    return;
  end if;

  select count(*) into v_count from public.profiles
    where structure_id = v_structure.id and actif = true;
  if v_count >= v_structure.quota then
    return query select false, 'Quota de comptes atteint pour votre structure.';
    return;
  end if;

  update public.profiles
    set structure_id = v_structure.id, role = 'membre', plan = 'structure'
    where id = v_target.id;

  return query select true, 'Compte rattaché avec succès.';
end;
$$;

grant execute on function public.attach_existing_account(text) to authenticated;

-- ============================================================
-- SUSPENSION ET SUPPRESSION D'UNE STRUCTURE (super-admin uniquement)
-- ============================================================

alter table structures add column if not exists suspended boolean not null default false;

-- Une structure suspendue ne peut plus accueillir de nouvelles inscriptions.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_code text;
  v_structure public.structures;
  v_count int;
begin
  v_code := nullif(trim(new.raw_user_meta_data->>'code_invitation'), '');

  if v_code is not null then
    select * into v_structure from public.structures where code_invitation = v_code;
    if not found then
      raise exception 'Code d''invitation invalide.';
    end if;

    if v_structure.suspended then
      raise exception 'Cette structure est actuellement suspendue. Contactez votre administrateur.';
    end if;

    select count(*) into v_count from public.profiles where structure_id = v_structure.id and actif = true;
    if v_count >= v_structure.quota then
      raise exception 'Cette structure a atteint son quota de comptes. Contactez votre administrateur.';
    end if;

    insert into public.profiles (id, email, profession, structure_id, role, plan)
    values (new.id, new.email, new.raw_user_meta_data->>'profession', v_structure.id, 'membre', 'structure');
  else
    insert into public.profiles (id, email, profession, plan)
    values (new.id, new.email, new.raw_user_meta_data->>'profession', 'gratuit');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- Suspendre ou réactiver une structure entière : bascule le statut de
-- TOUS les comptes de la structure en même temps (actif <-> inactif),
-- en plus de bloquer/débloquer les nouvelles inscriptions via le code.
create or replace function public.set_structure_suspended(p_structure_id bigint, p_suspend boolean)
returns table(success boolean, message text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    return query select false, 'Action réservée au super-administrateur.';
    return;
  end if;

  update public.structures set suspended = p_suspend where id = p_structure_id;
  update public.profiles set actif = not p_suspend where structure_id = p_structure_id and role <> 'admin';

  return query select true, case when p_suspend then 'Structure suspendue.' else 'Structure réactivée.' end;
end;
$$;

grant execute on function public.set_structure_suspended(bigint, boolean) to authenticated;

-- Supprimer une structure : détache proprement tous ses comptes (ils
-- redeviennent des comptes "gratuit", ne sont jamais supprimés eux-mêmes)
-- avant de supprimer la structure, pour éviter toute erreur de
-- contrainte de clé étrangère.
create or replace function public.delete_structure(p_structure_id bigint)
returns table(success boolean, message text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    return query select false, 'Action réservée au super-administrateur.';
    return;
  end if;

  update public.profiles
    set structure_id = null, role = 'membre', plan = 'gratuit'
    where structure_id = p_structure_id;

  delete from public.structures where id = p_structure_id;

  return query select true, 'Structure supprimée. Les comptes rattachés repassent en accès découverte.';
end;
$$;

grant execute on function public.delete_structure(bigint) to authenticated;

-- ============================================================
-- NIVEAU DE DÉTAIL : STANDARD / EXPERT
-- ============================================================
-- niveau_detail : 'standard' (par défaut, tout le contenu existant)
-- ou 'expert' (contenu plus dense, réservé aux comptes payants).
--
-- technique_id : identifiant texte optionnel permettant de relier une
-- fiche standard à sa version experte du MÊME sujet (ex. 'musique-preferee').
-- Laissé vide pour une fiche experte totalement inédite, sans équivalent
-- standard, ou pour une fiche standard qui n'a pas (encore) de version
-- experte associée.

alter table interventions add column if not exists niveau_detail text not null default 'standard' check (niveau_detail in ('standard','expert'));
alter table interventions add column if not exists technique_id text;
create index if not exists idx_interventions_technique_id on interventions(technique_id);

-- ============================================================
-- FICHES "MACRO" — synthèse renvoyant vers plusieurs techniques
-- atomiques précises (ex. COM-000 "Créer un premier contact apaisant"
-- renvoie vers COM-002, COM-003, COM-005, COM-007).
-- ============================================================
-- techniques_liees : tableau de technique_id référencés par CETTE
-- fiche (généralement une fiche "macro" de synthèse). Vide/absent pour
-- une fiche atomique classique.

alter table interventions add column if not exists techniques_liees text[];

-- ============================================================
-- CHARTE APÉZEO EXPERT (V1) — champs additionnels
-- ============================================================
-- Tous nullables : n'affectent en rien les 833 fiches standard
-- existantes. Remplis uniquement pour les fiches niveau_detail='expert'
-- rédigées selon la charte.

alter table interventions add column if not exists objectifs_observables text[]; -- 5 objectifs observables (liste), distinct du champ "objectifs" (paragraphe) déjà existant
alter table interventions add column if not exists temps_mise_en_oeuvre text;
alter table interventions add column if not exists frequence text;
alter table interventions add column if not exists preparation text[];
alter table interventions add column if not exists adaptation_stade text;
alter table interventions add column if not exists conditions_favorables text[];
alter table interventions add column if not exists points_vigilance text[]; -- chaque entrée inclut son explication
alter table interventions add column if not exists precautions text[];
alter table interventions add column if not exists fondements text; -- "Principe → Application"
alter table interventions add column if not exists points_cles text[]; -- 4-5 puces de synthèse

-- ============================================================
-- CHARTE APÉZEO EXPERT — AJUSTEMENT V1.0 (structure exacte du gabarit)
-- ============================================================
-- points_vigilance, fondements et adaptation_stade avaient été prévus
-- trop simples (texte/liste plate) ; le gabarit final est plus riche
-- (objets structurés).
--
-- Correctif important : les premières versions de ce bloc utilisaient
-- "drop column" puis "add column" SANS "if not exists" sur certaines
-- lignes. Résultat concret : 1) une erreur "column already exists" à
-- la réexécution (fondement_principe/application), et surtout 2) le
-- risque bien plus grave d'effacer purement et simplement les données
-- de "points_vigilance" des fiches déjà importées à chaque nouvelle
-- exécution du script (drop + recréation vide). Corrigé ci-dessous :
-- tout passe en "add column if not exists", aucune perte de données,
-- rejouable à l'infini sans risque.

alter table interventions add column if not exists points_vigilance jsonb; -- [{ "point": "...", "explication": "..." }]

alter table interventions add column if not exists fondement_principe text;
alter table interventions add column if not exists fondement_application text;

alter table interventions add column if not exists adaptation_stades jsonb; -- { "leger": [...], "modere": [...], "severe": [...] }

-- Nouveaux champs structurés du gabarit, absents jusqu'ici
alter table interventions add column if not exists deroulement jsonb; -- [{ "etape": 1, "titre": "...", "description": "..." }]
alter table interventions add column if not exists erreurs_frequentes jsonb; -- [{ "erreur": "...", "pourquoi": "..." }]

-- Suivi de version du gabarit (charte Apézeo Expert)
alter table interventions add column if not exists version text; -- ex. "1.0"

-- ============================================================
-- TYPE DE FICHE : Concept (macro, ~10-15% de la base experte) ou
-- Technique (geste précis, ~85-90%)
-- ============================================================
alter table interventions add column if not exists type_fiche text default 'technique' check (type_fiche in ('concept','technique'));

-- ============================================================
-- SWITCH GLOBAL STANDARD / EXPERT (au niveau du compte, pas de la fiche)
-- ============================================================
-- Les deux bibliothèques ont des architectures trop différentes pour
-- être reliées fiche par fiche. On bascule donc l'affichage au niveau
-- du compte utilisateur : "standard" (833 fiches historiques) ou
-- "expert" (nouveau référentiel dense). Réservé aux comptes payants
-- (plan='structure') côté application — vérifié côté interface.

alter table profiles add column if not exists affichage text not null default 'standard' check (affichage in ('standard','expert'));

-- Nouveau champ de la charte : comment évaluer l'efficacité d'une technique
alter table interventions add column if not exists comment_evaluer_efficacite text[];

-- (evaluation_efficacite : voir comment_evaluer_efficacite plus haut dans ce fichier, déjà présent — pas de doublon)

-- ============================================================
-- GARDE-FOU CONTRE LES DOUBLONS D'IMPORT
-- ============================================================
-- Empêche qu'un même technique_id soit importé deux fois par erreur.
-- Les fiches standard (technique_id = null) ne sont pas concernées :
-- une contrainte "unique" en SQL autorise autant de valeurs NULL que
-- l'on veut, elle ne s'applique qu'aux vraies valeurs renseignées.
-- Nécessite d'abord que les doublons existants soient nettoyés
-- (voir nettoyer_doublons.sql) sinon cette ligne échouera.

alter table interventions
  drop constraint if exists interventions_technique_id_unique,
  add constraint interventions_technique_id_unique unique (technique_id);

-- ============================================================
-- MODÈLE D'IMPORT DÉSORMAIS UTILISÉ (upsert, jamais de doublon)
-- ============================================================
-- Tous les imports de fiches Expert utilisent maintenant
-- "on conflict (technique_id) do update" au lieu d'un simple insert.
-- Concrètement : si vous relancez deux fois le même fichier d'import,
-- ou si un lot en écrase un autre par erreur, la fiche existante est
-- simplement MISE À JOUR avec le nouveau contenu — jamais dupliquée,
-- jamais d'erreur bloquante. Modèle (à titre indicatif, chaque
-- fichier d'import livré suit déjà cette structure) :
--
-- insert into interventions (technique_id, titre, ...)
-- select technique_id, titre, ... from json_to_recordset($$ ... $$::json) as x(...)
-- on conflict (technique_id) do update set
--   titre = excluded.titre,
--   description = excluded.description,
--   -- ... (tous les autres champs) ...
--   date_maj = excluded.date_maj;

-- ============================================================
-- SUPPRESSION DE COMPTE EN LIBRE-SERVICE
-- ============================================================
-- L'utilisateur ne peut supprimer que SON PROPRE compte (auth.uid()),
-- jamais celui d'un tiers. La suppression de la ligne auth.users
-- entraîne automatiquement, par cascade déjà en place, celle de
-- profiles, favoris, historique et fiches_personnelles.

create or replace function public.delete_own_account()
returns table(success boolean, message text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return query select false, 'Non authentifié.';
    return;
  end if;
  delete from auth.users where id = auth.uid();
  return query select true, 'Compte supprimé.';
end;
$$;

grant execute on function public.delete_own_account() to authenticated;

-- ============================================================
-- STATISTIQUES D'USAGE COLLECTIVES (par structure, jamais par personne)
-- ============================================================
-- Un simple compteur par fiche et par structure, incrémenté à chaque
-- consultation. Aucune donnée individuelle : impossible de savoir QUI
-- a consulté quoi, seulement COMBIEN de fois une fiche a été ouverte
-- au sein d'une structure sur le mois en cours.

create table if not exists fiche_vues (
  id bigint generated always as identity primary key,
  fiche_ref text not null,
  structure_id bigint references structures(id) on delete cascade,
  mois text not null,
  vues int not null default 0,
  unique (fiche_ref, structure_id, mois)
);
alter table fiche_vues enable row level security;

-- Même principe que fiche_vues, mais agrégé par semaine ISO plutôt
-- que par mois — permet un suivi de tendance plus rapproché
-- (nombre de clics par semaine) sans recalculer l'historique.
create table if not exists fiche_vues_semaine (
  id bigint generated always as identity primary key,
  fiche_ref text not null,
  structure_id bigint references structures(id) on delete cascade,
  semaine text not null, -- format ISO 'YYYY-"W"WW', ex. '2026-W33'
  vues int not null default 0,
  unique (fiche_ref, structure_id, semaine)
);
alter table fiche_vues_semaine enable row level security;

-- Enregistre une consultation. Ne fait rien si le compte n'est
-- rattaché à aucune structure (comptes gratuits) : pas de collecte
-- inutile dans ce cas.
create or replace function public.enregistrer_vue(p_fiche_ref text)
returns void language plpgsql security definer
set search_path = public, pg_temp as $$
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
  values (p_fiche_ref, v_structure_id, to_char(now(), 'IYYY-"S"IW'), 1)
  on conflict (fiche_ref, structure_id, semaine) do update set vues = fiche_vues_semaine.vues + 1;
end;
$$;
grant execute on function public.enregistrer_vue(text) to authenticated;

-- Renvoie le top 5 des fiches les plus consultées ce mois-ci, pour la
-- structure de l'administrateur qui appelle — jamais celle d'un autre.
create or replace function public.top_fiches_structure()
returns table(fiche_ref text, vues int)
language sql security definer stable
set search_path = public, pg_temp as $$
  select fv.fiche_ref, fv.vues
  from public.fiche_vues fv
  where fv.structure_id = public.my_structure_id(auth.uid())
    and fv.mois = to_char(now(), 'YYYY-MM')
  order by fv.vues desc
  limit 5;
$$;
grant execute on function public.top_fiches_structure() to authenticated;

-- Renvoie le nombre total de consultations cette semaine et la
-- semaine précédente, pour la structure de l'administrateur —
-- utilisé pour afficher une tendance hebdomadaire simple.
create or replace function public.vues_semaine_structure()
returns table(semaine text, total_vues bigint)
language sql security definer stable
set search_path = public, pg_temp as $$
  select fvs.semaine, sum(fvs.vues) as total_vues
  from public.fiche_vues_semaine fvs
  where fvs.structure_id = public.my_structure_id(auth.uid())
    and fvs.semaine in (to_char(now(), 'IYYY-"S"IW'), to_char(now() - interval '7 days', 'IYYY-"S"IW'))
  group by fvs.semaine
  order by fvs.semaine desc;
$$;
grant execute on function public.vues_semaine_structure() to authenticated;

-- ============================================================
-- OUTILS SPÉCIFIQUES
-- ============================================================
-- Nouveau module distinct des fiches "technique" : des outils
-- matériels utilisés en soutien des approches non médicamenteuses
-- (poupée d'empathie, luminothérapie, animal robotisé, etc.).
-- Structure volontairement plus simple : indication, contre-indication,
-- précautions, et un croquis (SVG neutre, jamais un produit/marque
-- existant) plutôt qu'un déroulement en étapes.
--
-- type_fiche gagne une 3e valeur possible : 'outil'.

alter table interventions drop constraint if exists interventions_type_fiche_check;
alter table interventions add constraint interventions_type_fiche_check
  check (type_fiche in ('concept','technique','outil'));

alter table interventions add column if not exists outil_type text; -- ex. "Poupées et peluches thérapeutiques"
alter table interventions add column if not exists indication text;
alter table interventions add column if not exists contre_indication_outil text[];
alter table interventions add column if not exists precautions_particulieres text[];
alter table interventions add column if not exists croquis_svg text; -- code SVG du croquis, généré par Claude, jamais un produit de marque
alter table interventions add column if not exists croquis_url text; -- image réelle du croquis (base64 ou URL hébergée), prioritaire sur croquis_svg si les deux sont présents
alter table interventions add column if not exists alerte_outil text; -- alerte réglementaire/sécuritaire mise en avant (ex. statut de contention physique passive), affichée en évidence, distincte des précautions habituelles

-- ============================================================
-- ESSAI GRATUIT À DURÉE LIMITÉE POUR LES STRUCTURES
-- ============================================================
-- essai_duree_semaines = NULL : pas d'essai en cours (structure payante
-- confirmée, ou durée pas encore fixée) -> jamais verrouillée automatiquement.
-- essai_duree_semaines = 6, par exemple : décompte automatique depuis
-- created_at, pas de nouvelle date à saisir séparément.
alter table structures add column if not exists essai_duree_semaines int;

-- Vérifie l'état de l'essai d'une structure et, s'il vient d'expirer,
-- verrouille réellement l'accès : réutilise le même mécanisme que la
-- suspension manuelle (suspended = true + actif = false sur TOUS les
-- membres, y compris l'admin, car l'essai concerne toute la structure).
-- Idempotent : si déjà expiré/suspendu, ne refait rien mais continue de
-- renvoyer expire = true pour que l'app affiche le bon message.
create or replace function public.verifier_essai(p_structure_id bigint)
returns table(expire boolean, jours_restants int)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_structure public.structures;
  v_fin timestamptz;
  v_jours int;
begin
  select * into v_structure from public.structures where id = p_structure_id;

  if not found or v_structure.essai_duree_semaines is null then
    return query select false, null::int;
    return;
  end if;

  v_fin := v_structure.created_at + (v_structure.essai_duree_semaines || ' weeks')::interval;
  v_jours := ceil(extract(epoch from (v_fin - now())) / 86400)::int;

  if now() >= v_fin then
    if not v_structure.suspended then
      update public.structures set suspended = true where id = p_structure_id;
      update public.profiles set actif = false where structure_id = p_structure_id;
    end if;
    return query select true, greatest(v_jours, 0);
  else
    return query select false, v_jours;
  end if;
end;
$$;

grant execute on function public.verifier_essai(bigint) to authenticated;

-- ============================================================
-- STATISTIQUES SUPER-ADMIN — usage de la bibliothèque
-- ============================================================
-- fiche_vues a RLS activée sans aucune policy (lecture bloquée par
-- défaut), donc seule cette fonction security definer peut l'agréger,
-- et seulement pour un super-admin.
create or replace function public.stats_usage_bibliotheque()
returns jsonb
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_mois text := to_char(now(), 'YYYY-MM');
  result jsonb;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Accès réservé au super-admin';
  end if;

  select jsonb_build_object(
    'total_vues_mois', coalesce((select sum(vues) from fiche_vues where mois = v_mois), 0),
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
    'fiches_jamais_consultees', (
      select count(*) from interventions i
      where not exists (select 1 from fiche_vues fv where fv.fiche_ref = i.titre)
    ),
    'total_fiches', (select count(*) from interventions)
  ) into result;

  return result;
end;
$$;
grant execute on function public.stats_usage_bibliotheque() to authenticated;
