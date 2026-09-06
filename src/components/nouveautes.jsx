// Écran "Nouveautés" -- journal des évolutions récentes, à
// destination des utilisateurs. Contenu statique, tenu à jour
// manuellement dans data/nouveautes.js.
import { Sparkles } from "lucide-react";
import { TopBar } from "./ui.jsx";
import { NOUVEAUTES } from "../data/nouveautes.js";

function moisLisible(aaaaMm) {
  const [annee, mois] = aaaaMm.split("-");
  const noms = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${noms[Number(mois) - 1]} ${annee}`;
}

export function NouveautesView({ onBack }) {
  return (
    <div className="pb-10">
      <TopBar title="Nouveautés" onBack={onBack} />
      <div className="p-5 lg:px-9 lg:max-w-2xl">
        <p className="text-sm text-stone-500 mb-6">Les dernières évolutions d'Apézeo.</p>
        <div className="flex flex-col gap-4">
          {NOUVEAUTES.map((n, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-emerald-900/5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-400">{moisLisible(n.date)}</span>
              </div>
              <div className="font-semibold text-emerald-950 text-sm mb-1">{n.titre}</div>
              <div className="text-sm text-stone-600 leading-relaxed">{n.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
