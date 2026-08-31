// Écran "Mon compte" — accessible à tout utilisateur connecté
// (changement de mot de passe, export de ses données, suppression
// de son propre compte).
import { useState, useEffect } from "react";
import { Eye, EyeOff, FileText, LogOut, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { PROFESSIONS } from "../data/constants.js";
import { TopBar, inputCls } from "./ui.jsx";

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

