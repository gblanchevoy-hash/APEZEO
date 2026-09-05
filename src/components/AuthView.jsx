// Écran de connexion / création de compte (version Pro).
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, UserCircle } from "lucide-react";
import { PROFESSIONS } from "../data/constants.js";
import { supabase } from "../lib/supabase.js";
import { Field, inputCls } from "./ui.jsx";
import { LegalView, LegalFooterLinks } from "./legal.jsx";

export function AuthView({ onChooseAidant }) {
  const [legalDoc, setLegalDoc] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profession, setProfession] = useState(PROFESSIONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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
        options: { data: { profession } },
      });
      if (error) setError(error.message);
      else setInfo("Compte créé. Vérifiez votre boîte mail pour confirmer votre inscription si demandé, puis connectez-vous. Votre administrateur devra ensuite rattacher votre compte à votre structure.");
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
          <img src="/logo-phoenix.png" alt="Apézeo" className="w-36 h-36 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-4xl font-bold text-emerald-950 tracking-tight">Apézeo</h1>
          <p className="text-base text-stone-500 mt-1">Version Pro</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-[28px] p-6 mb-6">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.05] pointer-events-none" />
          <svg className="absolute inset-x-0 bottom-0 w-full h-14 pointer-events-none" viewBox="0 0 400 60" preserveAspectRatio="none">
            <path d="M0,35 C90,55 160,15 240,32 C310,47 350,25 400,38 L400,60 L0,60 Z" fill="rgba(255,255,255,0.05)" />
          </svg>
          <p className="relative text-3xl font-bold mb-1 tracking-tight">1500+ fiches</p>
          <p className="relative text-sm text-emerald-100 mb-4">d'aides non médicamenteuses pour les professionnels accompagnant des personnes atteintes d'Alzheimer et maladies apparentées.</p>
          <ul className="relative space-y-2 text-sm text-emerald-50">
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Recherche instantanée par symptôme</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Outils référencés (HAS, littérature gériatrique)</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Bibliothèque enrichie en continu</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-300" /> Suivi d'usage par technique testée</li>
          </ul>
          <div className="relative mt-5 pt-4 border-t border-white/15 text-xs text-emerald-100">
            Accès structure (EHPAD, SSIAD, accueil de jour…) — <strong className="text-white">accessible gratuitement</strong> pendant cette phase de découverte et d'expérimentation sur le terrain.
          </div>
        </div>
        <p className="text-sm text-stone-500 text-center mb-2">Réservé aux professionnels accompagnant des personnes atteintes d'Alzheimer et maladies apparentées.</p>
        <div className="text-center mb-6">
          <button onClick={onChooseAidant} className="text-xs text-emerald-700 underline">Vous êtes un aidant familial ?</button>
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
                <p className="text-xs text-stone-400 mb-4">Votre compte donne accès à un échantillon de la bibliothèque. Pour un accès complet via votre établissement, votre administrateur rattachera votre compte après cette inscription.</p>
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
