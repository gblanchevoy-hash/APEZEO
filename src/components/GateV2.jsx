// Landing page publique (v2).
// Le CSS vit dans gate-v2.css, entièrement isolé sous .apezeo-landing-v2
// pour ne jamais déborder sur le reste de l'app.
//
// Structure : un écran mobile simplifié (mobile-gate, inchangé), et côté
// desktop un hero autonome (desktop-gate) reproduisant fidèlement la
// maquette de référence fournie, avec des sous-pages internes (Pourquoi,
// Fonctionnalités, Installation, Accès & tarifs) accessibles depuis un
// petit lien de navigation -- pas de défilement de sections, uniquement
// un état local qui bascule d'une vue à l'autre.
import { useState } from "react";
import "../gate-v2.css";

function PageInfo({ title, onBack, children }) {
  return (
    <div className="info-page">
      <div className="container info-page-inner">
        <button className="info-back" onClick={onBack}>← Retour</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function PagePourquoi({ onBack }) {
  return (
    <PageInfo title="Pourquoi Apézeo ?" onBack={onBack}>
      <p className="info-lead">Un besoin de terrain, documenté par les chiffres et reconnu par les autorités de santé elles-mêmes.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">1,2 à 1,4 M</div>
          <div className="stat-label">personnes vivent avec la maladie d'Alzheimer ou une maladie apparentée en France</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">×2</div>
          <div className="stat-label">c'est la progression attendue du nombre de personnes touchées d'ici 2050</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">~225 000</div>
          <div className="stat-label">nouveaux cas sont diagnostiqués chaque année en France</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">~1 résident sur 2</div>
          <div className="stat-label">en EHPAD présente des troubles cognitifs, sur environ 700 000 résidents au total</div>
        </div>
      </div>

      <div className="callout">
        <p>La Haute Autorité de Santé recommande les approches non médicamenteuses en première intention face aux troubles du comportement liés aux maladies neurocognitives. Mais elle constate elle-même qu'une grande partie des professionnels de terrain manque de formation spécifique sur ce sujet — un écart documenté aussi par l'IGAS, qui pointe des moyens de formation jugés insuffisants dans de nombreux établissements.</p>
      </div>

      <p className="info-lead" style={{ marginTop: 30 }}>Ce que ça change concrètement pour les équipes</p>
      <div className="number-grid">
        <article className="number-card"><div className="number">1</div><h3>Un socle commun</h3><p>Du professionnel nouvellement arrivé à l'encadrement, chacun retrouve les mêmes repères.</p></article>
        <article className="number-card"><div className="number">2</div><h3>La formation se prolonge</h3><p>Une ressource complémentaire aux formations ponctuelles, accessible dans le quotidien.</p></article>
        <article className="number-card"><div className="number">3</div><h3>Les nouveaux arrivants</h3><p>Un accès rapide aux pratiques pour les nouveaux, remplaçants, vacataires et étudiants.</p></article>
        <article className="number-card"><div className="number">4</div><h3>Une bibliothèque, pas un diagnostic</h3><p>Apézeo n'est ni un outil diagnostique ni un outil d'aide à la décision clinique.</p></article>
        <article className="number-card"><div className="number">5</div><h3>Accessible partout</h3><p>PWA responsive, utilisable sur ordinateur, tablette et smartphone.</p></article>
      </div>

      <p className="sources-note">Sources : Santé publique France, France Alzheimer, Alzheimer Europe (rapport de prévalence 2025-2026), Haute Autorité de Santé, IGAS — Évaluation des dispositifs spécialisés de prise en charge des personnes atteintes de maladies neurodégénératives.</p>
    </PageInfo>
  );
}

function PageFonctionnalites({ onBack }) {
  return (
    <PageInfo title="Une bibliothèque qui s'adapte au terrain" onBack={onBack}>
      <div className="feature-list">
        <div className="feature"><div className="feature-icon">01</div><div><strong>Plus de 1500 fiches</strong><span>Une bibliothèque riche et évolutive, consultable à tout moment.</span></div></div>
        <div className="feature"><div className="feature-icon">02</div><div><strong>Deux bibliothèques complémentaires</strong><span>Standard pour aller à l'essentiel, Expert pour approfondir.</span></div></div>
        <div className="feature"><div className="feature-icon">03</div><div><strong>Des fiches créées pour le terrain</strong><span>Les professionnels peuvent créer leurs propres fiches selon leurs besoins.</span></div></div>
        <div className="feature"><div className="feature-icon">04</div><div><strong>Des favoris individuels et d'équipe</strong><span>Retrouver et partager rapidement les ressources utiles.</span></div></div>
        <div className="feature"><div className="feature-icon">05</div><div><strong>Des fiches outils spécifiques</strong><span>Des outils concrets et faciles à utiliser auprès des personnes vivant avec des troubles neurocognitifs, chacun accompagné d'une étude scientifique de référence.</span></div></div>
      </div>
      <div className="flyer-panel">
        <div className="flyer-inner">
          <div className="flyer-title">Utiliser des interventions non médicamenteuses <span>tout en se formant au quotidien.</span></div>
          <div className="flyer-mini-grid">
            <div className="mini"><b><span className="mnum">01</span>Socle commun</b><span>Les mêmes repères pour toute l'équipe.</span></div>
            <div className="mini"><b><span className="mnum">02</span>Formation prolongée</b><span>Les connaissances restent accessibles.</span></div>
            <div className="mini"><b><span className="mnum">03</span>Nouveaux arrivants</b><span>Une prise en main plus rapide.</span></div>
            <div className="mini"><b><span className="mnum">04</span>Sources reconnues</b><span>HAS, NICE, France Alzheimer, OMS, revues scientifiques et sociétés savantes.</span></div>
          </div>
          <div className="flyer-bottom"><div className="count">1500+</div><small className="count-label">fiches de techniques non médicamenteuses et d'outils de compréhension des troubles</small></div>
        </div>
      </div>
    </PageInfo>
  );
}

function PageInstallation({ onBack }) {
  return (
    <PageInfo title="Disponible partout, comme une application" onBack={onBack}>
      <p className="info-lead">Apézeo est une PWA : elle peut être installée depuis le navigateur, sans passer par un store.</p>
      <div className="install-grid">
        <article className="install-card">
          <h3>Android · Chrome</h3><p>Ajoutez Apézeo à l'écran d'accueil depuis Chrome.</p>
          <div className="steps">
            <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" /></svg></b><span>Ouvrir Apézeo dans Chrome.</span></div>
            <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></b><span>Ouvrir le menu du navigateur.</span></div>
            <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg></b><span>Choisir « Installer l'application » ou « Ajouter à l'écran d'accueil ».</span></div>
          </div>
        </article>
        <article className="install-card ios">
          <h3>iPhone / iPad · Safari</h3><p>Ajoutez Apézeo à l'écran d'accueil depuis Safari.</p>
          <div className="steps">
            <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16,8 13,13 8,16 11,11" /></svg></b><span>Ouvrir Apézeo dans Safari.</span></div>
            <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg></b><span>Appuyer sur « Partager ».</span></div>
            <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8" /><path d="M8 12h8" /></svg></b><span>Choisir « Sur l'écran d'accueil », puis « Ajouter ».</span></div>
          </div>
        </article>
      </div>
    </PageInfo>
  );
}

function PageAcces({ onBack }) {
  return (
    <PageInfo title="Apézeo — actuellement accessible gratuitement aux établissements" onBack={onBack}>
      <p>Apézeo est une bibliothèque numérique de pratiques non médicamenteuses destinée aux professionnels accompagnant les personnes vivant avec des troubles neurocognitifs.</p>
      <p>La plateforme est actuellement proposée gratuitement aux établissements souhaitant la découvrir et l'expérimenter sur le terrain.</p>
      <p>Cette phase permet de recueillir les retours des professionnels et de faire évoluer l'outil au plus près des besoins du terrain.</p>
      <p>Les modalités d'accès pourront évoluer à l'avenir, notamment avec la possibilité de proposer certaines fonctionnalités ou certains contenus dans le cadre d'offres payantes.</p>
      <p>Toute évolution des conditions d'accès ou de tarification sera communiquée aux utilisateurs concernés.</p>
    </PageInfo>
  );
}

export function GateV2({ onChoose }) {
  const [page, setPage] = useState("hero");
  const back = () => setPage("hero");

  return (
    <div className="apezeo-landing-v2">

      {/* Écran d'accueil simplifié, uniquement affiché sur mobile — pas
          de défilement, l'essentiel en un coup d'œil. */}
      <div className="mobile-gate">
        <img className="mobile-gate-logo" src="/logo-phoenix.png" alt="" onError={(e) => { e.target.style.display = "none"; }} />
        <div className="mobile-gate-brand">Apézeo</div>

        <div className="mobile-gate-box">
          <p className="mobile-gate-tagline">La bonne pratique, au bon moment, pour tous.</p>
          <p className="mobile-gate-desc">Bibliothèque de pratiques non médicamenteuses pour accompagner les personnes vivant avec des troubles neurocognitifs.</p>
        </div>

        <div className="mobile-gate-actions">
          <button className="btn btn-amber mobile-gate-btn" onClick={() => onChoose("aidant")}>
            Je suis aidant →
          </button>
          <button className="btn btn-green mobile-gate-btn" onClick={() => onChoose("pro")}>
            Je suis professionnel →
          </button>
        </div>

        <button className="mobile-gate-login" onClick={() => onChoose("pro")}>Déjà inscrit ? Se connecter</button>
      </div>

      {/* Hero desktop, autonome — reproduction fidèle de la maquette de
          référence. Les sous-pages (Pourquoi, Fonctionnalités,
          Installation, Accès) remplacent le hero plutôt que de s'ajouter
          en dessous : pas de long défilement. */}
      <div className="desktop-gate">
        {page === "hero" && (
          <main className="h5-page">
            <div className="h5-glow tl" /><div className="h5-glow tr" />

            <header className="h5-brand">
              <div className="h5-logo-row">
                <img className="h5-logo" src="/logo-phoenix.png" alt="" />
                <div className="h5-word">Ap<span className="h5-e">é</span>zeo</div>
              </div>
              <div className="h5-tagline">La bonne pratique, au bon moment, pour tous.</div>
            </header>

            <section className="h5-cards" aria-label="Choisir un espace">
              <article className="h5-card pro">
                <div className="h5-card-glow" aria-hidden="true" />
                <div className="h5-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h2>Professionnels</h2>
                <p>Une bibliothèque de référence pour harmoniser les pratiques de votre équipe au quotidien.</p>
                <button className="h5-cta" onClick={() => onChoose("pro")}>Découvrir l'espace professionnel <span>→</span></button>
              </article>

              <article className="h5-card aid">
                <div className="h5-card-glow" aria-hidden="true" />
                <div className="h5-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </div>
                <h2>Aidants</h2>
                <p>Des repères simples et bienveillants pour accompagner votre proche, où que vous soyez.</p>
                <button className="h5-cta" onClick={() => onChoose("aidant")}>Accéder à l'espace aidant <span>→</span></button>
              </article>
            </section>

            <section className="h5-trust">
              <div className="h5-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5.2 3.4 9.4 8 11 4.6-1.6 8-5.8 8-11V5z" /><polyline points="9 12 11 14 15 10" /></svg><span>Basé sur les recommandations<br />HAS, NICE et sources officielles</span></div>
              <div className="h5-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg><span>Données sécurisées et respect<br />de la confidentialité</span></div>
              <div className="h5-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg><span>Conçu pour les professionnels<br />et les aidants</span></div>
            </section>

            <nav className="dg-info-nav" aria-label="En savoir plus">
              <button onClick={() => setPage("pourquoi")}>Pourquoi Apézeo</button>
              <span>·</span>
              <button onClick={() => setPage("fonctionnalites")}>Fonctionnalités</button>
              <span>·</span>
              <button onClick={() => setPage("installation")}>Installer l'application</button>
              <span>·</span>
              <button onClick={() => setPage("acces")}>Accès &amp; tarifs</button>
              <span>·</span>
              <button onClick={() => onChoose("pro")}>Connexion</button>
            </nav>

            <footer className="h5-footer">© Apézeo — Ressources d'accompagnement non médicamenteuses</footer>
          </main>
        )}

        {page === "pourquoi" && <PagePourquoi onBack={back} />}
        {page === "fonctionnalites" && <PageFonctionnalites onBack={back} />}
        {page === "installation" && <PageInstallation onBack={back} />}
        {page === "acces" && <PageAcces onBack={back} />}
      </div>
    </div>
  );
}
