import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";
import {
  Search, Heart, HeartOff, History, Plus, ArrowLeft, Star, ChevronRight,
  Sparkles, Clock, AlertTriangle, Filter, Leaf, Save, Info, RefreshCw,
  Trash2, DatabaseZap, LogOut, UserCircle, Mail, Lock, Stethoscope, Users,
  ArrowLeftRight, CheckCircle2, ShieldCheck, UserX, UserCheck, Copy, BookOpen,
  Eye, EyeOff, FileText, Home, Lightbulb, PhoneCall, Box,
} from "lucide-react";
import { TROUBLES, FAMILLES, STADES, CONTEXTES, PROFESSIONS, OUTILS_TYPES } from "./data/constants.js";
import { MENTIONS_LEGALES, CGU, CONFIDENTIALITE, NON_RESPONSABILITE, METHODE_EDITORIALE } from "./data/legalTexts.js";
import { AIDANT_FICHES } from "./data/aidantFiches.js";
import { supabase, supabaseReady, rowToFiche, rowToPersonalFiche, ficheToPersonalRow } from "./lib/supabase.js";
import { getLocal, setLocal } from "./lib/localStore.js";

const uid = () => `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const linesToArray = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const arrayToLines = (a) => (a || []).join("\n");

const emptyLocalFiche = () => ({
  id: null, isLocal: true, titre: "", categorie: FAMILLES[0], sousCategorie: "",
  troubles: [], stades: [], contextes: [], niveauPreuve: 3, description: "",
  pourquoi: "", quandUtiliser: "", quandEviter: "", dureeMinutes: 5, dureeLabel: "",
  materiel: [], difficulte: "Facile", etapes: [], conseils: [], erreurs: [],
  contreIndications: [], motsCles: [], sources: [], dateMaj: "",
});

/* ---------- petits composants UI ---------- */
function Stars({ n }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
      ))}
    </span>
  );
}
function Badge({ children, tone = "stone" }) {
  const tones = {
    stone: "bg-stone-100 text-stone-700",
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-700",
    orangeDark: "bg-orange-800 text-white",
    expert: "bg-emerald-950 text-amber-300",
    outil: "bg-violet-100 text-violet-800",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
const HomeContext = createContext(() => {});

function TopBar({ title, onBack, right }) {
  const goHome = useContext(HomeContext);
  return (
    <div className="sticky top-0 z-30 bg-[#F4F6F2]/55 backdrop-blur-xl backdrop-saturate-150 px-5 py-4 lg:px-9 lg:py-5 flex items-center gap-3">
      {onBack ? (
        <>
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-emerald-900/8 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200" aria-label="Retour">
            <ArrowLeft size={19} className="text-emerald-900" />
          </button>
          <button onClick={goHome} className="p-2 rounded-full hover:bg-emerald-900/8 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200" aria-label="Retour au menu principal">
            <Home size={18} className="text-emerald-900" />
          </button>
        </>
      ) : (
        <img src="/logo-phoenix.png" alt="Apézeo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
      )}
      <h1 className="flex-1 text-lg font-bold text-emerald-950 truncate tracking-tight">{title}</h1>
      {right}
    </div>
  );
}
function NavCard({ icon: Icon, label, sub, onClick, accent = "emerald", badge }) {
  const accents = {
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-800 text-white",
    amber: "bg-gradient-to-br from-amber-300 to-amber-500 text-emerald-950",
    stone: "bg-gradient-to-br from-stone-500 to-stone-700 text-white",
    admin: "bg-gradient-to-br from-stone-800 to-stone-950 text-white",
    violet: "bg-gradient-to-br from-violet-400 to-violet-700 text-white",
  };
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 bg-white rounded-3xl p-5 shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] hover:shadow-[0_8px_28px_-6px_rgba(6,78,59,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200 text-left">
      <div className={`relative overflow-hidden rounded-2xl p-3 ${accents[accent]}`}>
        {/* reflet — léger halo lumineux en haut à gauche */}
        <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-white/30 blur-md pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
        <Icon size={22} className="relative" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="font-semibold text-emerald-950">{label}</div>
          {badge && <span className="text-[10px] font-semibold uppercase tracking-wide bg-stone-950 text-white rounded-full px-2 py-0.5">{badge}</span>}
        </div>
        {sub && <div className="text-sm text-stone-500 truncate">{sub}</div>}
      </div>
      <ChevronRight size={18} className="text-stone-300" />
    </button>
  );
}
function FicheCard({ f, onClick, favState }) {
  const nonSourcee = f.categorie === "Technique personnelle";
  const isOutil = f.typeFiche === "outil";
  return (
    <button onClick={onClick} className={`w-full text-left bg-white rounded-2xl p-4 shadow-[0_2px_12px_-4px_rgba(6,78,59,0.08)] hover:shadow-[0_6px_20px_-6px_rgba(6,78,59,0.14)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 transition-all duration-200 flex items-start gap-3 ${isOutil ? "border-l-[3px] border-violet-400 focus-visible:outline-violet-500" : "focus-visible:outline-emerald-600"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          {isOutil ? <Badge tone="outil">{f.outilType || "Outil spécifique"}</Badge> : <Badge tone={nonSourcee ? "orangeDark" : "emerald"}>{f.categorie}</Badge>}
          {f.alerteOutil && <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5"><AlertTriangle size={11} /> Vigilance</span>}
          {f.niveauDetail === "expert" && <Badge tone="expert">Expert</Badge>}
          {nonSourcee && <Badge tone="rose">Non sourcée</Badge>}
          {f.dureeMinutes > 0 ? <Badge>{f.dureeMinutes} min</Badge> : f.dureeLabel ? <Badge>{f.dureeLabel}</Badge> : null}
          {f.isLocal && <Badge tone="amber">Personnelle</Badge>}
          {favState === "liked" && <Heart size={14} className="fill-rose-500 text-rose-500" />}
        </div>
        <div className={`font-semibold truncate tracking-tight ${isOutil ? "text-violet-950" : "text-emerald-950"}`}>{f.titre}</div>
        <div className="text-sm text-stone-500 line-clamp-2 mt-0.5">{f.description}</div>
        {!isOutil && f.niveauDetail !== "expert" && <div className="mt-1.5"><Stars n={f.niveauPreuve} /></div>}
      </div>
      <ChevronRight size={18} className="text-stone-300 mt-1 shrink-0" />
    </button>
  );
}
function Field({ label, children }) {
  return <label className="block mb-3"><span className="block text-sm font-medium text-stone-600 mb-1">{label}</span>{children}</label>;
}
const inputCls = "w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";
function CheckGroup({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <button type="button" key={o} onClick={() => onToggle(o)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${active ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-600 border-stone-300"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
function Section({ title, children }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  return <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">{title}</div>{children}</div>;
}
function BulletList({ items }) {
  if (!items || items.length === 0) return null;
  return <ul className="space-y-1.5">{items.map((it, i) => <li key={i} className="text-sm text-stone-700 flex gap-2"><span className="text-emerald-600 mt-0.5">•</span><span>{it}</span></li>)}</ul>;
}
function ScoreRing({ pct, violet }) {
  const r = 20, c = 2 * Math.PI * r;
  const color = violet ? "#6d28d9" : "#047857";
  const textColor = violet ? "#4c1d95" : "#064e3b";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <title>Score de correspondance avec les critères que vous avez indiqués (troubles, besoin, stade, contexte, temps disponible) — plus il est élevé, plus la fiche correspond à ce que vous cherchez.</title>
      <circle cx="26" cy="26" r={r} stroke="#e7e5e4" strokeWidth="5" fill="none" />
      <circle cx="26" cy="26" r={r} stroke={color} strokeWidth="5" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round" transform="rotate(-90 26 26)" />
      <text x="26" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill={textColor}>{pct}%</text>
    </svg>
  );
}

/* ---------- AUTHENTIFICATION ---------- */
/* ---------- AFFICHAGE DES TEXTES LÉGAUX (markdown-lite, sans dépendance) ---------- */
function renderInline(str) {
  const parts = str.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-emerald-950">{part}</strong> : part));
}
function SourcesLine({ sources, dateMaj }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="text-xs text-stone-400 mt-1">
      Sources :{" "}
      {sources.map((s, i) => {
        const [label, url] = s.split("|");
        return (
          <span key={i}>
            {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">{label}</a> : label}
            {i < sources.length - 1 ? ", " : ""}
          </span>
        );
      })}
      {dateMaj ? ` · maj ${dateMaj}` : ""}
    </div>
  );
}
function LegalContent({ text }) {
  const lines = text.split("\n");
  return (
    <div className="text-sm text-stone-700 leading-relaxed">
      {lines.map((line, i) => {
        const t = line.trim();
        if (t.startsWith("### ")) return <h3 key={i} className="font-semibold text-emerald-950 mt-4 mb-1">{renderInline(t.slice(4))}</h3>;
        if (t.startsWith("## ")) return <h2 key={i} className="font-semibold text-emerald-950 text-base mt-5 mb-1.5">{renderInline(t.slice(3))}</h2>;
        if (t.startsWith("# ")) return null; // titre déjà affiché dans le TopBar
        if (t.startsWith("- ")) return <li key={i} className="ml-4 list-disc mb-1">{renderInline(t.slice(2))}</li>;
        if (t.startsWith("---")) return <hr key={i} className="my-4 border-stone-200" />;
        if (t.startsWith("*") && t.endsWith("*") && !t.startsWith("**") && t.length > 1) return <p key={i} className="italic text-stone-500 text-xs mb-2">{renderInline(t.slice(1, -1))}</p>;
        if (t === "") return <div key={i} className="h-2" />;
        return <p key={i} className="mb-2">{renderInline(t)}</p>;
      })}
    </div>
  );
}
function LegalView({ doc, onBack }) {
  const map = {
    mentions: { title: "Mentions légales", text: MENTIONS_LEGALES },
    cgu: { title: "CGU", text: CGU },
    confidentialite: { title: "Confidentialité", text: CONFIDENTIALITE },
    responsabilite: { title: "Non-responsabilité", text: NON_RESPONSABILITE },
    methode: { title: "Notre méthode éditoriale", text: METHODE_EDITORIALE },
  };
  const entry = map[doc] || map.mentions;
  return (
    <div className="pb-10">
      <TopBar title={entry.title} onBack={onBack} />
      <div className="p-4"><LegalContent text={entry.text} /></div>
    </div>
  );
}
function LegalFooterLinks({ onOpen }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-stone-400 px-5 py-4">
      <button onClick={() => onOpen("mentions")} className="underline">Mentions légales</button>
      <button onClick={() => onOpen("cgu")} className="underline">CGU</button>
      <button onClick={() => onOpen("confidentialite")} className="underline">Confidentialité</button>
      <button onClick={() => onOpen("responsabilite")} className="underline">Non-responsabilité</button>
      <button onClick={() => onOpen("methode")} className="underline">Notre méthode éditoriale</button>
    </div>
  );
}


function AuthView({ onChangeMode }) {
  const [legalDoc, setLegalDoc] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profession, setProfession] = useState(PROFESSIONS[0]);
  const [codeInvitation, setCodeInvitation] = useState("");
  const [codeCheck, setCodeCheck] = useState(null); // null | {valid, structure_nom, places_restantes}
  const [checkingCode, setCheckingCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const verifyCode = async () => {
    const code = codeInvitation.trim();
    if (!code) { setCodeCheck(null); return; }
    setCheckingCode(true);
    const { data, error } = await supabase.rpc("check_invitation_code", { p_code: code });
    setCheckingCode(false);
    if (error || !data || !data[0]) { setCodeCheck({ valid: false }); return; }
    setCodeCheck(data[0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (mode === "signup" && password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { profession, code_invitation: codeInvitation.trim() || null } },
      });
      if (error) setError(error.message);
      else setInfo("Compte créé. Vérifiez votre boîte mail pour confirmer votre inscription si demandé, puis connectez-vous.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setBusy(false);
  };

  if (legalDoc) {
    return (
      <div className="min-h-screen bg-[#F4F6F2]">
        <LegalView doc={legalDoc} onBack={() => setLegalDoc(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F2] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Vitrine commerciale */}
        <div className="text-center mb-6">
          <img src="/logo-phoenix.png" alt="Apézeo" className="w-11 h-11 mx-auto mb-3 rounded-2xl object-cover shadow-sm" />
          <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Apézeo</h1>
          <p className="text-sm text-stone-500 mt-0.5">Version Pro</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-[28px] p-6 mb-6">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.05] pointer-events-none" />
          <svg className="absolute inset-x-0 bottom-0 w-full h-14 pointer-events-none" viewBox="0 0 400 60" preserveAspectRatio="none">
            <path d="M0,35 C90,55 160,15 240,32 C310,47 350,25 400,38 L400,60 L0,60 Z" fill="rgba(255,255,255,0.05)" />
          </svg>
          <p className="relative text-3xl font-bold mb-1 tracking-tight">800+ fiches</p>
          <p className="relative text-sm text-emerald-100 mb-4">d'aides non médicamenteuses pour les professionnels accompagnant des personnes atteintes d'Alzheimer et maladies apparentées.</p>
          <ul className="relative space-y-2 text-sm text-emerald-50">
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Recherche instantanée par symptôme</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Outils référencés (HAS, littérature gériatrique)</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Bibliothèque enrichie en continu</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Suivi d'usage par technique testée</li>
          </ul>
          <div className="relative mt-5 pt-4 border-t border-white/15 text-xs text-emerald-100">
            Accès structure (EHPAD, SSIAD, accueil de jour…) — <strong className="text-white">tarif sur devis</strong>, adapté à votre organisation. <a href="mailto:contact@apezeo.fr" className="underline text-amber-300">Demander un devis</a>
          </div>
        </div>
        <p className="text-sm text-stone-500 text-center mb-2">Réservé aux professionnels accompagnant des personnes atteintes d'Alzheimer et maladies apparentées.</p>
        <div className="text-center mb-6">
          <button onClick={onChangeMode} className="text-xs text-emerald-700 underline">Vous êtes un aidant familial ?</button>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_24px_-6px_rgba(6,78,59,0.12)] p-6">
          <div className="flex gap-1.5 mb-6 bg-stone-100 rounded-2xl p-1">
            <button onClick={() => { setMode("login"); setError(""); setInfo(""); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === "login" ? "bg-white text-emerald-800 shadow-sm" : "text-stone-500"}`}>
              Connexion
            </button>
            <button onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === "signup" ? "bg-white text-emerald-800 shadow-sm" : "text-stone-500"}`}>
              Créer un compte
            </button>
          </div>

          <form onSubmit={submit}>
            <Field label="E-mail professionnel">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls + " pl-9"} />
              </div>
            </Field>
            <Field label="Mot de passe">
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input required type={showPassword ? "text" : "password"} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls + " pl-9 pr-9"} />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            {mode === "signup" && (
              <Field label="Confirmer le mot de passe">
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input required type={showPassword ? "text" : "password"} minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls + " pl-9 pr-9"} />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-rose-600 mt-1">Les mots de passe ne correspondent pas.</p>
                )}
              </Field>
            )}
            {mode === "signup" && (
              <>
                <Field label="Votre profession">
                  <select className={inputCls} value={profession} onChange={(e) => setProfession(e.target.value)}>
                    {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Code d'invitation de votre établissement (optionnel)">
                  <input
                    className={inputCls}
                    placeholder="Laissez vide pour un accès découverte"
                    value={codeInvitation}
                    onChange={(e) => { setCodeInvitation(e.target.value); setCodeCheck(null); }}
                    onBlur={verifyCode}
                  />
                  {checkingCode && <p className="text-xs text-stone-400 mt-1">Vérification…</p>}
                  {codeCheck && codeCheck.valid && (
                    <p className="text-xs text-emerald-700 mt-1">✓ {codeCheck.structure_nom} — {codeCheck.places_restantes} place(s) disponible(s)</p>
                  )}
                  {codeCheck && !codeCheck.valid && (
                    <p className="text-xs text-rose-600 mt-1">Code invalide.</p>
                  )}
                  <p className="text-xs text-stone-400 mt-1">Sans code, votre compte donne accès à un échantillon de la bibliothèque.</p>
                </Field>
                <label className="flex items-start gap-2 mb-4 text-xs text-stone-600">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" required />
                  <span>
                    J'accepte les <button type="button" onClick={() => setLegalDoc("cgu")} className="underline text-emerald-700">CGU</button>,
                    la <button type="button" onClick={() => setLegalDoc("confidentialite")} className="underline text-emerald-700">politique de confidentialité</button> et
                    la <button type="button" onClick={() => setLegalDoc("responsabilite")} className="underline text-emerald-700">clause de non-responsabilité</button> d'Apézeo.
                  </span>
                </label>
              </>
            )}

            {error && <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-sm text-rose-700 mb-3">{error}</div>}
            {info && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-sm text-emerald-800 mb-3">{info}</div>}

            <button type="submit" disabled={busy || (mode === "signup" && (!accepted || password !== confirmPassword))} className="w-full bg-emerald-700 hover:bg-emerald-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2 text-white font-semibold rounded-2xl transition-all duration-200 py-3 flex items-center justify-center gap-2">
              <UserCircle size={17} /> {mode === "signup" ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
        </div>
        <LegalFooterLinks onOpen={setLegalDoc} />
      </div>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
function AuthenticatedApp({ session, onChangeMode }) {
  const userId = session.user.id;
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [dbFiches, setDbFiches] = useState([]);
  const [localFiches, setLocalFiches] = useState([]);
  const [favoris, setFavoris] = useState({ liked: [], disliked: [] });
  const [historique, setHistorique] = useState([]);
  const [toast, setToast] = useState(null);
  const [stack, setStack] = useState([{ view: "home" }]);
  const [profile, setProfile] = useState(null);

  const current = stack[stack.length - 1];
  const push = (frame) => setStack((s) => [...s, frame]);
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  // Supabase plafonne toute requête non paginée à 1000 lignes par défaut.
  // Cette fonction récupère la table entière par blocs successifs, quelle
  // que soit sa taille — indispensable maintenant que "interventions"
  // dépasse ce seuil.
  const fetchAllRows = useCallback(async (table, orderCol = "id") => {
    const pageSize = 1000;
    let from = 0;
    let all = [];
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderCol, { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) return { data: null, error };
      all = all.concat(data || []);
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }
    return { data: all, error: null };
  }, []);

  const loadFromSupabase = useCallback(async () => {
    if (!supabaseReady) { setLoading(false); return; }
    setLoading(true);

    const [interv, personal, favRows, histRows, profileRow] = await Promise.all([
      fetchAllRows("interventions", "id"),
      supabase.from("fiches_personnelles").select("*").eq("user_id", userId).order("id", { ascending: true }),
      supabase.from("favoris").select("*").eq("user_id", userId),
      supabase.from("historique").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", userId).single(),
    ]);

    if (interv.error) { setDbError(interv.error.message); setLoading(false); return; }
    setDbFiches((interv.data || []).map(rowToFiche));
    setDbError(null);

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

    if (!profileRow.error) setProfile(profileRow.data);

    setLoading(false);
  }, [userId, fetchAllRows]);

  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);

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

  const scoreFiche = (f, q) => {
    if (f.typeFiche === "concept") return null; // pas actionnable directement dans un quiz
    if (q.troubleIds && q.troubleIds.length > 0 && !q.troubleIds.every((t) => f.troubles.includes(t))) return null;
    if (q.besoin && f.categorie !== q.besoin) return null;
    if (q.tempsDispo != null && f.dureeMinutes > 0 && f.dureeMinutes > q.tempsDispo) return null;
    let score = 0;
    score += (q.troubleIds?.length || 0) * 20;
    if (q.besoin) score += 25;
    if (q.stade && f.stades.includes(q.stade)) score += 15;
    if (q.contexte && (f.contextes || []).includes(q.contexte)) score += 10;
    if (q.materielDispo === false && (f.materiel || []).length === 0) score += 10;
    if (q.materielDispo === true) score += 3;
    score += (f.niveauPreuve || 0) * 2;
    if (favoris.liked.includes(f.id)) score += 15;
    if (favoris.disliked.includes(f.id)) score -= 60;
    return score;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2]">
        <div className="flex flex-col items-center gap-3 text-emerald-800">
          <img src="/logo-phoenix.png" alt="Apézeo" className="w-14 h-14 rounded-2xl object-cover animate-pulse shadow-md" />
          <span className="text-sm">Chargement d'Apézeo…</span>
        </div>
      </div>
    );
  }

  if (profile && profile.actif === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2] p-6">
        <div className="max-w-sm text-center">
          <UserX className="mx-auto mb-3 text-rose-600" size={32} />
          <h1 className="text-lg font-semibold text-emerald-950 mb-2">Compte désactivé</h1>
          <p className="text-sm text-stone-600 mb-4">Votre accès a été désactivé par l'administrateur de votre structure. Contactez-le pour plus d'informations.</p>
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
          fiches={fiches} dbCount={visibleDbFiches.length} profession={session?.user?.user_metadata?.profession}
          isAdmin={profile?.role === "admin"}
          isSuperAdmin={profile?.super_admin === true}
          canToggleExpert={profile?.plan === "structure"}
          modeExpert={modeExpert}
          onToggleAffichage={toggleAffichage}
          onOpenCreateStructure={() => push({ view: "create-structure" })}
          onOpenMesFiches={() => push({ view: "mes-fiches" })}
          onOpenLegal={(doc) => push({ view: "legal", doc })}
          onOpenCompte={() => push({ view: "compte" })}
          onOpenTeam={() => push({ view: "team" })}
          onOpenTroubles={() => push({ view: "troubles" })}
          onOpenBesoins={() => push({ view: "besoins" })}
          onOpenOutils={() => push({ view: "outils" })}
          onOpenSearch={() => push({ view: "search" })}
          onOpenFavoris={() => push({ view: "favoris" })}
          onOpenQuiz={() => push({ view: "quiz" })}
          onOpenAdd={() => push({ view: "form", fiche: emptyLocalFiche() })}
          onRefresh={loadFromSupabase}
          onLogout={() => supabase.auth.signOut()}
          onChangeMode={onChangeMode}
        />
      )}

      {current.view === "troubles" && (
        <TroublesView fiches={fiches} onBack={pop} onOpenTrouble={(t) => push({ view: "trouble-detail", trouble: t })} />
      )}
      {current.view === "trouble-detail" && (
        <FicheListView title={current.trouble} onBack={pop} favoris={favoris}
          items={fiches.filter((f) => f.troubles.includes(current.trouble)).sort((a, b) => b.niveauPreuve - a.niveauPreuve)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucune fiche pour ce trouble pour l'instant." />
      )}
      {current.view === "besoins" && (
        <FamillesView fiches={fiches} onBack={pop} onOpenFamille={(c) => push({ view: "famille-detail", famille: c })} />
      )}
      {current.view === "famille-detail" && (
        <FicheListView title={current.famille} onBack={pop} favoris={favoris}
          items={fiches.filter((f) => f.categorie === current.famille)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucune fiche dans cette famille pour l'instant." />
      )}
      {current.view === "outils" && (
        <OutilsView fiches={outilsFiches} onBack={pop} onOpenType={(t) => push({ view: "outil-type", outilType: t })} />
      )}
      {current.view === "outil-type" && (
        <FicheListView title={current.outilType} onBack={pop} favoris={favoris}
          items={outilsFiches.filter((f) => f.outilType === current.outilType)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucun outil dans cette catégorie pour l'instant." />
      )}
      {current.view === "search" && (
        <SearchView fiches={fichesRecherchables} onBack={pop} favoris={favoris} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "favoris" && (
        <FavorisView fiches={fichesRecherchables} favoris={favoris} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "historique" && (
        <HistoriqueView historique={historique} ficheById={ficheById} onBack={pop} />
      )}
      {current.view === "quiz" && (
        <QuizView onBack={pop} onSubmit={(q) => {
          const scored = [...fiches, ...outilsFiches].map((f) => ({ f, s: scoreFiche(f, q) })).filter((x) => x.s !== null).sort((a, b) => b.s - a.s).slice(0, 8);
          const max = 134;
          const results = scored.map((x) => ({ ...x, pct: Math.max(5, Math.min(99, Math.round((x.s / max) * 100))) }));
          const label = [q.troubleIds.join(", "), q.besoin].filter(Boolean).join(" · ");
          push({ view: "recommandations", results, trouble: label });
        }} />
      )}
      {current.view === "recommandations" && (
        <RecommandationsView title={current.trouble} results={current.results} favoris={favoris} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "fiche" && (
        <FicheDetailView
          fiche={ficheById(current.fiche.id) || current.fiche} favoris={favoris} onBack={pop}
          allFiches={fiches}
          onOpenFiche={(nf) => push({ view: "fiche", fiche: nf })}
          onToggleLike={() => toggleFav(current.fiche.id, "liked")}
          onToggleDislike={() => toggleFav(current.fiche.id, "disliked")}
          onLog={() => push({ view: "log", fiche: current.fiche })}
          onEdit={current.fiche.isLocal ? () => push({ view: "form", fiche: ficheById(current.fiche.id) || current.fiche }) : null}
          onDelete={current.fiche.isLocal ? async () => { await deleteLocalFiche(current.fiche.id); pop(); } : null}
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
        <MonCompteView email={session?.user?.email} profile={profile} onProfileUpdated={(patch) => setProfile((p) => ({ ...p, ...patch }))} onBack={pop} />
      )}
      {current.view === "create-structure" && (
        <CreateStructureView onBack={pop} />
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
function Home_({ fiches, dbCount, profession, isAdmin, isSuperAdmin, canToggleExpert, modeExpert, onToggleAffichage, onOpenTroubles, onOpenBesoins, onOpenOutils, onOpenSearch, onOpenFavoris, onOpenQuiz, onOpenAdd, onOpenTeam, onOpenCreateStructure, onOpenMesFiches, onOpenLegal, onOpenCompte, onRefresh, onLogout, onChangeMode }) {
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
            <img src="/logo-phoenix.png" alt="Apézeo" className="w-5 h-5 rounded-full object-cover" />
            <span className="uppercase tracking-widest text-xs font-semibold text-emerald-200">Apézeo</span>
            <span className="text-[11px] bg-white/15 rounded-full px-2 py-0.5">Version Pro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onChangeMode} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Changer de mode"><ArrowLeftRight size={15} /></button>
            <button onClick={onRefresh} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Actualiser"><RefreshCw size={15} /></button>
            <button onClick={onLogout} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Se déconnecter"><LogOut size={15} /></button>
          </div>
        </div>

        {canToggleExpert && (
          <div className="relative flex mb-4 bg-white/10 rounded-full p-0.5 w-fit">
            <button onClick={() => modeExpert && onToggleAffichage()} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${!modeExpert ? "bg-white text-emerald-800" : "text-emerald-100"}`}>Bibliothèque Standard</button>
            <button onClick={() => !modeExpert && onToggleAffichage()} className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${modeExpert ? "bg-emerald-950 text-amber-300" : "text-emerald-100"}`}>Bibliothèque Expert</button>
          </div>
        )}

        <h1 className="relative text-2xl lg:text-3xl font-bold mb-1.5 tracking-tight">Un geste apaisant, tout de suite.</h1>
        {profession && <p className="relative text-emerald-200 text-xs mb-2.5">Connecté en tant que {profession}</p>}
        <div className="relative flex items-center gap-3 text-emerald-100 text-sm mb-7">
          <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-emerald-300" /> {fiches.length} techniques</span>
          <span className="text-emerald-400/50">|</span>
          <span className="flex items-center gap-1.5"><Users size={15} className="text-emerald-300" /> Bibliothèque complète : {dbCount}</span>
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
        <NavCard icon={Box} label="Outils spécifiques" sub="Poupées, luminothérapie, objets sensoriels…" onClick={onOpenOutils} accent="violet" />
        <NavCard icon={Search} label="Recherche libre" onClick={onOpenSearch} accent="emerald" />
        <NavCard icon={Heart} label="Favoris" sub="Ce qui fonctionne pour votre pratique" onClick={onOpenFavoris} accent="emerald" />
        <NavCard icon={FileText} label="Mes fiches" sub="Toutes vos créations personnelles" onClick={onOpenMesFiches} accent="emerald" />
        {isAdmin && <NavCard icon={Users} label="Gérer mon équipe" sub="Comptes et accès à la structure" onClick={onOpenTeam} accent="admin" badge="Admin" />}
        {isSuperAdmin && <NavCard icon={Stethoscope} label="Créer une structure" sub="Nouveau client B2B" onClick={onOpenCreateStructure} accent="admin" badge="Admin" />}
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

function TroublesView({ fiches, onBack, onOpenTrouble }) {
  return (
    <div className="pb-10">
      <TopBar title="Choisir un trouble" onBack={onBack} />
      <div className="p-5 lg:px-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {TROUBLES.map((t) => {
          const n = fiches.filter((f) => f.troubles.includes(t)).length;
          return (
            <button key={t} onClick={() => onOpenTrouble(t)} className="relative bg-white rounded-2xl pl-4 pr-3 py-3.5 text-left border-l-[3px] border-emerald-600 shadow-[0_2px_10px_-4px_rgba(6,78,59,0.08)] hover:shadow-[0_6px_18px_-6px_rgba(6,78,59,0.15)] hover:-translate-y-0.5 hover:border-emerald-700 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200">
              <span className="absolute top-3 right-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">{n}</span>
              <div className="font-semibold text-emerald-950 text-sm leading-snug tracking-tight pr-6">{t}</div>
              <div className="text-xs text-stone-400 mt-1">fiche{n !== 1 ? "s" : ""} associée{n !== 1 ? "s" : ""}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function OutilsView({ fiches, onBack, onOpenType }) {
  return (
    <div className="pb-10">
      <TopBar title="Outils spécifiques" onBack={onBack} />
      <div className="p-5 lg:px-9">
        <p className="text-sm text-stone-500 mb-5">Des objets et dispositifs matériels utilisés en soutien des approches non médicamenteuses — indications, contre-indications et précautions pour chacun.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {OUTILS_TYPES.map((t) => {
            const n = fiches.filter((f) => f.outilType === t).length;
            return (
              <button key={t} onClick={() => onOpenType(t)} className="bg-violet-50/60 hover:bg-white rounded-2xl p-4 text-left border border-violet-800/10 hover:border-violet-700/20 shadow-none hover:shadow-[0_6px_18px_-6px_rgba(88,28,135,0.12)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 transition-all duration-200">
                <div className="font-semibold text-violet-950 text-sm leading-snug tracking-tight">{t}</div>
                <div className="text-xs text-violet-700/70 mt-1.5 font-medium">{n} outil{n !== 1 ? "s" : ""}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function FamillesView({ fiches, onBack, onOpenFamille }) {
  return (
    <div className="pb-10">
      <TopBar title="Rechercher par besoin" onBack={onBack} />
      <div className="p-5 lg:px-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {FAMILLES.map((c) => {
          const n = fiches.filter((f) => f.categorie === c).length;
          return (
            <button key={c} onClick={() => onOpenFamille(c)} className="bg-emerald-50/60 hover:bg-white rounded-2xl p-4 text-left border border-emerald-800/10 hover:border-emerald-700/20 shadow-none hover:shadow-[0_6px_18px_-6px_rgba(6,78,59,0.12)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200">
              <div className="font-semibold text-emerald-950 text-sm leading-snug tracking-tight">{c}</div>
              <div className="text-xs text-emerald-700/70 mt-1.5 font-medium">{n} fiche{n !== 1 ? "s" : ""}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function FicheListView({ title, items, onBack, onOpenFiche, favoris, emptyLabel }) {
  const favState = (id) => (favoris.liked.includes(id) ? "liked" : favoris.disliked.includes(id) ? "disliked" : null);
  return (
    <div className="pb-10">
      <TopBar title={title} onBack={onBack} />
      <div className="p-4 flex flex-col gap-2.5">
        {items.length === 0 && <div className="text-center text-stone-400 text-sm py-10">{emptyLabel}</div>}
        {items.map((f) => <FicheCard key={f.id} f={f} favState={favState(f.id)} onClick={() => onOpenFiche(f)} />)}
      </div>
    </div>
  );
}
function SearchView({ fiches, onBack, onOpenFiche, favoris }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const match = (v) => typeof v === "string" && v.toLowerCase().includes(s);
    const matchArr = (arr) => Array.isArray(arr) && arr.some((k) => match(k));
    return fiches.filter((f) =>
      match(f.titre) || match(f.description) || match(f.categorie) ||
      matchArr(f.troubles) || matchArr(f.motsCles) ||
      matchArr(f.objectifsObservables) || matchArr(f.pointsCles) ||
      match(f.fondementPrincipe) || match(f.fondementApplication) ||
      match(f.indication) || matchArr(f.contreIndicationOutil) || matchArr(f.precautionsParticulieres)
    );
  }, [q, fiches]);
  const favState = (id) => (favoris.liked.includes(id) ? "liked" : favoris.disliked.includes(id) ? "disliked" : null);
  return (
    <div className="pb-10">
      <TopBar title="Recherche libre" onBack={onBack} />
      <div className="p-4">
        <div className="relative mb-3">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un trouble, un mot-clé, une technique…"
            className="w-full rounded-xl border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
        </div>
        <div className="flex flex-col gap-2.5">
          {q.trim() && results.length === 0 && <div className="text-center text-stone-400 text-sm py-10">Aucun résultat.</div>}
          {results.map((f) => <FicheCard key={f.id} f={f} favState={favState(f.id)} onClick={() => onOpenFiche(f)} />)}
        </div>
      </div>
    </div>
  );
}
function FavorisView({ fiches, favoris, onBack, onOpenFiche }) {
  const liked = fiches.filter((f) => favoris.liked.includes(f.id));
  return (
    <div className="pb-10">
      <TopBar title="Favoris" onBack={onBack} />
      <div className="p-4">
        <div className="flex flex-col gap-2.5">
          {liked.length === 0 && <div className="text-stone-400 text-sm">Aucune technique ajoutée à vos favoris pour l'instant.</div>}
          {liked.map((f) => <FicheCard key={f.id} f={f} favState="liked" onClick={() => onOpenFiche(f)} />)}
        </div>
      </div>
    </div>
  );
}
function MesFichesView({ fiches, favoris, onBack, onOpenFiche }) {
  const mine = fiches.filter((f) => f.isLocal);
  return (
    <div className="pb-10">
      <TopBar title="Mes fiches" onBack={onBack} />
      <div className="p-4">
        <p className="text-sm text-stone-500 mb-4">Toutes les fiches que vous avez créées vous-même, au même endroit.</p>
        <div className="flex flex-col gap-2.5">
          {mine.length === 0 && <div className="text-stone-400 text-sm py-8 text-center">Vous n'avez encore créé aucune fiche personnelle.</div>}
          {mine.map((f) => (
            <FicheCard key={f.id} f={f} favState={favoris.liked.includes(f.id) ? "liked" : undefined} onClick={() => onOpenFiche(f)} />
          ))}
        </div>
      </div>
    </div>
  );
}
function HistoriqueView({ historique, ficheById, onBack }) {
  return (
    <div className="pb-10">
      <TopBar title="Historique" onBack={onBack} />
      <div className="p-4 flex flex-col gap-2.5">
        {historique.length === 0 && <div className="text-center text-stone-400 text-sm py-10">Aucune utilisation enregistrée pour l'instant.</div>}
        {historique.map((h) => {
          const f = ficheById(h.ficheId);
          const delta = h.avant - h.apres;
          return (
            <div key={h.id} className="bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-emerald-950 text-sm">{f ? f.titre : "Fiche indisponible"}</div>
                <span className="text-xs text-stone-400">{new Date(h.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="text-stone-500">Avant <b className="text-stone-800">{h.avant}/10</b></span>
                <ChevronRight size={14} className="text-stone-300" />
                <span className="text-stone-500">Après <b className="text-stone-800">{h.apres}/10</b></span>
                <Badge tone={delta > 0 ? "emerald" : delta < 0 ? "rose" : "stone"}>{delta > 0 ? `-${delta} d'intensité` : delta < 0 ? `+${-delta}` : "stable"}</Badge>
              </div>
              {h.commentaire && <div className="text-sm text-stone-600 mt-1.5 italic">« {h.commentaire} »</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
/* ---------- CRÉER UNE STRUCTURE (super-admin uniquement) ---------- */
function generateCode(nom) {
  const base = (nom || "STRUCTURE")
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10) || "STRUCTURE";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

function CreateStructureView({ onBack }) {
  const [nom, setNom] = useState("");
  const [quota, setQuota] = useState(30);
  const [code, setCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
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
    setBusy(true);
    setError("");
    const finalCode = code.trim() || generateCode(nom);
    const { data: newStructure, error: structError } = await supabase
      .from("structures")
      .insert({ nom: nom.trim(), code_invitation: finalCode, quota: Number(quota) })
      .select()
      .single();

    if (structError) { setError(structError.message); setBusy(false); return; }

    if (adminEmail.trim()) {
      const { error: adminError } = await supabase
        .from("profiles")
        .update({ structure_id: newStructure.id, role: "admin", plan: "structure" })
        .eq("email", adminEmail.trim());
      if (adminError) { setError("Structure créée, mais échec de la promotion admin : " + adminError.message); }
    }

    setCreated(newStructure);
    setNom(""); setQuota(30); setCode(""); setAdminEmail("");
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
            <input type="email" className={inputCls} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="directeur@etablissement.fr" />
            <p className="text-xs text-stone-400 mt-1">Doit déjà avoir un compte créé dans l'app (avec ou sans code) pour être promu.</p>
          </Field>

          {error && <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-sm text-rose-700 mb-3">{error}</div>}
          {created && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-sm text-emerald-800 mb-3">
              Structure "{created.nom}" créée — code : <span className="font-mono font-semibold">{created.code_invitation}</span>
            </div>
          )}

          <button type="submit" disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2 text-white font-semibold rounded-2xl transition-all duration-200 py-3 flex items-center justify-center gap-2">
            <Plus size={17} /> Créer la structure
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
                  <div className="font-medium text-emerald-950 text-sm flex-1">{s.nom}</div>
                  {s.suspended && <Badge tone="rose">Suspendue</Badge>}
                </div>
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
function MonCompteView({ email, profile, onProfileUpdated, onBack }) {
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
    const [{ data: favoris }, { data: historique }, { data: fiches }] = await Promise.all([
      supabase.from("favoris").select("*"),
      supabase.from("historique").select("*"),
      supabase.from("fiches_personnelles").select("*"),
    ]);
    const payload = {
      export_genere_le: new Date().toISOString(),
      profil: { email, profession: profile?.profession, plan: profile?.plan, structure: structureNom },
      favoris: favoris || [],
      historique: historique || [],
      fiches_personnelles: fiches || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "apezeo-mes-donnees.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

function AdminTeamView({ structureId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState(null);
  const [members, setMembers] = useState([]);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [attachEmail, setAttachEmail] = useState("");
  const [attaching, setAttaching] = useState(false);
  const [attachMsg, setAttachMsg] = useState(null); // {ok: bool, text: string}
  const [topFiches, setTopFiches] = useState([]);

  const load = useCallback(async () => {
    if (!structureId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: structData }, { data: memberData }, { data: topData }] = await Promise.all([
      supabase.from("structures").select("*").eq("id", structureId).single(),
      supabase.from("profiles").select("*").eq("structure_id", structureId).order("created_at", { ascending: true }),
      supabase.rpc("top_fiches_structure"),
    ]);
    setStructure(structData || null);
    setMembers(memberData || []);
    setTopFiches(topData || []);
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

  return (
    <div className="pb-10">
      <TopBar title="Gérer mon équipe" onBack={onBack} />
      <div className="p-4">
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
            <div key={m.id} className="bg-white rounded-xl p-3 border border-emerald-900/5 shadow-sm flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-emerald-950 text-sm truncate">{m.email}</div>
                <div className="text-xs text-stone-500">{m.profession || "—"} {m.role === "admin" && "· Admin"}</div>
              </div>
              {m.role !== "admin" && (
                <button
                  onClick={() => toggleActif(m.id, m.actif)}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${m.actif ? "border-stone-300 text-stone-600" : "border-rose-300 text-rose-600 bg-rose-50"}`}
                >
                  {m.actif ? <><UserCheck size={13} /> Actif</> : <><UserX size={13} /> Désactivé</>}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  );
}

function QuizView({ onBack, onSubmit }) {
  const [q, setQ] = useState({ troubleIds: [], besoin: "", stade: "", contexte: "", tempsDispo: 10, materielDispo: false });
  const toggleTrouble = (t) => setQ((s) => ({ ...s, troubleIds: s.troubleIds.includes(t) ? s.troubleIds.filter((x) => x !== t) : [...s.troubleIds, t] }));
  const sliderPct = Math.round(((q.tempsDispo - 1) / 39) * 100);
  return (
    <div className="pb-10">
      <TopBar title="Trouver la meilleure technique" onBack={onBack} />

      <div className="mx-4 mt-4 lg:mx-8 lg:mt-6 relative overflow-hidden px-6 py-6 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-3xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><Search size={20} /></div>
          <div>
            <div className="font-bold text-lg tracking-tight">Quelques précisions</div>
            <div className="text-emerald-200 text-sm">Plus vous êtes précis, plus la recommandation le sera aussi.</div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:px-8 flex flex-col gap-3.5">

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">1</div>
            <span className="font-semibold text-emerald-950">Trouble(s) observé(s)</span>
          </div>
          <p className="text-xs text-stone-400 mb-3 ml-9">Sélectionnez-en plusieurs si besoin — seules les fiches couvrant tous les troubles cochés seront proposées.</p>
          <div className="ml-9"><CheckGroup options={TROUBLES} selected={q.troubleIds} onToggle={toggleTrouble} /></div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">2</div>
            <span className="font-semibold text-emerald-950">Type de besoin</span>
            <span className="text-xs text-stone-400">(optionnel)</span>
          </div>
          <select className={inputCls + " ml-9 w-[calc(100%-2.25rem)]"} value={q.besoin} onChange={(e) => setQ({ ...q, besoin: e.target.value })}>
            <option value="">Tous types</option>
            {FAMILLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">3</div>
            <span className="font-semibold text-emerald-950">Stade et contexte</span>
            <span className="text-xs text-stone-400">(optionnel)</span>
          </div>
          <div className="ml-9 flex flex-col gap-3">
            <CheckGroup options={STADES} selected={q.stade ? [q.stade] : []} onToggle={(v) => setQ({ ...q, stade: q.stade === v ? "" : v })} />
            <CheckGroup options={CONTEXTES} selected={q.contexte ? [q.contexte] : []} onToggle={(v) => setQ({ ...q, contexte: q.contexte === v ? "" : v })} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">4</div>
            <span className="font-semibold text-emerald-950">Temps disponible</span>
            <span className="ml-auto text-sm font-bold text-emerald-700">{q.tempsDispo} min</span>
          </div>
          <p className="text-xs text-stone-400 mb-3 ml-9">Les fiches plus longues que ce temps ne seront pas proposées.</p>
          <div className="ml-9">
            <input
              type="range" min={1} max={40} value={q.tempsDispo}
              onChange={(e) => setQ({ ...q, tempsDispo: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-700"
              style={{ background: `linear-gradient(to right, #047857 ${sliderPct}%, #e7e5e4 ${sliderPct}%)` }}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 bg-white rounded-3xl shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] px-5 py-4 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">5</div>
          <span className="text-sm font-medium text-stone-700 flex-1">J'ai du matériel disponible</span>
          <input type="checkbox" checked={q.materielDispo} onChange={(e) => setQ({ ...q, materielDispo: e.target.checked })} className="w-5 h-5 accent-emerald-700" />
        </label>

        <button onClick={() => onSubmit(q)} disabled={q.troubleIds.length === 0} className="relative overflow-hidden w-full mt-2 bg-emerald-700 hover:bg-emerald-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2 text-white font-semibold rounded-2xl transition-all duration-200 py-4 flex items-center justify-center gap-2">
          {q.troubleIds.length > 0 && <span className="cta-shine" />}
          Voir les techniques recommandées
        </button>
      </div>
    </div>
  );
}
function RecommandationsView({ title, results, favoris, onBack, onOpenFiche }) {
  const favState = (id) => (favoris.liked.includes(id) ? "liked" : favoris.disliked.includes(id) ? "disliked" : null);
  return (
    <div className="pb-10">
      <TopBar title={`Pour : ${title}`} onBack={onBack} />
      <div className="p-4 flex flex-col gap-2.5">
        {results.length === 0 && <div className="text-center text-stone-400 text-sm py-10">Aucune fiche ne correspond, essayez d'élargir vos critères.</div>}
        {results.map(({ f, pct }) => {
          const isOutil = f.typeFiche === "outil";
          return (
            <button key={f.id} onClick={() => onOpenFiche(f)} className={`w-full text-left bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3 active:scale-[0.99] transition ${isOutil ? "border-l-[3px] border-violet-400" : "border border-emerald-900/5"}`}>
              <ScoreRing pct={pct} violet={isOutil} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {isOutil ? <Badge tone="outil">{f.outilType || "Outil spécifique"}</Badge> : <Badge tone="emerald">{f.categorie}</Badge>}
                  {f.alerteOutil && <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5"><AlertTriangle size={11} /> Vigilance</span>}
                  {favState(f.id) === "liked" && <Heart size={13} className="fill-rose-500 text-rose-500" />}
                </div>
                <div className={`font-semibold ${isOutil ? "text-violet-950" : "text-emerald-950"}`}>{f.titre}</div>
                <div className="text-sm text-stone-500 line-clamp-2">{f.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function FicheDetailView({ fiche: f, favoris, onBack, onToggleLike, onToggleDislike, onLog, onEdit, onDelete, simple, onlyLike, allFiches, onOpenFiche }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [f.id]);
  useEffect(() => {
    if (!simple) supabase.rpc("enregistrer_vue", { p_fiche_ref: f.titre }).then(() => {}).catch(() => {});
  }, [f.id, simple]);
  const liked = favoris.liked.includes(f.id);
  const nonSourcee = f.categorie === "Technique personnelle";
  const isExpert = f.niveauDetail === "expert";
  const techniquesAssociees = (allFiches && f.techniquesLiees && f.techniquesLiees.length)
    ? f.techniquesLiees.map((tid) => allFiches.find((x) => x.techniqueId === tid)).filter(Boolean)
    : [];

  if (f.typeFiche === "outil") {
    return (
      <div className="pb-10">
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
          ) : f.croquisSvg ? (
            <div className="bg-violet-50/60 rounded-2xl p-6 mb-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: f.croquisSvg }} />
          ) : null}

          <div className="flex gap-2 flex-wrap mb-6">{f.troubles.map((t) => <Badge key={t} tone="outil">{t}</Badge>)}</div>

          <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Description</div><p className="text-sm text-stone-700 leading-relaxed">{f.description}</p></div>

          {f.indication && <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Indication</div><p className="text-sm text-stone-700 leading-relaxed">{f.indication}</p></div>}

          {f.contreIndicationOutil && f.contreIndicationOutil.length > 0 && (
            <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Contre-indications</div><div className="bg-rose-50 rounded-2xl p-4"><BulletList items={f.contreIndicationOutil} /></div></div>
          )}

          {f.precautionsParticulieres && f.precautionsParticulieres.length > 0 && (
            <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Précautions particulières</div><div className="bg-amber-50 rounded-2xl p-4"><BulletList items={f.precautionsParticulieres} /></div></div>
          )}

          {!simple && <SourcesLine sources={f.sources} dateMaj={f.dateMaj} />}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/70 backdrop-blur-xl backdrop-saturate-150 p-4 flex justify-center shadow-[0_-4px_24px_-8px_rgba(88,28,135,0.12)]">
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
          <p className="text-stone-600 text-[15px] leading-relaxed mb-6">{f.description}</p>

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
                {f.quandEviter && <p><span className="font-semibold">Évitez de : </span>{f.quandEviter}</p>}
                {f.erreurs && f.erreurs.length > 0 && (
                  <ul className={f.quandEviter ? "mt-2 space-y-1" : "space-y-1"}>
                    {f.erreurs.map((e, i) => <li key={i} className="flex gap-2"><span>•</span><span>{e}</span></li>)}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/70 backdrop-blur-xl backdrop-saturate-150 p-4 flex justify-center shadow-[0_-4px_24px_-8px_rgba(6,78,59,0.12)]">
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

        <Section title="Description"><p className="text-sm text-stone-700 leading-relaxed">{f.description}</p></Section>

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
                    const isDuplicate = norm(e.description) === norm(e.titre);
                    return (
                      <div key={e.etape} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{e.etape}</div>
                        <div>
                          <div className="text-sm font-semibold text-emerald-950">{e.titre}</div>
                          {e.description && !isDuplicate && <div className="text-sm text-stone-600">{e.description}</div>}
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
                {f.fondementPrincipe && <p className="text-sm text-stone-700 leading-relaxed mb-2"><span className="font-semibold text-emerald-800">Principe — </span>{f.fondementPrincipe}</p>}
                {f.fondementApplication && <p className="text-sm text-stone-700 leading-relaxed"><span className="font-semibold text-emerald-800">Application — </span>{f.fondementApplication}</p>}
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
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/70 backdrop-blur-xl backdrop-saturate-150 p-4 lg:px-9 flex justify-center shadow-[0_-4px_24px_-8px_rgba(6,78,59,0.12)]">
        <button onClick={onToggleLike} className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-8 text-sm font-semibold transition-all duration-200 active:scale-95 ${liked ? "bg-rose-500 text-white shadow-md" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
          <Heart size={17} className={liked ? "fill-white" : ""} /> {liked ? "Dans vos favoris" : "Ajouter aux favoris"}
        </button>
      </div>
    </div>
  );
}
function LogView({ fiche, onBack, onSave }) {
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
function FicheFormView({ initial, onBack, onSave }) {
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

/* ---------- ÉCRAN DE CHOIX DE PROFIL ---------- */
function Gate({ onChoose }) {
  return (
    <div className="min-h-screen bg-[#F4F6F2] flex items-center justify-center p-5">
      <div className="w-full max-w-sm text-center">
        <img src="/logo-phoenix.png" alt="Apézeo" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover shadow-sm" />
        <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Apézeo</h1>
        <p className="text-sm text-stone-500 mt-2 mb-7">Des idées concrètes pour apaiser une personne atteinte d'Alzheimer ou maladie apparentée.</p>

        <button onClick={() => onChoose("pro")} className="w-full bg-white rounded-2xl p-4 border border-emerald-900/5 shadow-sm flex items-center gap-4 text-left mb-3 active:scale-[0.99] transition">
          <div className="rounded-xl p-3 bg-emerald-700 text-white"><Stethoscope size={22} /></div>
          <div className="flex-1">
            <div className="font-semibold text-emerald-950">Je suis un professionnel</div>
            <div className="text-sm text-stone-500">Bibliothèque complète, compte requis <span className="italic">— Version Pro</span></div>
          </div>
          <ChevronRight size={18} className="text-stone-400" />
        </button>

        <button onClick={() => onChoose("aidant")} className="w-full bg-white rounded-2xl p-4 border border-emerald-900/5 shadow-sm flex items-center gap-4 text-left active:scale-[0.99] transition">
          <div className="rounded-xl p-3 bg-amber-500 text-white"><Users size={22} /></div>
          <div className="flex-1">
            <div className="font-semibold text-emerald-950">Je suis un aidant familial</div>
            <div className="text-sm text-stone-500">Version simple, sans compte</div>
          </div>
          <ChevronRight size={18} className="text-stone-400" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MODE AIDANT — accès public, sans compte, interface simplifiée.
   Lit la même bibliothèque partagée (lecture publique déjà autorisée
   par la policy RLS sur `interventions`). Favoris/historique/fiches
   personnelles restent sur cet appareil (localStorage), puisqu'il n'y
   a pas de compte dans ce mode.
   ============================================================ */
function AidantApp({ onChangeMode }) {
  const [localFiches, setLocalFiches] = useState(() => getLocal("aidant-local-fiches", []));
  const [favoris, setFavoris] = useState(() => getLocal("aidant-favoris", []));
  const [historique, setHistorique] = useState(() => getLocal("aidant-historique", []));
  const [toast, setToast] = useState(null);
  const [showUrgence, setShowUrgence] = useState(false);
  const [stack, setStack] = useState([{ view: "home" }]);

  const current = stack[stack.length - 1];
  const push = (frame) => setStack((s) => [...s, frame]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const goHome = () => setStack([{ view: "home" }]);
  const fiches = useMemo(() => [...AIDANT_FICHES, ...localFiches], [localFiches]);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const persistLocalFiches = (next) => { setLocalFiches(next); setLocal("aidant-local-fiches", next); };
  const persistFavoris = (next) => { setFavoris(next); setLocal("aidant-favoris", next); };
  const persistHistorique = (next) => { setHistorique(next); setLocal("aidant-historique", next); };

  const addLocalFiche = (f) => {
    const exists = localFiches.some((x) => x.id === f.id);
    const next = exists ? localFiches.map((x) => (x.id === f.id ? f : x)) : [...localFiches, { ...f, id: f.id || uid() }];
    persistLocalFiches(next);
    showToast("Votre idée a été enregistrée");
  };
  const deleteLocalFiche = (id) => { persistLocalFiches(localFiches.filter((x) => x.id !== id)); showToast("Fiche supprimée"); };

  // Favoris à un seul état, élégant et simple : on aime, ou pas.
  const toggleFav = (id) => {
    const next = favoris.includes(id) ? favoris.filter((x) => x !== id) : [...favoris, id];
    persistFavoris(next);
  };
  const addHistoriqueEntry = (entry) => {
    persistHistorique([{ ...entry, id: uid(), date: new Date().toISOString() }, ...historique]);
    showToast("Essai enregistré");
  };
  const ficheById = (id) => fiches.find((f) => f.id === id);

  const scoreFiche = (f, q) => {
    if (f.typeFiche === "concept") return null;
    if (q.troubleIds && q.troubleIds.length > 0 && !q.troubleIds.every((t) => f.troubles.includes(t))) return null;
    if (q.besoin && f.categorie !== q.besoin) return null;
    if (q.tempsDispo != null && f.dureeMinutes > 0 && f.dureeMinutes > q.tempsDispo) return null;
    let score = 0;
    score += (q.troubleIds?.length || 0) * 20;
    if (q.besoin) score += 25;
    if (q.materielDispo === false && (f.materiel || []).length === 0) score += 10;
    score += (f.niveauPreuve || 0) * 2;
    if (favoris.includes(f.id)) score += 15;
    return score;
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] md:bg-stone-200 md:flex md:justify-center md:py-8 lg:bg-[#F4F6F2] lg:block lg:py-0">
    <div className="w-full md:max-w-2xl md:bg-[#F4F6F2] md:rounded-3xl md:shadow-2xl md:overflow-hidden md:border md:border-stone-300/60 lg:max-w-none lg:rounded-none lg:shadow-none lg:border-none lg:overflow-visible">
      <HomeContext.Provider value={goHome}>
      <div className="lg:max-w-5xl xl:max-w-6xl lg:mx-auto">
      {current.view === "home" && (
        <div className="pb-10">
          <div className="mx-4 mt-4 lg:mx-8 lg:mt-6 relative overflow-hidden px-6 pt-7 pb-10 lg:px-10 lg:pt-10 lg:pb-14 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-[28px]">
            <svg className="absolute inset-x-0 bottom-0 w-full h-24 lg:h-32 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,55 C80,80 140,30 220,50 C290,68 340,40 400,58 L400,100 L0,100 Z" fill="rgba(255,255,255,0.05)" />
              <path d="M0,68 C90,45 160,85 240,65 C310,48 350,75 400,62 L400,100 L0,100 Z" fill="rgba(255,255,255,0.07)" />
            </svg>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none" />

            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img src="/logo-phoenix.png" alt="Apézeo" className="w-5 h-5 rounded-full object-cover" />
                <span className="uppercase tracking-widest text-xs font-semibold text-emerald-200">Apézeo</span>
              </div>
              <button onClick={onChangeMode} className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:scale-95 transition" aria-label="Changer de mode"><ArrowLeftRight size={15} /></button>
            </div>

            <h1 className="relative text-2xl lg:text-3xl font-bold mb-1.5 tracking-tight">Un geste apaisant, tout de suite.</h1>
            <p className="relative text-emerald-200 text-sm mb-7">Des idées simples à essayer, pas à pas.</p>
            <div className="relative">
              <button onClick={() => push({ view: "quiz" })} className="relative w-full overflow-hidden bg-amber-400 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-xl text-emerald-950 font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg ring-1 ring-white/40 active:scale-[0.98] transition-all duration-200">
                <span className="cta-shine" />
                Que faire maintenant ?
              </button>
            </div>
          </div>
          <div className="px-5 lg:px-8 mt-6 flex flex-col gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
            <NavCard icon={AlertTriangle} label="Choisir une situation" sub="Agitation, cris, refus de soins…" onClick={() => push({ view: "troubles" })} accent="emerald" />
            <NavCard icon={Search} label="Recherche libre" onClick={() => push({ view: "search" })} accent="stone" />
            <NavCard icon={Heart} label="Mes favoris" sub={`${favoris.length} idée${favoris.length !== 1 ? "s" : ""} qui fonctionne${favoris.length !== 1 ? "nt" : ""} pour vous`} onClick={() => push({ view: "favoris" })} accent="emerald" />
            <NavCard icon={FileText} label="Mes fiches" sub="Vos idées créées vous-même" onClick={() => push({ view: "mes-fiches" })} accent="stone" />
          </div>
          <div className="px-5 lg:px-8 mt-5">
            <button onClick={() => push({ view: "form", fiche: emptyLocalFiche() })} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-emerald-700/40 hover:bg-emerald-50/50 text-stone-500 hover:text-emerald-800 rounded-2xl py-4 font-medium transition-colors">
              <Plus size={18} /> Ajouter une idée qui a marché pour vous
            </button>
          </div>
          <div className="px-5 lg:px-8 mt-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-sm text-amber-900">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>En cas de danger immédiat, ou si les troubles deviennent fréquents et intenses, consultez un médecin ou un gériatre.</span>
            </div>
          </div>
          <LegalFooterLinks onOpen={(doc) => push({ view: "legal", doc })} />
        </div>
      )}

      {current.view === "legal" && (
        <LegalView doc={current.doc} onBack={pop} />
      )}

      {current.view === "troubles" && (
        <TroublesView fiches={fiches} onBack={pop} onOpenTrouble={(t) => push({ view: "trouble-detail", trouble: t })} />
      )}
      {current.view === "trouble-detail" && (
        <FicheListView title={current.trouble} onBack={pop} favoris={{ liked: favoris, disliked: [] }}
          items={fiches.filter((f) => f.troubles.includes(current.trouble)).sort((a, b) => b.niveauPreuve - a.niveauPreuve)}
          onOpenFiche={(f) => push({ view: "fiche", fiche: f })} emptyLabel="Aucune idée pour cette situation pour l'instant." />
      )}
      {current.view === "search" && (
        <SearchView fiches={fiches} onBack={pop} favoris={{ liked: favoris, disliked: [] }} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "favoris" && (
        <AidantFavorisView fiches={fiches} favoris={favoris} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "mes-fiches" && (
        <MesFichesView fiches={fiches} favoris={{ liked: favoris, disliked: [] }} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "quiz" && (
        <QuizView onBack={pop} onSubmit={(q) => {
          const scored = fiches.map((f) => ({ f, s: scoreFiche(f, q) })).filter((x) => x.s !== null).sort((a, b) => b.s - a.s).slice(0, 8);
          const max = 100;
          const results = scored.map((x) => ({ ...x, pct: Math.max(5, Math.min(99, Math.round((x.s / max) * 100))) }));
          const label = [q.troubleIds.join(", "), q.besoin].filter(Boolean).join(" · ");
          push({ view: "recommandations", results, trouble: label });
        }} />
      )}
      {current.view === "recommandations" && (
        <RecommandationsView title={current.trouble} results={current.results} favoris={{ liked: favoris, disliked: [] }} onBack={pop} onOpenFiche={(f) => push({ view: "fiche", fiche: f })} />
      )}
      {current.view === "fiche" && (
        <FicheDetailView
          fiche={ficheById(current.fiche.id) || current.fiche} favoris={{ liked: favoris, disliked: [] }} onBack={pop} simple onlyLike
          onToggleLike={() => toggleFav(current.fiche.id)}
          onLog={() => push({ view: "log", fiche: current.fiche })}
          onEdit={current.fiche.isLocal ? () => push({ view: "form", fiche: ficheById(current.fiche.id) || current.fiche }) : null}
          onDelete={current.fiche.isLocal ? () => { deleteLocalFiche(current.fiche.id); pop(); } : null}
        />
      )}
      {current.view === "log" && (
        <LogView fiche={current.fiche} onBack={pop} onSave={(entry) => { addHistoriqueEntry(entry); pop(); }} />
      )}
      {current.view === "form" && (
        <FicheFormView initial={current.fiche} onBack={pop} onSave={(f) => { addLocalFiche(f); pop(); }} />
      )}
      </div>
      </HomeContext.Provider>

      {/* Raccourci Urgence — toujours visible, uniquement côté Aidant.
          Positionné en onglet sur le bord droit, à mi-hauteur : ne
          chevauche ni l'en-tête (bouton changer de mode) ni la barre
          d'action fixe en bas des fiches. */}
      <button
        onClick={() => setShowUrgence(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-l-2xl shadow-lg active:scale-95 transition"
        aria-label="Numéros d'urgence"
        title="Urgence"
      >
        <PhoneCall size={19} />
      </button>
      {showUrgence && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowUrgence(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0"><PhoneCall size={19} className="text-rose-600" /></div>
              <div className="font-bold text-lg text-stone-800">En cas d'urgence</div>
            </div>
            <p className="text-sm text-stone-500 mb-5">Si la situation présente un danger immédiat, contactez directement les secours — n'attendez pas de trouver une réponse dans l'application.</p>
            <div className="flex flex-col gap-2.5">
              <a href="tel:15" className="flex items-center justify-between bg-rose-50 hover:bg-rose-100 rounded-2xl px-4 py-3.5 transition">
                <span className="font-semibold text-rose-900">SAMU</span>
                <span className="font-bold text-rose-700 text-lg">15</span>
              </a>
              <a href="tel:112" className="flex items-center justify-between bg-rose-50 hover:bg-rose-100 rounded-2xl px-4 py-3.5 transition">
                <span className="font-semibold text-rose-900">Numéro d'urgence européen</span>
                <span className="font-bold text-rose-700 text-lg">112</span>
              </a>
            </div>
            <button onClick={() => setShowUrgence(false)} className="w-full mt-5 text-sm text-stone-400 py-2">Fermer</button>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
    </div>
  );
}

/* Favoris côté aidant : une seule liste, élégante, pas de "à éviter". */
function AidantFavorisView({ fiches, favoris, onBack, onOpenFiche }) {
  const liked = fiches.filter((f) => favoris.includes(f.id));
  return (
    <div className="pb-10">
      <TopBar title="Mes favoris" onBack={onBack} />
      <div className="p-4">
        {liked.length === 0 ? (
          <div className="text-center text-stone-400 text-sm py-16 flex flex-col items-center gap-3">
            <Heart size={28} className="text-stone-300" />
            <span>Touchez le cœur sur une fiche pour la retrouver ici.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {liked.map((f) => (
              <button key={f.id} onClick={() => onOpenFiche(f)} className="w-full text-left bg-white rounded-xl p-3.5 border border-emerald-900/5 shadow-sm active:scale-[0.99] transition flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Badge tone="emerald">{f.categorie}</Badge>
                    {f.isLocal && <Badge tone="amber">Votre idée</Badge>}
                  </div>
                  <div className="font-semibold text-emerald-950 truncate">{f.titre}</div>
                  <div className="text-sm text-stone-500 line-clamp-2 mt-0.5">{f.description}</div>
                </div>
                <Heart size={18} className="fill-rose-500 text-rose-500 shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



/* ============================================================
   RACINE — choix du profil, puis configuration Supabase / session
   ============================================================ */
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

  if (!mode) return <Gate onChoose={chooseMode} />;

  if (mode === "aidant") return <AidantApp onChangeMode={changeMode} />;

  // mode === "pro"
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F2]">
        <div className="flex flex-col items-center gap-3 text-emerald-800">
          <img src="/logo-phoenix.png" alt="Apézeo" className="w-14 h-14 rounded-2xl object-cover animate-pulse shadow-md" />
          <span className="text-sm">Chargement d'Apézeo…</span>
        </div>
      </div>
    );
  }

  if (!session) return <AuthView onChangeMode={changeMode} />;

  return <AuthenticatedApp session={session} onChangeMode={changeMode} />;
}
