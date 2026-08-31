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
            <a className="nav-link" href="#sources">Nos sources</a>
            <button className="btn btn-outline nav-login" onClick={() => onChoose("pro")}>Connexion</button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <h1>La bonne pratique,<br /><span>au bon moment,</span><br />pour tous.</h1>
              <p className="hero-lead">
                Apézeo est une bibliothèque numérique de pratiques non médicamenteuses
                pour accompagner les personnes vivant avec Alzheimer ou maladies apparentées,
                au plus près des situations du quotidien.
              </p>
              <div className="hero-actions">
                <button className="btn btn-green" onClick={() => onChoose("pro")}>Découvrir l'espace professionnel <span>→</span></button>
                <button className="btn btn-amber" onClick={() => onChoose("aidant")}>Accéder gratuitement à l'espace aidant <span>→</span></button>
                <a className="hero-secondary" href="#fonctionnalites">Voir comment ça marche <span>↓</span></a>
              </div>
              <div className="hero-foot"><span>Une ressource commune pour les professionnels et les aidants.</span></div>
            </div>

            <div className="hero-art">
              <div className="art-glow" />
              <div className="leaf one" /><div className="leaf two" /><div className="leaf three" />
              <div className="device" aria-label="Aperçu de l'application Apézeo">
                <div className="app-tag">Bibliothèque Apézeo</div>
                <div className="app-window">
                  <div className="browser-bar"><span className="browser-dot" /><span className="browser-dot" /><span className="browser-dot" /><span className="browser-address" /></div>
                  <div className="mock-home">
                    <div className="mock-home-header">
                      <img src="/logo-phoenix.png" alt="" className="mock-logo" />
                      <span className="mock-brand">Apézeo</span>
                    </div>
                    <div className="mock-nav-row"><span className="mock-nav-icon" /><span className="mock-nav-text"><i /><em /></span></div>
                    <div className="mock-nav-row"><span className="mock-nav-icon alt" /><span className="mock-nav-text"><i /><em /></span></div>
                    <div className="mock-nav-row"><span className="mock-nav-icon" /><span className="mock-nav-text"><i /><em /></span></div>
                  </div>
                </div>
                <div className="screen-phone">
                  <div className="phone-notch" />
                  <div className="mock-fiche">
                    <div className="mock-fiche-badges"><span>Standard</span><span className="alt">Technique</span></div>
                    <div className="mock-fiche-title" />
                    <div className="mock-fiche-title short" />
                    <div className="mock-fiche-card" />
                    <div className="mock-fiche-card" />
                  </div>
                </div>
                <div className="floating-card"><strong>1500+</strong><span>fiches de pratiques</span><small>Une bibliothèque riche et évolutive</small></div>
              </div>
            </div>
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
              <button className="btn btn-green" onClick={() => onChoose("pro")}>Découvrir l'espace professionnel →</button>
              <a className="path-secondary" href="#sources">Voir les sources et la méthode</a>
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
              <p>Le principe du flyer reste au cœur de la page : des ressources riches, structurées et directement utilisables.</p>
              <div className="feature-list">
                <div className="feature"><div className="feature-icon">01</div><div><strong>Plus de 1500 fiches</strong><span>Une bibliothèque riche et évolutive, consultable à tout moment.</span></div></div>
                <div className="feature"><div className="feature-icon">02</div><div><strong>Deux bibliothèques complémentaires</strong><span>Standard pour aller à l'essentiel, Expert pour approfondir.</span></div></div>
                <div className="feature"><div className="feature-icon">03</div><div><strong>Des fiches créées pour le terrain</strong><span>Les professionnels peuvent créer leurs propres fiches selon leurs besoins.</span></div></div>
                <div className="feature"><div className="feature-icon">04</div><div><strong>Des favoris individuels et d'équipe</strong><span>Retrouver et partager rapidement les ressources utiles.</span></div></div>
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
                  <div className="mini"><b><span className="mnum">04</span>Sources reconnues</b><span>HAS, NICE, France Alzheimer et sociétés savantes.</span></div>
                </div>
                <div className="flyer-bottom"><div><div className="count">1500+</div><small>fiches de pratiques<br />non médicamenteuses</small></div><a className="btn btn-white" href="#sources">Voir les sources →</a></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sources" id="sources">
          <div className="container">
            <div className="source-box">
              <div className="source-copy">
                <h2>Des pratiques éclairées par des sources reconnues.</h2>
                <p>Les fiches s'appuient notamment sur des recommandations, ressources et données issues d'organismes reconnus. Les sources sont consultables depuis l'application.</p>
              </div>
              <div className="badges"><span className="badge">HAS</span><span className="badge">NICE</span><span className="badge">France Alzheimer</span><span className="badge">Sociétés savantes</span></div>
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
                  <div className="step"><b>1</b><span>Ouvrir Apézeo dans Chrome.</span></div>
                  <div className="step"><b>2</b><span>Ouvrir le menu du navigateur.</span></div>
                  <div className="step"><b>3</b><span>Choisir « Installer l'application » ou « Ajouter à l'écran d'accueil ».</span></div>
                </div>
              </article>
              <article className="install-card ios">
                <h3>iPhone / iPad · Safari</h3><p>Ajoutez Apézeo à l'écran d'accueil depuis Safari.</p>
                <div className="steps">
                  <div className="step"><b>1</b><span>Ouvrir Apézeo dans Safari.</span></div>
                  <div className="step"><b>2</b><span>Appuyer sur « Partager ».</span></div>
                  <div className="step"><b>3</b><span>Choisir « Sur l'écran d'accueil », puis « Ajouter ».</span></div>
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
