-- ============================================================
-- Journal d'événements des structures (création, suspension,
-- réactivation) — alimenté automatiquement à partir de maintenant.
-- L'historique antérieur à aujourd'hui n'est pas reconstituable
-- (les dates exactes de suspensions passées n'ont jamais été notées).
-- ============================================================
create table if not exists structures_evenements (
  id bigint generated always as identity primary key,
  structure_id bigint references structures(id) on delete cascade,
  type_evenement text not null check (type_evenement in ('creation', 'suspension', 'reactivation')),
  created_at timestamptz default now()
);
alter table structures_evenements enable row level security;

drop policy if exists "Super-admin lit le journal des structures" on structures_evenements;
create policy "Super-admin lit le journal des structures"
  on structures_evenements for select
  using (public.is_super_admin(auth.uid()));

create or replace function public.log_evenement_structure()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.structures_evenements (structure_id, type_evenement) values (new.id, 'creation');
    return new;
  end if;

  if tg_op = 'UPDATE' and old.suspended is distinct from new.suspended then
    insert into public.structures_evenements (structure_id, type_evenement)
    values (new.id, case when new.suspended then 'suspension' else 'reactivation' end);
  end if;

  return new;
end;
$$;

drop trigger if exists log_evenement_structure_trigger on structures;
create trigger log_evenement_structure_trigger
  after insert or update on structures
  for each row execute procedure public.log_evenement_structure();

-- Marque les structures déjà existantes comme "créées" aujourd'hui,
-- pour que le journal parte d'un état cohérent (une seule fois).
insert into structures_evenements (structure_id, type_evenement, created_at)
select id, 'creation', created_at from structures
where not exists (select 1 from structures_evenements se where se.structure_id = structures.id);
