// Écran de statistiques globales, réservé au super-admin.
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { RefreshCw, Download } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { fetchAllRows } from "../lib/utils.js";
import { Badge, TopBar } from "./ui.jsx";
import { essaiJoursRestants, StatBlock } from "./adminShared.jsx";
import { generateStatsPdfGlobal, generateStatsPdfStructures } from "../lib/statsExport.js";

export function SuperAdminStatsView({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [usage, setUsage] = useState(null);
  const [signalements, setSignalements] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [usageParStructure, setUsageParStructure] = useState([]);
  const [temoignages, setTemoignages] = useState([]);
  const [exportBusy, setExportBusy] = useState(null); // "global" | "structures" | null
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [structRes, profRes, fichesRes, usageRes, signalRes, evenRes, usageStructRes, temoinRes] = await Promise.all([
      fetchAllRows(supabase, "structures", "id, nom, quota, suspended, essai_duree_semaines, created_at"),
      fetchAllRows(supabase, "profiles", "id, structure_id, plan, actif, created_at"),
      fetchAllRows(supabase, "interventions", "categorie, niveau_detail, type_fiche"),
      supabase.rpc("stats_usage_bibliotheque"),
      supabase.from("signalements").select("*").order("created_at", { ascending: false }),
      fetchAllRows(supabase, "structures_evenements", "structure_id, type_evenement, created_at"),
      supabase.rpc("stats_usage_par_structure"),
      fetchAllRows(supabase, "temoignages", "structure_id, note, commentaire, autorise_citation, created_at"),
    ]);
    if (structRes.error || profRes.error || fichesRes.error || usageRes.error) {
      setError((structRes.error || profRes.error || fichesRes.error || usageRes.error).message);
    }
    setStructures(structRes.data || []);
    setProfiles(profRes.data || []);
    setFiches(fichesRes.data || []);
    setUsage(usageRes.data || null);
    setSignalements(signalRes.data || []);
    setEvenements(evenRes.data || []);
    setUsageParStructure(usageStructRes.data || []);
    setTemoignages(temoinRes.data || []);
    setLoading(false);
  }, []);

  const toggleResolu = async (id, current) => {
    setSignalements((s) => s.map((x) => (x.id === id ? { ...x, resolu: !current } : x)));
    await supabase.from("signalements").update({ resolu: !current }).eq("id", id);
  };

  const deleteSignalement = async (id) => {
    setSignalements((s) => s.filter((x) => x.id !== id));
    await supabase.from("signalements").delete().eq("id", id);
  };

  // Cumuls calculés directement depuis la liste déjà chargée, sans
  // requête supplémentaire.
  const signalementsCeMois = useMemo(() => {
    const debut = new Date(); debut.setDate(1); debut.setHours(0, 0, 0, 0);
    return signalements.filter((s) => new Date(s.created_at) >= debut).length;
  }, [signalements]);
  const signalementsCetteAnnee = useMemo(() => {
    const debut = new Date(new Date().getFullYear(), 0, 1);
    return signalements.filter((s) => new Date(s.created_at) >= debut).length;
  }, [signalements]);

  useEffect(() => { load(); }, [load]);

  const [openTop, setOpenTop] = useState(false);
  const [openTopSemaine, setOpenTopSemaine] = useState(false);
  const [openContenu, setOpenContenu] = useState(false);
  const [openParCategorie, setOpenParCategorie] = useState(false);
  const [openParStructure, setOpenParStructure] = useState(false);
  const usageParStructureTriee = useMemo(
    () => usageParStructure.slice().sort((a, b) => b.vues_mois - a.vues_mois),
    [usageParStructure]
  );

  // --- Croissance & comptes ---
  const structStatus = useMemo(() => structures.map((s) => {
    const jours = essaiJoursRestants(s);
    if (s.suspended) return "suspendue";
    if (jours == null) return "actif";
    if (jours <= 0) return "essai_termine";
    return "essai_cours";
  }), [structures]);
  const nbActif = structStatus.filter((s) => s === "actif").length;
  const nbEssaiCours = structStatus.filter((s) => s === "essai_cours").length;
  const nbEssaiTermine = structStatus.filter((s) => s === "essai_termine").length;
  const nbSuspendue = structStatus.filter((s) => s === "suspendue").length;
  const comptesActifs = profiles.filter((p) => p.actif).length;

  // --- Nouveau graphique période (semaine/mois/année), à partir du
  // journal d'événements (créations réelles depuis toujours, via le
  // rattrapage initial ; suspensions/réactivations à partir de la
  // mise en place du journal seulement).
  const [periode, setPeriode] = useState("mois");
  const bucketsParPeriode = useMemo(() => {
    const creations = evenements.filter((e) => e.type_evenement === "creation");
    // Chaque entrée porte une clé de tri numérique séparée de son
    // libellé affiché -- Object.entries() ne trie jamais par ordre
    // chronologique, seulement par ordre d'insertion, d'où le
    // désordre observé (S34 avant S32...).
    const bucketOf = (d) => {
      const date = new Date(d);
      if (periode === "semaine") {
        const onejan = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        return { sortKey: date.getFullYear() * 100 + week, label: `S${week} '${String(date.getFullYear()).slice(2)}` };
      }
      if (periode === "annee") return { sortKey: date.getFullYear(), label: String(date.getFullYear()) };
      return { sortKey: date.getFullYear() * 100 + date.getMonth(), label: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) };
    };
    const map = {};
    creations.forEach((e) => {
      const { sortKey, label } = bucketOf(e.created_at);
      if (!map[sortKey]) map[sortKey] = { label, count: 0 };
      map[sortKey].count += 1;
    });
    const entries = Object.entries(map)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => [v.label, v.count]);
    const maxPoints = periode === "semaine" ? 8 : periode === "annee" ? 5 : 6;
    return entries.slice(-maxPoints);
  }, [evenements, periode]);
  const essaisChartRef = useRef(null);
  const essaisChartInstance = useRef(null);
  useEffect(() => {
    if (!essaisChartRef.current || loading) return;
    let cancelled = false;
    import("chart.js/auto").then(({ Chart }) => {
      if (cancelled || !essaisChartRef.current) return;
      if (essaisChartInstance.current) essaisChartInstance.current.destroy();
      essaisChartInstance.current = new Chart(essaisChartRef.current, {
        type: "bar",
        data: {
          labels: bucketsParPeriode.map(([k]) => k),
          datasets: [{ data: bucketsParPeriode.map(([, n]) => n), backgroundColor: "#0f6e56", borderRadius: 4, maxBarThickness: 28 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0, color: "#a8a29e", font: { size: 11 } }, grid: { color: "#f1efe8" } },
            x: { grid: { display: false }, ticks: { color: "#a8a29e", font: { size: 11 } } },
          },
        },
      });
    });
    return () => { cancelled = true; essaisChartInstance.current?.destroy(); };
  }, [bucketsParPeriode, loading]);

  const categorieChartRef = useRef(null);
  const categorieChartInstance = useRef(null);

  // --- Santé commerciale ---
  const essaisBientotFinis = useMemo(() => structures
    .map((s) => ({ ...s, jours: essaiJoursRestants(s) }))
    .filter((s) => !s.suspended && s.jours != null && s.jours > 0 && s.jours <= 7)
    .sort((a, b) => a.jours - b.jours), [structures]);

  const quotasProches = useMemo(() => structures.map((s) => {
    const nb = profiles.filter((p) => p.structure_id === s.id && p.actif).length;
    return { ...s, nbComptes: nb, pct: s.quota > 0 ? Math.round((nb / s.quota) * 100) : 0 };
  }).filter((s) => s.pct >= 80).sort((a, b) => b.pct - a.pct), [structures, profiles]);

  // --- Contenu bibliothèque ---
  // Les outils spécifiques sont exclus du calcul Standard/Expert, comme
  // sur l'accueil ("X techniques" y exclut aussi les outils) -- comptés
  // à part ci-dessous pour rester cohérent entre les deux écrans.
  const fichesNonOutils = useMemo(() => fiches.filter((f) => f.type_fiche !== "outil"), [fiches]);
  const nbOutils = fiches.length - fichesNonOutils.length;
  const parCategorie = useMemo(() => {
    const map = {};
    fichesNonOutils.forEach((f) => { map[f.categorie] = (map[f.categorie] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [fichesNonOutils]);
  const nbExpert = fichesNonOutils.filter((f) => f.niveau_detail === "expert").length;
  const nbStandard = fichesNonOutils.length - nbExpert;

  const exportGlobal = async () => {
    setExportBusy("global");
    try {
      await generateStatsPdfGlobal({
        usage, structures, parCategorie, nbStandard, nbExpert, nbOutils, temoignages,
        structStatusCounts: { actif: nbActif, essaiCours: nbEssaiCours, essaiTermine: nbEssaiTermine, suspendue: nbSuspendue },
      });
    } finally {
      setExportBusy(null);
    }
  };

  const exportStructures = async () => {
    setExportBusy("structures");
    try {
      const details = {};
      await Promise.all(structures.map(async (s) => {
        const { data } = await supabase.rpc("stats_detail_structure", { p_structure_id: s.id });
        details[s.id] = data || {};
      }));
      await generateStatsPdfStructures(structures, usageParStructure, details);
    } finally {
      setExportBusy(null);
    }
  };

  useEffect(() => {
    if (!categorieChartRef.current || loading || parCategorie.length === 0) return;
    let cancelled = false;
    import("chart.js/auto").then(({ Chart }) => {
      if (cancelled || !categorieChartRef.current) return;
      if (categorieChartInstance.current) categorieChartInstance.current.destroy();
      const top6 = parCategorie.slice(0, 6);
      categorieChartInstance.current = new Chart(categorieChartRef.current, {
        type: "bar",
        data: {
          labels: top6.map(([c]) => c.length > 22 ? c.slice(0, 20) + "…" : c),
          datasets: [{ data: top6.map(([, n]) => n), backgroundColor: "#0f6e56", borderRadius: 4, maxBarThickness: 16 }],
        },
        options: {
          indexAxis: "y", responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { grid: { display: false }, ticks: { color: "#78716c", font: { size: 11 } } },
          },
        },
      });
    });
    return () => { cancelled = true; categorieChartInstance.current?.destroy(); };
  }, [parCategorie, loading]);

  return (
    <div className="pb-10">
      <TopBar title="Statistiques" onBack={onBack} right={
        <div className="flex items-center gap-1">
          <button onClick={exportGlobal} disabled={exportBusy === "global"} className="p-2 text-emerald-700 disabled:opacity-40" title="Exporter les statistiques globales en PDF">
            <Download size={17} />
          </button>
          <button onClick={load} className="p-2 text-emerald-700"><RefreshCw size={17} /></button>
        </div>
      } />
      <div className="p-4 space-y-8">
        {loading && <div className="text-center text-stone-400 text-sm py-10">Chargement…</div>}
        {error && <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">{error}</div>}

        {!loading && !error && (
          <>
            {/* Indicateurs clés */}
            <section>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="bg-emerald-900 rounded-2xl p-3.5">
                  <div className="text-xs text-emerald-200 mb-1">Vues ce mois</div>
                  <div className="text-2xl font-bold text-white">{usage?.total_vues_mois ?? 0}</div>
                </div>
                <StatBlock label="Vues cette semaine" value={usage?.total_vues_semaine ?? 0} />
                <StatBlock label="PDF téléchargés" value={usage?.total_telechargements_mois ?? 0} />
                <div className="bg-amber-100 rounded-2xl p-3.5">
                  <div className="text-xs text-amber-800 mb-1">Signalements</div>
                  <div className="text-2xl font-bold text-amber-950">{signalements.filter((s) => !s.resolu).length}</div>
                </div>
              </div>
            </section>

            {/* Croissance & comptes */}
            <section>
              <h2 className="text-sm font-bold text-emerald-950 mb-3">Croissance & comptes</h2>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <StatBlock label="Actives" value={nbActif} tone="emerald" />
                <StatBlock label="En essai" value={nbEssaiCours} tone="amber" />
                <StatBlock label="Essai terminé" value={nbEssaiTermine} tone="rose" />
                <StatBlock label="Suspendues" value={nbSuspendue} tone="rose" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <StatBlock label="Structures au total" value={structures.length} />
                <StatBlock label="Comptes actifs" value={comptesActifs} sub={`${profiles.length} comptes créés au total`} />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-emerald-900/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Nouveaux essais</div>
                  <div className="flex gap-1 bg-stone-100 rounded-lg p-0.5">
                    {[["semaine", "Semaine"], ["mois", "Mois"], ["annee", "Année"]].map(([val, lab]) => (
                      <button key={val} onClick={() => setPeriode(val)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md ${periode === val ? "bg-emerald-700 text-white" : "text-stone-500"}`}>
                        {lab}
                      </button>
                    ))}
                  </div>
                </div>
                {bucketsParPeriode.length === 0 ? (
                  <div className="text-sm text-stone-400 text-center py-6">Pas encore de données pour cette période.</div>
                ) : (
                  <div className="relative h-[150px]"><canvas ref={essaisChartRef} role="img" aria-label="Nouveaux essais par période" /></div>
                )}
              </div>
            </section>

            {/* Usage par structure */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-emerald-950">Usage par structure</h2>
                <div className="flex items-center gap-3">
                  <button onClick={exportStructures} disabled={exportBusy === "structures"} className="text-xs text-emerald-700 font-semibold disabled:opacity-40 flex items-center gap-1">
                    <Download size={13} /> {exportBusy === "structures" ? "Export…" : "Export PDF"}
                  </button>
                  <button onClick={() => setOpenParStructure((o) => !o)} className="text-xs text-stone-400 font-semibold">{openParStructure ? "Réduire ▾" : "Détail ▸"}</button>
                </div>
              </div>
              {openParStructure && (
                <div className="bg-white rounded-2xl border border-emerald-900/5 divide-y divide-emerald-900/5">
                  {usageParStructureTriee.length === 0 && <div className="px-4 py-3 text-sm text-stone-400">Aucune donnée pour l'instant.</div>}
                  {usageParStructureTriee.map((s) => (
                    <div key={s.structure_id} className="px-4 py-3">
                      <div className="text-sm font-semibold text-emerald-950 mb-1.5">{s.structure_nom}</div>
                      <div className="flex gap-4 text-xs text-stone-500">
                        <span><b className="text-emerald-700">{s.vues_mois}</b> vues ce mois</span>
                        <span><b className="text-emerald-700">{s.vues_semaine}</b> cette semaine</span>
                        <span><b className="text-emerald-700">{s.telechargements_mois}</b> PDF ce mois</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Témoignages */}
            <section>
              <h2 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
                Témoignages
                {temoignages.filter((t) => t.autorise_citation).length > 0 && (
                  <Badge tone="emerald">{temoignages.filter((t) => t.autorise_citation).length} citable{temoignages.filter((t) => t.autorise_citation).length > 1 ? "s" : ""}</Badge>
                )}
              </h2>
              <div className="bg-white rounded-2xl border border-emerald-900/5 divide-y divide-emerald-900/5">
                {temoignages.length === 0 && <div className="px-4 py-3 text-sm text-stone-400">Aucun témoignage pour l'instant.</div>}
                {temoignages.map((t, i) => {
                  const nomStructure = structures.find((s) => s.id === t.structure_id)?.nom || "Structure";
                  return (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-emerald-950">{t.autorise_citation ? nomStructure : "Structure anonyme"}</span>
                          {t.autorise_citation && <Badge tone="emerald">citable</Badge>}
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((n) => <span key={n} className={`text-xs ${n <= t.note ? "text-amber-500" : "text-stone-200"}`}>★</span>)}
                        </div>
                      </div>
                      {t.commentaire && <p className="text-sm text-stone-600 italic">"{t.commentaire}"</p>}
                      <p className="text-[11px] text-stone-400 mt-1">{new Date(t.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                  );
                })}
              </div>
            </section>


            <section>
              <h2 className="text-sm font-bold text-emerald-950 mb-3">Santé commerciale</h2>
              <div className="bg-white rounded-2xl border border-emerald-900/5 divide-y divide-emerald-900/5 mb-3">
                <div className="px-4 py-2.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Essais se terminant sous 7 jours</div>
                {essaisBientotFinis.length === 0 && <div className="px-4 py-3 text-sm text-stone-400">Aucun essai proche de l'échéance.</div>}
                {essaisBientotFinis.map((s) => (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-950">{s.nom}</span>
                    <Badge tone={s.jours <= 3 ? "rose" : "amber"}>{s.jours} j restants</Badge>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-emerald-900/5 divide-y divide-emerald-900/5">
                <div className="px-4 py-2.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Quotas presque atteints (≥ 80%)</div>
                {quotasProches.length === 0 && <div className="px-4 py-3 text-sm text-stone-400">Aucune structure proche de son quota.</div>}
                {quotasProches.map((s) => (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-950">{s.nom}</span>
                    <Badge tone={s.pct >= 100 ? "rose" : "amber"}>{s.nbComptes} / {s.quota} ({s.pct}%)</Badge>
                  </div>
                ))}
              </div>
            </section>

            {/* Usage de la bibliothèque */}
            <section>
              <h2 className="text-sm font-bold text-emerald-950 mb-3">Usage de la bibliothèque</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <StatBlock label="Jamais consultées" value={usage?.fiches_jamais_consultees ?? 0} tone={usage?.fiches_jamais_consultees > 0 ? "amber" : "stone"} />
                <StatBlock label="Taux de mise en favori" value={`${usage?.taux_favoris ?? 0}%`} sub="favoris / fiches consultées" />
              </div>
              {usage?.par_profession?.length > 0 && (
                <div className="bg-white rounded-2xl border border-emerald-900/5 p-4 mb-3">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Répartition par métier</div>
                  {usage.par_profession.map((p) => (
                    <div key={p.profession} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-emerald-950">{p.profession}</span>
                      <span className="font-bold text-stone-500">{p.nb}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white rounded-2xl border border-emerald-900/5 p-4 mb-3">
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Top fiches — ce mois</div>
                {(!usage?.top_fiches || usage.top_fiches.length === 0) && <div className="text-sm text-stone-400 py-2">Aucune consultation ce mois-ci.</div>}
                <div className="flex flex-col gap-2">
                  {usage?.top_fiches?.slice(0, openTop ? 10 : 5).map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-300 w-4">{i + 1}</span>
                      <span className="text-sm text-emerald-950 flex-1">{t.titre}</span>
                      <span className="text-xs font-bold text-emerald-700">{t.vues} vues</span>
                    </div>
                  ))}
                </div>
                {usage?.top_fiches?.length > 5 && (
                  <button onClick={() => setOpenTop((o) => !o)} className="w-full mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-400 font-semibold text-center">
                    {openTop ? "Réduire ▾" : "Voir le top 10 complet ▸"}
                  </button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-emerald-900/5 p-4">
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Top fiches — cette semaine</div>
                {(!usage?.top_fiches_semaine || usage.top_fiches_semaine.length === 0) && <div className="text-sm text-stone-400 py-2">Aucune consultation cette semaine.</div>}
                <div className="flex flex-col gap-2">
                  {usage?.top_fiches_semaine?.slice(0, openTopSemaine ? 10 : 5).map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-300 w-4">{i + 1}</span>
                      <span className="text-sm text-emerald-950 flex-1">{t.titre}</span>
                      <span className="text-xs font-bold text-emerald-700">{t.vues} vues</span>
                    </div>
                  ))}
                </div>
                {usage?.top_fiches_semaine?.length > 5 && (
                  <button onClick={() => setOpenTopSemaine((o) => !o)} className="w-full mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-400 font-semibold text-center">
                    {openTopSemaine ? "Réduire ▾" : "Voir plus ▸"}
                  </button>
                )}
              </div>
            </section>

            {/* Contenu de la bibliothèque */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-emerald-950">Bibliothèque — {fiches.length} fiches</h2>
                <button onClick={() => setOpenContenu((o) => !o)} className="text-xs text-stone-400 font-semibold">{openContenu ? "Réduire ▾" : "Détail ▸"}</button>
              </div>
              <div className="bg-white rounded-2xl border border-emerald-900/5 p-4 mb-3">
                {parCategorie.length === 0 ? (
                  <div className="text-sm text-stone-400 text-center py-4">Aucune donnée.</div>
                ) : (
                  <div className="relative h-[170px]"><canvas ref={categorieChartRef} role="img" aria-label="Répartition des 6 plus grandes catégories de fiches" /></div>
                )}
                <button onClick={() => setOpenParCategorie((o) => !o)} className="w-full mt-2 text-[11px] text-stone-400 font-semibold text-center">
                  {openParCategorie ? "Réduire ▾" : `Voir les ${parCategorie.length} catégories ▸`}
                </button>
                {openParCategorie && (
                  <div className="mt-2 pt-2 border-t border-stone-100 divide-y divide-stone-50">
                    {parCategorie.map(([cat, n]) => (
                      <div key={cat} className="py-2 flex items-center justify-between">
                        <span className="text-sm text-emerald-950">{cat}</span>
                        <span className="text-xs font-bold text-stone-500">{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {openContenu && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <StatBlock label="Fiches standard" value={nbStandard} />
                  <StatBlock label="Fiches Expert" value={nbExpert} tone="emerald" />
                  <StatBlock label="Outils spécifiques" value={nbOutils} sub="comptés à part" />
                </div>
              )}
            </section>

            {/* Signalements */}
            <section>
              <h2 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
                Signalements
                {signalements.filter((s) => !s.resolu).length > 0 && <Badge tone="rose">{signalements.filter((s) => !s.resolu).length} à traiter</Badge>}
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <StatBlock label="Signalements ce mois" value={signalementsCeMois} />
                <StatBlock label="Signalements cette année" value={signalementsCetteAnnee} />
              </div>
              <div className="bg-white rounded-2xl border border-emerald-900/5 divide-y divide-emerald-900/5">
                {signalements.length === 0 && <div className="px-4 py-3 text-sm text-stone-400">Aucun signalement pour l'instant.</div>}
                {signalements.map((s) => (
                  <div key={s.id} className={`px-4 py-3 ${s.resolu ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-emerald-950">{s.fiche_titre}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => toggleResolu(s.id, s.resolu)} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.resolu ? "bg-stone-100 text-stone-500" : "bg-amber-100 text-amber-800"}`}>
                          {s.resolu ? "Résolu" : "Marquer résolu"}
                        </button>
                        <button onClick={() => deleteSignalement(s.id)} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100">
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 mb-1">{s.message}</p>
                    <p className="text-[11px] text-stone-400">{s.technique_id ? s.technique_id + " · " : ""}{new Date(s.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
