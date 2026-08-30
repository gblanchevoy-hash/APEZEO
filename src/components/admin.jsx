// Écrans réservés aux administrateurs (structure ou super-admin) :
// statistiques, création de structure, gestion d'équipe, mon compte.
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Plus, Trash2, UserCheck, UserX, Copy, RefreshCw, AlertTriangle, Clock,
  FileText, LogOut, Eye, EyeOff,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { fetchAllRows } from "../lib/utils.js";
import { PROFESSIONS } from "../data/constants.js";
import { Badge, TopBar, Field, inputCls } from "./ui.jsx";

export function generateCode(nom) {
  const base = (nom || "STRUCTURE")
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10) || "STRUCTURE";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

export function essaiJoursRestants(s) {
  if (s.essai_duree_semaines == null) return null;
  const fin = new Date(s.created_at);
  fin.setDate(fin.getDate() + s.essai_duree_semaines * 7);
  return Math.ceil((fin - new Date()) / 86400000);
}

export function StructureStatusBadge({ s }) {
  const jours = essaiJoursRestants(s);
  if (s.suspended) {
    return <Badge tone="rose">{jours != null && jours <= 0 ? "Suspendue (essai terminé)" : "Suspendue"}</Badge>;
  }
  if (jours == null) return <Badge tone="emerald">Abonnement actif</Badge>;
  if (jours <= 0) return <Badge tone="rose">⚠ Essai terminé, non suspendue</Badge>;
  if (jours <= 3) return <Badge tone="rose">Essai : {jours} j restant{jours > 1 ? "s" : ""}</Badge>;
  return <Badge tone="amber">Essai : {jours} j restants</Badge>;
}

export function StatBlock({ label, value, sub, tone = "stone" }) {
  const tones = { stone: "text-emerald-950", rose: "text-rose-600", amber: "text-amber-700", emerald: "text-emerald-700" };
  return (
    <div className="bg-white rounded-2xl p-4 border border-emerald-900/5">
      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${tones[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export function SuperAdminStatsView({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [usage, setUsage] = useState(null);
  const [signalements, setSignalements] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [structRes, profRes, fichesRes, usageRes, signalRes, evenRes] = await Promise.all([
      fetchAllRows(supabase, "structures", "id, nom, quota, suspended, essai_duree_semaines, created_at"),
      fetchAllRows(supabase, "profiles", "id, structure_id, plan, actif, created_at"),
      fetchAllRows(supabase, "interventions", "categorie, niveau_detail, type_fiche"),
      supabase.rpc("stats_usage_bibliotheque"),
      supabase.from("signalements").select("*").order("created_at", { ascending: false }),
      fetchAllRows(supabase, "structures_evenements", "structure_id, type_evenement, created_at"),
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
      <TopBar title="Statistiques" onBack={onBack} right={<button onClick={load} className="p-2 text-emerald-700"><RefreshCw size={17} /></button>} />
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

            {/* Santé commerciale */}
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
              <div className="grid grid-cols-1 gap-3 mb-3">
                <StatBlock label="Jamais consultées" value={usage?.fiches_jamais_consultees ?? 0} tone={usage?.fiches_jamais_consultees > 0 ? "amber" : "stone"} />
              </div>
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

export function CreateStructureView({ onBack }) {
  const [nom, setNom] = useState("");
  const [quota, setQuota] = useState(30);
  const [code, setCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [essaiSemaines, setEssaiSemaines] = useState("");
  const [confirmNoAdmin, setConfirmNoAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [structures, setStructures] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [rowBusyId, setRowBusyId] = useState(null);
  const [rowMsg, setRowMsg] = useState(null); // {id, ok, text}
  const [editQuotaId, setEditQuotaId] = useState(null);
  const [editQuotaValue, setEditQuotaValue] = useState("");
  const [editParamsId, setEditParamsId] = useState(null);
  const [editEssaiValue, setEditEssaiValue] = useState("");
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [savingParams, setSavingParams] = useState(false);

  const loadStructures = useCallback(async () => {
    setLoadingList(true);
    const { data } = await supabase.from("structures").select("*").order("created_at", { ascending: false });
    setStructures(data || []);
    setLoadingList(false);
  }, []);

  useEffect(() => { loadStructures(); }, [loadStructures]);
  useEffect(() => { if (nom && !code) setCode(generateCode(nom)); }, [nom]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() && !confirmNoAdmin) {
      setConfirmNoAdmin(true);
      return;
    }
    setBusy(true);
    setError("");
    const finalCode = code.trim() || generateCode(nom);
    const { data: newStructure, error: structError } = await supabase
      .from("structures")
      .insert({
        nom: nom.trim(),
        code_invitation: finalCode,
        quota: Number(quota),
        essai_duree_semaines: essaiSemaines.trim() ? Number(essaiSemaines) : null,
      })
      .select()
      .single();

    if (structError) { setError(structError.message); setBusy(false); return; }

    if (adminEmail.trim()) {
      const { error: adminError } = await supabase
        .from("profiles")
        .update({ structure_id: newStructure.id, role: "admin", plan: "structure" })
        .ilike("email", adminEmail.trim());
      if (adminError) { setError("Structure créée, mais échec de la promotion admin : " + adminError.message); }
    }

    setCreated(newStructure);
    setNom(""); setQuota(30); setCode(""); setAdminEmail(""); setEssaiSemaines(""); setConfirmNoAdmin(false);
    setBusy(false);
    loadStructures();
  };

  const copyRowCode = (s) => {
    navigator.clipboard.writeText(s.code_invitation);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleSuspend = async (s) => {
    setRowBusyId(s.id);
    setRowMsg(null);
    const { data, error } = await supabase.rpc("set_structure_suspended", { p_structure_id: s.id, p_suspend: !s.suspended });
    setRowBusyId(null);
    const result = data && data[0];
    if (error || !result?.success) {
      setRowMsg({ id: s.id, ok: false, text: error?.message || result?.message || "Échec." });
      return;
    }
    setRowMsg({ id: s.id, ok: true, text: result.message });
    loadStructures();
  };

  const deleteStructure = async (s) => {
    setRowBusyId(s.id);
    setRowMsg(null);
    const { data, error } = await supabase.rpc("delete_structure", { p_structure_id: s.id });
    setRowBusyId(null);
    setConfirmDeleteId(null);
    const result = data && data[0];
    if (error || !result?.success) {
      setRowMsg({ id: s.id, ok: false, text: error?.message || result?.message || "Échec." });
      return;
    }
    loadStructures();
  };

  const saveQuota = async (s) => {
    const next = Number(editQuotaValue);
    if (!next || next < 1) { setRowMsg({ id: s.id, ok: false, text: "Le quota doit être un nombre positif." }); return; }
    setRowBusyId(s.id);
    setRowMsg(null);
    const { error } = await supabase.from("structures").update({ quota: next }).eq("id", s.id);
    setRowBusyId(null);
    if (error) { setRowMsg({ id: s.id, ok: false, text: error.message }); return; }
    setRowMsg({ id: s.id, ok: true, text: "Quota mis à jour." });
    setEditQuotaId(null);
    loadStructures();
  };

  const openEditParams = (s) => {
    setEditParamsId(editParamsId === s.id ? null : s.id);
    setEditEssaiValue(s.essai_duree_semaines != null ? String(s.essai_duree_semaines) : "");
    setEditAdminEmail("");
  };

  const saveStructureParams = async (s) => {
    setSavingParams(true);
    setRowMsg(null);
    const { error: essaiError } = await supabase
      .from("structures")
      .update({ essai_duree_semaines: editEssaiValue.trim() ? Number(editEssaiValue) : null })
      .eq("id", s.id);
    if (essaiError) {
      setSavingParams(false);
      setRowMsg({ id: s.id, ok: false, text: essaiError.message });
      return;
    }
    if (editAdminEmail.trim()) {
      const { error: adminError } = await supabase
        .from("profiles")
        .update({ structure_id: s.id, role: "admin", plan: "structure" })
        .ilike("email", editAdminEmail.trim());
      if (adminError) {
        setSavingParams(false);
        setRowMsg({ id: s.id, ok: false, text: "Essai mis à jour, mais échec de la promotion admin : " + adminError.message });
        return;
      }
    }
    setSavingParams(false);
    setRowMsg({ id: s.id, ok: true, text: "Paramètres mis à jour." });
    setEditParamsId(null);
    loadStructures();
  };

  return (
    <div className="pb-10">
      <TopBar title="Créer une structure" onBack={onBack} />
      <div className="p-4">
        <form onSubmit={submit} className="bg-white rounded-xl p-4 border border-emerald-900/5 shadow-sm mb-5">
          <Field label="Nom de l'établissement">
            <input required className={inputCls} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="EHPAD Les Tilleuls" />
          </Field>
          <Field label="Quota de comptes">
            <input required type="number" min={1} className={inputCls} value={quota} onChange={(e) => setQuota(e.target.value)} />
          </Field>
          <Field label="Code d'invitation">
            <div className="flex gap-2">
              <input className={inputCls + " font-mono"} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
              <button type="button" onClick={() => setCode(generateCode(nom))} className="px-3 rounded-lg border border-stone-300 text-sm text-stone-600">↻</button>
            </div>
          </Field>
          <Field label="E-mail du premier admin (optionnel)">
            <input type="email" className={inputCls} value={adminEmail} onChange={(e) => { setAdminEmail(e.target.value); setConfirmNoAdmin(false); }} placeholder="directeur@etablissement.fr" />
            <p className="text-xs text-stone-400 mt-1">Doit déjà avoir un compte créé dans l'app (avec ou sans code) pour être promu.</p>
          </Field>
          <Field label="Durée d'essai en semaines (optionnel)">
            <input
              type="number" min={1} className={inputCls} value={essaiSemaines}
              onChange={(e) => setEssaiSemaines(e.target.value)}
              placeholder="Laisser vide = pas de limite d'essai"
            />
            <p className="text-xs text-stone-400 mt-1">Décompte automatique depuis aujourd'hui. À l'échéance, l'accès de toute l'équipe (admin compris) se verrouille automatiquement — laissez vide pour une structure déjà payante.</p>
          </Field>

          {error && <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-sm text-rose-700 mb-3">{error}</div>}
          {confirmNoAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-sm text-amber-800 mb-3 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>Aucun e-mail d'admin renseigné — personne ne pourra gérer cette structure tant que vous n'en promouvez pas un manuellement. Cliquez à nouveau pour confirmer.</span>
            </div>
          )}
          {created && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-sm text-emerald-800 mb-3">
              Structure "{created.nom}" créée — code : <span className="font-mono font-semibold">{created.code_invitation}</span>
            </div>
          )}

          <button type="submit" disabled={busy} className={`w-full ${confirmNoAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-700 hover:bg-emerald-800"} hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2 text-white font-semibold rounded-2xl transition-all duration-200 py-3 flex items-center justify-center gap-2`}>
            <Plus size={17} /> {confirmNoAdmin ? "Confirmer sans admin" : "Créer la structure"}
          </button>
        </form>

        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">Structures existantes</div>
        {loadingList ? (
          <div className="text-stone-400 text-sm py-6 text-center">Chargement…</div>
        ) : structures.length === 0 ? (
          <div className="text-stone-400 text-sm py-6 text-center">Aucune structure pour l'instant.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {structures.map((s) => (
              <div key={s.id} className={`bg-white rounded-xl p-3 border shadow-sm ${s.suspended ? "border-rose-300" : "border-emerald-900/5"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => openEditParams(s)} className="font-medium text-emerald-950 text-sm flex-1 text-left underline decoration-dotted underline-offset-2 hover:text-emerald-700">
                    {s.nom}
                  </button>
                  <StructureStatusBadge s={s} />
                </div>
                {editParamsId === s.id && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mb-2 flex flex-col gap-2">
                    <Field label="Durée d'essai en semaines">
                      <input
                        type="number" min={1} className={inputCls + " !py-1.5 !text-xs"} value={editEssaiValue}
                        onChange={(e) => setEditEssaiValue(e.target.value)}
                        placeholder="Vide = pas de limite"
                      />
                    </Field>
                    <Field label="Promouvoir un admin (e-mail, optionnel)">
                      <input
                        type="email" className={inputCls + " !py-1.5 !text-xs"} value={editAdminEmail}
                        onChange={(e) => setEditAdminEmail(e.target.value)}
                        placeholder="doit déjà avoir un compte"
                      />
                    </Field>
                    <div className="flex gap-2">
                      <button onClick={() => saveStructureParams(s)} disabled={savingParams} className="flex-1 bg-emerald-700 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg py-1.5">
                        {savingParams ? "…" : "Enregistrer"}
                      </button>
                      <button onClick={() => setEditParamsId(null)} className="flex-1 bg-white border border-stone-300 text-xs rounded-lg py-1.5">Annuler</button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between bg-stone-50 rounded-lg px-2.5 py-1.5 mb-2">
                  <span className="text-xs text-stone-600 font-mono">{s.code_invitation}</span>
                  <button onClick={() => copyRowCode(s)} className="flex items-center gap-1 text-xs text-emerald-700 font-medium shrink-0 ml-2">
                    <Copy size={12} /> {copiedId === s.id ? "Copié !" : "Copier"}
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  {editQuotaId === s.id ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number" min={1} autoFocus value={editQuotaValue}
                        onChange={(e) => setEditQuotaValue(e.target.value)}
                        className="w-20 rounded-lg border border-emerald-300 px-2 py-1 text-xs"
                      />
                      <button onClick={() => saveQuota(s)} disabled={rowBusyId === s.id} className="text-xs font-semibold text-emerald-700">Valider</button>
                      <button onClick={() => setEditQuotaId(null)} className="text-xs text-stone-400">Annuler</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditQuotaId(s.id); setEditQuotaValue(String(s.quota)); }} className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-emerald-700">
                      <span>Quota : <span className="font-semibold">{s.quota}</span> comptes</span>
                      <span className="text-emerald-600 underline">modifier</span>
                    </button>
                  )}
                </div>

                {confirmDeleteId === s.id ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                    <p className="text-xs text-rose-800 mb-2">Supprimer "{s.nom}" ? Ses membres repasseront en accès découverte (aucun compte n'est supprimé). Irréversible.</p>
                    <div className="flex gap-2">
                      <button onClick={() => deleteStructure(s)} disabled={rowBusyId === s.id} className="flex-1 bg-rose-600 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg py-1.5">
                        Confirmer la suppression
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-white border border-stone-300 text-xs rounded-lg py-1.5">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSuspend(s)} disabled={rowBusyId === s.id}
                      className={`flex-1 text-xs font-medium rounded-lg py-1.5 border ${s.suspended ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-amber-300 text-amber-700 bg-amber-50"}`}
                    >
                      {s.suspended ? "Réactiver" : "Suspendre"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="flex-1 text-xs font-medium rounded-lg py-1.5 border border-rose-300 text-rose-600 bg-rose-50"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
                {rowMsg && rowMsg.id === s.id && (
                  <p className={`text-xs mt-1.5 ${rowMsg.ok ? "text-emerald-700" : "text-rose-600"}`}>{rowMsg.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ---------- MON COMPTE (suppression en libre-service) ---------- */
export function MonCompteView({ email, profile, onProfileUpdated, onBack, ficheById }) {
  const [structureNom, setStructureNom] = useState(null);
  const [profession, setProfession] = useState(profile?.profession || PROFESSIONS[0]);
  const [savingProfession, setSavingProfession] = useState(false);
  const [professionMsg, setProfessionMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ ok: false, text: "" });

  const [exporting, setExporting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.structure_id) {
      supabase.from("structures").select("nom").eq("id", profile.structure_id).single()
        .then(({ data }) => setStructureNom(data?.nom || null));
    }
  }, [profile?.structure_id]);

  const planLabel = { gratuit: "Compte gratuit — accès à un échantillon", structure: "Compte structure — accès complet", payant_manuel: "Compte payant" }[profile?.plan] || "Compte gratuit — accès à un échantillon";

  const saveProfession = async () => {
    setSavingProfession(true);
    setProfessionMsg("");
    const { error: err } = await supabase.from("profiles").update({ profession }).eq("id", profile.id);
    setSavingProfession(false);
    if (err) { setProfessionMsg("Échec : " + err.message); return; }
    setProfessionMsg("Mis à jour.");
    onProfileUpdated({ profession });
    setTimeout(() => setProfessionMsg(""), 2000);
  };

  const savePassword = async () => {
    if (newPassword.length < 6) { setPasswordMsg({ ok: false, text: "6 caractères minimum." }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ ok: false, text: "Les mots de passe ne correspondent pas." }); return; }
    setSavingPassword(true);
    setPasswordMsg({ ok: false, text: "" });
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (err) { setPasswordMsg({ ok: false, text: err.message }); return; }
    setPasswordMsg({ ok: true, text: "Mot de passe mis à jour." });
    setNewPassword(""); setConfirmPassword("");
  };

  const downloadMyData = async () => {
    setExporting(true);
    const { default: jsPDF } = await import("jspdf");
    const [{ data: favoris }, { data: historique }, { data: fichesPerso }] = await Promise.all([
      supabase.from("favoris").select("*").order("created_at", { ascending: false }),
      supabase.from("historique").select("*").order("created_at", { ascending: false }),
      supabase.from("fiches_personnelles").select("*").order("created_at", { ascending: false }),
    ]);

    // Charge le logo en base64 pour l'intégrer au PDF
    let logoBase64 = null;
    try {
      const res = await fetch("/logo-phoenix.png");
      const blob = await res.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch { /* pas bloquant si le logo ne charge pas */ }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = 210, pageHeight = 297, marginX = 18;
    let y = 20;

    const addHeader = () => {
      if (logoBase64) doc.addImage(logoBase64, "PNG", marginX, 10, 14, 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(2, 44, 34);
      doc.text("Apézeo", marginX + (logoBase64 ? 18 : 0), 17);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 113, 108);
      doc.text("Bibliothèque de techniques non médicamenteuses — Version Pro", marginX + (logoBase64 ? 18 : 0), 22.5);
      doc.setDrawColor(225, 225, 218);
      doc.setLineWidth(0.3);
      doc.line(marginX, 28, pageWidth - marginX, 28);
    };

    const addFooter = (pageNum, totalPages) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(165, 160, 155);
      doc.text("Document généré automatiquement par Apézeo — usage interne et traçabilité professionnelle.", marginX, pageHeight - 12);
      doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth - marginX, pageHeight - 12, { align: "right" });
    };

    addHeader();
    y = 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(2, 44, 34);
    doc.text("Export de mes données", marginX, y);
    y += 7;

    const now = new Date();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 105, 100);
    doc.text(`Document généré le ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`, marginX, y);
    y += 10;

    // Bloc informations professionnelles
    const blockH = 28;
    doc.setFillColor(246, 247, 244);
    doc.roundedRect(marginX, y, pageWidth - marginX * 2, blockH, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(4, 78, 59);
    doc.text("Informations du compte", marginX + 6, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70, 65, 60);
    doc.text(`E-mail : ${email || "—"}`, marginX + 6, y + 14.5);
    doc.text(`Profession : ${profile?.profession || "—"}`, marginX + 6, y + 19.5);
    doc.text(`Plan : ${profile?.plan === "structure" ? "Structure" : profile?.plan === "solo" ? "Solo" : "Gratuit"}${structureNom ? " — " + structureNom : ""}`, marginX + 6, y + 24.5);
    y += blockH + 10;

    let pageNum = 1;
    const checkPageBreak = (needed) => {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        pageNum += 1;
        addHeader();
        y = 40;
      }
    };

    const addSection = (title, items, renderLine) => {
      checkPageBreak(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(4, 78, 59);
      doc.text(`${title} (${items.length})`, marginX, y);
      y += 6.5;
      if (items.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(160, 155, 150);
        doc.text("Aucune donnée enregistrée.", marginX + 2, y);
        y += 9;
        return;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(55, 50, 45);
      items.forEach((it) => {
        checkPageBreak(6);
        renderLine(it);
      });
      y += 6;
    };

    addSection("Mes favoris", favoris || [], (f) => {
      const fiche = ficheById ? ficheById(f.fiche_id) : null;
      const titre = fiche?.titre || f.fiche_id || "Fiche introuvable";
      doc.text(`•  ${titre}`, marginX + 2, y, { maxWidth: pageWidth - marginX * 2 - 4 });
      y += 5.5;
    });

    addSection("Historique de consultation", historique || [], (h) => {
      const fiche = ficheById ? ficheById(h.fiche_id) : null;
      const titre = fiche?.titre || h.fiche_id || "Fiche introuvable";
      const date = h.created_at ? new Date(h.created_at).toLocaleDateString("fr-FR") : "—";
      doc.text(`•  ${titre}  —  ${date}`, marginX + 2, y, { maxWidth: pageWidth - marginX * 2 - 4 });
      y += 5.5;
    });

    addSection("Mes fiches personnelles", fichesPerso || [], (p) => {
      doc.text(`•  ${p.titre || "Sans titre"}`, marginX + 2, y, { maxWidth: pageWidth - marginX * 2 - 4 });
      y += 5.5;
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    doc.save("apezeo-mes-donnees.pdf");
    setExporting(false);
  };

  const doDelete = async () => {
    setBusy(true);
    setError("");
    const { data, error: err } = await supabase.rpc("delete_own_account");
    const result = data && data[0];
    if (err || !result?.success) {
      setError(err?.message || result?.message || "Échec de la suppression.");
      setBusy(false);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <div className="pb-10">
      <TopBar title="Mon compte" onBack={onBack} />
      <div className="p-4">

        <div className="bg-white rounded-2xl p-4 border border-emerald-900/5 shadow-sm mb-4">
          <div className="text-xs text-stone-400 mb-0.5">Adresse e-mail</div>
          <div className="text-sm text-emerald-950 font-medium mb-3">{email}</div>
          <div className="text-xs text-stone-400 mb-0.5">Type d'accès</div>
          <div className="text-sm text-emerald-950 font-medium mb-3">{planLabel}</div>
          {structureNom && (
            <>
              <div className="text-xs text-stone-400 mb-0.5">Structure de rattachement</div>
              <div className="text-sm text-emerald-950 font-medium">{structureNom}</div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-900/5 shadow-sm mb-4">
          <div className="font-semibold text-emerald-950 text-sm mb-2.5">Votre profession</div>
          <div className="flex gap-2">
            <select className={inputCls + " flex-1"} value={profession} onChange={(e) => setProfession(e.target.value)}>
              {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button onClick={saveProfession} disabled={savingProfession || profession === profile?.profession} className="px-4 rounded-2xl bg-emerald-700 disabled:bg-stone-300 text-white text-sm font-semibold">
              Enregistrer
            </button>
          </div>
          {professionMsg && <p className="text-xs text-emerald-700 mt-2">{professionMsg}</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-900/5 shadow-sm mb-4">
          <div className="font-semibold text-emerald-950 text-sm mb-2.5">Changer de mot de passe</div>
          <div className="flex flex-col gap-2.5">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls + " pr-9"} />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <input type={showPassword ? "text" : "password"} placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} />
            <button onClick={savePassword} disabled={savingPassword || !newPassword} className="bg-emerald-700 disabled:bg-stone-300 text-white text-sm font-semibold rounded-2xl py-2.5">
              {savingPassword ? "Mise à jour…" : "Mettre à jour le mot de passe"}
            </button>
            {passwordMsg.text && <p className={`text-xs ${passwordMsg.ok ? "text-emerald-700" : "text-rose-600"}`}>{passwordMsg.text}</p>}
          </div>
        </div>

        <button onClick={downloadMyData} disabled={exporting} className="w-full flex items-center justify-center gap-2 bg-white border border-emerald-900/5 shadow-sm text-emerald-800 rounded-2xl py-3.5 font-medium mb-4">
          <FileText size={16} /> {exporting ? "Préparation…" : "Télécharger mes données"}
        </button>

        <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 text-stone-500 border border-stone-200 rounded-2xl py-3.5 font-medium mb-4">
          <LogOut size={16} /> Se déconnecter
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full flex items-center justify-center gap-2 text-rose-600 border border-rose-200 rounded-2xl py-3.5 font-medium hover:bg-rose-50 transition-colors">
            <Trash2 size={16} /> Supprimer mon compte
          </button>
        ) : (
          <div className="bg-rose-50 rounded-2xl p-4">
            <p className="text-sm text-rose-800 mb-3">
              Cette action est <strong>irréversible</strong>. Votre compte, vos favoris, votre historique et vos fiches personnelles seront définitivement supprimés.
            </p>
            <p className="text-xs text-rose-700 mb-2">Pour confirmer, tapez <strong>SUPPRIMER</strong> ci-dessous :</p>
            <input
              value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-xl border border-rose-300 px-3 py-2 text-sm mb-3"
              placeholder="SUPPRIMER"
            />
            {error && <p className="text-xs text-rose-700 mb-2">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={doDelete} disabled={confirmText !== "SUPPRIMER" || busy}
                className="flex-1 bg-rose-600 disabled:bg-stone-300 text-white text-sm font-semibold rounded-xl py-2.5"
              >
                {busy ? "Suppression…" : "Confirmer la suppression"}
              </button>
              <button onClick={() => { setConfirmDelete(false); setConfirmText(""); setError(""); }} className="flex-1 bg-white border border-stone-300 text-sm rounded-xl py-2.5">Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminTeamView({ structureId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState(null);
  const [members, setMembers] = useState([]);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [attachEmail, setAttachEmail] = useState("");
  const [attaching, setAttaching] = useState(false);
  const [attachMsg, setAttachMsg] = useState(null); // {ok: bool, text: string}
  const [topFiches, setTopFiches] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);
  const [favorisEquipe, setFavorisEquipe] = useState([]);

  const load = useCallback(async () => {
    if (!structureId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: structData }, { data: memberData }, { data: topData }, { data: weekData }, { data: inviteData }, { data: favData }] = await Promise.all([
      supabase.from("structures").select("*").eq("id", structureId).single(),
      supabase.from("profiles").select("*").eq("structure_id", structureId).order("created_at", { ascending: true }),
      supabase.rpc("top_fiches_structure"),
      supabase.rpc("vues_semaine_structure"),
      supabase.from("invitations_structure").select("*").eq("structure_id", structureId).eq("utilisee", false).order("created_at", { ascending: false }),
      supabase.from("favoris_equipe").select("*").eq("structure_id", structureId).order("created_at", { ascending: false }),
    ]);
    setStructure(structData || null);
    setMembers(memberData || []);
    setTopFiches(topData || []);
    setWeeklyStats(weekData || []);
    setInvitations(inviteData || []);
    setFavorisEquipe(favData || []);
    setLoading(false);
  }, [structureId]);

  useEffect(() => { load(); }, [load]);

  const toggleActif = async (memberId, current) => {
    const { error } = await supabase.from("profiles").update({ actif: !current }).eq("id", memberId);
    if (error) { setToast("Échec : " + error.message); setTimeout(() => setToast(null), 2500); return; }
    setToast(!current ? "Compte réactivé" : "Compte désactivé");
    setTimeout(() => setToast(null), 2000);
    load();
  };

  const [confirmRemove, setConfirmRemove] = useState(null); // id du membre à confirmer
  const removeMember = async (memberId) => {
    const { error } = await supabase.from("profiles").update({ structure_id: null }).eq("id", memberId);
    setConfirmRemove(null);
    if (error) { setToast("Échec : " + error.message); setTimeout(() => setToast(null), 2500); return; }
    setToast("Membre retiré de l'équipe");
    setTimeout(() => setToast(null), 2000);
    load();
  };

  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(null);
  const deleteMemberAccount = async (memberId) => {
    const { data, error } = await supabase.rpc("delete_member_account", { p_member_id: memberId });
    setConfirmDeleteAccount(null);
    const result = data && data[0];
    if (error || !result?.success) {
      setToast("Échec : " + (error?.message || result?.message));
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setToast("Compte supprimé définitivement");
    setTimeout(() => setToast(null), 2000);
    load();
  };

  const attachAccount = async (e) => {
    e.preventDefault();
    setAttaching(true);
    setAttachMsg(null);
    const { data, error } = await supabase.rpc("attach_existing_account", { p_email: attachEmail.trim() });
    setAttaching(false);
    if (error) { setAttachMsg({ ok: false, text: error.message }); return; }
    const result = data && data[0];
    if (result) {
      setAttachMsg({ ok: result.success, text: result.message });
      if (result.success) { setAttachEmail(""); load(); }
    }
  };

  const inviteAccount = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("invitations_structure").insert({
      email: inviteEmail.trim().toLowerCase(), structure_id: structureId, invite_par: user?.id,
    });
    setInviting(false);
    if (error) {
      setInviteMsg({ ok: false, text: error.code === "23505" ? "Cette adresse a déjà une invitation en attente." : error.message });
      return;
    }
    setInviteMsg({ ok: true, text: "En attente — rattachement automatique dès l'inscription. Pensez à prévenir la personne par vos propres moyens." });
    setInviteEmail("");
    load();
  };

  const cancelInvitation = async (id) => {
    await supabase.from("invitations_structure").delete().eq("id", id);
    load();
  };

  const removeFavoriEquipe = async (id) => {
    await supabase.from("favoris_equipe").delete().eq("id", id);
    setFavorisEquipe((f) => f.filter((x) => x.id !== id));
  };


  const copyCode = () => {
    if (!structure) return;
    navigator.clipboard.writeText(structure.code_invitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="pb-10">
        <TopBar title="Gérer mon équipe" onBack={onBack} />
        <div className="p-4 text-center text-stone-400 text-sm py-10">Chargement…</div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="pb-10">
        <TopBar title="Gérer mon équipe" onBack={onBack} />
        <div className="p-4 text-center text-stone-400 text-sm py-10">Aucune structure associée à votre compte.</div>
      </div>
    );
  }

  const activeCount = members.filter((m) => m.actif).length;

  let joursRestants = null;
  if (structure.essai_duree_semaines != null) {
    const fin = new Date(structure.created_at);
    fin.setDate(fin.getDate() + structure.essai_duree_semaines * 7);
    joursRestants = Math.ceil((fin - new Date()) / 86400000);
  }

  return (
    <div className="pb-10">
      <TopBar title="Gérer mon équipe" onBack={onBack} />
      <div className="p-4">
        {joursRestants !== null && (
          <div className={`rounded-xl p-3 text-sm font-medium mb-4 flex items-center gap-2 ${joursRestants <= 3 ? "bg-rose-50 border border-rose-200 text-rose-700" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
            <Clock size={15} className="shrink-0" />
            {joursRestants > 0
              ? `Essai gratuit : ${joursRestants} jour${joursRestants > 1 ? "s" : ""} restant${joursRestants > 1 ? "s" : ""}${joursRestants <= 3 ? " — contactez Apézeo pour continuer au-delà" : ""}`
              : "Essai gratuit terminé — l'accès de toute l'équipe est actuellement verrouillé."}
          </div>
        )}
        <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm mb-4">
          <div className="font-semibold text-emerald-950 mb-1">{structure.nom}</div>
          <div className="text-sm text-stone-500 mb-3">{activeCount} / {structure.quota} comptes actifs</div>
          <div className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2">
            <span className="font-mono text-sm text-emerald-800">{structure.code_invitation}</span>
            <button onClick={copyCode} className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <Copy size={13} /> {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-2">Transmettez ce code à vos collègues pour qu'ils créent leur compte rattaché à votre structure.</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm mb-4">
          <div className="font-semibold text-emerald-950 text-sm mb-1">Rattacher un compte déjà créé</div>
          <p className="text-xs text-stone-400 mb-3">Pour quelqu'un qui s'est inscrit avant d'avoir reçu le code — pas besoin de recréer son compte.</p>
          <form onSubmit={attachAccount} className="flex gap-2">
            <input
              type="email" required placeholder="email@exemple.fr"
              value={attachEmail} onChange={(e) => setAttachEmail(e.target.value)}
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <button type="submit" disabled={attaching} className="bg-emerald-700 disabled:bg-stone-300 text-white text-sm font-medium rounded-lg px-4">
              {attaching ? "…" : "Rattacher"}
            </button>
          </form>
          {attachMsg && (
            <p className={`text-xs mt-2 ${attachMsg.ok ? "text-emerald-700" : "text-rose-600"}`}>{attachMsg.text}</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm mb-4">
          <div className="font-semibold text-emerald-950 text-sm mb-1">Pré-inviter par e-mail</div>
          <p className="text-xs text-stone-400 mb-3">Rattachement automatique dès que la personne crée son compte — aucun e-mail n'est envoyé, prévenez-la vous-même.</p>
          <form onSubmit={inviteAccount} className="flex gap-2">
            <input
              type="email" required placeholder="email@exemple.fr"
              value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <button type="submit" disabled={inviting} className="bg-emerald-700 disabled:bg-stone-300 text-white text-sm font-medium rounded-lg px-4">
              {inviting ? "…" : "Inviter"}
            </button>
          </form>
          {inviteMsg && (
            <p className={`text-xs mt-2 ${inviteMsg.ok ? "text-emerald-700" : "text-rose-600"}`}>{inviteMsg.text}</p>
          )}
          {invitations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-1.5">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1">En attente</div>
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{inv.email}</span>
                  <button onClick={() => cancelInvitation(inv.id)} className="text-xs text-stone-400 hover:text-rose-600">Annuler</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {favorisEquipe.length > 0 && (
          <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm mb-4">
            <div className="font-semibold text-emerald-950 text-sm mb-0.5">Favoris de l'équipe</div>
            <p className="text-xs text-stone-400 mb-3">Techniques recommandées, visibles par toute votre équipe. Ajoutez-en depuis le détail d'une fiche.</p>
            <div className="flex flex-col gap-1.5">
              {favorisEquipe.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between text-sm">
                  <span className="text-emerald-950">{fav.fiche_titre}</span>
                  <button onClick={() => removeFavoriEquipe(fav.id)} className="text-xs text-stone-400 hover:text-rose-600">Retirer</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {weeklyStats.length > 0 && (() => {
          const thisWeek = weeklyStats[0]?.total_vues || 0;
          const lastWeek = weeklyStats[1]?.total_vues || 0;
          const diff = thisWeek - lastWeek;
          return (
            <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm mb-4">
              <div className="font-semibold text-emerald-950 text-sm mb-0.5">Consultations cette semaine</div>
              <p className="text-xs text-stone-400 mb-3">Nombre total de fiches ouvertes par votre équipe, semaine en cours.</p>
              <div className="flex items-end gap-2.5">
                <span className="text-2xl font-bold text-emerald-950">{thisWeek}</span>
                {lastWeek > 0 && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${diff >= 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"}`}>
                    {diff >= 0 ? "+" : ""}{diff} vs semaine dernière
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {topFiches.length > 0 && (
          <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm mb-4">
            <div className="font-semibold text-emerald-950 text-sm mb-0.5">Fiches les plus consultées ce mois-ci</div>
            <p className="text-xs text-stone-400 mb-3">Statistique collective de votre équipe — aucune donnée individuelle.</p>
            <div className="flex flex-col gap-1.5">
              {topFiches.map((t, i) => (
                <div key={t.fiche_ref} className="flex items-center gap-2.5 text-sm">
                  <span className="w-5 text-stone-300 font-bold text-xs">{i + 1}</span>
                  <span className="flex-1 text-stone-700 truncate">{t.fiche_ref}</span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-full px-2 py-0.5">{t.vues} vue{t.vues !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">Membres de l'équipe</div>
        <div className="flex flex-col gap-2">
          {members.length === 0 && <div className="text-stone-400 text-sm py-6 text-center">Aucun membre pour l'instant.</div>}
          {members.map((m) => (
            <div key={m.id} className="bg-white rounded-xl p-3 border border-emerald-900/5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-emerald-950 text-sm truncate">{m.email}</div>
                  <div className="text-xs text-stone-500">{m.profession || "—"} {m.role === "admin" && "· Admin"}</div>
                </div>
                {m.role !== "admin" && (
                  <>
                    <button
                      onClick={() => toggleActif(m.id, m.actif)}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${m.actif ? "border-stone-300 text-stone-600" : "border-rose-300 text-rose-600 bg-rose-50"}`}
                    >
                      {m.actif ? <><UserCheck size={13} /> Actif</> : <><UserX size={13} /> Désactivé</>}
                    </button>
                    <button
                      onClick={() => setConfirmRemove(confirmRemove === m.id ? null : m.id)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
              {confirmRemove === m.id && (
                <div className="mt-2.5 pt-2.5 border-t border-stone-100">
                  <p className="text-xs text-stone-500 mb-2">Retirer {m.email} de l'équipe ? Son compte redevient gratuit, ne disparaît pas — il peut être rattaché à nouveau plus tard.</p>
                  <div className="flex gap-1.5 mb-3">
                    <button onClick={() => removeMember(m.id)} className="text-xs font-semibold bg-rose-600 text-white rounded-lg px-3 py-1.5">Confirmer le retrait</button>
                    <button onClick={() => setConfirmRemove(null)} className="text-xs font-medium text-stone-500 px-2 py-1.5">Annuler</button>
                  </div>
                  {confirmDeleteAccount === m.id ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                      <p className="text-xs text-rose-800 mb-2"><b>Irréversible</b> : supprime le compte pour de bon (favoris, historique, fiches personnelles). Libère l'e-mail pour une nouvelle inscription.</p>
                      <div className="flex gap-2">
                        <button onClick={() => deleteMemberAccount(m.id)} className="flex-1 bg-rose-600 text-white text-xs font-semibold rounded-lg py-1.5">Supprimer définitivement</button>
                        <button onClick={() => setConfirmDeleteAccount(null)} className="flex-1 bg-white border border-stone-300 text-xs rounded-lg py-1.5">Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteAccount(m.id)} className="text-[11px] text-stone-400 underline">
                      Ou supprimer définitivement le compte (libère l'e-mail)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  );
}

/* ---------- ÉCRAN DE CHOIX DE PROFIL ---------- */
