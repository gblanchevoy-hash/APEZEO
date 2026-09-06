// Écran "Nouveautés" -- journal des évolutions récentes, à
// destination des utilisateurs. Contenu statique, tenu à jour
// manuellement dans data/nouveautes.js.
import { TopBar } from "./ui.jsx";
import { NOUVEAUTES } from "../data/nouveautes.js";

function moisLisible(aaaaMm) {
  const [annee, mois] = aaaaMm.split("-");
  const noms = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${noms[Number(mois) - 1]} ${annee}`;
}

export function NouveautesView({ onBack }) {
  return (
    <div className="pb-10">
      <TopBar title="Nouveautés" onBack={onBack} />
      <div className="p-5 lg:px-9 lg:max-w-2xl">
        <p className="text-sm text-stone-500 mb-7">Journal des évolutions d'Apézeo.</p>
        <div className="relative">
          <div className="absolute left-[68px] top-1.5 bottom-1.5 w-px bg-stone-200" />
          <div className="flex flex-col gap-6">
            {NOUVEAUTES.map((n, i) => (
              <div key={i} className="relative flex gap-4">
                <div className="w-14 shrink-0 text-right pt-0.5">
                  <span className="text-[11px] font-semibold text-stone-400 tabular-nums">{moisLisible(n.date)}</span>
                </div>
                <div className="relative shrink-0 pt-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-700 relative z-10" />
                </div>
                <div className="flex-1 pb-1">
                  <div className="font-semibold text-emerald-950 text-sm mb-1">{n.titre}</div>
                  <div className="text-sm text-stone-600 leading-relaxed">{n.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
