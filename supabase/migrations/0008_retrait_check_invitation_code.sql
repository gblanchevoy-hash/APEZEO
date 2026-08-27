-- ============================================================
-- Retrait de check_invitation_code — plus aucun usage depuis le
-- retrait de l'inscription par code. La garder ne servait plus qu'à
-- laisser une petite prise inutile (deviner un code, voir le nom
-- d'une structure) sans aucun bénéfice en échange.
-- ============================================================
drop function if exists public.check_invitation_code(text);

-- Vérification : doit renvoyer 0 ligne.
select proname from pg_proc
where pronamespace = 'public'::regnamespace and proname = 'check_invitation_code';
