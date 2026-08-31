// Petits utilitaires partagés entre tous les écrans d'administration
// (statistiques, structures, équipe, compte) — extraits d'admin.jsx
// pour éviter la duplication et garder chaque écran focalisé.
import { Badge } from "./ui.jsx";

export function generateCode(nom) {
  const base = (nom || "STRUCTURE")
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10) || "STRUCTURE";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

export function essaiJoursRestants(s) {
  if (s.essai_duree_semaines == null) return null;
  const fin = new Date(s.created_at);
  fin.setDate(fin.getDate() + s.essai_duree_semaines * 7);
  return Math.ceil((fin - new Date()) / 86400000);
}

export function StructureStatusBadge({ s }) {
  const jours = essaiJoursRestants(s);
  if (s.suspended) {
    return <Badge tone="rose">{jours != null && jours <= 0 ? "Suspendue (essai terminé)" : "Suspendue"}</Badge>;
  }
  if (jours == null) return <Badge tone="emerald">Abonnement actif</Badge>;
  if (jours <= 0) return <Badge tone="rose">⚠ Essai terminé, non suspendue</Badge>;
  if (jours <= 3) return <Badge tone="rose">Essai : {jours} j restant{jours > 1 ? "s" : ""}</Badge>;
  return <Badge tone="amber">Essai : {jours} j restants</Badge>;
}

export function StatBlock({ label, value, sub, tone = "stone" }) {
  const tones = { stone: "text-emerald-950", rose: "text-rose-600", amber: "text-amber-700", emerald: "text-emerald-700" };
  return (
    <div className="bg-white rounded-2xl p-4 border border-emerald-900/5">
      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${tones[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
    </div>
  );
}
