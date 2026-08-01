import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(url && key);

export const supabase = supabaseReady ? createClient(url, key) : null;

/* Convertit une ligne de la table `interventions` (snake_case, Supabase)
   en fiche utilisée par l'app (camelCase). */
export function rowToFiche(row) {
  return {
    id: `db-${row.id}`,
    dbId: row.id,
    isLocal: false,
    titre: row.titre || "",
    categorie: row.categorie || "",
    sousCategorie: row.sous_categorie || "",
    description: row.description || "",
    pourquoi: row.objectifs || "",
    troubles: row.troubles || [],
    stades: row.stades || [],
    contextes: row.contextes || [],
    dureeLabel: row.duree || "",
    dureeMinutes: row.duree_minutes || 0,
    materiel: row.materiel || [],
    etapes: row.etapes && row.etapes.length ? row.etapes : (row.protocole ? [row.protocole] : []),
    conseils: row.conseils || [],
    erreurs: row.erreurs || [],
    contreIndications: row.contre_indications || [],
    niveauPreuve: row.niveau_preuve || 3,
    difficulte: row.difficulte || "Facile",
    sources: row.sources || [],
    motsCles: row.mots_cles || [],
    dateMaj: row.date_maj || "",
  };
}

/* Fiche personnelle (table fiches_personnelles, propre à chaque utilisateur) */
export function rowToPersonalFiche(row) {
  return {
    id: `personal-${row.id}`,
    dbId: row.id,
    isLocal: true,
    titre: row.titre || "",
    categorie: row.categorie || "",
    sousCategorie: row.sous_categorie || "",
    description: row.description || "",
    pourquoi: row.objectifs || "",
    quandUtiliser: row.quand_utiliser || "",
    troubles: row.troubles || [],
    stades: row.stades || [],
    contextes: row.contextes || [],
    dureeLabel: row.duree || "",
    dureeMinutes: row.duree_minutes || 0,
    materiel: row.materiel || [],
    etapes: row.etapes || [],
    conseils: row.conseils || [],
    erreurs: row.erreurs || [],
    contreIndications: row.contre_indications || [],
    niveauPreuve: row.niveau_preuve || 3,
    difficulte: row.difficulte || "Facile",
    sources: row.sources || [],
    motsCles: row.mots_cles || [],
    dateMaj: row.date_maj || "",
  };
}

/* Fiche (camelCase, app) -> ligne à écrire dans fiches_personnelles (snake_case) */
export function ficheToPersonalRow(f, userId) {
  return {
    user_id: userId,
    titre: f.titre,
    categorie: f.categorie,
    sous_categorie: f.sousCategorie || null,
    description: f.description || null,
    objectifs: f.pourquoi || null,
    quand_utiliser: f.quandUtiliser || null,
    troubles: f.troubles || [],
    stades: f.stades || [],
    contextes: f.contextes || [],
    duree: f.dureeLabel || null,
    duree_minutes: f.dureeMinutes || 0,
    materiel: f.materiel || [],
    etapes: f.etapes || [],
    conseils: f.conseils || [],
    erreurs: f.erreurs || [],
    contre_indications: f.contreIndications || [],
    niveau_preuve: f.niveauPreuve || 3,
    difficulte: f.difficulte || "Facile",
    sources: f.sources || [],
    mots_cles: f.motsCles || [],
    date_maj: f.dateMaj || null,
  };
}
