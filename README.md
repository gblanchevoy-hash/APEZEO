# Apézeo

Une bibliothèque **Pro** évolutive (Supabase) et une bibliothèque
**Aidant** volontairement fixe et déjà écrite (les 44 fiches d'origine,
en langage simple), avec deux façades :

- **Version Pro** — réservée aux professionnels, compte requis (e-mail +
  mot de passe + profession), bibliothèque partagée qui grandit au fil
  de vos imports Supabase, favoris/historique liés au compte.
- **Version Aidant** — accessible sans compte. Bibliothèque = les 44
  fiches d'origine (intégrées au code, `src/data/aidantFiches.js`, pas
  de dépendance Supabase pour l'affichage) + les idées que l'aidant
  ajoute lui-même (stockées sur son appareil). Favoris à un seul état,
  simple : on aime, ou pas — pas de notion de "à éviter".

Un écran d'accueil ("Qui êtes-vous ?") propose le choix au premier
lancement ; le choix est mémorisé sur l'appareil (bouton pour changer
de mode à tout moment).

## Architecture

- **La bibliothèque de fiches** vit dans une table Supabase (`interventions`),
  en lecture publique. Tout le monde qui ouvre le site la voit.
- **Vous seul** pouvez y ajouter/modifier/supprimer des fiches, via l'éditeur
  SQL de Supabase (aucune interface d'admin à coder : Supabase la fournit déjà).
- **Favoris, historique, fiches personnelles** ajoutés par un visiteur restent
  dans son navigateur (`localStorage`) — jamais partagés, jamais écrasés par
  vos mises à jour de la bibliothèque partagée.

### Organisation des fichiers (`src/`)

`App.jsx` ne contient plus que les deux "chefs d'orchestre" — `AuthenticatedApp`
(version Pro) et `AidantApp` (version grand public) — qui gèrent la navigation
et l'état, et assemblent les écrans ci-dessous. Tout le reste est découpé par
domaine dans `src/components/` :

| Fichier | Contenu |
|---|---|
| `ui.jsx` | Briques génériques réutilisées partout (Badge, TopBar, Section, BulletList...) |
| `FicheCard.jsx` | La carte de fiche affichée dans toutes les listes |
| `legal.jsx` | Mentions légales, CGU, confidentialité |
| `browse.jsx` | Écrans de parcours : troubles, familles, recherche, favoris, historique |
| `quiz.jsx` | Formulaire "Trouver la meilleure technique" + résultats |
| `ficheDetail.jsx` | Détail d'une fiche, journal d'essai, formulaire de création/édition |
| `admin.jsx` | Statistiques super-admin, création de structure, gestion d'équipe, mon compte |
| `AuthView.jsx` | Écran de connexion (version Pro) |
| `gate.jsx` | Page d'accueil publique (choix Professionnel / Aidant) |
| `Home.jsx` | Écran d'accueil une fois connecté (version Pro) |

`src/lib/` regroupe les fonctions sans dépendance à React (`scoreFiche`,
formatage de texte, accès Supabase). `src/data/` regroupe les constantes et
textes statiques (troubles, catégories, mentions légales).

**Convention pour la suite** : tout nouvel écran devient un nouveau fichier
dans `src/components/`, pas un ajout dans `App.jsx`. Si un fichier dépasse
~400 lignes, c'est probablement le signe qu'il devrait être scindé.

## 1. Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com), créez un compte gratuit,
   puis "New project".
2. Une fois le projet créé, ouvrez **SQL Editor** (menu de gauche) > *New query*.
3. Collez tout le contenu de [`supabase/schema.sql`](./supabase/schema.sql)
   et cliquez **Run**. Ça crée la table `interventions`, active la sécurité
   (RLS) avec lecture publique, et insère un exemple de fiche.
4. Allez dans **Project Settings > API**. Notez :
   - **Project URL** (ex. `https://xxxxx.supabase.co`)
   - **anon public key** (une longue chaîne commençant par `eyJ...`)
5. **Authentification** : allez dans **Authentication > Providers > Email**.
   Par défaut, Supabase exige une confirmation par e-mail à l'inscription.
   Pour tester rapidement sans configurer d'envoi d'e-mails, vous pouvez
   désactiver temporairement "Confirm email" dans **Authentication > Settings**
   (à réactiver avant une mise en production réelle).

Vous en aurez besoin à l'étape 3.

## 2. Pousser le code sur GitHub

Dans un terminal, à la racine de ce dossier :

```bash
git init
git add .
git commit -m "Apézeo v1"
```

Puis créez un nouveau dépôt (vide) sur [github.com/new](https://github.com/new),
et suivez les instructions qu'il affiche pour "push an existing repository",
typiquement :

```bash
git remote add origin https://github.com/VOTRE-COMPTE/apezeo.git
git branch -M main
git push -u origin main
```

## 3. Déployer sur Vercel

1. Sur [vercel.com](https://vercel.com), connectez votre compte GitHub.
2. **Add New > Project**, sélectionnez le dépôt `apezeo`.
3. Vercel détecte automatiquement Vite — laissez les réglages par défaut.
4. Dans **Environment Variables**, ajoutez :
   - `VITE_SUPABASE_URL` = votre Project URL
   - `VITE_SUPABASE_ANON_KEY` = votre clé anon public
5. **Deploy**. Vous obtenez une URL publique (ex. `apezeo.vercel.app`).

À chaque `git push` sur `main`, Vercel redéploie automatiquement.

## 4. Ajouter des fiches à la bibliothèque partagée

Pas besoin de coder ni de redéployer. Pour chaque lot de fiches que vous
recevez (ex. généré par ChatGPT) :

1. Ouvrez **Supabase > SQL Editor**.
2. Ouvrez `supabase/schema.sql`, copiez le bloc "IMPORT EN LOT".
3. Remplacez `PASTE_JSON_HERE` par votre tableau JSON de fiches.
4. **Run**. Les fiches apparaissent immédiatement pour tous les visiteurs
   du site, sans redéploiement.

Une fiche dont le `titre` existe déjà créera une deuxième ligne (l'exemple
ne fait pas de mise à jour automatique par titre) — si vous voulez corriger
une fiche existante, éditez-la directement dans **Table Editor > interventions**.

## Développement local

```bash
npm install
cp .env.example .env.local   # puis renseignez vos identifiants Supabase
npm run dev
```

## Ce que gère l'app

| Donnée | Où elle vit | Visible par |
|---|---|---|
| Bibliothèque de fiches (vous, l'admin) | Supabase (`interventions`) | Tout le monde, y compris sans compte |
| Fiches personnelles d'un professionnel | Supabase (`fiches_personnelles`) | Ce professionnel uniquement, sur tous ses appareils |
| Favoris ("efficace" / "à éviter") | Supabase (`favoris`) | Ce professionnel uniquement, sur tous ses appareils |
| Historique des essais (avant/après) | Supabase (`historique`) | Ce professionnel uniquement, sur tous ses appareils |
| Profil (profession) | Supabase (`profiles`) | Ce professionnel uniquement |

Toutes les données personnelles sont protégées par des règles de sécurité
(Row Level Security) : chaque utilisateur ne peut lire ou écrire que ses
propres lignes, jamais celles des autres.
