-- Autorise le super-admin à supprimer un signalement (jusqu'ici,
-- seules la lecture et la mise à jour du statut "résolu" étaient
-- permises -- sans ceci, le bouton "Supprimer" échouerait
-- silencieusement, bloqué par la sécurité RLS).
drop policy if exists "Seul le super-admin supprime les signalements" on signalements;
create policy "Seul le super-admin supprime les signalements"
  on signalements for delete
  using (public.is_super_admin(auth.uid()));
