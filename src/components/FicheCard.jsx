// Carte de fiche utilisée dans toutes les listes (troubles, catégories,
// recherche, recommandations...). Extraite de App.jsx.
import { Heart, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge, Stars } from "./ui.jsx";

// Certains croquis d'outils sont des scènes complètes (pas un objet
// isolé sur fond uni) — ils s'affichent en pleine largeur plutôt que
// "pinglés" sur la page de carnet, qui n'a de sens que pour un objet seul.
export const CROQUIS_PLEINE_LARGEUR = [];

export function FicheCard({ f, onClick, favState }) {
  const nonSourcee = !!f.isLocal; // toute fiche créée par l'utilisateur, quelle que soit la catégorie choisie
  const isOutil = f.typeFiche === "outil";
  const isConcept = f.typeFiche === "concept";
  const isTechnique = !isOutil && !isConcept;
  const isStandard = f.niveauDetail !== "expert";
  const borderCls = isOutil ? "border-l-[3px] border-violet-400 focus-visible:outline-violet-500"
    : isStandard ? "border-l-[3px] border-green-400 focus-visible:outline-green-600"
    : isConcept ? "border-l-[3px] border-sky-400 focus-visible:outline-sky-500"
    : "border-l-[3px] border-amber-400 focus-visible:outline-emerald-600";
  return (
    <button onClick={onClick} className={`w-full text-left bg-white rounded-2xl p-4 shadow-[0_2px_12px_-4px_rgba(6,78,59,0.08)] hover:shadow-[0_6px_20px_-6px_rgba(6,78,59,0.14)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 transition-all duration-200 flex items-start gap-3 ${borderCls}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          {isOutil ? <Badge tone="outil">{f.outilType || "Outil spécifique"}</Badge> : <Badge tone={nonSourcee ? "orangeDark" : "emerald"}>{f.categorie}</Badge>}
          {isConcept && <Badge tone="concept">Explicatif</Badge>}
          {isTechnique && <Badge tone="amber">Technique</Badge>}
          {f.alerteOutil && <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5"><AlertTriangle size={11} /> Vigilance</span>}
          {f.niveauDetail === "expert" && <Badge tone="expert">Expert</Badge>}
          {nonSourcee && <Badge tone="rose">Non sourcée</Badge>}
          {f.dureeMinutes > 0 ? <Badge>{f.dureeMinutes} min</Badge> : f.dureeLabel ? <Badge>{f.dureeLabel}</Badge> : null}
          {f.isLocal && <Badge tone="amber">Personnelle</Badge>}
          {favState === "liked" && <Heart size={14} className="fill-rose-500 text-rose-500" />}
        </div>
        <div className={`font-semibold truncate tracking-tight ${isOutil ? "text-violet-950" : isConcept ? "text-sky-950" : "text-emerald-950"}`}>{f.titre}</div>
        <div className="text-sm text-stone-500 line-clamp-2 mt-0.5">{f.description}</div>
        {!isOutil && f.niveauDetail !== "expert" && <div className="mt-1.5"><Stars n={f.niveauPreuve} /></div>}
      </div>
      <ChevronRight size={18} className="text-stone-300 mt-1 shrink-0" />
    </button>
  );
}
