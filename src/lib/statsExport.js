// Génération des PDF de statistiques (global ou par structure).
// jsPDF est chargé à la demande, jamais dans le bundle principal.
export async function generateStatsPdfGlobal({ usage, structures, structStatusCounts, parCategorie, nbStandard, nbExpert, nbOutils, temoignages = [] }) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const marginX = 18, pageWidth = 210;
  let y = 20;

  const wrap = (text, size, weight = "normal", color = [40, 40, 40], gap = 5) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text), pageWidth - marginX * 2);
    lines.forEach((line) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, marginX, y);
      y += gap;
    });
    y += 2;
  };
  const line = () => { doc.setDrawColor(220, 220, 220); doc.line(marginX, y, pageWidth - marginX, y); y += 6; };

  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(2, 44, 34);
  doc.text("Apézeo — Statistiques globales", marginX, 12);
  doc.setFontSize(9); doc.setTextColor(140, 140, 140);
  doc.text(new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }), pageWidth - marginX, 12, { align: "right" });
  doc.setDrawColor(220, 220, 220); doc.line(marginX, 17, pageWidth - marginX, 17);
  y = 26;

  wrap("Usage de la bibliothèque", 13, "bold", [4, 120, 87]);
  wrap(`Vues ce mois : ${usage?.total_vues_mois ?? 0}`, 10);
  wrap(`Vues cette semaine : ${usage?.total_vues_semaine ?? 0}`, 10);
  wrap(`PDF de fiches téléchargés ce mois : ${usage?.total_telechargements_mois ?? 0}`, 10);
  wrap(`Fiches jamais consultées : ${usage?.fiches_jamais_consultees ?? 0}`, 10);
  wrap(`Taux de mise en favori : ${usage?.taux_favoris ?? 0}% (favoris / fiches consultées)`, 10);
  if (usage?.par_profession?.length) {
    y += 1;
    wrap("Répartition par métier :", 10, "bold");
    usage.par_profession.forEach((p) => wrap(`• ${p.profession} : ${p.nb}`, 9, "normal", [90, 90, 90], 4.5));
  }
  y += 2; line();

  wrap("Structures", 13, "bold", [4, 120, 87]);
  wrap(`Total : ${structures.length}  ·  Actives : ${structStatusCounts.actif}  ·  En essai : ${structStatusCounts.essaiCours}  ·  Essai terminé : ${structStatusCounts.essaiTermine}  ·  Suspendues : ${structStatusCounts.suspendue}`, 10);
  y += 2; line();

  wrap("Contenu de la bibliothèque", 13, "bold", [4, 120, 87]);
  wrap(`Fiches standard : ${nbStandard}  ·  Fiches Expert : ${nbExpert}  ·  Outils spécifiques : ${nbOutils}`, 10);
  y += 1;
  wrap("Répartition par catégorie :", 10, "bold");
  parCategorie.forEach(([cat, n]) => wrap(`• ${cat} : ${n}`, 9, "normal", [90, 90, 90], 4.5));
  y += 2; line();

  if (usage?.top_fiches?.length) {
    wrap("Top fiches — ce mois (toutes structures)", 13, "bold", [4, 120, 87]);
    usage.top_fiches.forEach((t, i) => wrap(`${i + 1}. ${t.titre} — ${t.vues} vues`, 9, "normal", [90, 90, 90], 4.5));
  }

  const citables = temoignages.filter((t) => t.autorise_citation);
  if (citables.length) {
    y += 2; line();
    wrap("Témoignages (citables publiquement)", 13, "bold", [4, 120, 87]);
    citables.forEach((t) => {
      const nom = structures.find((s) => s.id === t.structure_id)?.nom || "Structure";
      wrap(`${nom} — ${"★".repeat(t.note)}${"☆".repeat(5 - t.note)}`, 10, "bold");
      if (t.commentaire) wrap(`"${t.commentaire}"`, 10, "normal", [90, 90, 90]);
    });
  }

  doc.save(`Apezeo - Statistiques globales - ${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function generateStatsPdfStructures(structures, usageParStructure, detailsParStructure) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const marginX = 18, pageWidth = 210;
  let y = 20;

  const wrap = (text, size, weight = "normal", color = [40, 40, 40], gap = 5) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text), pageWidth - marginX * 2);
    lines.forEach((l) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(l, marginX, y);
      y += gap;
    });
    y += 2;
  };

  const usageMap = Object.fromEntries((usageParStructure || []).map((u) => [u.structure_id, u]));

  structures.forEach((s, idx) => {
    if (idx > 0) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(2, 44, 34);
    doc.text("Apézeo — Détail structure", marginX, 12);
    doc.setDrawColor(220, 220, 220); doc.line(marginX, 17, pageWidth - marginX, 17);
    y = 26;

    wrap(s.nom, 15, "bold", [2, 44, 34], 7);
    wrap(s.suspended ? "Statut : suspendue" : "Statut : active", 10, "normal", s.suspended ? [180, 60, 60] : [4, 120, 87]);
    y += 2;

    const u = usageMap[s.id] || {};
    const detail = (detailsParStructure && detailsParStructure[s.id]) || {};
    wrap("Usage", 12, "bold", [4, 120, 87]);
    wrap(`Vues ce mois : ${u.vues_mois ?? 0}  ·  Vues cette semaine : ${u.vues_semaine ?? 0}  ·  PDF téléchargés ce mois : ${u.telechargements_mois ?? 0}`, 10);
    wrap(`Comptes : ${detail.nb_comptes ?? "—"} au total, ${detail.nb_comptes_actifs ?? "—"} actifs  ·  Quota : ${s.quota ?? "—"}`, 10);
    y += 2;

    if (detail.top_fiches_mois?.length) {
      wrap("Top fiches consultées ce mois", 12, "bold", [4, 120, 87]);
      detail.top_fiches_mois.forEach((t, i) => wrap(`${i + 1}. ${t.titre} — ${t.vues} vues`, 9, "normal", [90, 90, 90], 4.5));
    } else {
      wrap("Aucune fiche consultée ce mois-ci.", 10, "normal", [140, 140, 140]);
    }
  });

  doc.save(`Apezeo - Detail par structure - ${new Date().toISOString().slice(0, 10)}.pdf`);
}
