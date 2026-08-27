-- ============================================================
-- CORRECTIF : les favoris d'équipe n'étaient lisibles par personne
-- d'autre que l'admin qui les a ajoutés.
-- ============================================================
-- my_structure_id() ne renvoie une valeur que pour un admin (c'est son
-- rôle : identifier LA structure qu'il administre) -- réutilisée par
-- erreur ici pour "appartient à cette structure", elle renvoie NULL
-- pour un membre normal, donc la condition ne matchait jamais.

drop policy if exists "Toute l'équipe voit les favoris de sa structure" on favoris_equipe;
create policy "Toute l'équipe voit les favoris de sa structure"
  on favoris_equipe for select
  using (
    structure_id = (select structure_id from public.profiles where id = auth.uid())
    or public.is_super_admin(auth.uid())
  );
