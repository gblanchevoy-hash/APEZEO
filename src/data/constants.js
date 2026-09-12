export const TROUBLES = [
  "Agitation", "Agressivité", "Anxiété", "Déambulation", "Refus de soins",
  "Cris répétés", "Hallucinations", "Idées délirantes", "Opposition",
  "Apathie", "Symptômes dépressifs", "Sommeil perturbé", "Syndrome crépusculaire",
  "Désorientation", "Errance", "Répétitions verbales", "Sortie inopinée",
  "Comportements sexuels inadaptés", "Refus alimentaire",
  "Troubles pendant la toilette", "Troubles pendant les repas",
  "Troubles pendant l'habillage", "Troubles nocturnes", "Stress de l'aidant",
  "Autre",
];

export const FAMILLES = [
  "Communication", "Validation émotionnelle", "Distraction", "Musicothérapie",
  "Toucher / Massage", "Stimulation sensorielle", "Respiration", "Relaxation",
  "Activité physique", "Activités domestiques", "Activités créatives",
  "Nature / Animaux", "Réminiscence", "Spiritualité", "Alimentation",
  "Hydratation", "Gestion des besoins", "Environnement", "Sommeil", "Routine",
  "Sécurité", "Techniques d'urgence", "Compréhension des comportements",
  "Activités cognitives adaptées", "Soutien aux aidants",
  "Activités favorisant l'autonomie", "Autres",
];

export const OUTILS_TYPES = [
  "Poupées et peluches thérapeutiques", "Objets de manipulation sensorielle",
  "Luminothérapie", "Diffusion sonore et musicale", "Aides visuelles et repères",
  "Robots et animaux de compagnie simulés", "Aromathérapie", "Réminiscence",
  "Environnement multisensoriel", "Autre outil",
];

export const STADES = ["Léger", "Modéré", "Sévère"];
export const CONTEXTES = ["Domicile", "EHPAD", "Hôpital"];
export const MOMENTS = ["Jour", "Soir", "Nuit"];

export const PROFESSIONS = [
  "Aide-soignant(e)",
  "Infirmier(ère)",
  "Médecin / Gériatre",
  "Psychologue",
  "Ergothérapeute",
  "Psychomotricien(ne)",
  "Auxiliaire de vie",
  "Aide médico-psychologique (AMP)",
  "Animateur(trice)",
  "Directeur / Directrice d'établissement",
  "Étudiant(e) en formation",
  "Autre profession du soin",
];

// "Situations fréquentes" — chaque entrée reformule une situation de
// terrain concrète en une recherche pré-remplie sur les mêmes troubles
// que ceux du quiz. Pas de lien figé vers des fiches précises : le
// moteur de recherche existant retrouve toujours les bonnes, même si
// le contenu de la bibliothèque évolue.
export const SITUATIONS_TYPES = [
  { id: "toilette-refus", titre: "Refus de toilette le matin", contexte: "La personne s'oppose ou se ferme dès qu'on évoque la toilette.", troubles: ["Troubles pendant la toilette"] },
  { id: "repas-refus", titre: "Repas qui s'éternise ou refus de manger", contexte: "Le repas traîne en longueur, ou la personne refuse de s'alimenter.", troubles: ["Troubles pendant les repas", "Refus alimentaire"] },
  { id: "habillage-refus", titre: "Refus de s'habiller", contexte: "L'habillage devient une source de tension ou de blocage.", troubles: ["Troubles pendant l'habillage"] },
  { id: "soins-refus", titre: "Refus des soins en général", contexte: "La personne refuse un soin, sans que ce soit lié à un moment précis.", troubles: ["Refus de soins"] },
  { id: "agitation-soir", titre: "Agitation en fin de journée", contexte: "L'agitation ou la confusion augmentent en fin d'après-midi ou en soirée.", troubles: ["Syndrome crépusculaire", "Agitation"] },
  { id: "marche-repetee", titre: "Marche répétée, difficile à canaliser", contexte: "La personne marche sans arrêt, sans but apparent.", troubles: ["Déambulation", "Errance"] },
  { id: "cris-appels", titre: "Cris ou appels répétés", contexte: "Des cris ou des appels reviennent fréquemment dans la journée.", troubles: ["Cris répétés", "Répétitions verbales"] },
  { id: "agressivite-soudaine", titre: "Comportement agressif soudain", contexte: "Un comportement agressif, verbal ou physique, apparaît sans prévenir.", troubles: ["Agressivité"] },
  { id: "geste-sexuel-inadapte", titre: "Geste ou parole déplacée à caractère sexuel", contexte: "Un comportement à caractère sexuel inadapté au contexte se produit.", troubles: ["Comportements sexuels inadaptés"] },
  { id: "reveils-nuit", titre: "Réveils répétés la nuit", contexte: "La personne se réveille plusieurs fois pendant la nuit.", troubles: ["Troubles nocturnes", "Sommeil perturbé"] },
  { id: "deambulation-nocturne", titre: "Déambulations nocturnes dans les couloirs", contexte: "La personne marche dans les couloirs pendant la nuit.", troubles: ["Déambulation", "Troubles nocturnes"], exclure: ["Participer à l'arrosage de quelques plantes", "Participer au ramassage de quelques feuilles dans un espace extérieur"] },
  { id: "anxiete-marquee", titre: "Anxiété marquée, inquiétude envahissante", contexte: "Une inquiétude forte et persistante prend le dessus.", troubles: ["Anxiété"] },
  { id: "retrait-tristesse", titre: "Personne triste, en retrait, qui ne fait plus rien", contexte: "La personne se retire, ne participe plus aux activités habituelles.", troubles: ["Symptômes dépressifs", "Apathie"] },
  { id: "confusion-lieu-temps", titre: "Confusion sur le lieu ou le moment", contexte: "La personne ne sait plus où elle se trouve ou quel moment de la journée c'est.", troubles: ["Désorientation"] },
  { id: "propos-inquietants", titre: "Propos ou croyances qui inquiètent l'entourage", contexte: "Des propos ou des convictions inhabituelles inquiètent les proches ou l'équipe.", troubles: ["Idées délirantes", "Hallucinations"] },
  { id: "sortie-non-accompagnee", titre: "Tentative de sortie non accompagnée", contexte: "La personne cherche à sortir seule, sans accompagnement.", troubles: ["Sortie inopinée"] },
  { id: "arrivee-recente", titre: "Arrivée récente en structure, période d'adaptation difficile", contexte: "Une entrée récente en structure s'accompagne d'une période d'adaptation difficile.", troubles: ["Anxiété", "Opposition"] },
  { id: "aidant-epuise", titre: "Aidant épuisé, qui ne sait plus quoi faire", contexte: "L'aidant se sent débordé et cherche des repères pour souffler.", troubles: ["Stress de l'aidant"] },
  { id: "refus-medicaments", titre: "Refus de prendre ses médicaments", contexte: "La personne refuse ou repousse la prise de son traitement.", troubles: ["Refus de soins"] },
  { id: "question-boucle", titre: "Répéter sans arrêt la même question", contexte: "Une même question revient en boucle, quelle que soit la réponse donnée.", troubles: ["Répétitions verbales"] },
  { id: "rentrer-chez-soi", titre: "Vouloir « rentrer chez soi » ou retrouver un proche", contexte: "La personne insiste pour rejoindre son domicile ou une personne absente.", troubles: ["Errance", "Anxiété"] },
  { id: "repli-activites", titre: "Réticence à participer, repli sur soi", contexte: "La personne se tient à l'écart des activités et des échanges collectifs.", troubles: ["Apathie", "Opposition"] },
  { id: "reaction-selon-personne", titre: "Réagit différemment selon la personne présente", contexte: "Un soin ou une consigne est accepté avec l'un, refusé avec l'autre.", troubles: ["Opposition"] },
  { id: "gestes-repetitifs", titre: "Gestes répétitifs sans but apparent", contexte: "La personne plie, trie ou manipule des objets de façon répétée, sans finalité claire.", troubles: ["Agitation"] },
];
