// ============================================================
// Simulateur Apézeo — logique front (remplace le fichier JS du
// prototype Artifact). Le HTML et le CSS que vous avez déjà restent
// identiques, sans aucune modification.
//
// Ce fichier crée son propre client Supabase (URL + clé publique
// "anon", sans danger à exposer côté navigateur — c'est leur usage
// prévu). Si votre projet a déjà un client Supabase partagé ailleurs
// et que vous préférez le réutiliser, remplacez les 3 lignes
// ci-dessous par : import { supabase } from "<votre fichier>";
//
// Nécessite la librairie @supabase/supabase-js (déjà utilisée par le
// reste de l'appli Apézeo, donc normalement déjà installée : sinon,
// `npm install @supabase/supabase-js`).
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";

const supabase = createClient(
  "https://ombjclgknizkjwqqbyck.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYmpjbGdrbml6a2p3cXFieWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTYzMDcsImV4cCI6MjEwMTEzMjMwN30.p8gcH6BM6Gg303te4pUUsUDYasPfL1uY4cKMaX8QCQ4"
);

(function () {
  "use strict";

  const ICONS = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 4.2 6 7.6 6 10.6A6 6 0 1 1 6 13.6C6 10.6 8.5 7.2 12 3z"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M3.5 20c.6-3.6 3-5.6 5.5-5.6s4.9 2 5.5 5.6"/><path d="M14.8 14.8c2 .3 3.7 2 4.2 5.2"/></svg>',
    wave: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c1.6-3 3.2-3 4.8 0s3.2 3 4.8 0 3.2-3 4.8 0 3.2 3 4.8 0"/><path d="M2 18c1.6-3 3.2-3 4.8 0s3.2 3 4.8 0 3.2-3 4.8 0 3.2 3 4.8 0"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l7.5 3.4v5.4c0 4.9-3.2 8.3-7.5 9.7-4.3-1.4-7.5-4.8-7.5-9.7V5.9L12 2.5z"/></svg>',
    raincloud: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15.5a4.2 4.2 0 1 1 .9-8.3A5.3 5.3 0 0 1 18 8.8a3.6 3.6 0 0 1-1 6.7H7z"/><path d="M8 19l-1 2M12.5 19l-1 2M17 19l-1 2"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c1.2-4.2 4.2-6.4 7.5-6.4s6.3 2.2 7.5 6.4"/></svg>'
  };

  // Dossier des visuels détourés (un PNG par personnage), à déposer dans
  // ./personnages/ (un sous-dossier, à côté de simulateur.html/css/js).
  // Le nom du fichier se base sur le PRÉNOM affiché du résident, pas sur
  // un identifiant technique : pour "Georgette M.", le fichier attendu est
  // simplement ./personnages/georgette.png (minuscules, sans accent, sans
  // espace — voir charSlug ci-dessous). Si l'image manque pour un
  // personnage, le popup/portrait ne s'affiche simplement pas pour lui
  // (aucune image cassée visible).
  const CHAR_IMG_BASE = "./personnages/";
  // charSlug() convertit un prénom affiché ("Georgette", "Robert") en nom
  // de fichier attendu ("georgette", "robert"). Définie via slug() plus
  // bas dans ce fichier (function déclarée = disponible partout ici).
  function charSlug(nomComplet) {
    return slug(String(nomComplet || "").trim().split(" ")[0]);
  }

  // Essaie plusieurs extensions à la suite (png, jpg, jpeg, webp) pour le
  // même code, plutôt que d'exiger un .png précis : beaucoup de photos
  // (Explorateur Windows, téléphone...) sont en .jpg sans que ça se voie
  // au premier coup d'œil si les extensions sont masquées. On abandonne
  // (onFail) seulement une fois toutes les extensions essayées.
  const IMG_EXTS = ["png", "jpg", "jpeg", "webp"];
  function loadCharImage(imgEl, code, onSuccess, onFail) {
    let i = 0;
    function attempt() {
      if (i >= IMG_EXTS.length) { onFail && onFail(); return; }
      imgEl.onload = () => onSuccess && onSuccess();
      imgEl.onerror = attempt;
      imgEl.src = CHAR_IMG_BASE + code + "." + IMG_EXTS[i++];
    }
    attempt();
  }

  const DIFF_LABELS = { facile: "Facile", intermediaire: "Intermédiaire", expert: "Expert" };
  const MOOD_LABELS = { calme: "calme", apaisee: "apaisée", anxieuse: "anxieuse", agitee: "agitée", confuse: "confuse", opposante: "en opposition", triste: "triste", abattue: "abattue" };
  const MOOD_STYLE = { calme: "blue", apaisee: "green", anxieuse: "orange", agitee: "bad", confuse: "orange", opposante: "bad", triste: "blue", abattue: "bad" };
  const MOOD_VARS = {
    green: ["var(--green-600-bg)", "var(--green-600)", "var(--green-600-line)"],
    blue: ["var(--blue-bg)", "var(--blue)", "var(--blue-line)"],
    orange: ["var(--orange-bg)", "var(--orange)", "var(--orange-line)"],
    bad: ["var(--bad-bg)", "var(--bad)", "var(--bad-line)"]
  };

  // ---------------- state ----------------
  const SOFT_LIMIT = 10;
  const HARD_LIMIT = 15;
  let currentTheme = null;       // { code, nom, description, icone }
  let currentScenarios = [];     // scénarios de la thématique ouverte
  let persona = null;            // scénario en cours de session
  let sessionId = null;
  let totalScore = 0;
  let caregiverTurnCount = 0;
  let awaitingReply = false;
  let lastUserMessage = null;
  let lastDebrief = null;
  let softLimitShown = false;
  let hardLimitReached = false;
  let transcriptForDownload = []; // {role:'resident'|'soignant', text} — reconstruit localement pour le .md téléchargeable
  let annotationsForDownload = [];

  // ---------------- dom refs ----------------
  const screenThemes = document.getElementById("screen-themes");
  const screenScenarios = document.getElementById("screen-scenarios");
  const screenSession = document.getElementById("screen-session");
  const themeGrid = document.getElementById("theme-grid");
  const scenarioList = document.getElementById("scenario-list");
  const scThemeIcon = document.getElementById("sc-theme-icon");
  const scThemeName = document.getElementById("sc-theme-name");
  const scThemeDesc = document.getElementById("sc-theme-desc");
  const btnBackThemes = document.getElementById("btn-back-themes");
  const btnBackScenarios = document.getElementById("btn-back-scenarios");
  const chatScroll = document.getElementById("chat-scroll");
  const composer = document.getElementById("composer");
  const composerInput = document.getElementById("composer-input");
  const sendBtn = document.getElementById("send-btn");
  const btnEnd = document.getElementById("btn-end");
  const turnCountEl = document.getElementById("turn-count");
  const scoreEl = document.getElementById("s-score");
  const sAvatar = document.getElementById("s-avatar");
  const sName = document.getElementById("s-name");
  const sMood = document.getElementById("s-mood");
  const sMoodText = document.getElementById("s-mood-text");
  const overlay = document.getElementById("overlay");
  const debriefBody = document.getElementById("debrief-body");
  const debriefClose = document.getElementById("debrief-close");
  const sPersona = document.getElementById("s-persona");
  const charPreviewFloat = document.getElementById("char-preview-float");
  const charPreviewImg = document.getElementById("char-preview-img");
  const scenarioPreview = document.getElementById("scenario-preview");
  const scenarioPreviewImg = document.getElementById("scenario-preview-img");

  function esc(str) { const d = document.createElement("div"); d.textContent = String(str); return d.innerHTML; }

  // ---------------- aperçu personnage au survol ----------------
  // Un seul popup partagé (voir simulateur.html / simulateur.css), affiché
  // à côté de n'importe quel élément portant la classe .char-hover et un
  // attribut data-char-code. En position:fixed positionnée ici en JS (donc
  // jamais rognée par le défilement de la conversation), pas "collée" au
  // curseur : elle se place une fois au survol et n'en bouge plus tant que
  // c'est le même élément qui est survolé.
  let charPreviewCode = null;

  function showCharPreview(el) {
    const code = el.dataset.charCode;
    if (!code) return;
    if (charPreviewCode !== code) {
      charPreviewCode = code;
      loadCharImage(charPreviewImg, code, null, () => { charPreviewFloat.style.display = "none"; });
    }
    charPreviewFloat.style.display = "";
    const rect = el.getBoundingClientRect();
    const margin = 14;
    const previewWidth = charPreviewFloat.offsetWidth || 180;
    let left = rect.right + margin;
    if (left + previewWidth > window.innerWidth - 8) left = rect.left - margin - previewWidth;
    if (left < 8) left = 8;
    let top = rect.top + rect.height / 2;
    top = Math.min(Math.max(top, previewWidth / 2 + 8), window.innerHeight - 8);
    charPreviewFloat.style.left = left + "px";
    charPreviewFloat.style.top = top + "px";
    charPreviewFloat.classList.add("visible");
  }
  function hideCharPreview() {
    charPreviewFloat.classList.remove("visible");
  }
  // (le masquage si aucune extension ne fonctionne est géré directement
  // dans showCharPreview, via loadCharImage ci-dessus)

  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(".char-hover");
    if (el) showCharPreview(el);
  });
  document.addEventListener("mouseout", (e) => {
    const el = e.target.closest(".char-hover");
    if (!el) return;
    if (e.relatedTarget && el.contains(e.relatedTarget)) return;
    hideCharPreview();
  });
  // Le scroll de la conversation peut faire dériver la position calculée
  // au survol (l'élément bouge, le popup non) : on referme proprement
  // plutôt que de laisser un popup mal placé.
  document.addEventListener("scroll", hideCharPreview, true);

  // ---------------- petit portrait fixe de l'en-tête de session ----------------
  // Contrairement à l'ancien comportement (icône générique, portrait
  // visible seulement au survol via .char-hover), l'avatar réel du
  // personnage reste affiché en permanence dans l'en-tête pendant tout
  // l'entretien. Le hover sur #s-persona continue par ailleurs d'afficher
  // le grand portrait flottant (showCharPreview ci-dessus), en plus de ce
  // petit avatar — les deux ne se gênent pas.
  function setSessionAvatar(code) {
    sAvatar.innerHTML = ICONS.person;
    if (!code) return;
    const img = document.createElement("img");
    img.alt = "";
    loadCharImage(img, code,
      () => { sAvatar.innerHTML = ""; sAvatar.appendChild(img); },
      () => { /* pas d'image pour ce personnage : on garde l'icône générique déjà posée */ }
    );
  }

  // ---------------- grand portrait de l'écran "scénarios" ----------------
  // Contrairement au popup flottant ci-dessus (qui suit le curseur), ici
  // l'image occupe un cadre fixe à droite de la liste et change selon la
  // carte survolée. Reste affichée tant qu'une autre carte n'est pas
  // survolée (pas d'effet de clignotement quand la souris quitte la liste).
  let scenarioPreviewCode = null;
  function showScenarioPreview(code) {
    if (!code || code === scenarioPreviewCode) return;
    scenarioPreviewCode = code;
    scenarioPreview.classList.remove("has-image");
    scenarioPreviewImg.classList.remove("visible");
    loadCharImage(scenarioPreviewImg, code,
      () => { scenarioPreviewImg.classList.add("visible"); scenarioPreview.classList.add("has-image"); },
      () => { scenarioPreviewImg.classList.remove("visible"); scenarioPreview.classList.remove("has-image"); }
    );
  }
  scenarioList.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".scenario-card-btn");
    if (btn) showScenarioPreview(btn.dataset.charCode);
  });
  scenarioList.addEventListener("focusin", (e) => {
    const btn = e.target.closest(".scenario-card-btn");
    if (btn) showScenarioPreview(btn.dataset.charCode);
  });

  function showScreen(el) {
    [screenThemes, screenScenarios, screenSession].forEach((s) => s.classList.remove("active"));
    el.classList.add("active");
  }

  // ---------------- chargement des données (Supabase, plus de tableau en dur) ----------------
  async function renderThemeGrid() {
    themeGrid.innerHTML = '<div class="banner">Chargement…</div>';
    const { data: themes, error } = await supabase
      .schema("simulateur")
      .from("themes")
      .select("code, nom, description, icone")
      .eq("actif", true)
      .order("ordre");

    if (error || !themes) {
      themeGrid.innerHTML = '<div class="banner">Impossible de charger les thématiques pour le moment.</div>';
      return;
    }

    // nombre de scénarios par thématique, pour l'affichage "X scénarios"
    const { data: counts } = await supabase
      .schema("simulateur")
      .from("scenarios")
      .select("theme_code")
      .eq("actif", true);
    const countByTheme = {};
    (counts || []).forEach((r) => { countByTheme[r.theme_code] = (countByTheme[r.theme_code] || 0) + 1; });

    themeGrid.innerHTML = "";
    themes.forEach((t) => {
      const card = document.createElement("div");
      card.className = "theme-card";
      card.innerHTML =
        '<button class="theme-card-btn" type="button" data-code="' + t.code + '">' +
          '<div class="theme-icon">' + (ICONS[t.icone] || "") + "</div>" +
          '<div class="theme-body">' +
            '<div class="theme-name">' + esc(t.nom) + "</div>" +
            '<div class="theme-count">' + (countByTheme[t.code] || 0) + " scénarios · Facile → Expert</div>" +
            '<div class="theme-cta">Explorer →</div>' +
          "</div>" +
        "</button>";
      themeGrid.appendChild(card);
    });
    themeGrid.querySelectorAll(".theme-card-btn").forEach((btn) => {
      btn.addEventListener("click", () => openTheme(btn.dataset.code, themes));
    });
  }

  async function openTheme(code, themesCache) {
    currentTheme = (themesCache || []).find((t) => t.code === code) || null;
    if (!currentTheme) return;

    scThemeIcon.innerHTML = ICONS[currentTheme.icone] || "";
    scThemeName.textContent = currentTheme.nom;
    scThemeDesc.textContent = currentTheme.description;
    scenarioList.innerHTML = '<div class="banner">Chargement…</div>';
    showScreen(screenScenarios);

    // on ne sélectionne jamais profil_clinique ici : le front n'a besoin
    // que des champs d'affichage, le contenu clinique complet reste
    // exclusivement du côté serveur (Edge Function), jamais dans le
    // navigateur.
    const { data: scenarios, error } = await supabase
      .schema("simulateur")
      .from("scenarios")
      .select("code, nom, age, difficulte, contexte, accroche, initiales, humeur_initiale, replique_ouverture")
      .eq("theme_code", code)
      .eq("actif", true)
      .order("ordre");

    if (error || !scenarios) {
      scenarioList.innerHTML = '<div class="banner">Impossible de charger les scénarios pour le moment.</div>';
      return;
    }
    currentScenarios = scenarios;

    scenarioList.innerHTML = "";
    scenarios.forEach((p) => {
      const card = document.createElement("div");
      card.className = "scenario-card " + p.difficulte;
      card.innerHTML =
        '<button class="scenario-card-btn" type="button" data-code="' + p.code + '" data-char-code="' + esc(charSlug(p.nom)) + '">' +
          '<div class="scenario-avatar">' + ICONS.person + "</div>" +
          '<div class="scenario-main">' +
            '<div class="scenario-name">' + esc(p.nom) + "</div>" +
            '<div class="scenario-meta">' + p.age + " ans · " + esc(p.contexte) + "</div>" +
            '<div class="scenario-tagline">' + esc(p.accroche) + "</div>" +
          "</div>" +
          '<span class="diff-badge ' + p.difficulte + '">' + esc(DIFF_LABELS[p.difficulte] || p.difficulte) + "</span>" +
        "</button>";
      scenarioList.appendChild(card);
    });
    scenarioList.querySelectorAll(".scenario-card-btn").forEach((btn) => {
      btn.addEventListener("click", () => startSession(btn.dataset.code));
    });

    // Réinitialise le grand portrait pour cette thématique, et affiche
    // directement le premier cas plutôt que de laisser le cadre vide
    // tant qu'on n'a pas encore survolé quoi que ce soit.
    scenarioPreviewCode = null;
    scenarioPreviewImg.classList.remove("visible");
    scenarioPreview.classList.remove("has-image");
    if (scenarios.length) showScenarioPreview(charSlug(scenarios[0].nom));
  }

  // ---------------- session lifecycle ----------------
  async function startSession(code) {
    persona = currentScenarios.find((p) => p.code === code);
    if (!persona) return;

    const { data: authData } = await supabase.auth.getUser();
    const user = authData && authData.user;
    if (!user) { showScreen(screenScenarios); return; }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("structure_id")
      .eq("id", user.id)
      .single();
    if (profileErr || !profile) {
      alert("Impossible de récupérer votre structure. Reconnectez-vous et réessayez.");
      return;
    }

    const { data: newSession, error: sessErr } = await supabase
      .schema("simulateur")
      .from("sessions")
      .insert({
        structure_id: profile.structure_id,
        user_id: user.id,
        theme_code: currentTheme.code,
        scenario_code: persona.code,
        difficulte: persona.difficulte
      })
      .select("id")
      .single();

    if (sessErr || !newSession) {
      // le message le plus fréquent ici vient du garde-fou côté base :
      // accès non actif ou quota mensuel atteint pour la structure.
      alert(
        "Impossible de démarrer une session : " +
        (sessErr && sessErr.message ? sessErr.message : "accès non actif ou quota atteint.")
      );
      return;
    }
    sessionId = newSession.id;

    totalScore = 0;
    caregiverTurnCount = 0;
    lastDebrief = null;
    softLimitShown = false;
    hardLimitReached = false;
    transcriptForDownload = [];
    annotationsForDownload = [];

    setSessionAvatar(charSlug(persona.nom));
    sName.textContent = persona.nom + ", " + persona.age + " ans";
    sPersona.dataset.charCode = charSlug(persona.nom);
    setMood(persona.humeur_initiale);
    updateScore();
    updateTurnCount();
    btnEnd.disabled = true;
    btnEnd.classList.remove("btn-pulse");
    chatScroll.innerHTML = "";

    showScreen(screenSession);

    addResidentBubble(persona.replique_ouverture);
    transcriptForDownload.push({ role: "resident", text: persona.replique_ouverture });

    composerInput.value = "";
    composerInput.focus();
    setComposerEnabled(true);
  }

  function setMood(mood) {
    const key = MOOD_STYLE[mood] || "orange";
    const [bg, fg, ln] = MOOD_VARS[key];
    sMoodText.textContent = MOOD_LABELS[mood] || mood;
    sMood.style.background = bg; sMood.style.color = fg; sMood.style.border = "1px solid " + ln;
  }

  // deltaJustApplied (optionnel) : la variation qui vient de produire ce
  // nouveau total (ex. +1, -2). Quand elle est fournie et non nulle, une
  // pastille s'affiche brièvement au-dessus du score puis s'efface toute
  // seule, pour attirer l'œil sur le score global sans avoir à remonter
  // dans la conversation pour voir la note de chaque échange.
  function updateScore(deltaJustApplied) {
    scoreEl.textContent = (totalScore > 0 ? "+" : "") + totalScore;
    scoreEl.className = "stat-value " + (totalScore > 0 ? "pos" : totalScore < 0 ? "neg" : "zero");
    if (typeof deltaJustApplied === "number" && deltaJustApplied !== 0) {
      popScoreDelta(deltaJustApplied);
    }
  }
  function popScoreDelta(delta) {
    const pop = document.createElement("span");
    pop.className = "score-pop " + (delta > 0 ? "pos" : "neg");
    pop.textContent = (delta > 0 ? "+" : "") + delta;
    scoreEl.parentElement.appendChild(pop);
    pop.addEventListener("animationend", () => pop.remove());
  }
  function updateTurnCount() {
    turnCountEl.textContent = caregiverTurnCount + (caregiverTurnCount <= 1 ? " échange" : " échanges");
    btnEnd.disabled = caregiverTurnCount < 3;
  }

  // ---------------- chat rendering (identique au prototype) ----------------
  function addResidentBubble(text) {
    const row = document.createElement("div");
    row.className = "msg-row resident";
    row.innerHTML = '<div class="msg-label char-hover" data-char-code="' + esc(charSlug(persona.nom)) + '">' + esc(persona.nom.split(" ")[0]) + '</div><div class="bubble">' + esc(text) + "</div>";
    chatScroll.appendChild(row); scrollToBottom(); return row;
  }
  function addThinkingBubble() {
    const row = document.createElement("div");
    row.className = "msg-row resident";
    row.innerHTML = '<div class="msg-label char-hover" data-char-code="' + esc(charSlug(persona.nom)) + '">' + esc(persona.nom.split(" ")[0]) + '</div><div class="bubble"><span class="thinking-dots"><span></span><span></span><span></span></span></div>';
    chatScroll.appendChild(row); scrollToBottom(); return row;
  }
  function addCaregiverBubble(text) {
    const row = document.createElement("div");
    row.className = "msg-row soignant";
    row.innerHTML = '<div class="msg-label">Vous</div><div class="bubble">' + esc(text) + "</div>";
    chatScroll.appendChild(row); scrollToBottom(); return row;
  }
  function addAnnotationTo(row, delta, tag, explication) {
    const polarity = delta > 0 ? "pos" : delta < 0 ? "neg" : "zero";
    const icon = delta > 0 ? "+" + delta : delta < 0 ? String(delta) : "±0";
    const chip = document.createElement("div");
    chip.className = "annotation " + polarity;
    chip.innerHTML = '<span class="annotation-icon">' + esc(icon) + '</span><div class="annotation-body"><div class="annotation-tag">' + esc(tag) + '</div><div class="annotation-expl">' + esc(explication) + "</div></div>";
    row.appendChild(chip); scrollToBottom();
  }
  function showBanner(text) {
    const div = document.createElement("div"); div.className = "banner"; div.textContent = text;
    chatScroll.appendChild(div); scrollToBottom();
  }
  // Garde-fou : réplique insultante/irrespectueuse jamais transmise à la
  // simulation. Volontairement distinct visuellement de .error-row (panne
  // technique) et de .banner (information neutre) : c'est un rappel au
  // stagiaire, pas une erreur de l'appli ni un conseil pédagogique.
  function showGuardrailNotice(text) {
    const div = document.createElement("div"); div.className = "guardrail-row"; div.textContent = text;
    chatScroll.appendChild(div); scrollToBottom();
  }
  function showErrorRow(text, retryLabel, onRetry) {
    const div = document.createElement("div"); div.className = "error-row";
    const span = document.createElement("span"); span.textContent = text; div.appendChild(span);
    if (retryLabel && onRetry) {
      const btn = document.createElement("button"); btn.type = "button"; btn.textContent = retryLabel;
      btn.addEventListener("click", () => { div.remove(); onRetry(); });
      div.appendChild(btn);
    }
    chatScroll.appendChild(div); scrollToBottom();
  }
  function scrollToBottom() { chatScroll.scrollTop = chatScroll.scrollHeight; }
  function setComposerEnabled(enabled) { composerInput.disabled = !enabled; sendBtn.disabled = !enabled; }

  // ---------------- envoi d'un tour : appelle l'Edge Function simulateur-tour ----------------
  async function sendMessage(message) {
    if (awaitingReply || !sessionId || hardLimitReached) return;
    awaitingReply = true;
    lastUserMessage = message;
    setComposerEnabled(false);

    const caregiverRow = addCaregiverBubble(message);
    caregiverTurnCount++;
    updateTurnCount();

    const thinkingRow = addThinkingBubble();

    const { data, error } = await supabase.functions.invoke("simulateur-tour", {
      body: { session_id: sessionId, message }
    });

    thinkingRow.remove();

    if (error || !data || data.error) {
      caregiverRow.remove();
      caregiverTurnCount = Math.max(0, caregiverTurnCount - 1);
      updateTurnCount();
      handleTourError(data && data.error, caregiverRow);
      awaitingReply = false;
      return;
    }

    // Garde-fou : message insultant/irrespectueux envers le/la résident·e,
    // ou qui ne prend manifestement pas l'exercice au sérieux. Il n'a pas
    // été transmis à la simulation côté serveur (aucune réplique générée,
    // rien d'enregistré) : on retire la bulle, on n'avance ni le compteur
    // d'échanges ni le score, et on invite simplement à reformuler.
    if (data.hors_cadre) {
      caregiverRow.remove();
      caregiverTurnCount = Math.max(0, caregiverTurnCount - 1);
      updateTurnCount();
      showGuardrailNotice(data.invitation || "Ce message n'a pas été transmis à la simulation. Merci de reformuler votre réponse dans le respect du cadre professionnel de l'exercice.");
      setComposerEnabled(true);
      composerInput.focus();
      awaitingReply = false;
      return;
    }

    addResidentBubble(data.reponse_residente);
    transcriptForDownload.push({ role: "soignant", text: message });
    transcriptForDownload.push({ role: "resident", text: data.reponse_residente });

    addAnnotationTo(caregiverRow, data.delta, data.tag, data.explication);
    annotationsForDownload.push({ turnIndex: caregiverTurnCount, delta: data.delta, tag: data.tag, explication: data.explication });

    totalScore = data.score_total;
    updateScore(data.delta);
    setMood(data.etat_emotionnel);

    if (data.nb_echanges >= HARD_LIMIT) {
      hardLimitReached = true;
      setComposerEnabled(false);
      showBanner("Durée maximale de cette simulation atteinte (" + HARD_LIMIT + " échanges). Cliquez sur « Terminer & voir le bilan » ci-dessous pour recevoir votre évaluation.");
    } else {
      setComposerEnabled(true);
      composerInput.focus();
      if (data.nb_echanges >= SOFT_LIMIT && !softLimitShown) {
        softLimitShown = true;
        showBanner("Vous avez atteint la durée recommandée pour cet exercice. Continuez si vous le souhaitez, ou clôturez dès maintenant pour consulter votre bilan.");
        btnEnd.classList.add("btn-pulse");
      }
    }
    awaitingReply = false;
  }

  function handleTourError(code, caregiverRow) {
    if (code === "quota_exceeded") {
      showErrorRow("Le quota du mois est atteint pour votre structure. Contactez votre administrateur Apézeo.", null, null);
      setComposerEnabled(false);
    } else if (code === "hard_limit_reached" || code === "session_closed") {
      showErrorRow("Cette session est terminée.", null, null);
      setComposerEnabled(false);
    } else {
      showErrorRow("Une erreur est survenue.", "Réessayer", () => sendMessage(lastUserMessage));
    }
  }

  // ---------------- events ----------------
  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = composerInput.value.trim().slice(0, 600);
    if (!val || awaitingReply) return;
    composerInput.value = ""; composerInput.style.height = "auto";
    sendMessage(val);
  });
  composerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); composer.requestSubmit(); }
  });
  composerInput.addEventListener("input", () => {
    composerInput.style.height = "auto";
    composerInput.style.height = Math.min(140, composerInput.scrollHeight) + "px";
  });

  btnEnd.addEventListener("click", endSession);
  btnBackThemes.addEventListener("click", () => showScreen(screenThemes));
  btnBackScenarios.addEventListener("click", () => showScreen(screenScenarios));
  debriefClose.addEventListener("click", () => overlay.classList.remove("active"));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("active"); });

  // ---------------- fin de session : appelle l'Edge Function simulateur-bilan ----------------
  async function endSession() {
    overlay.classList.add("active");
    debriefBody.innerHTML = '<div class="banner">Génération du bilan…</div>';

    const { data, error } = await supabase.functions.invoke("simulateur-bilan", {
      body: { session_id: sessionId }
    });

    if (error || !data || data.error) {
      debriefBody.innerHTML =
        '<div class="banner">Le bilan n\'a pas pu être généré. Vous pouvez réessayer.</div>' +
        '<div style="margin-top:14px;"><button class="btn-primary" id="debrief-retry" style="width:100%;">Réessayer</button></div>' +
        debriefActionsHTML(false);
      wireDebriefActions();
      const retryBtn = document.getElementById("debrief-retry");
      if (retryBtn) retryBtn.addEventListener("click", endSession);
      return;
    }

    lastDebrief = data.bilan;
    renderDebrief(data.bilan);
  }

  function levelClass(level) {
    const l = (level || "").toLowerCase();
    if (l.indexOf("renforc") !== -1) return "renforcer";
    if (l.indexOf("conven") !== -1) return "convenable";
    if (l.indexOf("excell") !== -1) return "excellent";
    return "bonne";
  }

  function debriefActionsHTML(withDownload) {
    let html = "";
    if (withDownload) {
      html += '<div class="download-row"><button class="btn-gold" id="debrief-download">' + ICONS.download + "<span>Télécharger le compte-rendu (PDF)</span></button>" +
        '<div class="download-status" id="download-status"></div></div>';
    }
    html += '<div class="debrief-actions">' +
      '<button class="btn-quiet" id="debrief-replay">Rejouer ce cas</button>' +
      '<button class="btn-primary" id="debrief-newcase">Autre cas →</button>' +
      "</div>";
    return html;
  }

  function wireDebriefActions() {
    const replay = document.getElementById("debrief-replay");
    const newcase = document.getElementById("debrief-newcase");
    const dl = document.getElementById("debrief-download");
    if (replay) replay.addEventListener("click", () => { overlay.classList.remove("active"); startSession(persona.code); });
    if (newcase) newcase.addEventListener("click", () => { overlay.classList.remove("active"); showScreen(screenScenarios); });
    if (dl) dl.addEventListener("click", downloadTranscript);
  }

  function frDate() {
    const d = new Date();
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  function slug(str) {
    return String(str).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // Génère le compte-rendu complet (échanges + bilan) en PDF et le
  // télécharge directement dans le navigateur. Remplace l'ancien export en
  // .md : un PDF s'ouvre et s'imprime partout sans logiciel particulier,
  // contrairement à un fichier markdown.
  function downloadTranscript() {
    const statusEl = document.getElementById("download-status");
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const marginX = 18, pageWidth = 210;
      let y = 20;

      const wrap = (text, size, weight = "normal", color = [40, 40, 40], gap = 5) => {
        doc.setFont("helvetica", weight);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(String(text), pageWidth - marginX * 2);
        lines.forEach((line) => {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(line, marginX, y);
          y += gap;
        });
        y += 2;
      };

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(2, 44, 34);
      doc.text("Apézeo training", marginX, 12);
      doc.setDrawColor(220, 220, 220); doc.line(marginX, 17, pageWidth - marginX, 17);
      y = 26;

      wrap("Compte-rendu de simulation", 16, "bold", [2, 44, 34], 7);
      wrap("Thématique : " + currentTheme.nom, 10, "normal", [80, 80, 80]);
      wrap("Scénario : " + persona.nom + ", " + persona.age + " ans : " + persona.contexte, 10, "normal", [80, 80, 80]);
      wrap("Niveau : " + (DIFF_LABELS[persona.difficulte] || persona.difficulte), 10, "normal", [80, 80, 80]);
      wrap("Date : " + frDate(), 10, "normal", [80, 80, 80]);
      wrap("Score final de la session : " + (totalScore > 0 ? "+" : "") + totalScore, 11, "bold", [2, 44, 34]);
      y += 2;

      wrap("Échanges", 13, "bold", [4, 120, 87], 6);
      let annIdx = 0;
      transcriptForDownload.forEach((t) => {
        if (t.role === "resident") {
          wrap(persona.nom.split(" ")[0], 10, "bold", [40, 40, 40], 5);
          wrap(t.text, 10, "normal", [40, 40, 40]);
        } else {
          wrap("Vous", 10, "bold", [40, 40, 40], 5);
          wrap(t.text, 10, "normal", [40, 40, 40]);
          if (annIdx < annotationsForDownload.length) {
            const a = annotationsForDownload[annIdx];
            const deltaStr = a.delta > 0 ? "+" + a.delta : String(a.delta);
            wrap("Évaluation (" + deltaStr + " / " + a.tag + ") : " + a.explication, 9, "normal", [150, 110, 20]);
            annIdx++;
          }
        }
      });

      y += 2;
      wrap("Bilan de fin de session", 13, "bold", [4, 120, 87], 6);
      if (lastDebrief) {
        wrap("Niveau global : " + (lastDebrief.niveau_global || ""), 10, "bold", [2, 44, 34]);
        if (lastDebrief.resume) wrap(lastDebrief.resume, 10);
        if (Array.isArray(lastDebrief.points_forts) && lastDebrief.points_forts.length) {
          wrap("Points forts", 11, "bold", [4, 120, 87]);
          lastDebrief.points_forts.forEach((f) => wrap("- " + f, 10));
        }
        if (Array.isArray(lastDebrief.axes_travail) && lastDebrief.axes_travail.length) {
          wrap("Axes de travail", 11, "bold", [180, 100, 20]);
          lastDebrief.axes_travail.forEach((a) => wrap("- " + a, 10));
        }
        if (lastDebrief.conseil_prochaine_session) {
          wrap("Conseil pour la prochaine session", 11, "bold", [4, 120, 87]);
          wrap(lastDebrief.conseil_prochaine_session, 10);
        }
      } else {
        wrap("Bilan non disponible.", 10);
      }

      y += 4;
      wrap("Document généré par Apézeo training, simulation à but pédagogique, personnages entièrement fictifs.", 8, "normal", [140, 140, 140]);

      const filename = "apezeo-training_" + slug(persona.nom) + "_" + slug(currentTheme.nom) + ".pdf";
      doc.save(filename);
      if (statusEl) statusEl.textContent = "Compte-rendu téléchargé.";
    } catch (err) {
      if (statusEl) { statusEl.classList.add("err"); statusEl.textContent = "Le téléchargement a échoué."; }
    }
  }

  function renderDebrief(data) {
    const level = String(data.niveau_global || "Convenable");
    const resume = String(data.resume || "");
    const forces = Array.isArray(data.points_forts) ? data.points_forts : [];
    const axes = Array.isArray(data.axes_travail) ? data.axes_travail : [];
    const conseil = String(data.conseil_prochaine_session || "");

    let html = '<span class="level-badge ' + levelClass(level) + '">' + esc(level) + "</span>";
    html += '<p class="debrief-resume">' + esc(resume) + "</p>";

    if (forces.length) {
      html += '<div class="debrief-section"><h3>Points forts</h3><ul class="debrief-list">';
      forces.forEach((f) => { html += '<li><svg class="li-icon" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' + esc(f) + "</span></li>"; });
      html += "</ul></div>";
    }
    if (axes.length) {
      html += '<div class="debrief-section"><h3>Axes de travail</h3><ul class="debrief-list">';
      axes.forEach((a) => { html += '<li><svg class="li-icon" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span>' + esc(a) + "</span></li>"; });
      html += "</ul></div>";
    }
    if (conseil) {
      html += '<div class="conseil-box"><strong>Pour la prochaine session</strong>' + esc(conseil) + "</div>";
    }
    html += debriefActionsHTML(true);
    debriefBody.innerHTML = html;
    wireDebriefActions();
  }

  // ---------------- init ----------------
  // Connexion : cette page de test est servie seule (hors de votre appli
  // Apézeo), donc il n'y a aucune session utilisateur déjà ouverte. Sans
  // connexion, Supabase (RLS) refuse l'accès aux données (erreur 401).
  // On demande donc l'email/mot de passe de votre compte Apézeo une fois,
  // juste pour ce test — une fois intégré dans la vraie appli React, cette
  // étape disparaît naturellement car la session sera déjà ouverte.
  async function ensureLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;

    const email = window.prompt("Email de votre compte Apézeo (pour ce test) :");
    if (!email) return false;
    const password = window.prompt("Mot de passe :");
    if (!password) return false;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Connexion refusée : " + error.message);
      return false;
    }
    return true;
  }

  (async function init() {
    const ok = await ensureLoggedIn();
    if (!ok) {
      themeGrid.innerHTML = '<p style="color:#b00">Connexion requise pour charger les thématiques. Rechargez la page (F5) pour réessayer.</p>';
      return;
    }
    renderThemeGrid();
  })();
})();
