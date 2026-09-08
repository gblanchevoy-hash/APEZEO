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
    <PageInfo title="Pourquoi choisir Apézeo ?" onBack={onBack}>
      <p className="info-lead">Les mêmes repères, une ressource disponible au moment où la situation se présente.</p>
      <div className="number-grid">
        <article className="number-card"><div className="number">1</div><h3>Un socle commun</h3><p>Du professionnel nouvellement arrivé à l'encadrement, chacun retrouve les mêmes repères.</p></article>
        <article className="number-card"><div className="number">2</div><h3>La formation se prolonge</h3><p>Une ressource complémentaire aux formations ponctuelles, accessible dans le quotidien.</p></article>
        <article className="number-card"><div className="number">3</div><h3>Les nouveaux arrivants</h3><p>Un accès rapide aux pratiques pour les nouveaux, remplaçants, vacataires et étudiants.</p></article>
        <article className="number-card"><div className="number">4</div><h3>Une bibliothèque, pas un diagnostic</h3><p>Apézeo n'est ni un outil diagnostique ni un outil d'aide à la décision clinique.</p></article>
        <article className="number-card"><div className="number">5</div><h3>Accessible partout</h3><p>PWA responsive, utilisable sur ordinateur, tablette et smartphone.</p></article>
      </div>
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
          <main className="v4-page">
            <span className="v4-ring tl" /><span className="v4-ring tr" />
            <span className="v4-ring bl" /><span className="v4-ring br" />

            <header className="v4-header">
              <div className="v4-logo">
                <span className="v4-logo-leaves" />
                Ap<span className="v4-orange">é</span>zeo
              </div>
              <div className="v4-tagline">La bonne pratique<br />au bon moment pour chacun</div>
            </header>

            <section className="v4-hero" aria-label="Choisissez votre espace">
              <div className="v4-field left" aria-hidden="true">
                <svg viewBox="0 0 815 690" preserveAspectRatio="none">
                  <path className="v4-left-fill" d="M0,70 C130,8 290,32 405,112 C495,175 505,250 610,307 C700,355 785,386 815,460 L815,690 L95,690 C48,648 14,580 0,525 Z" />
                </svg>
              </div>
              <div className="v4-field right" aria-hidden="true">
                <svg viewBox="0 0 815 690" preserveAspectRatio="none">
                  <path className="v4-right-fill" d="M815,70 C685,8 525,32 410,112 C320,175 310,250 205,307 C115,355 30,386 0,460 L0,690 L720,690 C767,648 801,580 815,525 Z" />
                </svg>
              </div>

              <div className="v4-photo prof"><img src="/landing/photo-pro.jpg" alt="Soignante en blouse blanche auprès d'une personne âgée" /></div>
              <div className="v4-photo aid"><img src="/landing/photo-aid.jpg" alt="Homme âgé et sa fille partageant un moment chaleureux" /></div>

              <article className="v4-panel-content prof">
                <div className="v4-round-icon teal" aria-hidden="true">
                  <svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="10" r="4.2" /><circle cx="22" cy="10" r="4.2" /><path d="M3.8 25c.5-5 3.1-7.7 7.2-7.7s6.7 2.7 7.2 7.7" /><path d="M14.8 25c.5-5 3-7.7 7.1-7.7 3.9 0 6.2 2.7 6.6 7.7" /></svg>
                </div>
                <h2>Professionnels</h2>
                <p className="v4-description">
                  Accédez à une bibliothèque<br />
                  <strong>complète et fiable</strong> de techniques<br />
                  <strong>non médicamenteuses</strong><br />
                  pour accompagner au quotidien.
                </p>
                <div className="v4-feature-list">
                  <div className="v4-feature"><span className="v4-feature-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><rect x="8" y="5" width="16" height="22" rx="2" /><path d="M12 11h8M12 16h8M12 21h5" /></svg></span><span>Des fiches pratiques validées<br />par des sources officielles</span></div>
                  <div className="v4-feature"><span className="v4-feature-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="m16 5.5 3.2 6.5 7.2 1-5.2 5.1 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5.1 7.2-1L16 5.5Z" /></svg></span><span>2 bibliothèques : Standard<br />(simplifiée) &amp; Expert (approfondie)</span></div>
                  <div className="v4-feature"><span className="v4-feature-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5v15M10.5 14.5 16 20l5.5-5.5M7 25h18" /></svg></span><span>Plus de 1500 fiches téléchargeables<br />et des outils avec liens vers les études</span></div>
                </div>
                <button className="v4-cta teal" onClick={() => onChoose("pro")}>Accéder à l'espace professionnel <span className="v4-arrow">→</span></button>
              </article>

              <article className="v4-panel-content aid">
                <div className="v4-round-icon orange" aria-hidden="true">
                  <svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27.1S5.2 20.4 5.2 12.5C5.2 8.9 7.7 6.5 11 6.5c2.1 0 4 1.1 5 2.9 1-1.8 2.9-2.9 5-2.9 3.3 0 5.8 2.4 5.8 6 0 7.9-10.8 14.6-10.8 14.6Z" /></svg>
                </div>
                <h2>Aidants</h2>
                <p className="v4-description">
                  Trouvez des solutions concrètes<br />
                  et bienveillantes pour mieux vivre<br />
                  le quotidien avec votre proche<br />
                  atteint de la maladie d'Alzheimer.
                </p>
                <div className="v4-feature-list">
                  <div className="v4-feature"><span className="v4-feature-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M11 22h10M12 26h8M10.2 18.7C8.9 17.2 8 15.3 8 13.2a8 8 0 0 1 16 0c0 2.1-.9 4-2.2 5.5-.9 1-1.4 2-1.6 3.3h-8.4c-.2-1.3-.7-2.3-1.6-3.3Z" /><path d="M16 2v2M4.8 6.1l1.4 1M27.2 6.1l-1.4 1" /></svg></span><span>Des conseils simples et accessibles<br />à mettre en place</span></div>
                  <div className="v4-feature"><span className="v4-feature-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="10" r="4.2" /><circle cx="22" cy="10" r="4.2" /><path d="M3.8 25c.5-5 3.1-7.7 7.2-7.7s6.7 2.7 7.2 7.7" /><path d="M14.8 25c.5-5 3-7.7 7.1-7.7 3.9 0 6.2 2.7 6.6 7.7" /></svg></span><span>Des techniques adaptées<br />aux situations du quotidien</span></div>
                  <div className="v4-feature"><span className="v4-feature-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27.1S5.2 20.4 5.2 12.5C5.2 8.9 7.7 6.5 11 6.5c2.1 0 4 1.1 5 2.9 1-1.8 2.9-2.9 5-2.9 3.3 0 5.8 2.4 5.8 6 0 7.9-10.8 14.6-10.8 14.6Z" /></svg></span><span>Un soutien pour vous sentir<br />plus serein et accompagné</span></div>
                </div>
                <button className="v4-cta orange" onClick={() => onChoose("aidant")}>Accéder à l'espace aidant <span className="v4-arrow">→</span></button>
              </article>

              <div className="v4-seam" aria-hidden="true" />
            </section>

            <section className="v4-trust">
              <div className="v4-trust-item"><span className="v4-trust-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4 26 8v7c0 6.2-4.1 10.7-10 13-5.9-2.3-10-6.8-10-13V8l10-4Z" /><path d="m11.8 15.9 2.7 2.7 5.8-6" /></svg></span><span>Basé sur les recommandations<br />HAS, NICE et autres sources officielles</span></div>
              <div className="v4-trust-item"><span className="v4-trust-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="14" width="18" height="13" rx="2" /><path d="M11 14V9.8a5 5 0 0 1 10 0V14M16 19v3" /></svg></span><span>Données sécurisées<br />et respect de la confidentialité</span></div>
              <div className="v4-trust-item"><span className="v4-trust-icon"><svg className="v4-icon-svg" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" /><path d="m10.5 16.2 3.5 3.5 7.5-8" /></svg></span><span>Conçu pour les professionnels<br />et les aidants, ensemble</span></div>
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

            <footer className="v4-footer">© Apézeo — Ressources d'accompagnement non médicamenteuses</footer>
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
