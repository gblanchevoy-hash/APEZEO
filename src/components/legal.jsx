// Affichage des textes légaux (mentions, CGU, confidentialité...).
// Extrait de App.jsx : ce bloc est autonome, sans dépendance à l'état
// d'un écran précis.
import { TopBar } from "./ui.jsx";
import { MENTIONS_LEGALES, CGU, CONFIDENTIALITE, NON_RESPONSABILITE, METHODE_EDITORIALE } from "../data/legalTexts.js";

export function renderInline(str) {
  const parts = str.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-emerald-950">{part}</strong> : part));
}

export function SourcesLine({ sources, dateMaj }) {
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

export function LegalContent({ text }) {
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

export function LegalView({ doc, onBack }) {
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

export function LegalFooterLinks({ onOpen }) {
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
