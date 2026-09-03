// Application "Aidant" -- version grand public, gratuite, sans
// compte, avec des fiches embarquées localement (AIDANT_FICHES) et
// un stockage purement local (favoris, historique, fiches perso).
import { useState, useMemo } from "react";
import { ArrowLeftRight, Info, PhoneCall, Plus, AlertTriangle, Search, Heart, FileText } from "lucide-react";
import { AIDANT_FICHES } from "./data/aidantFiches.js";
import { getLocal, setLocal } from "./lib/localStore.js";
import { uid, scoreFiche } from "./lib/utils.js";

import { NavCard, HomeContext } from "./components/ui.jsx";
import { LegalView, LegalFooterLinks } from "./components/legal.jsx";
import { TroublesView, FicheListView, SearchView, MesFichesView, AidantFavorisView } from "./components/browse.jsx";
import { QuizView, RecommandationsView } from "./components/quiz.jsx";
import { FicheDetailView, LogView, FicheFormView } from "./components/ficheDetail.jsx";

export function AidantApp({ onChangeMode }) {
  const [localFiches, setLocalFiches] = useState(() => getLocal("aidant-local-fiches", []));
  const [favoris, setFavoris] = useState(() => getLocal("aidant-favoris", []));
  const [historique, setHistorique] = useState(() => getLocal("aidant-historique", []));
  const [toast, setToast] = useState(null);
  const [showUrgence, setShowUrgence] = useState(false);
  const [stack, setStack] = useState([{ view: "home" }]);

  const current = stack[stack.length - 1];
  const push = (frame) => setStack((s) => {
    const updated = [...s];
    updated[updated.length - 1] = { ...updated[updated.length - 1], scrollY: window.scrollY };
    return [...updated, frame];
  });
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const goHome = () => setStack([{ view: "home" }]);
  const fiches = useMemo(() => [...AIDANT_FICHES, ...localFiches], [localFiches]);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const persistLocalFiches = (next) => { setLocalFiches(next); setLocal("aidant-local-fiches", next); };
  const persistFavoris = (next) => { setFavoris(next); setLocal("aidant-favoris", next); };
  const persistHistorique = (next) => { setHistorique(next); setLocal("aidant-historique", next); };

  const addLocalFiche = (f) => {
    const exists = localFiches.some((x) => x.id === f.id);
    const next = exists ? localFiches.map((x) => (x.id === f.id ? f : x)) : [...localFiches, { ...f, id: f.id || uid() }];
    persistLocalFiches(next);
    showToast("Votre idée a été enregistrée");
  };
  const deleteLocalFiche = (id) => { persistLocalFiches(localFiches.filter((x) => x.id !== id)); showToast("Fiche supprimée"); };

  // Favoris à un seul état, élégant et simple : on aime, ou pas.
  const toggleFav = (id) => {
    const next = favoris.includes(id) ? favoris.filter((x) => x !== id) : [...favoris, id];
    persistFavoris(next);
  };
  const addHistoriqueEntry = (entry) => {
    persistHistorique([{ ...entry, id: uid(), date: new Date().toISOString() }, ...historique]);
    showToast("Essai enregistré");
  };
  const ficheById = (id) => fiches.find((f) => f.id === id);

  return (
    <div className="min-h-screen bg-[#F4F6F2] md:bg-stone-200 md:flex md:justify-center md:py-8 lg:bg-[#F4F6F2] lg:block lg:py-0">
    <div className="w-full md:max-w-2xl md:bg-[#F4F6F2] md:rounded-3xl md:shadow-2xl md:overflow-hidden md:border md:border-stone-300/60 lg:max-w-none lg:rounded-none lg:shadow-none lg:border-none lg:overflow-visible">
      <HomeContext.Provider value={goHome}>
      <div className="lg:max-w-5xl xl:max-w-6xl lg:mx-auto">
      {current.view === "home" && (
        <div className="pb-10">
          <div className="mx-4 mt-4 lg:mx-8 lg:mt-6 relative overflow-hidden px-6 pt-7 pb-10 lg:px-10 lg:pt-10 lg:pb-14 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-[28px]">
            <svg className="absolute inset-x-0 bottom-0 w-full h-24 lg:h-32 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,55 C80,80 140,30 220,50 C290,68 340,40 400,58 L400,100 L0,100 Z" fill="rgba(255,255,255,0.05)" />
              <path d="M0,68 C90,45 160,85 240,65 C310,48 350,75 400,62 L400,100 L0,100 Z" fill="rgba(255,255,255,0.07)" />
            </svg>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none" />

            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img src="/logo-phoenix.png" alt="Apézeo" className="w-9 h-9 rounded-full object-cover shadow-sm" />
                <span className="uppercase tracking-widest text-xs font-semibold text-emerald-200">Apézeo</span>
              </div>
              <button onClick={onChangeMode} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Changer de mode"><ArrowLeftRight size={15} /></button>
            </div>

            <h1 className="relative text-2xl lg:text-3xl font-bold mb-1.5 tracking-tight">Un geste apaisant, tout de suite.</h1>
            <p className="relative text-emerald-200 text-sm mb-7">Des idées simples à essayer, pas à pas.</p>
            <div className="relative">
              <button onClick={() => push({ view: "quiz" })} className="relative w-full overflow-hidden bg-amber-400 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-xl text-emerald-950 font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg ring-1 ring-white/40 active:scale-[0.98] transition-all duration-200">
                <span className="cta-shine" />
                Que faire maintenant ?
              </button>
            </div>
          </div>
          <div className="px-5 lg:px-8 mt-6 flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
            <NavCard icon={AlertTriangle} label="Choisir une situation" sub="Agitation, cris, refus de soins…" onClick={() => push({ view: "troubles" })} accent="emerald" />
            <NavCard icon={Search} label="Recherche libre" onClick={() => push({ view: "search" })} accent="stone" />
            <NavCard icon={Heart} label="Mes favoris" sub={`${favoris.length} idée${favoris.length !== 1 ? "s" : ""} qui fonctionne${favoris.length !== 1 ? "nt" : ""} pour vous`} onClick={() => push({ view: "favoris" })} accent="emerald" />
            <NavCard icon={FileText} label="Mes fiches" sub="Vos idées créées vous-même" onClick={() => push({ view: "mes-fiches" })} accent="stone" />
          </div>
          <div className="px-5 lg:px-8 mt-5">
            <button onClick={() => push({ view: "form", fiche: emptyLocalFiche() })} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-emerald-700/40 hover:bg-emerald-50/50 text-stone-500 hover:text-emerald-800 rounded-2xl py-4 font-medium transition-colors">
              <Plus size={18} /> Ajouter une idée qui a marché pour vous
            </button>
          </div>
          <div className="px-5 lg:px-8 mt-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-sm text-amber-900">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>En cas de danger immédiat, ou si les troubles deviennent fréquents et intenses, consultez un médecin ou un gériatre.</span>
            </div>
          </div>
          <LegalFooterLinks onOpen={(doc) => push({ view: "legal", doc })} />
        </div>
      )}

      {current.view === "legal" && (
        <LegalView doc={current.doc} onBack={pop} />
      )}

      {current.view === "troubles" && (
        <TroublesView fiches={fiches} onBack={pop} onOpenTrouble={(t) => push({ view: "trouble-detail", trouble: t })} />
      )}
      {current.view === "trouble-detail" && (
        <FicheListView title={current.trouble} onBack={pop} favoris={{ liked: favoris, disliked: [] }} scrollY={current.scrollY}
          items={fiches.filter((f) => f.troubles.includes(current.trouble)).sort((a, b) => b.niveauPreuve - a.niveauPreuve)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucune idée pour cette situation pour l'instant." />
      )}
      {current.view === "search" && (
        <SearchView fiches={fiches} onBack={pop} favoris={{ liked: favoris, disliked: [] }} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "favoris" && (
        <AidantFavorisView fiches={fiches} favoris={favoris} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "mes-fiches" && (
        <MesFichesView fiches={fiches} favoris={{ liked: favoris, disliked: [] }} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "quiz" && (
        <QuizView onBack={pop} fichesDisponibles={fiches} onSubmit={(q) => {
          const scored = fiches.map((f) => ({ f, s: scoreFiche(f, q, { liked: favoris, disliked: [] }) })).filter((x) => x.s !== null).sort((a, b) => b.s - a.s);
          const max = 100;
          const results = scored.map((x) => ({ ...x, pct: Math.max(5, Math.min(99, Math.round((x.s / max) * 100))) }));
          const label = [q.troubleIds.join(", "), q.besoin].filter(Boolean).join(" · ");
          let suggestions = [];
          if (results.length === 0 && q.troubleIds.length > 0) {
            suggestions = fiches
              .map((f) => ({ f, n: (f.troubles || []).filter((t) => q.troubleIds.includes(t)).length }))
              .filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4).map((x) => x.f);
          }
          push({ view: "recommandations", results, trouble: label, suggestions });
        }} />
      )}
      {current.view === "recommandations" && (
        <RecommandationsView title={current.trouble} results={current.results} suggestions={current.suggestions} favoris={{ liked: favoris, disliked: [] }} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "fiche" && (
        <FicheDetailView
          fiche={ficheById(current.fiche.id) || current.fiche} favoris={{ liked: favoris, disliked: [] }} onBack={pop} simple onlyLike
          onToggleLike={() => toggleFav(current.fiche.id)}
          onLog={() => push({ view: "log", fiche: current.fiche })}
          onEdit={current.fiche.isLocal ? () => push({ view: "form", fiche: ficheById(current.fiche.id) || current.fiche }) : null}
          onDelete={current.fiche.isLocal ? () => { deleteLocalFiche(current.fiche.id); pop(); } : null}
        />
      )}
      {current.view === "log" && (
        <LogView fiche={current.fiche} onBack={pop} onSave={(entry) => { addHistoriqueEntry(entry); pop(); }} />
      )}
      {current.view === "form" && (
        <FicheFormView initial={current.fiche} onBack={pop} onSave={(f) => { addLocalFiche(f); pop(); }} />
      )}
      </div>
      </HomeContext.Provider>

      {/* Raccourci Urgence — toujours visible, uniquement côté Aidant.
          Positionné en onglet sur le bord droit, à mi-hauteur : ne
          chevauche ni l'en-tête (bouton changer de mode) ni la barre
          d'action fixe en bas des fiches. */}
      <button
        onClick={() => setShowUrgence(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-l-2xl shadow-lg active:scale-95 transition"
        aria-label="Numéros d'urgence"
        title="Urgence"
      >
        <PhoneCall size={19} />
      </button>
      {showUrgence && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowUrgence(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0"><PhoneCall size={19} className="text-rose-600" /></div>
              <div className="font-bold text-lg text-stone-800">En cas d'urgence</div>
            </div>
            <p className="text-sm text-stone-500 mb-5">Si la situation présente un danger immédiat, contactez directement les secours — n'attendez pas de trouver une réponse dans l'application.</p>
            <div className="flex flex-col gap-2.5">
              <a href="tel:15" className="flex items-center justify-between bg-rose-50 hover:bg-rose-100 rounded-2xl px-4 py-3.5 transition">
                <span className="font-semibold text-rose-900">SAMU</span>
                <span className="font-bold text-rose-700 text-lg">15</span>
              </a>
              <a href="tel:17" className="flex items-center justify-between bg-rose-50 hover:bg-rose-100 rounded-2xl px-4 py-3.5 transition">
                <span className="font-semibold text-rose-900">Police / Gendarmerie</span>
                <span className="font-bold text-rose-700 text-lg">17</span>
              </a>
              <a href="tel:112" className="flex items-center justify-between bg-rose-50 hover:bg-rose-100 rounded-2xl px-4 py-3.5 transition">
                <span className="font-semibold text-rose-900">Numéro d'urgence européen</span>
                <span className="font-bold text-rose-700 text-lg">112</span>
              </a>
              <a href="tel:114" className="flex items-center justify-between bg-rose-50 hover:bg-rose-100 rounded-2xl px-4 py-3.5 transition">
                <div>
                  <div className="font-semibold text-rose-900">Urgence par SMS</div>
                  <div className="text-xs text-rose-600/80">Si la personne ne peut pas parler</div>
                </div>
                <span className="font-bold text-rose-700 text-lg">114</span>
              </a>
            </div>
            <div className="h-px bg-stone-100 my-4" />
            <a href="tel:3133" className="flex items-center justify-between bg-amber-50 hover:bg-amber-100 rounded-2xl px-4 py-3.5 transition">
              <div>
                <div className="font-semibold text-amber-900">Suspicion de maltraitance</div>
                <div className="text-xs text-amber-700/80">Écoute et conseil, pas un numéro d'urgence — 9h-20h, 7j/7</div>
              </div>
              <span className="font-bold text-amber-700 text-lg">3133</span>
            </a>
            <button onClick={() => setShowUrgence(false)} className="w-full mt-5 text-sm text-stone-400 py-2">Fermer</button>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
    </div>
  );
}
