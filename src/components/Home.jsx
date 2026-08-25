// Écran d'accueil de la version Pro (après connexion).
import {
  ArrowLeftRight, BookOpen, Info, Lock, LogOut, Plus, RefreshCw, Users,
  Activity, AlertTriangle, Box, FileText, Filter, Heart, Search, Stethoscope,
} from "lucide-react";
import { NavCard } from "./ui.jsx";
import { LegalFooterLinks } from "./legal.jsx";

export function Home_({ fiches, dbCount, libraryLoading, profession, isAdmin, isSuperAdmin, canToggleExpert, onLockedExpertClick, modeExpert, onToggleAffichage, onOpenTroubles, onOpenBesoins, onOpenOutils, onOpenSearch, onOpenFavoris, onOpenQuiz, onOpenAdd, onOpenTeam, onOpenCreateStructure, onOpenSuperAdminStats, onOpenMesFiches, onOpenLegal, onOpenCompte, onRefresh, onLogout, onChangeMode }) {
  return (
    <div className="pb-10">
      <div className="mx-4 mt-4 lg:mx-8 lg:mt-6 relative overflow-hidden px-6 pt-7 pb-10 lg:px-10 lg:pt-10 lg:pb-14 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-[28px]">
        {/* Motif de vague — plusieurs profondeurs, très discret, jamais agité */}
        <svg className="absolute inset-x-0 bottom-0 w-full h-24 lg:h-32 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,55 C80,80 140,30 220,50 C290,68 340,40 400,58 L400,100 L0,100 Z" fill="rgba(255,255,255,0.05)" />
          <path d="M0,68 C90,45 160,85 240,65 C310,48 350,75 400,62 L400,100 L0,100 Z" fill="rgba(255,255,255,0.07)" />
        </svg>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="/logo-phoenix.png" alt="Apézeo" className="w-9 h-9 rounded-full object-cover shadow-sm" />
            <span className="uppercase tracking-widest text-xs font-semibold text-emerald-200">Apézeo</span>
            <span className="text-[11px] bg-white/15 rounded-full px-2 py-0.5">Version Pro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onChangeMode} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Changer de mode"><ArrowLeftRight size={15} /></button>
            <button onClick={onRefresh} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Actualiser"><RefreshCw size={15} /></button>
            <button onClick={onLogout} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Se déconnecter"><LogOut size={15} /></button>
          </div>
        </div>

        <div className="relative flex mb-4 bg-white/10 rounded-full p-0.5 w-fit">
          <button onClick={() => modeExpert && onToggleAffichage()} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${!modeExpert ? "bg-white text-emerald-800" : "text-emerald-100"}`}>Bibliothèque Standard</button>
          {canToggleExpert ? (
            <button onClick={() => !modeExpert && onToggleAffichage()} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${modeExpert ? "bg-emerald-950 text-amber-300" : "text-emerald-100"}`}>Bibliothèque Expert</button>
          ) : (
            <button onClick={onLockedExpertClick} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full text-emerald-100/50" aria-label="Bibliothèque Expert — accès réservé">
              <Lock size={11} /> Bibliothèque Expert
            </button>
          )}
        </div>

        <h1 className="relative text-2xl lg:text-3xl font-bold mb-1.5 tracking-tight">Un geste apaisant, tout de suite.</h1>
        {profession && <p className="relative text-emerald-200 text-xs mb-2.5">Connecté en tant que {profession}</p>}
        <div className="relative flex items-center gap-3 text-emerald-100 text-sm mb-7">
          {libraryLoading ? (
            <span className="flex items-center gap-1.5 text-emerald-200/80"><RefreshCw size={13} className="animate-spin" /> Chargement de la bibliothèque…</span>
          ) : (
            <>
              <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-emerald-300" /> {fiches.length} techniques</span>
              <span className="text-emerald-400/50">|</span>
              <span className="flex items-center gap-1.5"><Users size={15} className="text-emerald-300" /> Bibliothèque complète : {dbCount}</span>
            </>
          )}
        </div>
        <div className="relative">
          <button onClick={onOpenQuiz} className="relative w-full overflow-hidden bg-amber-400 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-xl text-emerald-950 font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg ring-1 ring-white/40 active:scale-[0.98] transition-all duration-200">
            <span className="cta-shine" />
            Trouver la meilleure technique maintenant
          </button>
        </div>
      </div>
      <div className="px-5 lg:px-8 mt-6 flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
        <NavCard icon={AlertTriangle} label="Choisir un trouble" sub="Agitation, cris, refus de soins…" onClick={onOpenTroubles} accent="emerald" />
        <NavCard icon={Filter} label="Rechercher par besoin" sub="Communication, musique, toucher…" onClick={onOpenBesoins} accent="emerald" />
        <NavCard icon={Box} label="Outils et soins spécifiques" sub="Poupées, luminothérapie, objets sensoriels…" onClick={onOpenOutils} accent="violet" />
        <NavCard icon={Search} label="Recherche libre" onClick={onOpenSearch} accent="emerald" />
        <NavCard icon={Heart} label="Favoris" sub="Ce qui fonctionne pour votre pratique" onClick={onOpenFavoris} accent="emerald" />
        <NavCard icon={FileText} label="Mes fiches" sub="Toutes vos créations personnelles" onClick={onOpenMesFiches} accent="emerald" />
        {isAdmin && <NavCard icon={Users} label="Gérer mon équipe" sub="Comptes et accès à la structure" onClick={onOpenTeam} accent="admin" badge="Admin" />}
        {isSuperAdmin && <NavCard icon={Stethoscope} label="Créer une structure" sub="Nouveau client B2B" onClick={onOpenCreateStructure} accent="admin" badge="Admin" />}
        {isSuperAdmin && <NavCard icon={Activity} label="Statistiques" sub="Vue d'ensemble de la plateforme" onClick={onOpenSuperAdminStats} accent="admin" badge="Admin" />}
      </div>
      <div className="px-5 lg:px-8 mt-5">
        <button onClick={onOpenAdd} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-emerald-700/40 hover:bg-emerald-50/50 text-stone-500 hover:text-emerald-800 rounded-2xl py-4 font-medium transition-colors">
          <Plus size={18} /> Ajouter une fiche personnelle
        </button>
        <p className="text-xs text-stone-400 text-center mt-2">Fiche personnelle, privée — vous seul(e) y avez accès, elle n'est pas partagée avec le reste de votre équipe.</p>
      </div>
      <div className="px-5 lg:px-8 mt-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-sm text-amber-900">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>En cas de danger immédiat, ou si les troubles deviennent fréquents et intenses, consultez un médecin ou un gériatre.</span>
        </div>
      </div>
      <div className="text-center">
        <button onClick={onOpenCompte} className="text-xs text-stone-400 underline">Mon compte</button>
      </div>
      <LegalFooterLinks onOpen={onOpenLegal} />
    </div>
  );
}

/* ---------- CRÉER UNE STRUCTURE (super-admin uniquement) ---------- */
/* ============================================================
   MODE AIDANT — accès public, sans compte, interface simplifiée.
   Lit la même bibliothèque partagée (lecture publique déjà autorisée
   par la policy RLS sur `interventions`). Favoris/historique/fiches
   personnelles restent sur cet appareil (localStorage), puisqu'il n'y
   a pas de compte dans ce mode.
   ============================================================ */
