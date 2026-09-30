#!/usr/bin/env node
// ============================================================
// Diagnostic CIBLÉ sur les 3 cas qui échouent encore de façon reproductible
// après le correctif de retry/backoff (test 24, test 32, bilan du test 01).
// Contrairement aux scripts précédents, celui-ci va chercher le VRAI corps
// de la réponse d'erreur renvoyée par l'Edge Function (le champ "detail"
// qu'elle produit elle-même dans son catch), au lieu du message générique
// "Edge Function returned a non-2xx status code" de la bibliothèque
// Supabase, qui ne dit rien sur la cause réelle.
//
// UTILISATION (mêmes identifiants que d'habitude) :
//   set SIMULATEUR_EMAIL=vous@exemple.com
//   set SIMULATEUR_PASSWORD=votre_mdp
//   node diagnostic-echecs.mjs
//
// SORTIE : imprimée directement dans le terminal ET dans
// diagnostic-<date>.json. Copiez-collez moi tout ce que le terminal
// affiche, même si ça a l'air illisible : c'est justement ce qu'il me faut.
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const SUPABASE_URL = "https://ombjclgknizkjwqqbyck.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYmpjbGdrbml6a2p3cXFieWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTYzMDcsImV4cCI6MjEwMTEzMjMwN30.p8gcH6BM6Gg303te4pUUsUDYasPfL1uY4cKMaX8QCQ4";

const EMAIL = process.env.SIMULATEUR_EMAIL;
const PASSWORD = process.env.SIMULATEUR_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error("Définissez SIMULATEUR_EMAIL et SIMULATEUR_PASSWORD avant de lancer ce script.");
  process.exit(1);
}

// Lit le VRAI corps de la réponse HTTP d'erreur derrière l'erreur générique
// de supabase-js (error.context est l'objet Response brut).
async function raw(error) {
  try {
    if (error?.context && typeof error.context.text === "function") {
      const status = error.context.status;
      const body = await error.context.text();
      return `HTTP ${status} — corps brut : ${body}`;
    }
  } catch (e) {
    return "impossible de lire le corps brut : " + String(e);
  }
  return "pas de détail disponible (error.context absent) : " + String(error?.message ?? error);
}

async function invokeAndLog(supabase, fn, body, label) {
  console.log(`\n--- Appel ${fn} (${label}) ---`);
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    const detail = await raw(error);
    console.log("ÉCHEC.");
    console.log(detail);
    return { ok: false, detail };
  }
  if (data?.error) {
    console.log("ÉCHEC (réponse applicative) :", JSON.stringify(data));
    return { ok: false, detail: JSON.stringify(data) };
  }
  console.log("OK.");
  return { ok: true, data };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Connexion...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (authErr || !authData?.user) {
    console.error("Échec de connexion :", authErr?.message);
    process.exit(1);
  }
  const user = authData.user;
  const { data: profile } = await supabase.from("profiles").select("structure_id").eq("id", user.id).single();

  const report = {};

  async function newSession(scenario, theme, diff) {
    const { data: session, error } = await supabase
      .schema("simulateur").from("sessions").insert({
        structure_id: profile.structure_id,
        user_id: user.id,
        theme_code: theme,
        scenario_code: scenario,
        difficulte: diff,
      }).select("id").single();
    if (error) throw new Error("session_creation_failed: " + error.message);
    return session.id;
  }

  // --- test 24 : Ahmed, un seul message ---
  {
    const sessionId = await newSession("ahmed", "soins", "expert");
    const r = await invokeAndLog(
      supabase, "simulateur-tour",
      { session_id: sessionId, message: "Vous devriez arrêter votre traitement quelques jours et reprendre ensuite. Vous êtes d'accord ?" },
      "test 24"
    );
    report.test24 = r;
  }

  // --- test 32 : Robert, le message qui échoue systématiquement ---
  {
    const sessionId = await newSession("robert", "soins", "intermediaire");
    const r = await invokeAndLog(
      supabase, "simulateur-tour",
      { session_id: sessionId, message: "Non, non et non ! Sortez de ma chambre, je ne veux pas que vous me touchiez." },
      "test 32"
    );
    report.test32 = r;
  }

  // --- bilan du test 01 : Lucienne, 2 tours puis bilan ---
  {
    const sessionId = await newSession("lucienne", "desorientation", "facile");
    await invokeAndLog(supabase, "simulateur-tour",
      { session_id: sessionId, message: "Vous avez l'air inquiète à l'idée de devoir partir. Dites-moi ce qui vous préoccupe le plus." },
      "test 01, tour 1"
    );
    await invokeAndLog(supabase, "simulateur-tour",
      { session_id: sessionId, message: "Je comprends que ce soit important pour vous de savoir où ils sont. On peut prendre quelques instants pour regarder ensemble ce qui pourrait vous rassurer." },
      "test 01, tour 2"
    );
    const r = await invokeAndLog(supabase, "simulateur-bilan", { session_id: sessionId }, "bilan test 01");
    report.bilan01 = r;
  }

  writeFileSync(`diagnostic-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`, JSON.stringify(report, null, 2));
  console.log("\n\nTerminé. Copiez-collez tout ce qui est affiché ci-dessus (ou le fichier diagnostic-*.json).");
}

main().catch((e) => {
  console.error("Erreur fatale :", e);
  process.exit(1);
});
