// Briques d'interface génériques, réutilisées dans tout Apézeo (vue
// Pro comme vue Aidant). Extraites de App.jsx : ce fichier ne contient
// aucune logique métier, uniquement de l'affichage.
import React, { createContext, useContext, useState } from "react";
import { Star, ArrowLeft, Home, ChevronRight, ChevronDown } from "lucide-react";

export function Stars({ n }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
      ))}
    </span>
  );
}

export function Badge({ children, tone = "stone" }) {
  const tones = {
    stone: "bg-stone-100 text-stone-700",
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-700",
    orangeDark: "bg-orange-800 text-white",
    expert: "bg-emerald-950 text-amber-300",
    outil: "bg-violet-100 text-violet-800",
    concept: "bg-sky-100 text-sky-800",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

// Fournit la fonction "retour au menu principal" au TopBar, sans avoir
// à la faire remonter manuellement à travers chaque écran. Fourni par
// le composant racine (App.jsx).
export const HomeContext = createContext(() => {});

export function TopBar({ title, onBack, right }) {
  const goHome = useContext(HomeContext);
  return (
    <div className="sticky top-0 z-30 bg-[#F4F6F2]/35 backdrop-blur-lg backdrop-saturate-150 px-5 py-4 lg:px-9 lg:py-5 flex items-center gap-3">
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
        <img src="/logo-phoenix.png" alt="Apézeo" className="w-16 h-16 drop-shadow-md" />
      )}
      <h1 className="flex-1 text-lg font-bold text-emerald-950 truncate tracking-tight">{title}</h1>
      {right}
    </div>
  );
}

export function NavCard({ icon: Icon, label, sub, onClick, accent = "emerald", badge, notifCount }) {
  const accents = {
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-800 text-white",
    amber: "bg-gradient-to-br from-amber-300 to-amber-500 text-emerald-950",
    stone: "bg-gradient-to-br from-stone-500 to-stone-700 text-white",
    admin: "bg-gradient-to-br from-stone-800 to-stone-950 text-white",
    violet: "bg-gradient-to-br from-violet-400 to-violet-700 text-white",
  };
  return (
    <button onClick={onClick} className="relative w-full flex items-center gap-4 bg-white rounded-3xl p-5 shadow-[0_2px_16px_-4px_rgba(6,78,59,0.10)] hover:shadow-[0_8px_28px_-6px_rgba(6,78,59,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition-all duration-200 text-left">
      {notifCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
          {notifCount}
        </span>
      )}
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

export function Field({ label, children }) {
  return <label className="block mb-3"><span className="block text-sm font-medium text-stone-600 mb-1">{label}</span>{children}</label>;
}

export const inputCls = "w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

export function CheckGroup({ options, selected, onToggle }) {
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

// Découpe un texte du type "Label :\n- item\n- item\n\nAutre label :\n..."
// (généré pour les fiches à champs multiples) en blocs propres, avec
// un petit titre discret par bloc et de vraies puces — plutôt qu'un
// unique pavé de texte dense.
export function StructuredText({ text }) {
  if (!text) return null;
  const blocks = text.split(/\n\n+/).map((block) => {
    const lines = block.split("\n");
    const isLabel = lines[0].trim().endsWith(":") && lines.length > 1;
    return isLabel
      ? { label: lines[0].trim().replace(/:$/, ""), lines: lines.slice(1) }
      : { label: null, lines };
  });
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <div key={i}>
          {b.label && <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1.5">{b.label}</div>}
          {b.lines.every((l) => l.trim().startsWith("- ")) ? (
            <ul className="space-y-1">
              {b.lines.map((l, j) => (
                <li key={j} className="text-sm text-stone-600 flex gap-2 leading-relaxed">
                  <span className="text-emerald-500 mt-0.5">•</span><span>{l.replace(/^- /, "")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{b.lines.join("\n")}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function BulletList({ items }) {
  if (!items || items.length === 0) return null;
  return <ul className="space-y-1.5">{items.map((it, i) => <li key={i} className="text-sm text-stone-700 flex gap-2"><span className="text-emerald-600 mt-0.5">•</span><span>{it}</span></li>)}</ul>;
}

export function Section({ title, children }) {
  const isEmptyBulletList = React.isValidElement(children) && children.type === BulletList && (!children.props.items || children.props.items.length === 0);
  const isEmptyParagraph = React.isValidElement(children) && children.type === "p" && (!children.props.children || (typeof children.props.children === "string" && children.props.children.trim() === ""));
  if (!children || isEmptyBulletList || isEmptyParagraph || (Array.isArray(children) && children.length === 0)) return null;
  return <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">{title}</div>{children}</div>;
}

// Comme Section, mais repliée par défaut -- pour les blocs qui alourdissent
// la lecture d'une fiche Expert sans être ce qu'on cherche en premier
// (Description, Fondements...). Le bouton reste bien visible (fond,
// bordure, flèche) pour qu'on ne le prenne jamais pour un simple titre.
export function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const isEmptyBulletList = React.isValidElement(children) && children.type === BulletList && (!children.props.items || children.props.items.length === 0);
  const isEmptyParagraph = React.isValidElement(children) && children.type === "p" && (!children.props.children || (typeof children.props.children === "string" && children.props.children.trim() === ""));
  if (!children || isEmptyBulletList || isEmptyParagraph || (Array.isArray(children) && children.length === 0)) return null;
  return (
    <div className="mb-6 bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden" style={{ overflowAnchor: "none" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{title}</span>
        <ChevronDown size={16} className={`text-emerald-700 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function ScoreRing({ pct }) {
  // Seuils recalibrés : le score de base (troubles en commun / meilleur
  // score du lot) pénalise mécaniquement les fiches généralistes -- une
  // fiche pertinente mais avec un peu moins de tags que la meilleure du
  // lot ne doit pas basculer en orange pour autant.
  const niveau = pct >= 60 ? "vert" : pct >= 35 ? "orange" : "rouge";
  const styles = {
    vert: { halo: "#dcfce7", point: "#22c55e" },
    orange: { halo: "#ffedd5", point: "#f59e0b" },
    rouge: { halo: "#fee2e2", point: "#ef4444" },
  }[niveau];
  return (
    <div className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-full" style={{ background: styles.halo }}
      title="Correspondance avec les critères indiqués : voir la légende des couleurs.">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: styles.point }} />
    </div>
  );
}

export function LegendeMacarons({ avecRouge = true }) {
  return (
    <details className="text-xs text-stone-500 px-1 py-1">
      <summary className="cursor-pointer select-none font-medium text-stone-600 list-none flex items-center gap-1">
        <span className="text-[10px]">▸</span> Légende des couleurs
      </summary>
      <div className="flex flex-wrap gap-3 pt-2">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#dcfce7", border: "1px solid #166534" }} /> Vert : Pratique appropriée</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#ffedd5", border: "1px solid #9a3412" }} /> Orange : Pratique appropriée mais à adapter en fonction du contexte</span>
        {avecRouge && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#fee2e2", border: "1px solid #991b1b" }} /> Rouge : Technique peu ou pas appropriée dans ce cas de figure</span>}
      </div>
    </details>
  );
}
