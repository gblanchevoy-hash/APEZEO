// Écran d'accueil public (avant connexion) : choix Professionnel /
// Aidant, avec une vitrine desktop riche (GateDesktop) et une version
// mobile compacte (Gate).
import { useState, useEffect } from "react";
import {
  ChevronRight, Stethoscope, Users, Lightbulb, Leaf, LayoutGrid,
  Footprints, MessageCircle, BookOpen, Activity, Wind, Sparkles, Home,
  Utensils, Heart,
} from "lucide-react";

const FAQ_ITEMS_GATE = [
  { q: "Qu'est-ce qu'Apézeo, exactement ?", a: "Une bibliothèque de techniques non médicamenteuses pour accompagner les personnes atteintes d'Alzheimer et de maladies apparentées — pensée pour les aidants comme pour les professionnels." },
  { q: "Est-ce gratuit pour les aidants familiaux ?", a: "Oui, entièrement gratuit et sans compte à créer. Vous accédez immédiatement à la bibliothèque adaptée aux familles, présentée pas à pas et sans contenu professionnel médical." },
  { q: "Les fiches sont-elles validées scientifiquement ?", a: "Les fiches de niveau Expert s'appuient sur des sources documentées (recommandations HAS, littérature scientifique). Les fiches personnelles ou de partage d'expérience sont clairement signalées comme non sourcées." },
  { q: "Apézeo remplace-t-il un avis médical ?", a: "Non. Apézeo propose des pistes d'accompagnement non médicamenteuses, en complément — jamais en remplacement — d'un suivi médical et paramédical adapté." },
  { q: "Comment fonctionne la version Professionnels ?", a: "Un compte lié à votre structure ou établissement donne accès à la bibliothèque complète, au niveau Expert, aux outils spécifiques illustrés et à la gestion d'équipe." },
];

function FaqItemGate({ item, isOpen, onClick }) {
  return (
    <div className="border-b border-emerald-900/8 py-5">
      <button onClick={onClick} className="w-full flex items-center justify-between text-left gap-4">
        <span className="text-[15.5px] font-bold text-emerald-950">{item.q}</span>
        <ChevronRight size={18} className={`text-emerald-700 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      </button>
      {isOpen && <p className="text-[14px] text-stone-500 leading-relaxed mt-3 pr-8">{item.a}</p>}
    </div>
  );
}

const BENEFITS = [
  { icon: Lightbulb, title: "Des techniques concrètes", text: "Des approches directement utilisables dans les situations du quotidien." },
  { icon: Leaf, title: "Une approche non médicamenteuse", text: "Centrée sur l'accompagnement, l'environnement, la communication et les activités." },
  { icon: LayoutGrid, title: "Des contenus structurés", text: "Une bibliothèque organisée pour retrouver rapidement la technique adaptée à la situation." },
  { icon: Footprints, title: "Pensé pour le terrain", text: "Des contenus conçus pour être compréhensibles et utilisables par les professionnels comme par les aidants." },
];

const LIBRARY_PREVIEW = [
  { icon: MessageCircle, label: "Communication" },
  { icon: BookOpen, label: "Réminiscence" },
  { icon: Activity, label: "Activités" },
  { icon: Wind, label: "Relaxation" },
  { icon: Sparkles, label: "Stimulation sensorielle" },
  { icon: Home, label: "Environnement" },
  { icon: Utensils, label: "Alimentation / Hydratation" },
  { icon: Heart, label: "Soutien aux aidants" },
];

export function GateDesktop({ onChoose }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="hidden lg:block bg-white text-[#1a2e28]">
      {/* En-tête — devient compact au scroll */}
      <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(6,78,59,0.08)] py-3" : "bg-transparent py-6"}`}>
        <div className="max-w-[1100px] mx-auto px-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-phoenix.png" alt="Apézeo" className={`transition-all duration-300 ${scrolled ? "w-8 h-8" : "w-10 h-10"}`} />
            <span className="text-lg font-extrabold text-emerald-950 tracking-tight">Apézeo</span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#pourquoi" className="text-sm font-semibold text-emerald-900/70 hover:text-emerald-950 transition">Présentation</a>
            <a href="#professionnels" className="text-sm font-semibold text-emerald-900/70 hover:text-emerald-950 transition">Professionnels</a>
            <a href="#aidants" className="text-sm font-semibold text-emerald-900/70 hover:text-emerald-950 transition">Aidants</a>
            <button onClick={() => onChoose("pro")} className="text-sm font-semibold text-emerald-800 border border-emerald-900/15 bg-white rounded-full px-5 py-2 hover:bg-emerald-50 transition">Connexion</button>
          </nav>
        </div>
      </header>

      {/* Hero — deux colonnes : discours à gauche, composition signature à droite */}
      <div className="relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[460px] h-[460px] rounded-full opacity-[0.14] blur-[80px]" style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }} />
        <div className="absolute top-40 -left-20 w-[320px] h-[320px] rounded-full opacity-[0.10] blur-[70px]" style={{ background: "radial-gradient(circle, #047857, transparent 70%)" }} />

        <div className="relative max-w-[1100px] mx-auto px-12 pt-20 pb-24 grid grid-cols-[1.05fr_0.95fr] gap-16 items-center">
          {/* Colonne texte */}
          <div>
            <span className="inline-block text-[11px] font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-7">TECHNIQUES NON MÉDICAMENTEUSES</span>
            <h1 className="font-serif text-[46px] font-semibold text-emerald-950 tracking-tight leading-[1.12] mb-6">Des techniques simples pour mieux accompagner, apaiser et comprendre.</h1>
            <p className="text-[17px] text-stone-500 leading-relaxed mb-9 max-w-[440px]">Une bibliothèque de techniques non médicamenteuses pensée pour les professionnels et les aidants accompagnant les personnes vivant avec la maladie d'Alzheimer.</p>
            <div className="flex items-center gap-3.5">
              <button onClick={() => onChoose("pro")} className="text-[14.5px] font-bold px-7 py-3.5 rounded-xl bg-emerald-900 text-white shadow-[0_12px_25px_-8px_rgba(6,78,59,0.4)] hover:bg-emerald-800 hover:-translate-y-0.5 transition-all">Je suis professionnel</button>
              <button onClick={() => onChoose("aidant")} className="text-[14.5px] font-bold px-7 py-3.5 rounded-xl bg-white text-amber-700 border-2 border-amber-300 hover:bg-amber-50 hover:-translate-y-0.5 transition-all">Je suis aidant</button>
            </div>
          </div>

          {/* Colonne visuelle — composition signature (volutes du phénix + cartes flottantes) */}
          <div className="relative h-[420px]">
            <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 460 420" fill="none">
              <path d="M440 30C340 10 220 70 210 180C202 265 280 315 350 290C420 265 428 185 370 155C322 130 275 165 283 215C289 253 330 264 346 240" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
              <path d="M60 400C130 340 130 250 60 210C5 178 -40 220 -30 270" stroke="#047857" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
              <circle cx="350" cy="290" r="4" fill="#10b981" opacity="0.45"/>
              <circle cx="120" cy="90" r="3" fill="#f59e0b" opacity="0.4"/>
            </svg>
            <div className="absolute top-6 left-6 w-[300px] rounded-[22px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(6,78,59,0.35)] rotate-[-3deg]">
              <img src="/landing/photo-pro.jpg" alt="Professionnelle accompagnant une personne âgée" className="w-full h-[260px] object-cover" />
            </div>
            <div className="absolute bottom-4 right-2 w-[260px] rounded-[22px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(6,78,59,0.3)] rotate-[3deg] border-4 border-white">
              <img src="/landing/photo-aidant.jpg" alt="Un aidant partageant un moment au jardin avec un proche âgé" className="w-full h-[210px] object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Pourquoi Apézeo — bénéfices */}
      <section id="pourquoi" className="max-w-[1100px] mx-auto px-12 py-16">
        <div className="text-center mb-12 max-w-[560px] mx-auto">
          <span className="inline-block text-[11px] font-bold tracking-wider text-emerald-700 bg-emerald-50 rounded-full px-3.5 py-1.5 mb-4">POURQUOI APÉZEO ?</span>
          <h2 className="font-serif text-[30px] font-semibold text-emerald-950 tracking-tight">Une bibliothèque pensée pour être utile, tout de suite.</h2>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-[#FBFAF7] rounded-2xl p-6 border border-emerald-900/5">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4"><b.icon size={18} className="text-emerald-700" /></div>
              <div className="text-[14.5px] font-bold text-emerald-950 mb-2 leading-snug">{b.title}</div>
              <p className="text-[13px] text-stone-500 leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pour les professionnels — photo + arguments concrets */}
      <section id="professionnels" className="max-w-[1100px] mx-auto px-12 py-16">
        <div className="grid grid-cols-2 gap-14 items-center">
          <div className="rounded-[28px] overflow-hidden shadow-[0_30px_70px_-24px_rgba(6,78,59,0.3)]">
            <img src="/landing/photo-pro.jpg" alt="Une professionnelle partageant un moment de mots croisés avec une résidente" className="w-full h-[420px] object-cover" />
          </div>
          <div>
            <span className="inline-block text-[11px] font-bold tracking-wider text-emerald-700 bg-emerald-50 rounded-full px-3.5 py-1.5 mb-5">POUR LES PROFESSIONNELS</span>
            <h2 className="font-serif text-[28px] font-semibold text-emerald-950 tracking-tight leading-tight mb-5">Des ressources fiables pour enrichir votre pratique au quotidien.</h2>
            <ul className="space-y-4 mb-9">
              <li className="text-[15px] text-stone-600 leading-relaxed"><span className="font-bold text-emerald-950">Plus de 1000 fiches</span>, sourcées et régulièrement enrichies, couvrant les situations les plus fréquentes en accompagnement.</li>
              <li className="text-[15px] text-stone-600 leading-relaxed"><span className="font-bold text-emerald-950">Un niveau Expert</span>, avec fondements cliniques et références documentaires, pour étayer vos décisions de terrain.</li>
              <li className="text-[15px] text-stone-600 leading-relaxed"><span className="font-bold text-emerald-950">Une recherche rapide</span> par trouble, par besoin ou par situation — pour trouver la bonne réponse en quelques secondes.</li>
              <li className="text-[15px] text-stone-600 leading-relaxed"><span className="font-bold text-emerald-950">Une gestion d'équipe intégrée</span>, pensée pour les établissements et les structures de soin.</li>
            </ul>
            <button onClick={() => onChoose("pro")} className="text-[14.5px] font-bold px-7 py-3.5 rounded-xl bg-emerald-900 text-white shadow-[0_12px_25px_-8px_rgba(6,78,59,0.4)] hover:bg-emerald-800 transition">Découvrir l'espace professionnel</button>
          </div>
        </div>
      </section>

      {/* Pour les aidants — photo + texte bienveillant */}
      <section id="aidants" className="bg-[#FBFAF7] py-16">
        <div className="max-w-[1100px] mx-auto px-12 grid grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-block text-[11px] font-bold tracking-wider text-amber-700 bg-amber-50 rounded-full px-3.5 py-1.5 mb-5">POUR LES AIDANTS</span>
            <h2 className="font-serif text-[28px] font-semibold text-emerald-950 tracking-tight leading-tight mb-5">Vous n'êtes pas seul(e) face à ces moments difficiles.</h2>
            <ul className="space-y-4 mb-9">
              <li className="text-[15px] text-stone-600 leading-relaxed">Des idées simples et rassurantes, expliquées <span className="font-bold text-emerald-950">pas à pas</span>, sans contenu professionnel médical à déchiffrer.</li>
              <li className="text-[15px] text-stone-600 leading-relaxed">Accessible <span className="font-bold text-emerald-950">gratuitement</span>, à tout moment, sans avoir besoin de créer un compte.</li>
              <li className="text-[15px] text-stone-600 leading-relaxed">Parce que chaque petit geste compte, et que <span className="font-bold text-emerald-950">vous faites déjà de votre mieux</span>.</li>
            </ul>
            <button onClick={() => onChoose("aidant")} className="text-[14.5px] font-bold px-7 py-3.5 rounded-xl bg-amber-500 text-white shadow-[0_12px_25px_-8px_rgba(180,83,9,0.35)] hover:bg-amber-600 transition">Découvrir l'espace aidant</button>
          </div>
          <div className="rounded-[28px] overflow-hidden shadow-[0_30px_70px_-24px_rgba(6,78,59,0.2)]">
            <img src="/landing/photo-aidant.jpg" alt="Un aidant partageant un moment au jardin avec un proche âgé" className="w-full h-[420px] object-cover" />
          </div>
        </div>
      </section>

      {/* Une bibliothèque pensée pour le quotidien — aperçu des catégories */}
      <section className="max-w-[1100px] mx-auto px-12 py-16">
        <div className="text-center mb-12 max-w-[560px] mx-auto">
          <span className="inline-block text-[11px] font-bold tracking-wider text-emerald-700 bg-emerald-50 rounded-full px-3.5 py-1.5 mb-4">LA BIBLIOTHÈQUE</span>
          <h2 className="font-serif text-[30px] font-semibold text-emerald-950 tracking-tight">Une bibliothèque pensée pour le quotidien.</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {LIBRARY_PREVIEW.map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-emerald-900/8 rounded-2xl px-5 py-4 hover:border-emerald-900/20 hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0"><c.icon size={16} className="text-emerald-700" /></div>
              <span className="text-[13.5px] font-semibold text-emerald-950 leading-tight">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-[720px] mx-auto px-12">
          <div className="text-center mb-10">
            <h2 className="font-serif text-[28px] font-semibold text-emerald-950 tracking-tight">Questions fréquentes</h2>
          </div>
          <div>
            {FAQ_ITEMS_GATE.map((item, i) => (
              <FaqItemGate key={i} item={item} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <div className="py-20 text-center" style={{ background: "linear-gradient(135deg, #022c22, #064e3b)" }}>
        <h2 className="font-serif text-[30px] font-semibold text-white tracking-tight mb-10">Mieux comprendre. Mieux accompagner.<br/>Autrement.</h2>
        <div className="grid grid-cols-2 gap-4 max-w-[620px] mx-auto px-12">
          <button onClick={() => onChoose("aidant")} className="text-left bg-white/[0.08] border border-white/15 rounded-2xl p-6 hover:bg-white/[0.12] transition">
            <div className="text-[15px] font-bold text-white mb-1.5">Je suis aidant</div>
            <p className="text-xs text-white/75 leading-relaxed mb-4">Des ressources pour accompagner un proche au quotidien.</p>
            <div className="inline-block text-xs font-bold bg-white text-emerald-950 rounded-lg px-4 py-2.5">Accéder à Apézeo — Aidants</div>
          </button>
          <button onClick={() => onChoose("pro")} className="text-left bg-white rounded-2xl p-6">
            <div className="text-[15px] font-bold text-emerald-950 mb-1.5">Je suis professionnel</div>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">Une bibliothèque professionnelle avec fiches Expert.</p>
            <div className="inline-block text-xs font-bold bg-emerald-900 text-white rounded-lg px-4 py-2.5">Accéder à Apézeo — Professionnels</div>
          </button>
        </div>
      </div>

      <footer className="py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/logo-phoenix.png" alt="Apézeo" className="w-6 h-6" />
          <span className="text-sm font-bold text-emerald-950">Apézeo</span>
        </div>
        <p className="text-xs text-stone-400 mb-4">Des techniques non médicamenteuses pour mieux accompagner les personnes vivant avec la maladie d'Alzheimer.</p>
        <div className="text-xs text-stone-400">Professionnels · Aidants · Mentions légales · Politique de confidentialité · Contact</div>
        <div className="text-xs text-stone-300 mt-3">© 2026 Apézeo — informations non médicales</div>
      </footer>
    </div>
  );
}


export function Gate({ onChoose }) {
  return (
    <>
      {/* Mobile / tablette / app installée — inchangé */}
      <div className="lg:hidden min-h-screen bg-[#F4F6F2] flex items-center justify-center p-5">
        <div className="w-full max-w-sm text-center">
          <img src="/logo-phoenix.png" alt="Apézeo" className="w-28 h-28 mx-auto mb-3 drop-shadow-lg" />
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

      {/* Desktop — vitrine riche */}
      <GateDesktop onChoose={onChoose} />
    </>
  );
}

