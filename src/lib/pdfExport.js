// Génération du PDF d'une fiche (bouton "Exporter en PDF"). Isolé de
// l'affichage pour que ficheDetail.jsx reste concentré sur le rendu,
// pas la construction du document. jsPDF est chargé à la demande ici
// même (pas dans le composant), pour ne jamais alourdir le bundle
// principal en dehors du moment où cette fonction est vraiment appelée.
import { supabase } from "./supabase.js";

export async function generateFichePdf(f) {
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
}
