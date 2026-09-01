// Landing page publique (v2), conçue avec ChatGPT à partir d'un
// cahier des charges de cohérence visuelle, puis convertie ici en
// composant React. Le CSS vit dans gate-v2.css, entièrement isolé
// sous .apezeo-landing-v2 pour ne jamais déborder sur le reste de
// l'app. Les liens internes (#pourquoi, #sources...) restent de
// vrais ancrages qui font défiler la page ; seuls les boutons menant
// réellement dans l'app appellent onChoose.
import "../gate-v2.css";

export function GateV2({ onChoose }) {

  return (
    <div className="apezeo-landing-v2">
      <header>
        <div className="container nav">
          <a className="brand" href="#top" aria-label="Accueil Apézeo">
            <img className="logo" src="/logo-phoenix.png" alt="Logo Apézeo" onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "grid"; }} />
            <span className="logo-fallback">A</span>
            <span className="brand-name">Apézeo</span>
          </a>
          <nav className="nav-actions" aria-label="Navigation principale">
            <a className="nav-link" href="#pourquoi">Pourquoi Apézeo</a>
            <a className="nav-link" href="#fonctionnalites">Comment ça marche</a>
            <button className="btn btn-outline nav-login" onClick={() => onChoose("pro")}>Connexion</button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="kicker-line" />
                <span>LA BIBLIOTHÈQUE DES BONNES PRATIQUES</span>
              </div>

              <h1 className="hero-title">
                La bonne pratique,
                <span>au bon moment,</span>
                pour tous.
              </h1>

              <p className="hero-description">
                Apézeo rassemble plus de 1500 fiches de pratiques
                non médicamenteuses pour accompagner les personnes
                vivant avec Alzheimer ou maladies apparentées,
                au plus près des situations du quotidien.
              </p>

              <div className="hero-access">
                <button className="access-card professional" onClick={() => onChoose("pro")}>
                  <div className="access-card-top">
                    <div className="access-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="access-arrow">↗</div>
                  </div>
                  <div className="access-content">
                    <span className="access-label">ESPACE PROFESSIONNEL</span>
                    <strong>Pour les équipes de soin</strong>
                    <p>Une bibliothèque structurée pour harmoniser les pratiques et accompagner les équipes au quotidien.</p>
                  </div>
                  <div className="access-footer">
                    <span>Découvrir l'espace professionnel</span>
                    <span className="footer-arrow">→</span>
                  </div>
                </button>

                <button className="access-card caregiver" onClick={() => onChoose("aidant")}>
                  <div className="access-card-top">
                    <div className="access-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="access-arrow">↗</div>
                  </div>
                  <div className="access-content">
                    <span className="access-label">ESPACE AIDANT</span>
                    <strong>Gratuit, simplement</strong>
                    <p>Des pratiques accessibles pour trouver des repères concrets dans les situations du quotidien.</p>
                  </div>
                  <div className="access-footer">
                    <span>Accéder gratuitement à l'espace aidant</span>
                    <span className="footer-arrow">→</span>
                  </div>
                </button>
              </div>

              <div className="hero-secondary-actions">
                <button className="login-link" onClick={() => onChoose("pro")}>
                  <span className="login-dot" />
                  Déjà professionnel ?
                  <strong>Se connecter</strong>
                  <span>→</span>
                </button>
                <a className="how-link" href="#fonctionnalites">
                  Comment fonctionne Apézeo ?
                  <span>↓</span>
                </a>
              </div>

              <div className="hero-signature">
                <span className="signature-mark" />
                <span>Une ressource commune pour les professionnels et les aidants.</span>
              </div>
            </div>

            <section className="apezeo-visual">
              <div className="visual-background-shape" />
              <div className="visual-phoenix"><img src="/logo-phoenix.png" alt="" aria-hidden="true" /></div>

              <div className="saas-window">
                <div className="window-topbar">
                  <div className="window-dots"><span /><span /><span /></div>
                  <div className="window-address">apezeo.fr</div>
                  <div className="window-space" />
                </div>

                <div className="app-header">
                  <div className="app-brand">
                    <div className="app-logo"><img src="/logo-phoenix.png" alt="" /></div>
                    <span>Apézeo</span>
                  </div>
                  <div className="app-header-actions">
                    <span className="header-pill">Bibliothèque</span>
                    <div className="header-avatar" />
                  </div>
                </div>

                <div className="app-content">
                  <aside className="app-sidebar">
                    <div className="sidebar-item active"><span className="sidebar-icon" /><span>Bibliothèque</span></div>
                    <div className="sidebar-item"><span className="sidebar-icon small" /><span>Favoris</span></div>
                    <div className="sidebar-item"><span className="sidebar-icon small" /><span>Mes fiches</span></div>
                    <div className="sidebar-separator" />
                    <div className="sidebar-label">CATÉGORIES</div>
                    <div className="sidebar-item muted">Communication</div>
                    <div className="sidebar-item muted">Activités</div>
                    <div className="sidebar-item muted">Relaxation</div>
                  </aside>

                  <main className="app-main">
                    <div className="main-heading">
                      <div><span className="eyebrow">BIBLIOTHÈQUE</span><h3>Bonnes pratiques</h3></div>
                      <button className="fake-button">+ Créer une fiche</button>
                    </div>
                    <div className="fake-search"><span className="search-icon" /><span>Rechercher une pratique...</span></div>
                    <div className="fake-filters">
                      <span className="filter active">Toutes</span>
                      <span className="filter">Communication</span>
                      <span className="filter">Activités</span>
                      <span className="filter">Relaxation</span>
                    </div>
                    <div className="practice-list">
                      <article className="practice-card">
                        <div className="practice-mark green" />
                        <div className="practice-content">
                          <div className="practice-title">Adapter sa communication</div>
                          <div className="practice-description">Repères pour faciliter les échanges au quotidien</div>
                        </div>
                        <span className="practice-arrow">›</span>
                      </article>
                      <article className="practice-card">
                        <div className="practice-mark amber" />
                        <div className="practice-content">
                          <div className="practice-title">Créer un environnement apaisant</div>
                          <div className="practice-description">Des pistes simples directement applicables</div>
                        </div>
                        <span className="practice-arrow">›</span>
                      </article>
                      <article className="practice-card">
                        <div className="practice-mark green" />
                        <div className="practice-content">
                          <div className="practice-title">Favoriser une activité adaptée</div>
                          <div className="practice-description">Des pratiques ajustées aux capacités de chacun</div>
                        </div>
                        <span className="practice-arrow">›</span>
                      </article>
                    </div>
                  </main>
                </div>
              </div>

              <div className="saas-phone">
                <div className="phone-speaker" />
                <div className="phone-screen">
                  <div className="phone-header">
                    <div className="phone-brand"><img src="/logo-phoenix.png" alt="" /><span>Apézeo</span></div>
                    <div className="phone-menu">•••</div>
                  </div>
                  <div className="phone-title"><span>Bibliothèque</span><strong>Bonnes pratiques</strong></div>
                  <div className="phone-tabs"><span className="selected">Standard</span><span>Expert</span></div>
                  <div className="phone-card"><div className="phone-card-mark" /><div className="phone-lines"><span /><span /></div></div>
                  <div className="phone-card"><div className="phone-card-mark amber" /><div className="phone-lines"><span /><span /></div></div>
                  <div className="phone-card"><div className="phone-card-mark" /><div className="phone-lines"><span /><span /></div></div>
                </div>
              </div>

              <div className="library-badge">
                <div className="badge-number">1500<span>+</span></div>
                <div className="badge-title">fiches de pratiques</div>
                <div className="badge-description">Une bibliothèque riche<br />et évolutive</div>
              </div>

              <div className="visual-caption">
                <span className="caption-dot" />
                <span>Accessible partout, sur tous vos appareils</span>
              </div>
            </section>
          </div>
        </section>


        <section className="intro" id="pourquoi">
          <div className="container">
            <div className="intro-head">
              <h2>Pourquoi choisir Apézeo ?</h2>
              <p>Les mêmes repères, une ressource disponible au moment où la situation se présente.</p>
            </div>
            <div className="number-grid">
              <article className="number-card"><div className="number">1</div><h3>Un socle commun</h3><p>Du professionnel nouvellement arrivé à l'encadrement, chacun retrouve les mêmes repères.</p></article>
              <article className="number-card"><div className="number">2</div><h3>La formation se prolonge</h3><p>Une ressource complémentaire aux formations ponctuelles, accessible dans le quotidien.</p></article>
              <article className="number-card"><div className="number">3</div><h3>Les nouveaux arrivants</h3><p>Un accès rapide aux pratiques pour les nouveaux, remplaçants, vacataires et étudiants.</p></article>
              <article className="number-card"><div className="number">4</div><h3>Une bibliothèque, pas un diagnostic</h3><p>Apézeo n'est ni un outil diagnostique ni un outil d'aide à la décision clinique.</p></article>
              <article className="number-card"><div className="number">5</div><h3>Accessible partout</h3><p>PWA responsive, utilisable sur ordinateur, tablette et smartphone.</p></article>
            </div>
          </div>
        </section>

        <section className="split">
          <div className="container split-grid">
            <article className="path pro" id="professionnels">
              <div className="path-label">ESPACE PROFESSIONNEL</div>
              <h3>Pour les professionnels du soin</h3>
              <p>Une ressource de terrain pour harmoniser les pratiques et retrouver rapidement des repères fiables.</p>
              <ul>
                <li><span className="tick">✓</span><span><strong>Bibliothèque Standard</strong> : fiches synthétiques et accessibles.</span></li>
                <li><span className="tick">✓</span><span><strong>Bibliothèque Expert</strong> : contenus approfondis réservés aux comptes structure.</span></li>
                <li><span className="tick">✓</span><span>Création de fiches individuelles au plus près des pratiques professionnelles.</span></li>
                <li><span className="tick">✓</span><span>Favoris personnels et partageables dans les favoris d'équipe.</span></li>
                <li><span className="tick">✓</span><span>Outils pratiques et liens vers les études et ressources scientifiques.</span></li>
              </ul>
              <p className="path-pricing">Tarification sur devis, adaptée à la taille de votre structure — <strong>6 semaines d'essai offertes, sans engagement.</strong></p>
              <button className="btn btn-green" onClick={() => onChoose("pro")}>Découvrir l'espace professionnel →</button>
              <a className="path-secondary" href="#fonctionnalites">Voir les sources et la méthode</a>
            </article>

            <article className="path aidant" id="aidants">
              <div className="path-label">ESPACE AIDANT · GRATUIT</div>
              <h3>Pour les aidants</h3>
              <p>Des repères simples et des idées concrètes pour mieux accompagner un proche au quotidien.</p>
              <ul>
                <li><span className="tick">✓</span><span>Accès gratuit, sans compte obligatoire.</span></li>
                <li><span className="tick">✓</span><span>Des fiches accessibles, pensées pour les situations du quotidien.</span></li>
                <li><span className="tick">✓</span><span>Une approche centrée sur les besoins et les préférences de la personne.</span></li>
                <li><span className="tick">✓</span><span>Des pratiques non médicamenteuses avec leurs précautions d'utilisation.</span></li>
              </ul>
              <button className="btn btn-amber" onClick={() => onChoose("aidant")}>Accéder gratuitement à l'espace aidant →</button>
              <a className="path-secondary" href="#fonctionnalites">Voir les fonctionnalités</a>
            </article>
          </div>
        </section>

        <section className="features" id="fonctionnalites">
          <div className="container features-grid">
            <div className="feature-copy">
              <h2>Une bibliothèque qui s'adapte au terrain.</h2>
              <div className="feature-list">
                <div className="feature"><div className="feature-icon">01</div><div><strong>Plus de 1500 fiches</strong><span>Une bibliothèque riche et évolutive, consultable à tout moment.</span></div></div>
                <div className="feature"><div className="feature-icon">02</div><div><strong>Deux bibliothèques complémentaires</strong><span>Standard pour aller à l'essentiel, Expert pour approfondir.</span></div></div>
                <div className="feature"><div className="feature-icon">03</div><div><strong>Des fiches créées pour le terrain</strong><span>Les professionnels peuvent créer leurs propres fiches selon leurs besoins.</span></div></div>
                <div className="feature"><div className="feature-icon">04</div><div><strong>Des favoris individuels et d'équipe</strong><span>Retrouver et partager rapidement les ressources utiles.</span></div></div>
                <div className="feature"><div className="feature-icon">05</div><div><strong>Des fiches outils spécifiques</strong><span>Des outils concrets et faciles à utiliser auprès des personnes vivant avec des troubles neurocognitifs, chacun accompagné d'une étude scientifique de référence.</span></div></div>
              </div>
            </div>

            <div className="flyer-panel">
              <div className="flyer-inner">
                <div className="flyer-title">Faire passer les bonnes pratiques <span>de la formation au quotidien.</span></div>
                <div className="flyer-sub">L'esprit du flyer, transposé en expérience web : claire, professionnelle, rassurante et orientée terrain.</div>
                <div className="flyer-mini-grid">
                  <div className="mini"><b><span className="mnum">01</span>Socle commun</b><span>Les mêmes repères pour toute l'équipe.</span></div>
                  <div className="mini"><b><span className="mnum">02</span>Formation prolongée</b><span>Les connaissances restent accessibles.</span></div>
                  <div className="mini"><b><span className="mnum">03</span>Nouveaux arrivants</b><span>Une prise en main plus rapide.</span></div>
                  <div className="mini"><b><span className="mnum">04</span>Sources reconnues</b><span>HAS, NICE, France Alzheimer, OMS, revues scientifiques et sociétés savantes.</span></div>
                </div>
                <div className="flyer-bottom"><div className="count">1500+</div><small className="count-label">fiches de techniques non médicamenteuses et d'outils de compréhension des troubles</small></div>
              </div>
            </div>
          </div>
        </section>


        <section className="install">
          <div className="container">
            <div className="install-head"><h2>Disponible partout, comme une application.</h2><p>Apézeo est une PWA : elle peut être installée depuis le navigateur, sans passer par un store.</p></div>
            <div className="install-grid">
              <article className="install-card">
                <h3>Android · Chrome</h3><p>Ajoutez Apézeo à l'écran d'accueil depuis Chrome.</p>
                <div className="steps">
                  <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" /></svg></b><span>Ouvrir Apézeo dans Chrome.</span></div>
                  <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></b><span>Ouvrir le menu du navigateur.</span></div>
                  <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg></b><span>Choisir « Installer l'application » ou « Ajouter à l'écran d'accueil ».</span></div>
                </div>
              </article>
              <article className="install-card ios">
                <h3>iPhone / iPad · Safari</h3><p>Ajoutez Apézeo à l'écran d'accueil depuis Safari.</p>
                <div className="steps">
                  <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16,8 13,13 8,16 11,11" /></svg></b><span>Ouvrir Apézeo dans Safari.</span></div>
                  <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg></b><span>Appuyer sur « Partager ».</span></div>
                  <div className="step"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8" /><path d="M8 12h8" /></svg></b><span>Choisir « Sur l'écran d'accueil », puis « Ajouter ».</span></div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="cta" id="final">
          <div className="container cta-inner">
            <h2>La bonne pratique au bon moment, pour tous.</h2>
            <p>Professionnel ou aidant, choisissez votre espace et découvrez Apézeo.</p>
            <div className="cta-actions">
              <button className="btn btn-white" onClick={() => onChoose("pro")}>Découvrir l'espace professionnel →</button>
              <button className="btn btn-amber" onClick={() => onChoose("aidant")}>Accéder gratuitement à l'espace aidant →</button>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer">
          <div className="footer-brand"><img className="footer-logo" src="/logo-phoenix.png" alt="" onError={(e) => { e.target.style.display = "none"; }} /><span>Apézeo</span></div>
          <div className="footer-links">
            <a className="footer-mail" href="mailto:contact@apezeo.fr">contact@apezeo.fr</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
