# Migrations

`0000_historique_consolide.sql` = copie de `schema.sql` au moment où ce
dossier a été créé (tout ce qui a été fait avant cette date, en vrac).
Ne pas le relancer si la base est déjà à jour.

**À partir de maintenant**, chaque nouveau changement de structure de
base (nouvelle colonne, nouvelle fonction, nouvelle policy...) doit
être un nouveau fichier ici, nommé `NNNN_description_courte.sql` avec
un numéro qui s'incrémente (0001, 0002...). Ne pas modifier un fichier
déjà exécuté — en écrire un nouveau qui corrige ou complète.

Objectif : pouvoir reconstituer l'état exact de la base en relisant
les fichiers dans l'ordre, et savoir à tout moment ce qui a déjà été
exécuté chez toi vs. ce qui ne l'a pas encore été.
