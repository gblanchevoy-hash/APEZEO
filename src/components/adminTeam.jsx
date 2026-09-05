// Écran "Gérer mon équipe" — réservé aux admins de structure
// (membres, favoris d'équipe, invitations, statistiques équipe).
import { useState, useEffect, useCallback } from "react";
import { Clock, Copy, UserCheck, UserX } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { TopBar } from "./ui.jsx";

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
  const [temoignage, setTemoignage] = useState(null);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [autoriseCitation, setAutoriseCitation] = useState(false);
  const [certifieAuthentique, setCertifieAuthentique] = useState(false);
  const [envoiTemoignage, setEnvoiTemoignage] = useState(false);
  const [temoignageMsg, setTemoignageMsg] = useState(null);

  const load = useCallback(async () => {
    if (!structureId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: structData }, { data: memberData }, { data: topData }, { data: weekData }, { data: inviteData }, { data: favData }, { data: temoinData }] = await Promise.all([
      supabase.from("structures").select("*").eq("id", structureId).single(),
      supabase.from("profiles").select("*").eq("structure_id", structureId).order("created_at", { ascending: true }),
      supabase.rpc("top_fiches_structure"),
      supabase.rpc("vues_semaine_structure"),
      supabase.from("invitations_structure").select("*").eq("structure_id", structureId).eq("utilisee", false).order("created_at", { ascending: false }),
      supabase.from("favoris_equipe").select("*").eq("structure_id", structureId).order("created_at", { ascending: false }),
      supabase.from("temoignages").select("*").eq("structure_id", structureId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setStructure(structData || null);
    setMembers(memberData || []);
    setTopFiches(topData || []);
    setWeeklyStats(weekData || []);
    setInvitations(inviteData || []);
    setFavorisEquipe(favData || []);
    setTemoignage(temoinData || null);
    setLoading(false);
  }, [structureId]);

  const envoyerTemoignage = async () => {
    if (note === 0) { setTemoignageMsg({ ok: false, text: "Merci de choisir une note." }); return; }
    if (!certifieAuthentique) { setTemoignageMsg({ ok: false, text: "Merci de cocher la certification avant d'envoyer." }); return; }
    setEnvoiTemoignage(true);
    setTemoignageMsg(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("temoignages").insert({
      structure_id: structureId,
      auteur_id: user?.id,
      note,
      commentaire: commentaire.trim() || null,
      autorise_citation: autoriseCitation,
      certifie_authentique: certifieAuthentique,
    });
    setEnvoiTemoignage(false);
    if (error) { setTemoignageMsg({ ok: false, text: error.message }); return; }
    setTemoignageMsg({ ok: true, text: "Merci pour votre retour !" });
    load();
  };

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

        <div className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm mb-4">
          <div className="font-semibold text-emerald-950 text-sm mb-0.5">Donner votre avis</div>
          {temoignage ? (
            <div className="mt-2">
              <p className="text-xs text-stone-400 mb-2">Merci, votre dernier retour a bien été enregistré le {new Date(temoignage.created_at).toLocaleDateString("fr-FR")}.</p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`text-lg ${n <= temoignage.note ? "text-amber-500" : "text-stone-200"}`}>★</span>
                ))}
              </div>
              {temoignage.commentaire && <p className="text-sm text-stone-600 italic">"{temoignage.commentaire}"</p>}
            </div>
          ) : (
            <>
              <p className="text-xs text-stone-400 mb-3">Votre avis nous aide à améliorer Apézeo. Deux minutes suffisent.</p>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setNote(n)} className={`text-2xl transition-colors ${n <= note ? "text-amber-500" : "text-stone-200 hover:text-amber-300"}`}>★</button>
                ))}
              </div>
              <textarea
                value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Qu'est-ce qui fonctionne bien ? Qu'est-ce qu'on pourrait améliorer ?"
                className="w-full text-sm border border-stone-200 rounded-xl p-3 mb-3 resize-none" rows={3}
              />
              <label className="flex items-start gap-2.5 bg-stone-50 rounded-xl p-3 mb-3 cursor-pointer">
                <input type="checkbox" checked={certifieAuthentique} onChange={(e) => setCertifieAuthentique(e.target.checked)} className="mt-0.5 w-4 h-4 accent-emerald-700 shrink-0" />
                <span className="text-xs text-stone-700">
                  Je certifie que cet avis reflète l'usage réel d'Apézeo par {structure?.nom || "notre établissement"}.
                </span>
              </label>
              <label className="flex items-start gap-2.5 bg-emerald-50 rounded-xl p-3 mb-1 cursor-pointer">
                <input type="checkbox" checked={autoriseCitation} onChange={(e) => setAutoriseCitation(e.target.checked)} className="mt-0.5 w-4 h-4 accent-emerald-700 shrink-0" />
                <span className="text-xs text-emerald-900">
                  <b>J'autorise Apézeo à citer {structure?.nom || "notre établissement"} comme référence</b> (nom de l'établissement uniquement, jamais de donnée sur les résidents). Facultatif — vous pouvez revenir sur cette autorisation à tout moment en nous contactant.
                </span>
              </label>
              <p className="text-[11px] text-stone-400 mb-3 ml-6">Ça valorise votre établissement comme précurseur dans l'accompagnement non médicamenteux, et ça aide Apézeo à convaincre d'autres structures d'essayer l'outil — sans aucune obligation de votre part.</p>
              {temoignageMsg && <div className={`text-xs mb-3 ${temoignageMsg.ok ? "text-emerald-700" : "text-rose-600"}`}>{temoignageMsg.text}</div>}
              <button onClick={envoyerTemoignage} disabled={envoiTemoignage || !certifieAuthentique} className="w-full bg-emerald-700 disabled:bg-stone-300 text-white text-sm font-semibold rounded-xl py-2.5">
                {envoiTemoignage ? "Envoi…" : "Envoyer mon avis"}
              </button>
            </>
          )}
        </div>

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
