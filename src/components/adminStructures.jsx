// Écran de création et gestion des structures (clients B2B),
// réservé au super-admin.
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, AlertTriangle, Copy } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { Field, TopBar, inputCls } from "./ui.jsx";
import { generateCode, StructureStatusBadge } from "./adminShared.jsx";

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
