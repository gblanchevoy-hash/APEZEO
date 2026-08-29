// Écrans de navigation/parcours par catégorie : troubles, outils,
// familles de besoin, listes de fiches, recherche libre, favoris,
// mes fiches, historique. Tous partagent FicheCard et ne dépendent
// d'aucun état propre à AuthenticatedApp/AidantApp.
import { useState, useMemo, useEffect } from "react";
import { Search, ChevronRight, Heart } from "lucide-react";
import { TROUBLES, FAMILLES, OUTILS_TYPES } from "../data/constants.js";
import { supabase } from "../lib/supabase.js";
import { TopBar, Badge } from "./ui.jsx";
import { FicheCard } from "./FicheCard.jsx";

export function TroublesView({ fiches, onBack, onOpenTrouble }) {
  return (
    <div className="pb-10">
      <TopBar title="Choisir un trouble" onBack={onBack} />
      <div className="p-5 lg:px-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {TROUBLES.map((t) => {
          const n = fiches.filter((f) => f.troubles.includes(t)).length;
          return (
            <button key={t} onClick={() => onOpenTrouble(t)} className="relative bg-white rounded-2xl pl-4 pr-3 py-3.5 text-left border-l-[3px] border-emerald-600 shadow-[0_2px_10px_-4px_rgba(6,78,59,0.08)] hover:shadow-[0_6px_18px_-6px_rgba(6,78,59,0.15)] hover:-translate-y-0.5 hover:border-emerald-700 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200">
              <span className="absolute top-3 right-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">{n}</span>
              <div className="font-semibold text-emerald-950 text-sm leading-snug tracking-tight pr-6">{t}</div>
              <div className="text-xs text-stone-400 mt-1">fiche{n !== 1 ? "s" : ""} associée{n !== 1 ? "s" : ""}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OutilsView({ fiches, onBack, onOpenType }) {
  return (
    <div className="pb-10">
      <TopBar title="Outils et soins spécifiques" onBack={onBack} />
      <div className="p-5 lg:px-9">
        <p className="text-sm text-stone-500 mb-5">Des objets et dispositifs matériels utilisés en soutien des approches non médicamenteuses — indications, contre-indications et précautions pour chacun.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {OUTILS_TYPES.map((t) => {
            const n = fiches.filter((f) => f.outilType === t).length;
            return (
              <button key={t} onClick={() => onOpenType(t)} className="bg-violet-50/60 hover:bg-white rounded-2xl p-4 text-left border border-violet-800/10 hover:border-violet-700/20 shadow-none hover:shadow-[0_6px_18px_-6px_rgba(88,28,135,0.12)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 transition-all duration-200">
                <div className="font-semibold text-violet-950 text-sm leading-snug tracking-tight">{t}</div>
                <div className="text-xs text-violet-700/70 mt-1.5 font-medium">{n} outil{n !== 1 ? "s" : ""}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FamillesView({ fiches, onBack, onOpenFamille }) {
  return (
    <div className="pb-10">
      <TopBar title="Rechercher par besoin" onBack={onBack} />
      <div className="p-5 lg:px-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {FAMILLES.map((c) => {
          const n = fiches.filter((f) => f.categorie === c).length;
          return (
            <button key={c} onClick={() => onOpenFamille(c)} className="bg-emerald-50/60 hover:bg-white rounded-2xl p-4 text-left border border-emerald-800/10 hover:border-emerald-700/20 shadow-none hover:shadow-[0_6px_18px_-6px_rgba(6,78,59,0.12)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200">
              <div className="font-semibold text-emerald-950 text-sm leading-snug tracking-tight">{c}</div>
              <div className="text-xs text-emerald-700/70 mt-1.5 font-medium">{n} fiche{n !== 1 ? "s" : ""}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FicheListView({ title, items, onBack, onOpenFiche, favoris, emptyLabel, scrollY }) {
  const favState = (id) => (favoris.liked.includes(id) ? "liked" : favoris.disliked.includes(id) ? "disliked" : null);
  const [typeFilter, setTypeFilter] = useState("tous");
  useEffect(() => {
    if (scrollY) window.scrollTo(0, scrollY);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const hasConcept = items.some((f) => f.typeFiche === "concept");
  const filtered = (typeFilter === "tous" ? items : items.filter((f) => f.typeFiche === typeFilter))
    .slice()
    .sort((a, b) => (a.typeFiche === "concept" ? 0 : 1) - (b.typeFiche === "concept" ? 0 : 1));
  return (
    <div className="pb-10">
      <TopBar title={title} onBack={onBack} />
      {hasConcept && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex gap-2">
            {[["tous", "Tout", "stone"], ["technique", "Techniques", "emerald"], ["concept", "Explicatifs", "sky"]].map(([val, lab, color]) => {
              const active = typeFilter === val;
              const activeCls = { stone: "bg-emerald-950 text-white border-emerald-950", emerald: "bg-amber-500 text-white border-amber-500", sky: "bg-sky-500 text-white border-sky-500" }[color];
              return (
                <button
                  key={val} onClick={() => setTypeFilter(val)}
                  className={`flex-1 text-sm font-bold py-2.5 rounded-xl border-2 transition-all ${active ? activeCls + " shadow-md" : "bg-white text-stone-500 border-stone-200"}`}
                >{lab}</button>
              );
            })}
          </div>
        </div>
      )}
      <div className="p-4 flex flex-col gap-2.5">
        {filtered.length === 0 && <div className="text-center text-stone-400 text-sm py-10">{emptyLabel}</div>}
        {filtered.map((f) => <FicheCard key={f.id} f={f} favState={favState(f.id)} onClick={() => onOpenFiche(f)} />)}
      </div>
    </div>
  );
}

export function SearchView({ fiches, onBack, onOpenFiche, favoris }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const match = (v) => typeof v === "string" && v.toLowerCase().includes(s);
    const matchArr = (arr) => Array.isArray(arr) && arr.some((k) => match(k));
    return fiches.filter((f) =>
      match(f.titre) || match(f.description) || match(f.categorie) ||
      matchArr(f.troubles) || matchArr(f.motsCles) ||
      matchArr(f.objectifsObservables) || matchArr(f.pointsCles) ||
      match(f.fondementPrincipe) || match(f.fondementApplication) ||
      match(f.indication) || matchArr(f.contreIndicationOutil) || matchArr(f.precautionsParticulieres)
    );
  }, [q, fiches]);

  // Aucun résultat exact : suggère les fiches les plus proches, en
  // comptant combien de mots de la recherche apparaissent quelque
  // part dans chaque fiche (correspondance partielle, pas exacte).
  const suggestions = useMemo(() => {
    if (!q.trim() || results.length > 0) return [];
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
    if (words.length === 0) return [];
    const scored = fiches.map((f) => {
      const blob = [f.titre, f.description, f.categorie, ...(f.troubles || []), ...(f.motsCles || [])].filter(Boolean).join(" ").toLowerCase();
      const score = words.reduce((acc, w) => acc + (blob.includes(w) ? 1 : 0), 0);
      return { f, score };
    }).filter((x) => x.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 4).map((x) => x.f);
  }, [q, results, fiches]);

  const favState = (id) => (favoris.liked.includes(id) ? "liked" : favoris.disliked.includes(id) ? "disliked" : null);
  return (
    <div className="pb-10">
      <TopBar title="Recherche libre" onBack={onBack} />
      <div className="p-4">
        <div className="relative mb-3">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un trouble, un mot-clé, une technique…"
            className="w-full rounded-xl border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
        </div>
        <div className="flex flex-col gap-2.5">
          {q.trim() && results.length === 0 && (
            <div className="text-center text-stone-400 text-sm py-6">Aucun résultat exact.</div>
          )}
          {suggestions.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-800/10 shadow-sm rounded-2xl p-4 mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2.5">Ces fiches peuvent peut-être vous intéresser</div>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((t) => (
                  <button key={t.id} onClick={() => onOpenFiche(t)} className="flex items-center gap-2 text-left text-sm text-emerald-900 hover:text-emerald-700 bg-white/60 hover:bg-white rounded-xl px-3 py-2 transition-colors">
                    <span className="flex-1">{t.titre}</span>
                    <ChevronRight size={14} className="shrink-0 text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {results.map((f) => <FicheCard key={f.id} f={f} favState={favState(f.id)} onClick={() => onOpenFiche(f)} />)}
        </div>
      </div>
    </div>
  );
}

export function FavorisView({ fiches, favoris, onBack, onOpenFiche }) {
  const liked = fiches.filter((f) => favoris.liked.includes(f.id));
  return (
    <div className="pb-10">
      <TopBar title="Favoris" onBack={onBack} />
      <div className="p-4">
        <div className="flex flex-col gap-2.5">
          {liked.length === 0 && <div className="text-stone-400 text-sm">Aucune technique ajoutée à vos favoris pour l'instant.</div>}
          {liked.map((f) => <FicheCard key={f.id} f={f} favState="liked" onClick={() => onOpenFiche(f)} />)}
        </div>
      </div>
    </div>
  );
}

export function MesFichesView({ fiches, favoris, onBack, onOpenFiche }) {
  const mine = fiches.filter((f) => f.isLocal);
  return (
    <div className="pb-10">
      <TopBar title="Mes fiches" onBack={onBack} />
      <div className="p-4">
        <p className="text-sm text-stone-500 mb-4">Toutes les fiches que vous avez créées vous-même, au même endroit.</p>
        <div className="flex flex-col gap-2.5">
          {mine.length === 0 && <div className="text-stone-400 text-sm py-8 text-center">Vous n'avez encore créé aucune fiche personnelle.</div>}
          {mine.map((f) => (
            <FicheCard key={f.id} f={f} favState={favoris.liked.includes(f.id) ? "liked" : undefined} onClick={() => onOpenFiche(f)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HistoriqueView({ historique, ficheById, onBack }) {
  return (
    <div className="pb-10">
      <TopBar title="Historique" onBack={onBack} />
      <div className="p-4 flex flex-col gap-2.5">
        {historique.length === 0 && <div className="text-center text-stone-400 text-sm py-10">Aucune utilisation enregistrée pour l'instant.</div>}
        {historique.map((h) => {
          const f = ficheById(h.ficheId);
          const delta = h.avant - h.apres;
          return (
            <div key={h.id} className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-emerald-950 text-sm">{f ? f.titre : "Fiche indisponible"}</div>
                <span className="text-xs text-stone-400">{new Date(h.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="text-stone-500">Avant <b className="text-stone-800">{h.avant}/10</b></span>
                <ChevronRight size={14} className="text-stone-300" />
                <span className="text-stone-500">Après <b className="text-stone-800">{h.apres}/10</b></span>
                <Badge tone={delta > 0 ? "emerald" : delta < 0 ? "rose" : "stone"}>{delta > 0 ? `-${delta} d'intensité` : delta < 0 ? `+${-delta}` : "stable"}</Badge>
              </div>
              {h.commentaire && <div className="text-sm text-stone-600 mt-1.5 italic">« {h.commentaire} »</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Favoris côté Aidant : favoris y est un simple tableau d'ids (pas
// {liked, disliked} comme côté Pro), d'où ce petit écran dédié plutôt
// que de réutiliser FavorisView tel quel.
export function FavorisEquipeView({ structureId, fiches, onBack, onOpenFiche }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!structureId) { setLoading(false); return; }
    supabase.from("favoris_equipe").select("*").eq("structure_id", structureId).order("created_at", { ascending: false })
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, [structureId]);

  const resolved = rows.map((r) => ({
    row: r,
    fiche: fiches.find((f) => f.techniqueId === r.fiche_id || f.id === r.fiche_id),
  }));

  return (
    <div className="pb-10">
      <TopBar title="Favoris de l'équipe" onBack={onBack} />
      <div className="p-4">
        <p className="text-sm text-stone-500 mb-4">Techniques recommandées par votre administrateur, pour toute l'équipe.</p>
        <div className="flex flex-col gap-2.5">
          {!loading && rows.length === 0 && <div className="text-stone-400 text-sm py-8 text-center">Aucun favori d'équipe pour l'instant.</div>}
          {resolved.map(({ row, fiche }) => (
            fiche ? (
              <FicheCard key={row.id} f={fiche} onClick={() => onOpenFiche(fiche)} />
            ) : (
              <div key={row.id} className="bg-stone-50 rounded-xl p-3.5 text-sm text-stone-400 italic">{row.fiche_titre} (fiche indisponible)</div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export function AidantFavorisView({ fiches, favoris, onBack, onOpenFiche }) {
  const liked = fiches.filter((f) => favoris.includes(f.id));
  return (
    <div className="pb-10">
      <TopBar title="Mes favoris" onBack={onBack} />
      <div className="p-4">
        {liked.length === 0 ? (
          <div className="text-center text-stone-400 text-sm py-16 flex flex-col items-center gap-3">
            <Heart size={28} className="text-stone-300" />
            <span>Touchez le cœur sur une fiche pour la retrouver ici.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {liked.map((f) => (
              <button key={f.id} onClick={() => onOpenFiche(f)} className="w-full text-left bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm active:scale-[0.99] transition flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Badge tone="emerald">{f.categorie}</Badge>
                    {f.isLocal && <Badge tone="amber">Votre idée</Badge>}
                  </div>
                  <div className="font-semibold text-emerald-950 truncate">{f.titre}</div>
                  <div className="text-sm text-stone-500 line-clamp-2 mt-0.5">{f.description}</div>
                </div>
                <Heart size={18} className="fill-rose-500 text-rose-500 shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
