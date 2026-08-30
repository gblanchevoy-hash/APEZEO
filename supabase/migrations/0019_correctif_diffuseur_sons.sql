-- Retire "Hallucinations" des troubles ciblés du diffuseur de sons
-- naturels -- sa propre contre-indication dit explicitement qu'il ne
-- faut pas l'utiliser si la personne risque d'interpréter les sons
-- comme une hallucination. Contradiction corrigée.
update interventions
set troubles = array_remove(troubles, 'Hallucinations')
where titre = 'Diffuseur de sons naturels' and type_fiche = 'outil';

select technique_id, titre, troubles from interventions where titre = 'Diffuseur de sons naturels';
