-- ============================================================
-- MODULE SIMULATEUR D'ENTRAÎNEMENT — Apézeo
-- Schéma dédié "simulateur" (voir justification dans la réponse)
-- Ne modifie ni ne supprime rien dans public.* — ne fait que lire
-- structures.id et profiles.id/structure_id/super_admin en référence.
--
-- HYPOTHÈSES à confirmer avant exécution (ajustez si besoin) :
--   - public.profiles.id = auth.uid() (clé = uuid Supabase Auth)
--   - public.profiles.structure_id référence public.structures.id
--   - public.profiles.super_admin (boolean) existe et identifie les
--     comptes Apézeo habilités à activer/suspendre l'accès et à
--     configurer les quotas (équivalent d'un rôle "opérateur")
--   - l'extension pgcrypto (gen_random_uuid) est déjà active sur le
--     projet (c'est le cas par défaut sur Supabase)
-- ============================================================

create schema if not exists simulateur;

-- ------------------------------------------------------------
-- 1. Paliers de quota (référentiel configurable, pas de code en dur)
-- ------------------------------------------------------------
create table simulateur.paliers (
  code text primary key,                     -- 'essai', 'starter', 'pro', 'entreprise'
  libelle text not null,
  quota_echanges_mensuel integer not null,    -- nb d'échanges (tours de dialogue) autorisés / mois
  quota_sessions_mensuel integer,             -- optionnel : nb de sessions distinctes / mois
  prix_mensuel_eur numeric(10,2),
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

insert into simulateur.paliers (code, libelle, quota_echanges_mensuel, quota_sessions_mensuel, prix_mensuel_eur, description) values
  ('essai',      'Essai gratuit', 50,   5,   0,    'Palier découverte, très restreint, limité dans le temps'),
  ('starter',    'Starter',       500,  40,  49,   'Palier payant d''entrée'),
  ('pro',        'Pro',           2000, 150, 149,  'Palier payant intermédiaire'),
  ('entreprise', 'Entreprise',    8000, 600, 399,  'Palier payant pour grandes structures / groupes');

-- ------------------------------------------------------------
-- 1bis. Thématiques et scénarios cliniques (contenu sensible du
--   simulateur : entièrement en base, jamais dans le code front)
-- ------------------------------------------------------------
create table simulateur.themes (
  code text primary key,                       -- 'desorientation', 'soins', 'reconnaissance'...
  nom text not null,
  description text,
  icone text,                                   -- nom d'icône utilisé côté front ('clock','drop'...)
  ordre integer not null default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table simulateur.scenarios (
  code text primary key,                        -- 'lucienne', 'henri', 'georgette'...
  theme_code text not null references simulateur.themes(code) on delete cascade,
  nom text not null,                             -- 'Lucienne R.'
  age integer,
  difficulte text not null check (difficulte in ('facile','intermediaire','expert')),
  contexte text,                                 -- ligne courte ('Alzheimer stade modéré · déjeuner')
  accroche text,                                 -- tagline d'accroche affichée sur la carte
  initiales text,
  humeur_initiale text,                          -- 'anxieuse', 'calme', 'opposante'...
  replique_ouverture text not null,              -- réplique fixe qui démarre la session
  profil_clinique text not null,                 -- brief comportemental complet transmis à l'IA
  ordre integer not null default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_scenarios_theme on simulateur.scenarios(theme_code);

-- Contenu des 7 thématiques x 3 scénarios : à insérer une fois le contenu
-- clinique complet des 21 fiches récupéré (transmis partiellement à ce
-- stade — cf. échange en cours). Ne pas exécuter les tables ci-dessus sans
-- prévoir cet INSERT juste après, sans quoi l'app n'aura rien à afficher.

-- ------------------------------------------------------------
-- 2. Accès au simulateur par structure (activation / statut / palier)
-- ------------------------------------------------------------
create table simulateur.acces_structure (
  structure_id bigint primary key references public.structures(id) on delete cascade,
  statut text not null default 'essai' check (statut in ('essai','actif','suspendu')),
  palier text not null default 'essai' references simulateur.paliers(code),
  quota_echanges_mensuel_override integer,    -- si non-null, écrase le quota par défaut du palier
  date_debut_essai date default current_date,
  date_fin_essai date,
  date_activation date,                       -- passage en 'actif' (payant)
  date_suspension date,
  active_par uuid references public.profiles(id),   -- admin Apézeo ayant fait la dernière modification
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_acces_structure_statut on simulateur.acces_structure(statut);

-- ------------------------------------------------------------
-- 3. Sessions de simulation (une ligne = une mise en situation jouée)
-- ------------------------------------------------------------
create table simulateur.sessions (
  id uuid primary key default gen_random_uuid(),
  structure_id bigint not null references public.structures(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  theme_code text references simulateur.themes(code),
  scenario_code text references simulateur.scenarios(code),
  difficulte text check (difficulte in ('facile','intermediaire','expert')),  -- dupliqué du scénario
                                                -- à l'insertion, pour garder l'historique correct même
                                                -- si le contenu du scénario est modifié plus tard
  statut text not null default 'en_cours' check (statut in ('en_cours','terminee','abandonnee')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duree_secondes integer,
  nb_echanges integer not null default 0,      -- nb d'échanges soignant→résident complets, maj par trigger
  score numeric(5,2),                          -- somme des deltas (-2 à +2) de tous les échanges
  -- bilan jsonb attendu : { "niveau_global": "À renforcer|Convenable|Bonne pratique|Excellent",
  --   "resume": "...", "points_forts": ["..."], "axes_travail": ["..."],
  --   "conseil_prochaine_session": "..." }
  bilan jsonb,
  tokens_input integer not null default 0,
  tokens_output integer not null default 0,
  cout_estime_usd numeric(10,4) not null default 0,
  created_at timestamptz not null default now()
);

create index idx_sessions_structure on simulateur.sessions(structure_id);
create index idx_sessions_user on simulateur.sessions(user_id);
create index idx_sessions_started_at on simulateur.sessions(started_at);

-- ------------------------------------------------------------
-- 4. Messages échangés (granularité fine : coût réel, rejeu, audit)
-- ------------------------------------------------------------
create table simulateur.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references simulateur.sessions(id) on delete cascade,
  role text not null check (role in ('utilisateur','resident_ia','systeme')),
  contenu text not null,
  -- évaluation de la réplique du soignant (role='utilisateur' uniquement,
  -- null pour 'resident_ia'/'systeme') : delta -2..+2, tag court, explication pédagogique
  score_delta smallint check (score_delta between -2 and 2),
  score_tag text,
  score_explication text,
  tokens_input integer not null default 0,
  tokens_output integer not null default 0,
  cout_estime_usd numeric(10,6) not null default 0,   -- calculé côté appli au moment de l'appel API
  created_at timestamptz not null default now()
);

create index idx_messages_session on simulateur.messages(session_id);

-- ------------------------------------------------------------
-- 5. Usage mensuel agrégé par structure (pour vérifier le quota vite,
--    sans scanner tout l'historique) — alimenté uniquement par triggers
-- ------------------------------------------------------------
create table simulateur.usage_mensuel (
  structure_id bigint not null references public.structures(id) on delete cascade,
  annee_mois date not null,                    -- toujours le 1er du mois, ex '2026-09-01'
  nb_echanges_consommes integer not null default 0,
  nb_sessions integer not null default 0,
  cout_estime_usd numeric(10,4) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (structure_id, annee_mois)
);

-- ============================================================
-- FONCTIONS ET TRIGGERS DE MAINTIEN DU COMPTEUR D'USAGE
-- (toutes en SECURITY DEFINER : un utilisateur normal n'a pas et
--  n'a pas besoin d'un droit d'écriture direct sur usage_mensuel)
-- ============================================================

create or replace function simulateur.fn_maj_usage_session()
returns trigger
language plpgsql
security definer
set search_path = public, simulateur
as $$
declare
  v_mois date := date_trunc('month', new.started_at)::date;
begin
  insert into simulateur.usage_mensuel (structure_id, annee_mois, nb_sessions)
  values (new.structure_id, v_mois, 1)
  on conflict (structure_id, annee_mois)
  do update set nb_sessions = simulateur.usage_mensuel.nb_sessions + 1, updated_at = now();
  return new;
end;
$$;

create trigger trg_maj_usage_session
after insert on simulateur.sessions
for each row execute function simulateur.fn_maj_usage_session();


create or replace function simulateur.fn_maj_usage_message()
returns trigger
language plpgsql
security definer
set search_path = public, simulateur
as $$
declare
  v_structure_id bigint;
  v_mois date := date_trunc('month', new.created_at)::date;
  -- un "échange" = une réplique du résident IA (compte 1 fois par tour,
  -- pas à chaque ligne de la table messages, qui contient aussi les
  -- messages 'utilisateur' et 'systeme')
  v_incr_echange integer := case when new.role = 'resident_ia' then 1 else 0 end;
begin
  select structure_id into v_structure_id from simulateur.sessions where id = new.session_id;

  insert into simulateur.usage_mensuel (structure_id, annee_mois, nb_echanges_consommes, cout_estime_usd)
  values (v_structure_id, v_mois, v_incr_echange, new.cout_estime_usd)
  on conflict (structure_id, annee_mois)
  do update set nb_echanges_consommes = simulateur.usage_mensuel.nb_echanges_consommes + v_incr_echange,
                cout_estime_usd = simulateur.usage_mensuel.cout_estime_usd + new.cout_estime_usd,
                updated_at = now();

  update simulateur.sessions
     set nb_echanges = nb_echanges + v_incr_echange,
         tokens_input = tokens_input + new.tokens_input,
         tokens_output = tokens_output + new.tokens_output,
         cout_estime_usd = cout_estime_usd + new.cout_estime_usd
   where id = new.session_id;

  return new;
end;
$$;

create trigger trg_maj_usage_message
after insert on simulateur.messages
for each row execute function simulateur.fn_maj_usage_message();

-- ============================================================
-- FONCTION DE VÉRIFICATION DU QUOTA (appelée par l'appli avant
-- de démarrer une session, et par le trigger de garde-fou ci-dessous)
-- ============================================================
create or replace function simulateur.verifier_quota(p_structure_id bigint)
returns table (
  autorise boolean,
  statut text,
  palier text,
  quota_echanges_mensuel integer,
  echanges_consommes integer,
  quota_restant integer
)
language plpgsql
security definer
set search_path = public, simulateur
as $$
declare
  v_acces simulateur.acces_structure%rowtype;
  v_quota integer;
  v_consomme integer;
  v_mois date := date_trunc('month', now())::date;
begin
  select * into v_acces from simulateur.acces_structure where structure_id = p_structure_id;

  if v_acces.structure_id is null or v_acces.statut = 'suspendu' then
    return query select false, coalesce(v_acces.statut, 'non_active'), v_acces.palier, 0, 0, 0;
    return;
  end if;

  select coalesce(v_acces.quota_echanges_mensuel_override, p.quota_echanges_mensuel)
    into v_quota
    from simulateur.paliers p where p.code = v_acces.palier;

  select coalesce(um.nb_echanges_consommes, 0) into v_consomme
    from simulateur.usage_mensuel um
   where um.structure_id = p_structure_id and um.annee_mois = v_mois;

  v_consomme := coalesce(v_consomme, 0);

  return query select
    (v_consomme < v_quota) as autorise,
    v_acces.statut,
    v_acces.palier,
    v_quota,
    v_consomme,
    greatest(v_quota - v_consomme, 0);
end;
$$;

-- Garde-fou côté serveur : impossible de démarrer une session si le
-- quota est déjà atteint ou l'accès non actif, même en contournant l'appli.
create or replace function simulateur.fn_verifier_quota_avant_session()
returns trigger
language plpgsql
security definer
set search_path = public, simulateur
as $$
declare
  v_check record;
begin
  select * into v_check from simulateur.verifier_quota(new.structure_id);
  if not v_check.autorise then
    raise exception 'Simulateur : accès non actif ou quota mensuel atteint pour cette structure (statut=%, %/% échanges).',
      v_check.statut, v_check.echanges_consommes, v_check.quota_echanges_mensuel;
  end if;
  return new;
end;
$$;

create trigger trg_verifier_quota_avant_session
before insert on simulateur.sessions
for each row execute function simulateur.fn_verifier_quota_avant_session();

-- Garde-fou côté serveur pour la limite dure de 15 échanges/session (déjà
-- appliquée côté client en bloquant la saisie) : même en cas d'appel direct
-- à l'API en contournant le front, un 16e message 'utilisateur' est rejeté.
create or replace function simulateur.fn_verifier_limite_session_avant_message()
returns trigger
language plpgsql
security definer
set search_path = public, simulateur
as $$
declare
  v_nb_echanges integer;
  v_statut text;
begin
  if new.role = 'utilisateur' then
    select nb_echanges, statut into v_nb_echanges, v_statut
      from simulateur.sessions where id = new.session_id;

    if v_statut <> 'en_cours' then
      raise exception 'Simulateur : impossible d''ajouter un message, la session % n''est plus en cours.', new.session_id;
    end if;

    if v_nb_echanges >= 15 then
      raise exception 'Simulateur : limite de 15 échanges atteinte pour la session %.', new.session_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_verifier_limite_session_avant_message
before insert on simulateur.messages
for each row execute function simulateur.fn_verifier_limite_session_avant_message();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table simulateur.themes enable row level security;
alter table simulateur.scenarios enable row level security;
alter table simulateur.paliers enable row level security;
alter table simulateur.acces_structure enable row level security;
alter table simulateur.sessions enable row level security;
alter table simulateur.messages enable row level security;
alter table simulateur.usage_mensuel enable row level security;

-- Thématiques et scénarios : lecture libre pour tout utilisateur connecté
-- (nécessaire pour afficher les écrans de sélection), écriture réservée à
-- l'équipe Apézeo (super_admin) — c'est le contenu clinique sensible du
-- module, il ne doit pas être modifiable depuis un compte structure.
create policy themes_select on simulateur.themes
  for select to authenticated
  using (true);

create policy themes_write on simulateur.themes
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true));

create policy scenarios_select on simulateur.scenarios
  for select to authenticated
  using (true);

create policy scenarios_write on simulateur.scenarios
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true));

-- Référentiel des paliers : lecture libre pour tout utilisateur connecté
create policy paliers_select on simulateur.paliers
  for select to authenticated
  using (true);

-- Accès/statut/quota par structure : chaque structure voit sa propre ligne ;
-- seule l'équipe Apézeo (super_admin) peut créer/modifier/supprimer.
create policy acces_structure_select on simulateur.acces_structure
  for select to authenticated
  using (
    structure_id = (select p.structure_id from public.profiles p where p.id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true)
  );

create policy acces_structure_write on simulateur.acces_structure
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true));

-- Sessions : un utilisateur ne voit que les sessions de sa structure,
-- ne crée que ses propres sessions, ne met à jour que les siennes.
create policy sessions_select on simulateur.sessions
  for select to authenticated
  using (
    structure_id = (select p.structure_id from public.profiles p where p.id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true)
  );

create policy sessions_insert on simulateur.sessions
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and structure_id = (select p.structure_id from public.profiles p where p.id = auth.uid())
  );

create policy sessions_update on simulateur.sessions
  for update to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true)
  );

-- Messages : visibles/insérables uniquement via une session de sa propre structure
create policy messages_select on simulateur.messages
  for select to authenticated
  using (
    exists (
      select 1 from simulateur.sessions s
      join public.profiles p on p.id = auth.uid()
      where s.id = messages.session_id
        and (s.structure_id = p.structure_id or p.super_admin = true)
    )
  );

-- Pas de policy insert pour 'authenticated' sur messages : toute écriture
-- (réplique du soignant, réponse IA, score) passe exclusivement par l'Edge
-- Function côté serveur (clé service_role, qui contourne RLS). Un insert
-- direct depuis le navigateur permettrait de fabriquer un faux score, un
-- faux coût à zéro, ou une fausse réplique IA sans jamais appeler le modèle.

-- Usage mensuel : lecture seule pour la structure concernée (écriture
-- réservée aux triggers SECURITY DEFINER ci-dessus, aucune policy insert/update).
create policy usage_mensuel_select on simulateur.usage_mensuel
  for select to authenticated
  using (
    structure_id = (select p.structure_id from public.profiles p where p.id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.super_admin = true)
  );

-- ============================================================
-- GRANTS (le schéma n'est pas exposé publiquement, voir la note
-- sur "Exposed schemas" à faire dans le Dashboard Supabase)
-- ============================================================
grant usage on schema simulateur to authenticated;
grant select, insert, update, delete on simulateur.themes to authenticated;      -- RLS limite l'écriture aux super_admin
grant select, insert, update, delete on simulateur.scenarios to authenticated;   -- RLS limite l'écriture aux super_admin
grant select on simulateur.paliers to authenticated;
grant select, insert, update on simulateur.acces_structure to authenticated;   -- RLS limite l'écriture aux super_admin
grant select, insert, update on simulateur.sessions to authenticated;
grant select on simulateur.messages to authenticated;   -- écriture réservée à l'Edge Function (service_role)
grant select on simulateur.usage_mensuel to authenticated;
grant execute on function simulateur.verifier_quota(bigint) to authenticated;

-- Fin du script. Rien dans public.* n'a été modifié.
