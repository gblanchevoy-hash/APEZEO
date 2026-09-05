-- Ajoute la case de certification d'authenticité. Contrainte au
-- niveau de la base elle-même (pas seulement côté app) : un
-- témoignage ne peut être enregistré que si la case a été cochée.
alter table temoignages
  add column if not exists certifie_authentique boolean not null default false;

alter table temoignages
  drop constraint if exists temoignages_certifie_authentique_check;
alter table temoignages
  add constraint temoignages_certifie_authentique_check check (certifie_authentique = true);
