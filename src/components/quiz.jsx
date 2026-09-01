// Formulaire "Trouver la meilleure technique" et sa page de résultats.
// Partagé entre les vues Pro et Aidant.
import { useState, useMemo } from "react";
import { Search, ChevronRight, AlertTriangle, Heart } from "lucide-react";
import { TROUBLES, FAMILLES, STADES, CONTEXTES } from "../data/constants.js";
import { TopBar, Badge, CheckGroup, ScoreRing, inputCls } from "./ui.jsx";
import { scoreFiche } from "../lib/utils.js";

export function QuizView({ onBack, onSubmit, fichesDisponibles = [] }) {
  const [q, setQ] = useState({ troubleIds: [], besoin: "", stade: "", contexte: "", materielDispo: true, typeVoulu: "technique" });
  const toggleTrouble = (t) => setQ((s) => ({ ...s, troubleIds: s.troubleIds.includes(t) ? s.troubleIds.filter((x) => x !== t) : [...s.troubleIds, t] }));
  const resultCount = useMemo(
    () => fichesDisponibles.filter((f) => scoreFiche(f, q, null) !== null).length,
    [fichesDisponibles, q]
  );
  return (
    <div className="pb-10">
      <TopBar title="Trouver la meilleure technique" onBack={onBack} />

      <div className="mx-4 mt-4 lg:mx-8 lg:mt-6 relative overflow-hidden px-6 py-6 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-3xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><Search size={20} /></div>
          <div>
            <div className="font-bold text-lg tracking-tight">Quelques précisions</div>
            <div className="text-emerald-200 text-sm">Plus vous êtes précis, plus la recommandation le sera aussi.</div>
          </div>
        </div>
        {fichesDisponibles.length > 0 && (
          <div className="relative mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
            <span className="text-emerald-100 text-sm">Fiches correspondantes</span>
            <span className="text-2xl font-bold tabular-nums">{resultCount}</span>
          </div>
        )}
      </div>

      <div className="p-4 lg:px-8 flex flex-col gap-3.5">

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <span className="font-semibold text-emerald-950">Trouble(s) observé(s)</span>
          </div>
          <p className="text-xs text-stone-400 mb-3 ml-9">Sélectionnez-en plusieurs si besoin — seules les fiches couvrant tous les troubles cochés seront proposées.</p>
          <div className="ml-9"><CheckGroup options={TROUBLES} selected={q.troubleIds} onToggle={toggleTrouble} /></div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <span className="font-semibold text-emerald-950">Type de besoin</span>
            <span className="text-xs text-stone-400">(optionnel)</span>
          </div>
          <div className="ml-9">
            <select className={inputCls} value={q.besoin} onChange={(e) => setQ({ ...q, besoin: e.target.value })}>
              <option value="">Tous types</option>
              {FAMILLES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">3</div>
            <span className="font-semibold text-emerald-950">Stade et contexte</span>
            <span className="text-xs text-stone-400">(optionnel)</span>
          </div>
          <div className="ml-9 flex flex-col gap-3">
            <CheckGroup options={STADES} selected={q.stade ? [q.stade] : []} onToggle={(v) => setQ({ ...q, stade: q.stade === v ? "" : v })} />
            <CheckGroup options={CONTEXTES} selected={q.contexte ? [q.contexte] : []} onToggle={(v) => setQ({ ...q, contexte: q.contexte === v ? "" : v })} />
          </div>
        </div>

        <label className="flex items-center gap-3 bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] px-5 py-4 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">4</div>
          <span className="text-sm font-medium text-stone-700 flex-1">J'ai du matériel disponible</span>
          <input type="checkbox" checked={q.materielDispo} onChange={(e) => setQ({ ...q, materielDispo: e.target.checked })} className="w-5 h-5 accent-emerald-700" />
        </label>

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">5</div>
            <span className="font-semibold text-emerald-950">Type de fiche</span>
          </div>
          <div className="ml-9 flex gap-2">
            {[["technique", "Techniques", "emerald"], ["tous", "Tout", "stone"], ["concept", "Explicatifs", "sky"]].map(([val, lab, color]) => {
              const active = q.typeVoulu === val;
              const activeCls = { stone: "bg-emerald-950 text-white border-emerald-950", emerald: "bg-amber-500 text-white border-amber-500", sky: "bg-sky-500 text-white border-sky-500" }[color];
              return (
                <button
                  key={val} type="button" onClick={() => setQ({ ...q, typeVoulu: val })}
                  className={`flex-1 text-sm font-bold py-2.5 rounded-xl border-2 transition-all ${active ? activeCls + " shadow-md" : "bg-white text-stone-500 border-stone-200"}`}
                >{lab}</button>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-400 mt-2 ml-9">Explicatif = comprendre une situation, pas une action à appliquer directement.</p>
        </div>

        <button onClick={() => onSubmit(q)} disabled={q.troubleIds.length === 0} className="relative overflow-hidden w-full mt-2 bg-emerald-700 hover:bg-emerald-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2 text-white font-semibold rounded-2xl transition-all duration-200 py-4 flex items-center justify-center gap-2">
          {q.troubleIds.length > 0 && <span className="cta-shine" />}
          Voir les techniques recommandées
        </button>
      </div>
    </div>
  );
}

export function RecommandationsView({ title, results, suggestions, favoris, onBack, onOpenFiche }) {
  const favState = (id) => (favoris.liked.includes(id) ? "liked" : favoris.disliked.includes(id) ? "disliked" : null);
  return (
    <div className="pb-10">
      <TopBar title={`Pour : ${title}`} onBack={onBack} />
      <div className="p-4 flex flex-col gap-2.5">
        {results.length === 0 && <div className="text-center text-stone-400 text-sm py-6">Aucune fiche ne correspond exactement à ces critères.</div>}
        {results.length === 0 && suggestions && suggestions.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-800/10 shadow-sm rounded-2xl p-4 mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2.5">Ces fiches peuvent peut-être vous intéresser</div>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((f) => (
                <button key={f.id} onClick={() => onOpenFiche(f)} className="flex items-center gap-2 text-left text-sm text-emerald-900 hover:text-emerald-700 bg-white/60 hover:bg-white rounded-xl px-3 py-2 transition-colors">
                  <span className="flex-1">{f.titre}</span>
                  <ChevronRight size={14} className="shrink-0 text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        )}
        {results.map(({ f, pct }) => {
          const isOutil = f.typeFiche === "outil";
          return (
            <button key={f.id} onClick={() => onOpenFiche(f)} className={`w-full text-left bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3 active:scale-[0.99] transition ${isOutil ? "border-l-[3px] border-violet-400" : "border border-emerald-900/5"}`}>
              <ScoreRing pct={pct} violet={isOutil} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {isOutil ? <Badge tone="outil">{f.outilType || "Outil spécifique"}</Badge> : <Badge tone="emerald">{f.categorie}</Badge>}
                  {f.alerteOutil && <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5"><AlertTriangle size={11} /> Vigilance</span>}
                  {favState(f.id) === "liked" && <Heart size={13} className="fill-rose-500 text-rose-500" />}
                </div>
                <div className={`font-semibold ${isOutil ? "text-violet-950" : "text-emerald-950"}`}>{f.titre}</div>
                <div className="text-sm text-stone-500 line-clamp-2">{f.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
