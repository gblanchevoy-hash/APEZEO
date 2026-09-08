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
            <img src="/landing/icone-aidants.png" alt="" className="mobile-gate-icon icon-aidant" />
            Je suis aidant →
          </button>
          <button className="btn btn-green mobile-gate-btn" onClick={() => onChoose("pro")}>
            <img src="/landing/icone-professionnels.png" alt="" className="mobile-gate-icon" />
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
          <main className="dg-hero">
            <div className="dg-dots" aria-hidden="true" />
            <header className="dg-brand">
              <div className="dg-logo-row">
                <img className="dg-logo-mark" src="/logo-phoenix.png" alt="" />
                <div className="dg-logo-word" aria-label="Apézeo">Ap<span className="e">é</span>zeo</div>
              </div>
              <div className="dg-tagline">la bonne pratique<br />au bon moment pour chacun</div>
            </header>

            <section className="dg-switcher" aria-label="Choisir un espace">
              <article className="dg-panel dg-pro">
                <div className="dg-photo"><img src="/landing/photo-pro.jpg" alt="Soignante en blouse blanche souriant avec une personne âgée" /></div>
                <div className="dg-icon-main" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h2>Professionnels</h2>
                <p className="dg-intro">Accédez à une bibliothèque <strong>complète et fiable</strong> de techniques <strong>non médicamenteuses</strong> pour accompagner au quotidien.</p>
                <div className="dg-features">
                  <div className="dg-feature">
                    <span className="dg-bullet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg></span>
                    <span>Des fiches pratiques validées<br />par des sources officielles</span>
                  </div>
                  <div className="dg-feature">
                    <span className="dg-bullet"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></span>
                    <span>2 bibliothèques : Standard<br />(simplifiée) &amp; Expert (approfondie)</span>
                  </div>
                  <div className="dg-feature">
                    <span className="dg-bullet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg></span>
                    <span>Plus de 1500 fiches téléchargeables<br />et des outils avec liens vers les études</span>
                  </div>
                </div>
                <button className="dg-cta" onClick={() => onChoose("pro")}>
                  Accéder à l'espace professionnel
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
              </article>

              <article className="dg-panel dg-aid">
                <div className="dg-photo"><img src="/landing/photo-aid.jpg" alt="Homme âgé souriant avec sa fille, moment chaleureux" /></div>
                <div className="dg-icon-main" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21s-7.5-4.87-10.2-9.24C.24 9.2 1.4 5.5 4.9 4.5c2-.57 4 .2 5.1 1.9 1.1-1.7 3.1-2.47 5.1-1.9 3.5 1 4.66 4.7 3.1 7.26C19.5 16.13 12 21 12 21z" /></svg>
                </div>
                <h2>Aidants</h2>
                <p className="dg-intro">Trouvez des solutions <strong>concrètes et bienveillantes</strong> pour mieux vivre le quotidien avec votre proche atteint de la maladie d'Alzheimer.</p>
                <div className="dg-features">
                  <div className="dg-feature">
                    <span className="dg-bullet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4" /><circle cx="12" cy="10" r="6" /><path d="M12 6v1" /></svg></span>
                    <span>Des conseils simples et accessibles<br />à mettre en place</span>
                  </div>
                  <div className="dg-feature">
                    <span className="dg-bullet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></span>
                    <span>Des techniques adaptées<br />aux situations du quotidien</span>
                  </div>
                  <div className="dg-feature">
                    <span className="dg-bullet"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21s-7.5-4.87-10.2-9.24C.24 9.2 1.4 5.5 4.9 4.5c2-.57 4 .2 5.1 1.9 1.1-1.7 3.1-2.47 5.1-1.9 3.5 1 4.66 4.7 3.1 7.26C19.5 16.13 12 21 12 21z" /></svg></span>
                    <span>Un soutien pour vous sentir<br />plus serein et accompagné</span>
                  </div>
                </div>
                <button className="dg-cta" onClick={() => onChoose("aidant")}>
                  Accéder à l'espace aidant
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
              </article>

              <div className="dg-overlap-wrap" aria-hidden="true">
                <div className="dg-overlap" />
                <div className="dg-leaf-mark"><i /><i /></div>
              </div>
            </section>

            <section className="dg-trust">
              <div className="dg-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5.2 3.4 9.4 8 11 4.6-1.6 8-5.8 8-11V5z" /><polyline points="9 12 11 14 15 10" /></svg><span>Basé sur les recommandations<br />HAS, NICE et autres sources officielles</span></div>
              <div className="dg-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg><span>Données sécurisées<br />et respect de la confidentialité</span></div>
              <div className="dg-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg><span>Conçu pour les professionnels<br />et les aidants, ensemble</span></div>
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

            <footer className="dg-footer">
              <div className="dg-footer-brand"><img src="/logo-phoenix.png" alt="" /><span>Apézeo</span></div>
              <a className="dg-footer-mail" href="mailto:contact@apezeo.fr">contact@apezeo.fr</a>
            </footer>
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
