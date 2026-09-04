import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AlertTriangle, Info, DatabaseZap, UserX,
} from "lucide-react";
import { FAMILLES } from "./data/constants.js";
import { supabase, supabaseReady, rowToFiche, rowToPersonalFiche, ficheToPersonalRow } from "./lib/supabase.js";
import { getLocal, setLocal } from "./lib/localStore.js";

import { NavCard, HomeContext } from "./components/ui.jsx";
import { LegalView } from "./components/legal.jsx";
import { TroublesView, OutilsView, FamillesView, FicheListView, SearchView, FavorisView, MesFichesView, HistoriqueView, FavorisEquipeView } from "./components/browse.jsx";
import { QuizView, RecommandationsView } from "./components/quiz.jsx";
import { FicheDetailView, LogView, FicheFormView } from "./components/ficheDetail.jsx";
import { SuperAdminStatsView } from "./components/adminStats.jsx";
import { CreateStructureView } from "./components/adminStructures.jsx";
import { MonCompteView } from "./components/adminAccount.jsx";
import { AdminTeamView } from "./components/adminTeam.jsx";
import { essaiJoursRestants } from "./components/adminShared.jsx";
import { AuthView } from "./components/AuthView.jsx";
import { GateV2 } from "./components/GateV2.jsx";
import { AidantApp } from "./AidantApp.jsx";
import { Home_ } from "./components/Home.jsx";
import { scoreFiche, fetchAllRows } from "./lib/utils.js";

const emptyLocalFiche = () => ({
  id: null, isLocal: true, titre: "", categorie: FAMILLES[0], sousCategorie: "",
  troubles: [], stades: [], contextes: [], niveauPreuve: 3, description: "",
  pourquoi: "", quandUtiliser: "", quandEviter: "", dureeMinutes: 5, dureeLabel: "",
  materiel: [], difficulte: "Facile", etapes: [], conseils: [], erreurs: [],
  contreIndications: [], motsCles: [], sources: [], dateMaj: "",
});

/* ---------- AUTHENTIFICATION ---------- */
/* ---------- AFFICHAGE DES TEXTES LÉGAUX (markdown-lite, sans dépendance) ---------- */

/* ============================================================
   APP
   ============================================================ */
function AuthenticatedApp({ session, onChangeMode }) {
  const userId = session.user.id;
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [dbFiches, setDbFiches] = useState([]);
  const [localFiches, setLocalFiches] = useState([]);
  const [favoris, setFavoris] = useState({ liked: [], disliked: [] });
  const [historique, setHistorique] = useState([]);
  const [toast, setToast] = useState(null);
  const [stack, setStack] = useState([{ view: "home" }]);
  const [profile, setProfile] = useState(null);
  const [essaisExpires, setEssaisExpires] = useState([]);
  const [signalementsNonResolus, setSignalementsNonResolus] = useState(0);
  const [essaiTermine, setEssaiTermine] = useState(false);
  const [sessionReplaced, setSessionReplaced] = useState(false);
  const mySessionToken = useRef(null);

  const current = stack[stack.length - 1];
  const push = (frame) => setStack((s) => {
    const updated = [...s];
    updated[updated.length - 1] = { ...updated[updated.length - 1], scrollY: window.scrollY };
    return [...updated, frame];
  });
  const goHome = () => setStack([{ view: "home" }]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  // Compte "gratuit" (sans structure) : accès à un échantillon seulement —
  // une fiche par famille, pour donner un vrai aperçu sans donner accès
  // à la bibliothèque complète.
  const sampleDbFiches = useMemo(() => {
    const seen = new Set();
    const sample = [];
    let outilAjoute = false;
    for (const f of dbFiches) {
      if (f.niveauDetail === "expert") continue; // jamais dans l'échantillon gratuit
      if (f.typeFiche === "outil") {
        if (outilAjoute) continue; // un seul outil spécifique visible en accès découverte
        outilAjoute = true;
        sample.push(f);
        continue;
      }
      if (!seen.has(f.categorie)) { seen.add(f.categorie); sample.push(f); }
    }
    return sample;
  }, [dbFiches]);

  const isGratuit = profile && profile.plan === "gratuit";
  const visibleDbFiches = isGratuit ? sampleDbFiches : dbFiches;
  const modeExpert = profile?.affichage === "expert" && profile?.plan === "structure";
  const fichesDuMode = useMemo(
    () => visibleDbFiches.filter((f) => f.typeFiche !== "outil" && (modeExpert ? f.niveauDetail === "expert" : f.niveauDetail !== "expert")),
    [visibleDbFiches, modeExpert]
  );
  const fiches = useMemo(() => [...fichesDuMode, ...localFiches], [fichesDuMode, localFiches]);
  const outilsFiches = useMemo(() => visibleDbFiches.filter((f) => f.typeFiche === "outil"), [visibleDbFiches]);
  // Recherche et favoris : toujours accessibles, y compris les outils, indépendamment du mode Standard/Expert.
  const fichesRecherchables = useMemo(() => [...fiches, ...outilsFiches], [fiches, outilsFiches]);
  // Favoris d'équipe : toujours tous niveaux confondus -- un admin peut
  // recommander une fiche Standard alors qu'un membre est en mode
  // Expert, et inversement, il ne faut jamais qu'elle disparaisse.
  const fichesTousNiveaux = useMemo(
    () => [...visibleDbFiches.filter((f) => f.typeFiche !== "outil"), ...localFiches, ...outilsFiches],
    [visibleDbFiches, localFiches, outilsFiches]
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const loadFromSupabase = useCallback(async () => {
    if (!supabaseReady) { setLoading(false); return; }
    setLoading(true);
    setLibraryLoading(true);

    // La bibliothèque complète (le plus gros volume) charge en arrière-
    // plan, sans bloquer le reste : profil, favoris et historique sont
    // minuscules et peuvent débloquer l'écran d'accueil bien avant.
    fetchAllRows(supabase, "interventions", "*", "id").then((interv) => {
      if (interv.error) { setDbError(interv.error.message); }
      else { setDbFiches((interv.data || []).map(rowToFiche)); setDbError(null); }
      setLibraryLoading(false);
    });

    const [personal, favRows, histRows, profileRow] = await Promise.all([
      supabase.from("fiches_personnelles").select("*").eq("user_id", userId).order("id", { ascending: true }),
      supabase.from("favoris").select("*").eq("user_id", userId),
      supabase.from("historique").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", userId).single(),
    ]);

    if (!personal.error) setLocalFiches((personal.data || []).map(rowToPersonalFiche));

    if (!favRows.error) {
      const liked = (favRows.data || []).filter((r) => r.type === "liked").map((r) => r.fiche_id);
      const disliked = (favRows.data || []).filter((r) => r.type === "disliked").map((r) => r.fiche_id);
      setFavoris({ liked, disliked });
    }

    if (!histRows.error) {
      setHistorique((histRows.data || []).map((r) => ({
        id: r.id, ficheId: r.fiche_id, avant: r.avant, apres: r.apres,
        commentaire: r.commentaire, date: r.created_at,
      })));
    }

    if (!profileRow.error) {
      const p = profileRow.data;
      setProfile(p);
      // Vérifie paresseusement, à chaque chargement, si l'essai de la
      // structure vient d'expirer — et verrouille réellement l'accès
      // (côté base, via la fonction) si c'est le cas.
      if (p?.structure_id) {
        const { data: essaiCheck } = await supabase.rpc("verifier_essai", { p_structure_id: p.structure_id });
        const res = essaiCheck && essaiCheck[0];
        if (res?.expire) {
          setEssaiTermine(true);
          setProfile((prev) => (prev ? { ...prev, actif: false } : prev));
        }
      }
      // Verrou de session : écrit un nouveau jeton, ce qui invalide
      // (via l'abonnement temps réel ci-dessous) toute autre session
      // déjà ouverte avec ce compte.
      if (p?.actif !== false) {
        const token = crypto.randomUUID();
        mySessionToken.current = token;
        await supabase.from("profiles").update({ session_token: token }).eq("id", userId);
      }

      // Alerte super-admin : structures dont l'essai est terminé mais
      // toujours actives (pas suspendues) — protégée nativement, la
      // policy RLS de `structures` ne renvoie ces lignes qu'à un vrai
      // super-admin, quel que soit le moyen d'appel utilisé.
      if (p?.super_admin) {
        const { data: structs } = await fetchAllRows(supabase, "structures", "id, nom, essai_duree_semaines, created_at, suspended");
        const expirees = (structs || []).filter((s) => !s.suspended && essaiJoursRestants(s) != null && essaiJoursRestants(s) <= 0);
        setEssaisExpires(expirees);

        // Même principe que les essais expirés : protégé nativement par
        // la policy RLS de `signalements` (super-admin uniquement).
        const { count } = await supabase.from("signalements").select("id", { count: "exact", head: true }).eq("resolu", false);
        setSignalementsNonResolus(count || 0);
      }
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);

  // Écoute les changements sur sa propre ligne de profil : si le jeton
  // de session change pour une valeur différente de la sienne, c'est
  // qu'une connexion a eu lieu ailleurs — on se déconnecte localement.
  useEffect(() => {
    const channel = supabase
      .channel(`session-lock-${userId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` }, (payload) => {
        const newToken = payload.new?.session_token;
        if (newToken && mySessionToken.current && newToken !== mySessionToken.current) {
          setSessionReplaced(true);
          supabase.auth.signOut({ scope: "local" });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const addLocalFiche = async (f) => {
    const payload = ficheToPersonalRow(f, userId);
    if (f.dbId) {
      const { error } = await supabase.from("fiches_personnelles").update(payload).eq("id", f.dbId).eq("user_id", userId);
      if (error) { showToast("Échec de la mise à jour : " + error.message); return; }
      showToast("Fiche personnelle mise à jour");
    } else {
      const { error } = await supabase.from("fiches_personnelles").insert(payload);
      if (error) { showToast("Échec de l'ajout : " + error.message); return; }
      showToast("Fiche personnelle ajoutée");
    }
    await loadFromSupabase();
  };
  const deleteLocalFiche = async (id) => {
    const f = fiches.find((x) => x.id === id);
    if (!f) return;
    const { error } = await supabase.from("fiches_personnelles").delete().eq("id", f.dbId).eq("user_id", userId);
    if (error) { showToast("Échec de la suppression : " + error.message); return; }
    showToast("Fiche supprimée");
    await loadFromSupabase();
  };

  const toggleFav = async (id, type) => {
    const already = favoris.liked.includes(id) ? "liked" : favoris.disliked.includes(id) ? "disliked" : null;
    if (already === type) {
      await supabase.from("favoris").delete().eq("user_id", userId).eq("fiche_id", id);
    } else {
      await supabase.from("favoris").upsert({ user_id: userId, fiche_id: id, type }, { onConflict: "user_id,fiche_id" });
    }
    const { data } = await supabase.from("favoris").select("*").eq("user_id", userId);
    const liked = (data || []).filter((r) => r.type === "liked").map((r) => r.fiche_id);
    const disliked = (data || []).filter((r) => r.type === "disliked").map((r) => r.fiche_id);
    setFavoris({ liked, disliked });
  };

  const toggleAffichage = async () => {
    const next = profile?.affichage === "expert" ? "standard" : "expert";
    setProfile((p) => ({ ...p, affichage: next }));
    await supabase.from("profiles").update({ affichage: next }).eq("id", userId);
  };

  const addHistoriqueEntry = async (entry) => {
    const { error } = await supabase.from("historique").insert({
      user_id: userId, fiche_id: entry.ficheId, avant: entry.avant, apres: entry.apres, commentaire: entry.commentaire || null,
    });
    if (error) { showToast("Échec de l'enregistrement : " + error.message); return; }
    showToast("Utilisation enregistrée");
    const { data } = await supabase.from("historique").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setHistorique((data || []).map((r) => ({ id: r.id, ficheId: r.fiche_id, avant: r.avant, apres: r.apres, commentaire: r.commentaire, date: r.created_at })));
  };

  const ficheById = (id) => fichesRecherchables.find((f) => f.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2]">
        <div className="flex flex-col items-center gap-6 text-emerald-800">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full logo-orbit-ring"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, transparent 68%, rgba(217,180,80,0.18) 84%, rgba(245,197,66,0.95) 97%, #fff7d6 100%)",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_16px_5px_rgba(245,197,66,0.85)]" />
            </div>
            <img src="/logo-phoenix-large.png" alt="Apézeo" className="w-44 h-44 rounded-full" />
          </div>
          <span className="text-sm">Chargement d'Apézeo…</span>
        </div>
      </div>
    );
  }

  if (sessionReplaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2] p-6">
        <div className="max-w-sm text-center">
          <UserX className="mx-auto mb-3 text-amber-600" size={32} />
          <h1 className="text-lg font-semibold text-emerald-950 mb-2">Session ouverte ailleurs</h1>
          <p className="text-sm text-stone-600 mb-4">
            Votre compte vient d'être utilisé pour se connecter sur un autre appareil. Pour la sécurité de votre compte, un seul appareil peut être connecté à la fois. Si ce n'était pas vous, changez votre mot de passe.
          </p>
          <button onClick={() => window.location.reload()} className="text-sm text-emerald-700 underline">Se reconnecter</button>
        </div>
      </div>
    );
  }

  if (profile && profile.actif === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2] p-6">
        <div className="max-w-sm text-center">
          <UserX className="mx-auto mb-3 text-rose-600" size={32} />
          <h1 className="text-lg font-semibold text-emerald-950 mb-2">{essaiTermine ? "Essai terminé" : "Compte désactivé"}</h1>
          <p className="text-sm text-stone-600 mb-4">
            {essaiTermine
              ? "La période d'essai gratuite de votre structure est arrivée à son terme, pour toute l'équipe. Contactez Apézeo pour passer à un abonnement et retrouver l'accès complet."
              : "Votre accès a été désactivé par l'administrateur de votre structure. Contactez-le pour plus d'informations."}
          </p>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-emerald-700 underline">Se déconnecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F2] md:bg-stone-200 md:flex md:justify-center md:py-8 lg:bg-[#F4F6F2] lg:block lg:py-0">
    <div className="w-full md:max-w-2xl md:bg-[#F4F6F2] md:rounded-3xl md:shadow-2xl md:overflow-hidden md:border md:border-stone-300/60 lg:max-w-none lg:rounded-none lg:shadow-none lg:border-none lg:overflow-visible">
      {dbError && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-700 text-xs px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={13} /> Bibliothèque partagée indisponible ({dbError}) — seules vos fiches personnelles sont affichées.
        </div>
      )}
      {isGratuit && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 flex items-center gap-2">
          <Info size={13} className="shrink-0" /> Accès découverte — {sampleDbFiches.length} fiches sur {dbFiches.length}. Demandez un code d'invitation à votre établissement pour l'accès complet.
        </div>
      )}

      <HomeContext.Provider value={goHome}>
      <div className={`lg:max-w-5xl xl:max-w-6xl lg:mx-auto ${modeExpert ? "theme-expert" : ""}`}>
      {current.view === "home" && (
        <Home_
          fiches={fiches} dbCount={visibleDbFiches.length} libraryLoading={libraryLoading} profession={session?.user?.user_metadata?.profession}
          isAdmin={profile?.role === "admin"}
          isSuperAdmin={profile?.super_admin === true}
          essaisExpires={essaisExpires}
          signalementsNonResolus={signalementsNonResolus}
          hasStructure={!!profile?.structure_id}
          canToggleExpert={profile?.plan === "structure"}
          onLockedExpertClick={() => showToast("La Bibliothèque Expert est réservée aux comptes Structure — contactez votre établissement pour en bénéficier.")}
          modeExpert={modeExpert}
          onToggleAffichage={toggleAffichage}
          onOpenCreateStructure={() => push({ view: "create-structure" })}
          onOpenSuperAdminStats={() => push({ view: "super-admin-stats" })}
          onOpenMesFiches={() => push({ view: "mes-fiches" })}
          onOpenLegal={(doc) => push({ view: "legal", doc })}
          onOpenCompte={() => push({ view: "compte" })}
          onOpenTeam={() => push({ view: "team" })}
          onOpenTroubles={() => push({ view: "troubles" })}
          onOpenBesoins={() => push({ view: "besoins" })}
          onOpenOutils={() => push({ view: "outils" })}
          onOpenSearch={() => push({ view: "search" })}
          onOpenFavoris={() => push({ view: "favoris" })}
          onOpenFavorisEquipe={() => push({ view: "favoris-equipe" })}
          onOpenQuiz={() => push({ view: "quiz" })}
          onOpenAdd={() => push({ view: "form", fiche: emptyLocalFiche() })}
          onRefresh={loadFromSupabase}
          onLogout={() => supabase.auth.signOut()}
          onChangeMode={onChangeMode}
        />
      )}

      {current.view === "troubles" && (
        <TroublesView fiches={fichesRecherchables} onBack={pop} onOpenTrouble={(t) => push({ view: "trouble-detail", trouble: t })} />
      )}
      {current.view === "trouble-detail" && (
        <FicheListView title={current.trouble} onBack={pop} favoris={favoris} scrollY={current.scrollY}
          items={fichesRecherchables.filter((f) => f.troubles.includes(current.trouble)).sort((a, b) => b.niveauPreuve - a.niveauPreuve)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucune fiche pour ce trouble pour l'instant." />
      )}
      {current.view === "besoins" && (
        <FamillesView fiches={fichesRecherchables} onBack={pop} onOpenFamille={(c) => push({ view: "famille-detail", famille: c })} />
      )}
      {current.view === "famille-detail" && (
        <FicheListView title={current.famille} onBack={pop} favoris={favoris} scrollY={current.scrollY}
          items={fichesRecherchables.filter((f) => f.categorie === current.famille)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucune fiche dans cette famille pour l'instant." />
      )}
      {current.view === "outils" && (
        <OutilsView fiches={outilsFiches} onBack={pop} onOpenType={(t) => push({ view: "outil-type", outilType: t })} />
      )}
      {current.view === "outil-type" && (
        <FicheListView title={current.outilType} onBack={pop} favoris={favoris} scrollY={current.scrollY}
          items={outilsFiches.filter((f) => f.outilType === current.outilType)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucun outil dans cette catégorie pour l'instant." />
      )}
      {current.view === "search" && (
        <SearchView fiches={fichesRecherchables} onBack={pop} favoris={favoris} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "favoris" && (
        <FavorisView fiches={fichesTousNiveaux} favoris={favoris} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "favoris-equipe" && (
        <FavorisEquipeView structureId={profile?.structure_id} fiches={fichesTousNiveaux} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "historique" && (
        <HistoriqueView historique={historique} ficheById={ficheById} onBack={pop} />
      )}
      {current.view === "quiz" && (
        <QuizView onBack={pop} fichesDisponibles={[...fiches, ...outilsFiches]} onSubmit={(q) => {
          const scored = [...fiches, ...outilsFiches].map((f) => ({ f, s: scoreFiche(f, q, favoris) })).filter((x) => x.s !== null).sort((a, b) => b.s - a.s);
          const max = 134;
          const results = scored.map((x) => ({ ...x, pct: Math.max(5, Math.min(99, Math.round((x.s / max) * 100))) }));
          const label = [q.troubleIds.join(", "), q.besoin, q.stade, q.contexte].filter(Boolean).join(" · ");
          let suggestions = [];
          if (results.length === 0 && q.troubleIds.length > 0) {
            suggestions = [...fiches, ...outilsFiches]
              .map((f) => ({ f, n: (f.troubles || []).filter((t) => q.troubleIds.includes(t)).length }))
              .filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4).map((x) => x.f);
          }
          push({ view: "recommandations", results, trouble: label, suggestions });
        }} />
      )}
      {current.view === "recommandations" && (
        <RecommandationsView title={current.trouble} results={current.results} suggestions={current.suggestions} favoris={favoris} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f, rechercheLabel: current.trouble })} />
      )}
      {current.view === "fiche" && (
        <FicheDetailView
          fiche={ficheById(current.fiche.id) || current.fiche} favoris={favoris} onBack={pop}
          allFiches={fiches}
          rechercheLabel={current.rechercheLabel}
          onOpenFiche={(nf) => push({ view: "fiche", fiche: nf, rechercheLabel: current.rechercheLabel })}
          onToggleLike={() => toggleFav(current.fiche.id, "liked")}
          onToggleDislike={() => toggleFav(current.fiche.id, "disliked")}
          onLog={() => push({ view: "log", fiche: current.fiche })}
          onEdit={current.fiche.isLocal ? () => push({ view: "form", fiche: ficheById(current.fiche.id) || current.fiche }) : null}
          onDelete={current.fiche.isLocal ? async () => { await deleteLocalFiche(current.fiche.id); pop(); } : null}
          teamAdminStructureId={profile?.role === "admin" ? profile?.structure_id : null}
        />
      )}
      {current.view === "log" && (
        <LogView fiche={current.fiche} onBack={pop} onSave={async (entry) => { await addHistoriqueEntry(entry); pop(); }} />
      )}
      {current.view === "form" && (
        <FicheFormView initial={current.fiche} onBack={pop} onSave={async (f) => { await addLocalFiche(f); pop(); }} />
      )}
      {current.view === "mes-fiches" && (
        <MesFichesView fiches={fiches} favoris={favoris} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "team" && (
        <AdminTeamView structureId={profile?.structure_id} onBack={pop} />
      )}
      {current.view === "compte" && (
        <MonCompteView email={session?.user?.email} profile={profile} onProfileUpdated={(patch) => setProfile((p) => ({ ...p, ...patch }))} onBack={pop} ficheById={ficheById} />
      )}
      {current.view === "create-structure" && (
        <CreateStructureView onBack={pop} />
      )}
      {current.view === "super-admin-stats" && (
        <SuperAdminStatsView onBack={pop} />
      )}
      {current.view === "legal" && (
        <LegalView doc={current.doc} onBack={pop} />
      )}
      </div>
      </HomeContext.Provider>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>
      )}
    </div>
    </div>
  );
}

/* ---------- HOME ---------- */
export default function App() {
  const [mode, setMode] = useState(() => getLocal("mode", null)); // null | "pro" | "aidant"
  const [session, setSession] = useState(undefined); // undefined = en cours, null = déconnecté

  const chooseMode = (m) => { setMode(m); setLocal("mode", m); };
  const changeMode = () => { setMode(null); setLocal("mode", null); };

  useEffect(() => {
    if (!supabaseReady) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2] p-6">
        <div className="max-w-sm text-center">
          <DatabaseZap className="mx-auto mb-3 text-emerald-700" size={32} />
          <h1 className="text-lg font-semibold text-emerald-950 mb-2">Supabase n'est pas encore configuré</h1>
          <p className="text-sm text-stone-600">
            Ajoutez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans vos variables
            d'environnement (fichier <code>.env.local</code> en local, ou réglages du projet sur Vercel), puis relancez.
            Voir le README du projet.
          </p>
        </div>
      </div>
    );
  }

  if (!mode) return <GateV2 onChoose={chooseMode} />;

  if (mode === "aidant") return <AidantApp onChangeMode={changeMode} />;

  // mode === "pro"
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2]">
        <div className="flex flex-col items-center gap-6 text-emerald-800">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full logo-orbit-ring"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, transparent 68%, rgba(217,180,80,0.18) 84%, rgba(245,197,66,0.95) 97%, #fff7d6 100%)",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_16px_5px_rgba(245,197,66,0.85)]" />
            </div>
            <img src="/logo-phoenix-large.png" alt="Apézeo" className="w-44 h-44 rounded-full" />
          </div>
          <span className="text-sm">Chargement d'Apézeo…</span>
        </div>
      </div>
    );
  }

  if (!session) return <AuthView onChangeMode={changeMode} />;

  return <AuthenticatedApp session={session} onChangeMode={changeMode} />;
}
