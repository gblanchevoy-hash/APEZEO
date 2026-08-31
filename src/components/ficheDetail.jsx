// Affichage détaillé d'une fiche (technique, concept, outil), le
// journal d'essai ("avant/après"), et le formulaire de création/
// modification d'une fiche personnelle.
import { useState, useEffect } from "react";
import { AlertTriangle, Heart, Leaf, Lightbulb, Clock, ChevronRight, Trash2, Save, Download, Flag, Star } from "lucide-react";
import { FAMILLES, TROUBLES, STADES } from "../data/constants.js";
import { supabase } from "../lib/supabase.js";
import { linesToArray, arrayToLines } from "../lib/utils.js";
import { Badge, TopBar, Field, inputCls, CheckGroup, StructuredText, Section, BulletList, Stars } from "./ui.jsx";
import { CROQUIS_PLEINE_LARGEUR } from "./FicheCard.jsx";
import { SourcesLine } from "./legal.jsx";

export function FicheDetailView({ fiche: f, favoris, onBack, onToggleLike, onToggleDislike, onLog, onEdit, onDelete, simple, onlyLike, allFiches, onOpenFiche, teamAdminStructureId }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showSignal, setShowSignal] = useState(false);
  const [signalMessage, setSignalMessage] = useState("");
  const [signalStatus, setSignalStatus] = useState(null); // null | "sending" | "sent" | "error"
  const [teamFavId, setTeamFavId] = useState(undefined); // undefined = pas encore vérifié, null = pas favori, sinon son id
  // Identifiant stable : technique_id ne change jamais, contrairement à
  // f.id (basé sur la ligne en base, qui change à chaque réimport).
  const stableFicheId = f.techniqueId || f.id;

  useEffect(() => {
    if (!teamAdminStructureId) return;
    let cancelled = false;
    supabase.from("favoris_equipe").select("id").eq("structure_id", teamAdminStructureId).eq("fiche_id", stableFicheId).maybeSingle()
      .then(({ data }) => { if (!cancelled) setTeamFavId(data?.id || null); });
    return () => { cancelled = true; };
  }, [teamAdminStructureId, stableFicheId]);

  const toggleTeamFavori = async () => {
    if (!teamAdminStructureId) return;
    if (teamFavId) {
      await supabase.from("favoris_equipe").delete().eq("id", teamFavId);
      setTeamFavId(null);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("favoris_equipe").insert({
        structure_id: teamAdminStructureId, fiche_id: stableFicheId, fiche_titre: f.titre, ajoute_par: user?.id,
      }).select("id").single();
      setTeamFavId(data?.id || null);
    }
  };

  const exportFichePdf = async () => {
    setExportingPdf(true);
    const { default: jsPDF } = await import("jspdf");

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
    const marginX = 18, pageWidth = 210;
    let y = 20;

    const wrap = (text, size, weight = "normal", color = [40, 40, 40], gap = 5) => {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, pageWidth - marginX * 2);
      lines.forEach((line) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, marginX, y);
        y += gap;
      });
      y += 2;
    };

    if (logoBase64) doc.addImage(logoBase64, "PNG", marginX, 6, 10, 10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(2, 44, 34);
    doc.text("Apézeo", marginX + (logoBase64 ? 13 : 0), 12);
    doc.setDrawColor(220, 220, 220); doc.line(marginX, 17, pageWidth - marginX, 17);
    y = 26;

    wrap(f.titre, 16, "bold", [2, 44, 34], 7);
    wrap(f.categorie + (f.niveauDetail === "expert" ? "  ·  Expert" : ""), 10, "normal", [110, 110, 110]);
    if (f.troubles?.length) wrap("Troubles : " + f.troubles.join(", "), 10, "normal", [80, 80, 80]);
    y += 2;

    if (f.alerteOutil) { wrap("ATTENTION — Point de vigilance réglementaire", 12, "bold", [180, 30, 30]); wrap(f.alerteOutil, 10); }
    if (f.description) { wrap("Description", 12, "bold", [4, 120, 87]); wrap(f.description, 10); }
    if (f.indication) { wrap("Indication", 12, "bold", [4, 120, 87]); wrap(f.indication, 10); }
    if (f.contreIndicationOutil?.length) { wrap("Contre-indications", 12, "bold", [180, 60, 60]); f.contreIndicationOutil.forEach((c) => wrap(`• ${c}`, 10)); }
    if (f.precautionsParticulieres?.length) { wrap("Précautions particulières", 12, "bold", [180, 100, 20]); f.precautionsParticulieres.forEach((p) => wrap(`• ${p}`, 10)); }
    if (f.pourquoi) { wrap("Pourquoi ça fonctionne", 12, "bold", [4, 120, 87]); wrap(f.pourquoi, 10); }
    if (f.quandUtiliser) { wrap("Quand l'utiliser", 12, "bold", [4, 120, 87]); wrap(f.quandUtiliser, 10); }
    if (f.quandEviter) { wrap("Quand éviter", 12, "bold", [180, 60, 60]); wrap(f.quandEviter, 10); }
    if (f.deroulement?.length) {
      wrap("Déroulement", 12, "bold", [4, 120, 87]);
      f.deroulement.forEach((e, i) => wrap(`${i + 1}. ${e.titre}${e.description && e.description !== e.titre ? " — " + e.description : ""}`, 10));
    }
    if (f.etapes?.length) {
      wrap("Étapes", 12, "bold", [4, 120, 87]);
      f.etapes.forEach((e, i) => wrap(`${i + 1}. ${e}`, 10));
    }
    if (f.materiel?.length) { wrap("Matériel", 12, "bold", [4, 120, 87]); f.materiel.forEach((m) => wrap(`• ${m}`, 10)); }
    if (f.conseils?.length) { wrap("Conseils", 12, "bold", [4, 120, 87]); f.conseils.forEach((c) => wrap(`• ${c}`, 10)); }
    if (f.pointsVigilance?.length) {
      wrap("Points de vigilance", 12, "bold", [180, 100, 20]);
      f.pointsVigilance.forEach((p) => wrap(`• ${p.point}${p.explication ? " — " + p.explication : ""}`, 10));
    }
    if (f.erreurs?.length) { wrap("Erreurs à éviter", 12, "bold", [180, 100, 20]); f.erreurs.forEach((e) => wrap(`• ${e}`, 10)); }
    if (f.precautions?.length) { wrap("Précautions", 12, "bold", [180, 60, 60]); f.precautions.forEach((p) => wrap(`• ${p}`, 10)); }
    if (f.contreIndications?.length) { wrap("Contre-indications", 12, "bold", [180, 60, 60]); f.contreIndications.forEach((c) => wrap(`• ${c}`, 10)); }
    if (f.fondementPrincipe) { wrap("Fondement", 12, "bold", [4, 120, 87]); wrap(f.fondementPrincipe, 10); }
    if (f.sources?.length) { wrap("Sources", 12, "bold", [4, 120, 87]); f.sources.forEach((s) => wrap(`• ${s}`, 9, "normal", [120, 120, 120])); }

    doc.save(`Apezeo - ${f.titre.slice(0, 60)}.pdf`);
    supabase.rpc("enregistrer_telechargement", { p_fiche_ref: f.titre }).then(() => {}).catch(() => {});
    setExportingPdf(false);
  };

  const submitSignal = async () => {
    if (!signalMessage.trim()) return;
    setSignalStatus("sending");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("signalements").insert({
      user_id: user?.id, technique_id: f.techniqueId || null, fiche_titre: f.titre, message: signalMessage.trim(),
    });
    setSignalStatus(error ? "error" : "sent");
    if (!error) setSignalMessage("");
  };
  useEffect(() => { window.scrollTo(0, 0); }, [f.id]);
  useEffect(() => {
    if (!simple) supabase.rpc("enregistrer_vue", { p_fiche_ref: f.titre }).then(() => {}).catch(() => {});
  }, [f.id, simple]);
  const liked = favoris.liked.includes(f.id);
  const nonSourcee = !!f.isLocal; // toute fiche créée par l'utilisateur, quelle que soit la catégorie choisie
  const isExpert = f.niveauDetail === "expert";
  const isConceptDetail = f.typeFiche === "concept";
  const isTechniqueDetail = f.typeFiche !== "concept" && f.typeFiche !== "outil";
  const techniquesAssociees = (allFiches && f.techniquesLiees && f.techniquesLiees.length)
    ? f.techniquesLiees.map((tid) => allFiches.find((x) => x.techniqueId === tid)).filter(Boolean)
    : [];

  if (f.typeFiche === "outil") {
    return (
      <div className="pb-28">
        <TopBar title={f.outilType || "Outil spécifique"} onBack={onBack} />
        <div className="p-5 lg:p-9 lg:max-w-2xl">
          <Badge tone="outil">Outil spécifique</Badge>
          <h2 className="text-2xl font-bold text-violet-950 mt-2 mb-4 tracking-tight leading-tight">{f.titre}</h2>

          {f.alerteOutil && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-5 flex gap-3">
              <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1">Point de vigilance réglementaire</div>
                <p className="text-sm text-red-900 leading-relaxed font-medium">{f.alerteOutil}</p>
              </div>
            </div>
          )}

          {f.croquisUrl ? (
            CROQUIS_PLEINE_LARGEUR.includes(f.titre) ? (
              <div className="rounded-2xl overflow-hidden mb-6 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.15)] flex items-center justify-center bg-white">
                <img src={f.croquisUrl} alt={f.titre} className="w-full h-auto max-h-[360px] object-contain" />
              </div>
            ) : (
            <div className="relative mb-6" style={{ aspectRatio: "900 / 560" }}>
              <img src="/images/notebook-page-bg.png" alt="" className="absolute inset-0 w-full h-full" />
              <div className="absolute flex items-center justify-center" style={{ left: "11%", right: "3%", top: "4%", bottom: "4%" }}>
                <img
                  src={f.croquisUrl}
                  alt={f.titre}
                  className="max-w-full max-h-full"
                  style={{ transform: "rotate(-1.5deg)", filter: "drop-shadow(3px 5px 3px rgba(0,0,0,0.12))" }}
                />
              </div>
            </div>
            )
          ) : f.croquisSvg ? (
            <div className="bg-violet-50/60 rounded-2xl p-6 mb-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: f.croquisSvg }} />
          ) : null}

          <div className="flex gap-2 flex-wrap mb-6">{f.troubles.map((t) => <Badge key={t} tone="outil">{t}</Badge>)}</div>

          <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Description</div><p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{f.description}</p></div>

          {f.indication && <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Indication</div><p className="text-sm text-stone-700 leading-relaxed">{f.indication}</p></div>}

          {f.contreIndicationOutil && f.contreIndicationOutil.length > 0 && (
            <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Contre-indications</div><div className="bg-rose-50 rounded-2xl p-4"><BulletList items={f.contreIndicationOutil} /></div></div>
          )}

          {f.precautionsParticulieres && f.precautionsParticulieres.length > 0 && (
            <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Précautions particulières</div><div className="bg-amber-50 rounded-2xl p-4"><BulletList items={f.precautionsParticulieres} /></div></div>
          )}

          {!simple && <SourcesLine sources={f.sources} dateMaj={f.dateMaj} />}

          {!simple && (
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-stone-100">
              <button onClick={exportFichePdf} disabled={exportingPdf} className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-violet-700 transition-colors">
                <Download size={14} /> {exportingPdf ? "Export en cours…" : "Exporter en PDF"}
              </button>
              <button onClick={() => setShowSignal((s) => !s)} className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-amber-700 transition-colors">
                <Flag size={14} /> Signaler un problème
              </button>
              {teamAdminStructureId && (
                <button onClick={toggleTeamFavori} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${teamFavId ? "text-violet-700" : "text-stone-500 hover:text-violet-700"}`}>
                  <Star size={14} className={teamFavId ? "fill-violet-600 text-violet-600" : ""} /> {teamFavId ? "Dans les favoris de l'équipe" : "Ajouter aux favoris de l'équipe"}
                </button>
              )}
            </div>
          )}
          {showSignal && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              {signalStatus === "sent" ? (
                <p className="text-sm text-emerald-800">Merci, votre signalement a bien été transmis.</p>
              ) : (
                <>
                  <textarea
                    rows={3} value={signalMessage} onChange={(e) => setSignalMessage(e.target.value)}
                    placeholder="Décrivez le problème (erreur, contenu peu clair, doublon…)"
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button onClick={submitSignal} disabled={!signalMessage.trim() || signalStatus === "sending"} className="text-xs font-semibold bg-amber-600 disabled:bg-stone-300 text-white rounded-lg px-3 py-1.5">
                    {signalStatus === "sending" ? "Envoi…" : "Envoyer"}
                  </button>
                  {signalStatus === "error" && <p className="text-xs text-rose-600 mt-1.5">Une erreur est survenue, réessayez.</p>}
                </>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#F4F6F2]/35 backdrop-blur-lg backdrop-saturate-150 p-4 flex justify-center shadow-[0_-4px_24px_-8px_rgba(88,28,135,0.12)]">
          <button onClick={onToggleLike} className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-8 text-sm font-semibold transition-all duration-200 active:scale-95 ${liked ? "bg-rose-500 text-white shadow-md" : "bg-violet-100 text-violet-800 hover:bg-violet-200"}`}>
            <Heart size={17} className={liked ? "fill-white" : ""} /> {liked ? "Dans vos favoris" : "Ajouter aux favoris"}
          </button>
        </div>
      </div>
    );
  }

  if (simple) {
    return (
      <div className="pb-28">
        <TopBar title={f.categorie} onBack={onBack} />
        <div className="bg-gradient-to-b from-emerald-50 to-[#F4F6F2] px-6 pt-2 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <Leaf size={26} className="text-emerald-700" />
          </div>
          <h1 className="font-serif text-2xl text-stone-800 leading-snug mb-3">{f.titre}</h1>
          <div className="flex gap-2 flex-wrap">
            {f.troubles.map((t) => <span key={t} className="text-xs font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">{t}</span>)}
          </div>
        </div>

        <div className="px-6 pt-6 pb-8">
          <p className="text-stone-600 text-[15px] leading-relaxed mb-6 whitespace-pre-line">{f.description}</p>

          {f.pourquoi && (
            <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 mb-7">
              <Lightbulb size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed"><span className="font-semibold">Pourquoi ça marche : </span>{f.pourquoi}</p>
            </div>
          )}

          {f.etapes && f.etapes.length > 0 && (
            <div className="mb-7">
              <h2 className="font-serif text-lg text-stone-800 mb-5">Le chemin, pas à pas</h2>
              <div className="relative">
                <div className="absolute left-[27px] top-3 bottom-3 w-0.5 bg-emerald-200" />
                <div className="flex flex-col gap-5">
                  {f.etapes.map((e, i) => (
                    <div key={i} className="flex gap-4 items-start relative">
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-emerald-200 flex items-center justify-center shrink-0 relative z-[1] text-emerald-700 font-serif font-semibold text-lg">{i + 1}</div>
                      <p className="text-stone-700 text-[15px] leading-relaxed pt-3">{e}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-stone-400 text-sm mb-7">
            {(f.dureeMinutes > 0 || f.dureeLabel) && (
              <span className="flex items-center gap-1.5"><Clock size={15} /> Environ {f.dureeMinutes > 0 ? `${f.dureeMinutes} minutes` : f.dureeLabel}</span>
            )}
            {f.materiel && f.materiel.length > 0 && (
              <span className="flex items-center gap-1.5">🧺 {f.materiel.join(", ")}</span>
            )}
          </div>

          {f.conseils && f.conseils.length > 0 && (
            <div className="bg-emerald-50 rounded-2xl p-4 mb-7">
              <div className="text-sm font-semibold text-emerald-800 mb-2">Petits conseils</div>
              <ul className="space-y-1.5">{f.conseils.map((c, i) => <li key={i} className="text-sm text-emerald-900 flex gap-2"><span>•</span><span>{c}</span></li>)}</ul>
            </div>
          )}

          {(f.quandEviter || (f.erreurs && f.erreurs.length > 0)) && (
            <div className="bg-rose-50 rounded-2xl p-4 flex gap-3 mb-8">
              <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-900 leading-relaxed">
                {f.quandEviter && <p><span className="font-semibold">Évitez si : </span>{f.quandEviter}</p>}
                {f.erreurs && f.erreurs.length > 0 && (
                  <ul className={f.quandEviter ? "mt-2 space-y-1" : "space-y-1"}>
                    {f.erreurs.map((e, i) => <li key={i} className="flex gap-2"><span>•</span><span>{e}</span></li>)}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#F4F6F2]/35 backdrop-blur-lg backdrop-saturate-150 p-4 flex justify-center shadow-[0_-4px_24px_-8px_rgba(6,78,59,0.12)]">
          <button onClick={onToggleLike} className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-8 text-sm font-semibold transition-all duration-200 active:scale-95 ${liked ? "bg-rose-500 text-white shadow-md" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}>
            <Heart size={17} className={liked ? "fill-white" : ""} /> {liked ? "Dans vos favoris" : "Ajouter aux favoris"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <TopBar title={f.categorie} onBack={onBack} />
      <div className="p-5 lg:p-9 lg:max-w-5xl">
        <div className="flex items-center gap-2 mb-2">
          {isExpert && <Badge tone="expert">Expert</Badge>}
          {isConceptDetail && <Badge tone="concept">Explicatif</Badge>}
          {isTechniqueDetail && <Badge tone="amber">Technique</Badge>}
        </div>
        <h2 className="text-2xl font-bold text-emerald-950 mb-5 tracking-tight leading-tight">{f.titre}</h2>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_290px] lg:gap-10 lg:items-start">
          {techniquesAssociees.length > 0 && onOpenFiche && (
            <div className="order-2 bg-emerald-50 border border-emerald-800/10 shadow-sm rounded-2xl p-4 mt-6 lg:mt-0 lg:sticky lg:top-24">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2.5">Techniques détaillées associées</div>
              <div className="flex flex-col gap-1.5">
                {techniquesAssociees.map((t) => (
                  <button key={t.id} onClick={() => onOpenFiche(t)} className="flex items-center gap-2 text-left text-sm text-emerald-900 hover:text-emerald-700 bg-white/60 hover:bg-white rounded-xl px-3 py-2 transition-colors">
                    <span className="flex-1">{t.titre}</span>
                    <ChevronRight size={14} className="shrink-0 text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="order-1 min-w-0">
        {nonSourcee && (
          <div className="bg-rose-50 rounded-2xl p-4 flex gap-2.5 text-sm text-rose-800 mb-5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span><strong>Fiche non sourcée</strong> — partage d'expérience terrain, non validée scientifiquement. À utiliser avec discernement professionnel, jamais comme référence de bonne pratique lors d'un audit ou d'une évaluation qualité.</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {!simple && !isExpert && <Stars n={f.niveauPreuve} />}
          {f.dureeMinutes > 0 ? <Badge><Clock size={11} className="inline mr-1" />{f.dureeMinutes} min</Badge> : f.dureeLabel ? <Badge>{f.dureeLabel}</Badge> : null}
          {!simple && !isExpert && <Badge>{f.difficulte}</Badge>}
          {f.isLocal && <Badge tone="amber">Fiche personnelle</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap mb-6">{f.troubles.map((t) => <Badge key={t} tone="emerald">{t}</Badge>)}</div>

        {isExpert && f.pointsCles && f.pointsCles.length > 0 && (
          <div className="bg-emerald-900 text-white rounded-2xl p-4 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Points clés à retenir</div>
            <ul className="space-y-1.5">{f.pointsCles.map((p, i) => <li key={i} className="text-sm flex gap-2"><span className="text-amber-300 mt-0.5">•</span><span>{p}</span></li>)}</ul>
          </div>
        )}

        <Section title="Description"><p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{f.description}</p></Section>

        {isExpert ? (
          <>
            {(f.duree || f.tempsMiseEnOeuvre || f.frequence) && (
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                {f.duree && <div><span className="text-stone-400">Durée : </span><span className="text-stone-700 font-medium">{f.duree}</span></div>}
                {f.tempsMiseEnOeuvre && <div><span className="text-stone-400">Mise en œuvre : </span><span className="text-stone-700 font-medium">{f.tempsMiseEnOeuvre}</span></div>}
                {f.frequence && <div><span className="text-stone-400">Fréquence : </span><span className="text-stone-700 font-medium">{f.frequence}</span></div>}
              </div>
            )}
            <Section title="Objectifs"><BulletList items={f.objectifsObservables} /></Section>
            <Section title="Matériel"><BulletList items={f.materiel} /></Section>
            <Section title="Préparation"><BulletList items={f.preparation} /></Section>
            {f.deroulement && f.deroulement.length > 0 && (
              <Section title="Déroulement">
                <div className="flex flex-col gap-3">
                  {f.deroulement.map((e) => {
                    const norm = (s) => (s || "").trim().replace(/[.!?…]+$/, "").toLowerCase();
                    const titre = (e.titre || "").trim();
                    const description = (e.description || "").trim();
                    const isDuplicate = norm(description) === norm(titre);
                    // Le titre a parfois été extrait du tout début de la
                    // description (pour rester ancré dans le contenu réel) —
                    // sans retirer cette portion de la description elle-même,
                    // ce qui donnait un titre suivi d'une explication qui
                    // recommence par les mêmes mots. On n'affiche alors que
                    // la partie réellement nouvelle.
                    let displayDescription = description;
                    if (!isDuplicate && titre && description.toLowerCase().startsWith(titre.toLowerCase())) {
                      displayDescription = description.slice(titre.length).replace(/^[\s:.,;–—-]+/, "").trim();
                    }
                    const showDescription = displayDescription && !isDuplicate;
                    return (
                      <div key={e.etape} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{e.etape}</div>
                        <div>
                          <div className="text-sm font-semibold text-emerald-950">{e.titre}</div>
                          {showDescription && <div className="text-sm text-stone-600 whitespace-pre-line">{displayDescription}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}
            {f.adaptationStades && (f.adaptationStades.leger?.length || f.adaptationStades.modere?.length || f.adaptationStades.severe?.length) && (
              <Section title="Adaptation selon le stade">
                <div className="flex flex-col gap-2.5">
                  {[["Léger", f.adaptationStades.leger], ["Modéré", f.adaptationStades.modere], ["Sévère", f.adaptationStades.severe]].map(([label, items]) => items && items.length > 0 && (
                    <div key={label} className="bg-stone-50 rounded-xl p-3">
                      <div className="text-xs font-bold text-emerald-700 mb-1">{label}</div>
                      <BulletList items={items} />
                    </div>
                  ))}
                </div>
              </Section>
            )}
            <Section title="Conditions favorables"><BulletList items={f.conditionsFavorables} /></Section>
            {f.pointsVigilance && f.pointsVigilance.length > 0 && (
              <Section title="Points de vigilance">
                <div className="flex flex-col gap-2">
                  {f.pointsVigilance.map((pv, i) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-3 text-sm">
                      <div className="font-semibold text-amber-900">{pv.point}</div>
                      {pv.explication && <div className="text-amber-800">{pv.explication}</div>}
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {f.erreursFrequentes && f.erreursFrequentes.length > 0 && (
              <Section title="Erreurs fréquentes">
                <div className="flex flex-col gap-2">
                  {f.erreursFrequentes.map((er, i) => (
                    <div key={i} className="bg-rose-50 rounded-xl p-3 text-sm">
                      <div className="font-semibold text-rose-900">{er.erreur}</div>
                      {er.pourquoi && <div className="text-rose-800">{er.pourquoi}</div>}
                    </div>
                  ))}
                </div>
              </Section>
            )}
            <Section title="Précautions"><BulletList items={f.precautions} /></Section>
            {(f.fondementPrincipe || f.fondementApplication) && (
              <Section title="Fondements">
                {f.fondementPrincipe && <p className="text-sm text-stone-700 leading-relaxed mb-4"><span className="font-semibold text-emerald-800">Principe — </span>{f.fondementPrincipe}</p>}
                {f.fondementApplication && <StructuredText text={f.fondementApplication} />}
              </Section>
            )}
            <Section title="Comment évaluer l'efficacité"><BulletList items={f.commentEvaluerEfficacite} /></Section>
          </>
        ) : (
          <>
            <Section title={simple ? "Pourquoi ça aide" : "Pourquoi ça fonctionne"}><p className="text-sm text-stone-700 leading-relaxed">{f.pourquoi}</p></Section>
            <Section title="Quand l'utiliser"><p className="text-sm text-stone-700 leading-relaxed">{f.quandUtiliser}</p></Section>
            {f.quandEviter && <Section title="Quand éviter"><p className="text-sm text-rose-700 leading-relaxed flex gap-1.5"><AlertTriangle size={15} className="shrink-0 mt-0.5" />{f.quandEviter}</p></Section>}
            <Section title="Étapes"><BulletList items={f.etapes} /></Section>
            <Section title="Matériel"><BulletList items={f.materiel} /></Section>
            <Section title="Conseils"><BulletList items={f.conseils} /></Section>
            <Section title="Erreurs à éviter"><BulletList items={f.erreurs} /></Section>
            {f.contreIndications && f.contreIndications.length > 0 && (
              <Section title="Contre-indications"><div className="bg-rose-50 rounded-2xl p-4"><BulletList items={f.contreIndications} /></div></Section>
            )}
          </>
        )}
        {!simple && <SourcesLine sources={f.sources} dateMaj={f.dateMaj} />}

        {onDelete && (confirmDelete ? (
          <div className="mt-6 bg-rose-50 rounded-2xl p-4 text-sm">
            <p className="text-rose-800 mb-2.5">Supprimer définitivement cette fiche personnelle ?</p>
            <div className="flex gap-2">
              <button onClick={onDelete} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-2 font-medium transition-colors">Supprimer</button>
              <button onClick={() => setConfirmDelete(false)} className="flex-1 bg-white border border-stone-200 rounded-xl py-2 hover:bg-stone-50 transition-colors">Annuler</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="mt-6 text-xs text-stone-400 flex items-center gap-1"><Trash2 size={13} /> Supprimer cette fiche</button>
        ))}

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-stone-100">
          <button onClick={exportFichePdf} disabled={exportingPdf} className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-emerald-700 transition-colors">
            <Download size={14} /> {exportingPdf ? "Export en cours…" : "Exporter en PDF"}
          </button>
          <button onClick={() => setShowSignal((s) => !s)} className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-amber-700 transition-colors">
            <Flag size={14} /> Signaler un problème
          </button>
          {teamAdminStructureId && (
            <button onClick={toggleTeamFavori} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${teamFavId ? "text-emerald-700" : "text-stone-500 hover:text-emerald-700"}`}>
              <Star size={14} className={teamFavId ? "fill-emerald-600 text-emerald-600" : ""} /> {teamFavId ? "Dans les favoris de l'équipe" : "Ajouter aux favoris de l'équipe"}
            </button>
          )}
        </div>
        {showSignal && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            {signalStatus === "sent" ? (
              <p className="text-sm text-emerald-800">Merci, votre signalement a bien été transmis.</p>
            ) : (
              <>
                <textarea
                  rows={3} value={signalMessage} onChange={(e) => setSignalMessage(e.target.value)}
                  placeholder="Décrivez le problème (erreur, contenu peu clair, doublon…)"
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button onClick={submitSignal} disabled={!signalMessage.trim() || signalStatus === "sending"} className="text-xs font-semibold bg-amber-600 disabled:bg-stone-300 text-white rounded-lg px-3 py-1.5">
                  {signalStatus === "sending" ? "Envoi…" : "Envoyer"}
                </button>
                {signalStatus === "error" && <p className="text-xs text-rose-600 mt-1.5">Une erreur est survenue, réessayez.</p>}
              </>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#F4F6F2]/35 backdrop-blur-lg backdrop-saturate-150 p-4 lg:px-9 flex justify-center shadow-[0_-4px_24px_-8px_rgba(6,78,59,0.12)]">
        <button onClick={onToggleLike} className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-8 text-sm font-semibold transition-all duration-200 active:scale-95 ${liked ? "bg-rose-500 text-white shadow-md" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
          <Heart size={17} className={liked ? "fill-white" : ""} /> {liked ? "Dans vos favoris" : "Ajouter aux favoris"}
        </button>
      </div>
    </div>
  );
}

export function LogView({ fiche, onBack, onSave }) {
  const [avant, setAvant] = useState(6);
  const [apres, setApres] = useState(3);
  const [commentaire, setCommentaire] = useState("");
  return (
    <div className="pb-10">
      <TopBar title="Enregistrer un essai" onBack={onBack} />
      <div className="p-4">
        <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 mb-4">
          <div className="text-xs text-stone-400 mb-0.5">Technique</div>
          <div className="font-semibold text-emerald-950">{fiche.titre}</div>
        </div>
        <Field label={`Intensité du trouble avant : ${avant}/10`}><input type="range" min={0} max={10} value={avant} onChange={(e) => setAvant(Number(e.target.value))} className="w-full accent-rose-500" /></Field>
        <Field label={`Intensité du trouble après : ${apres}/10`}><input type="range" min={0} max={10} value={apres} onChange={(e) => setApres(Number(e.target.value))} className="w-full accent-emerald-600" /></Field>
        <Field label="Commentaire (optionnel)">
          <textarea rows={3} className={inputCls} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Ex. : plus efficace en fin d'après-midi, à retenter avec une musique différente…" />
        </Field>
        <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4 -mt-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-700" />
          <p className="text-xs text-amber-800">Ne mentionnez jamais le nom du résident ou toute information permettant de l'identifier — décrivez uniquement la technique et son effet.</p>
        </div>
        <button onClick={() => onSave({ ficheId: fiche.id, avant, apres, commentaire })} className="w-full mt-2 bg-emerald-700 text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2">
          <Save size={17} /> Enregistrer
        </button>
      </div>
    </div>
  );
}

export function FicheFormView({ initial, onBack, onSave }) {
  const [f, setF] = useState(initial);
  // Champs "une ligne = un élément" : on garde le texte brut tel quel
  // pendant la frappe (aucun trim/filtre), et on ne le transforme en
  // tableau qu'au moment d'enregistrer. Avant ce changement, chaque
  // frappe nettoyait immédiatement la ligne en cours de saisie, ce qui
  // supprimait les espaces au moment même où on les tapait.
  const [etapesText, setEtapesText] = useState(arrayToLines(initial.etapes));
  const [materielText, setMaterielText] = useState(arrayToLines(initial.materiel));
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleIn = (k, v) => setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const handleSave = () => {
    onSave({ ...f, etapes: linesToArray(etapesText), materiel: linesToArray(materielText) });
  };
  return (
    <div className="pb-16">
      <TopBar title={initial.titre ? "Modifier la fiche" : "Nouvelle fiche personnelle"} onBack={onBack} />
      <div className="p-4">
        <Field label="Titre *"><input className={inputCls} value={f.titre} onChange={(e) => set("titre", e.target.value)} /></Field>
        <Field label="Famille d'intervention"><select className={inputCls} value={f.categorie} onChange={(e) => set("categorie", e.target.value)}>{FAMILLES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Troubles ciblés"><CheckGroup options={TROUBLES} selected={f.troubles} onToggle={(v) => toggleIn("troubles", v)} /></Field>
        <Field label="Stade de la maladie"><CheckGroup options={STADES} selected={f.stades} onToggle={(v) => toggleIn("stades", v)} /></Field>
        <Field label="Niveau de preuve (1 à 5)"><select className={inputCls} value={f.niveauPreuve} onChange={(e) => set("niveauPreuve", Number(e.target.value))}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></Field>
        <Field label="Description"><textarea rows={3} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Pourquoi cela fonctionne"><textarea rows={2} className={inputCls} value={f.pourquoi} onChange={(e) => set("pourquoi", e.target.value)} /></Field>
        <Field label="Quand l'utiliser"><textarea rows={2} className={inputCls} value={f.quandUtiliser} onChange={(e) => set("quandUtiliser", e.target.value)} /></Field>
        <Field label="Durée (minutes)"><input type="number" min={0} className={inputCls} value={f.dureeMinutes} onChange={(e) => set("dureeMinutes", Number(e.target.value))} /></Field>
        <Field label="Étapes (une par ligne)"><textarea rows={3} className={inputCls} value={etapesText} onChange={(e) => setEtapesText(e.target.value)} /></Field>
        <Field label="Matériel (un par ligne)"><textarea rows={2} className={inputCls} value={materielText} onChange={(e) => setMaterielText(e.target.value)} /></Field>
        <button disabled={!f.titre.trim()} onClick={handleSave} className="w-full mt-3 bg-emerald-700 hover:bg-emerald-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2 text-white font-semibold rounded-2xl transition-all duration-200 py-3.5 flex items-center justify-center gap-2">
          <Save size={17} /> Enregistrer la fiche
        </button>
      </div>
    </div>
  );
}
