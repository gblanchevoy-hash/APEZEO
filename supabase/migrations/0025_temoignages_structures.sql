-- ============================================================
-- Témoignages des structures : note + commentaire libre, avec
-- autorisation FACULTATIVE de citer le nom de l'établissement
-- comme référence publique.
-- ============================================================
create table if not exists temoignages (
  id bigint generated always as identity primary key,
  structure_id bigint references structures(id) on delete cascade not null,
  auteur_id uuid references auth.users(id) on delete set null,
  note integer not null check (note between 1 and 5),
  commentaire text,
  autorise_citation boolean not null default false,
  created_at timestamptz default now()
);
alter table temoignages enable row level security;

drop policy if exists "Un admin de structure dépose un témoignage" on temoignages;
create policy "Un admin de structure dépose un témoignage"
  on temoignages for insert
  with check (
    auteur_id = auth.uid()
    and structure_id = (select structure_id from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Un admin voit les témoignages de sa structure" on temoignages;
create policy "Un admin voit les témoignages de sa structure"
  on temoignages for select
  using (
    structure_id = (select structure_id from profiles where id = auth.uid() and role = 'admin')
    or public.is_super_admin(auth.uid())
  );

revoke all on temoignages from anon;
grant select, insert on temoignages to authenticated;
